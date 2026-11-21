import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { extractSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requireAdmin(req: NextRequest) {
  const session = extractSessionFromRequest(req);

  if (!session || session.role !== "admin") {
    return null;
  }

  return session;
}

async function generateUniqueSlug(slug: string, excludeId?: string) {
  let finalSlug = slug;
  let counter = 1;

  while (true) {
    const query: Record<string, any> = {
      slug: finalSlug,
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Category.findOne(query).lean();

    if (!existing) {
      return finalSlug;
    }

    counter++;
    finalSlug = `${slug}-${counter}`;
  }
}

/* =========================================================
   GET CATEGORIES
========================================================= */

export async function GET(req: NextRequest) {
  try {
    const session = requireAdmin(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const categories = await Category.find({}).sort({ level: 1, order: 1, name: 1 }).lean();

    const productCounts = await Product.aggregate([
      {
        $match: {
          active: true,
        },
      },
      {
        $group: {
          _id: {
            $ifNull: ["$subcategory", "$category"],
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const countMap = new Map<string, number>();

    for (const item of productCounts) {
      if (item._id) {
        countMap.set(String(item._id), Number(item.count || 0));
      }
    }

    const serializedCategories = categories.map((category: any) => ({
      _id: String(category._id),
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId ? String(category.parentId) : null,
      level: category.level || 0,
      order: category.order || 0,
      icon: category.icon || "",
      image: category.image || "",
      banner: category.banner || "",
      isFeatured: Boolean(category.isFeatured),
      productCount: countMap.get(String(category._id)) || 0,
      createdAt: category.createdAt ? new Date(category.createdAt).toISOString() : "",
    }));

    return NextResponse.json({
      success: true,
      categories: serializedCategories,
    });
  } catch (error) {
    console.error("Admin categories GET error:", error);

    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}

/* =========================================================
   CREATE CATEGORY
========================================================= */

export async function POST(req: NextRequest) {
  try {
    const session = requireAdmin(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();

    const {
      name,
      slug,
      description = "",
      parentId = null,
      order = 0,
      icon = "",
      image = "",
      banner = "",
      isFeatured = false,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const generatedSlug = createSlug(slug || name);

    if (!generatedSlug) {
      return NextResponse.json({ error: "A valid category slug is required." }, { status: 400 });
    }

    let level = 0;

    if (parentId) {
      const parent = await Category.findById(parentId);

      if (!parent) {
        return NextResponse.json({ error: "Parent category not found." }, { status: 404 });
      }

      if (parent.level >= 1) {
        return NextResponse.json(
          {
            error: "Subcategories cannot be nested deeper than one level.",
          },
          { status: 400 },
        );
      }

      level = 1;
    }

    const uniqueSlug = await generateUniqueSlug(generatedSlug);

    const category = await Category.create({
      name: name.trim(),
      slug: uniqueSlug,
      description,
      parentId: parentId || null,
      level,
      order: Number(order) || 0,
      icon,
      image,
      banner,
      isFeatured: Boolean(isFeatured),
      productCount: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        category,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Admin categories POST error:", error);

    if (error?.code === 11000) {
      return NextResponse.json({ error: "Category slug already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}

/* =========================================================
   UPDATE CATEGORY
========================================================= */

export async function PATCH(req: NextRequest) {
  try {
    const session = requireAdmin(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();

    const {
      id,
      name,
      slug,
      description = "",
      parentId = null,
      order = 0,
      icon = "",
      image = "",
      banner = "",
      isFeatured = false,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required." }, { status: 400 });
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    if (parentId && parentId === id) {
      return NextResponse.json({ error: "A category cannot be its own parent." }, { status: 400 });
    }

    let level = 0;

    if (parentId) {
      const parent = await Category.findById(parentId);

      if (!parent) {
        return NextResponse.json({ error: "Parent category not found." }, { status: 404 });
      }

      if (parent.level >= 1) {
        return NextResponse.json(
          {
            error: "Subcategories cannot be nested deeper than one level.",
          },
          { status: 400 },
        );
      }

      level = 1;
    }

    /*
     * Prevent moving a parent category into a subcategory.
     */
    const hasChildren = await Category.exists({
      parentId: id,
    });

    if (hasChildren && level === 1) {
      return NextResponse.json(
        {
          error: "A category containing subcategories cannot itself become a subcategory.",
        },
        { status: 400 },
      );
    }

    const generatedSlug = createSlug(slug || name);

    const uniqueSlug = await generateUniqueSlug(generatedSlug, id);

    category.name = name.trim();
    category.slug = uniqueSlug;
    category.description = description;
    category.parentId = parentId || null;
    category.level = level;
    category.order = Number(order) || 0;
    category.icon = icon;
    category.image = image;
    category.banner = banner;
    category.isFeatured = Boolean(isFeatured);

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error: any) {
    console.error("Admin categories PATCH error:", error);

    if (error?.code === 11000) {
      return NextResponse.json({ error: "Category slug already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
  }
}

/* =========================================================
   DELETE CATEGORY
========================================================= */

export async function DELETE(req: NextRequest) {
  try {
    const session = requireAdmin(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required." }, { status: 400 });
    }

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const children = await Category.countDocuments({
      parentId: id,
    });

    if (children > 0) {
      return NextResponse.json(
        {
          error: "This category contains subcategories. Delete or move them first.",
        },
        { status: 400 },
      );
    }

    const linkedProducts = await Product.countDocuments({
      $or: [{ category: id }, { subcategory: id }],
    });

    if (linkedProducts > 0) {
      return NextResponse.json(
        {
          error: `This category is currently linked to ${linkedProducts} products. Reassign the products before deleting it.`,
        },
        { status: 400 },
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Admin categories DELETE error:", error);

    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
