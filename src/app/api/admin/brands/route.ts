import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/models/Brand";
import { Product } from "@/models/Product";
import { extractSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* =========================================================
   HELPERS
========================================================= */

function requireAdmin(req: NextRequest) {
  const session = extractSessionFromRequest(req);

  if (!session || session.role !== "admin") {
    return null;
  }

  return session;
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueSlug(slug: string, excludeId?: string) {
  let finalSlug = slug;
  let counter = 1;

  while (true) {
    const query: Record<string, any> = {
      slug: finalSlug,
    };

    if (excludeId) {
      query._id = {
        $ne: excludeId,
      };
    }

    const existing = await Brand.findOne(query).lean();

    if (!existing) {
      return finalSlug;
    }

    counter++;

    finalSlug = `${slug}-${counter}`;
  }
}

async function getBrandProductCounts() {
  const results = await Product.aggregate([
    {
      $match: {
        brand: {
          $exists: true,
          $ne: null,
        },
      },
    },
    {
      $group: {
        _id: "$brand",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const countMap = new Map<string, number>();

  for (const item of results) {
    if (item._id) {
      countMap.set(String(item._id), Number(item.count || 0));
    }
  }

  return countMap;
}

function serializeBrand(brand: any, productCounts: Map<string, number>) {
  return {
    _id: String(brand._id),
    name: brand.name,
    slug: brand.slug,
    description: brand.description || "",
    logo: brand.logo || "",
    website: brand.website || "",
    isActive: Boolean(brand.isActive),
    productCount: productCounts.get(String(brand._id)) || 0,
    createdAt: brand.createdAt ? new Date(brand.createdAt).toISOString() : "",
  };
}

/* =========================================================
   GET BRANDS
========================================================= */

export async function GET(req: NextRequest) {
  try {
    const session = requireAdmin(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const brands = await Brand.find({}).sort({ name: 1 }).lean();

    const productCounts = await getBrandProductCounts();

    const serializedBrands = brands.map((brand: any) => serializeBrand(brand, productCounts));

    return NextResponse.json({
      success: true,
      brands: serializedBrands,
    });
  } catch (error) {
    console.error("Admin brands GET error:", error);

    return NextResponse.json({ error: "Failed to fetch brands." }, { status: 500 });
  }
}

/* =========================================================
   CREATE BRAND
========================================================= */

export async function POST(req: NextRequest) {
  try {
    const session = requireAdmin(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();

    const { name, slug, description = "", logo = "", website = "", isActive = true } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
    }

    const generatedSlug = createSlug(slug || name);

    if (!generatedSlug) {
      return NextResponse.json({ error: "A valid brand slug is required." }, { status: 400 });
    }

    const uniqueSlug = await generateUniqueSlug(generatedSlug);

    const brand = await Brand.create({
      name: name.trim(),
      slug: uniqueSlug,
      description,
      logo,
      website,
      isActive: Boolean(isActive),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Brand created successfully.",
        brand,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Admin brands POST error:", error);

    if (error?.code === 11000) {
      return NextResponse.json({ error: "Brand slug already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create brand." }, { status: 500 });
  }
}

/* =========================================================
   UPDATE BRAND
========================================================= */

export async function PATCH(req: NextRequest) {
  try {
    const session = requireAdmin(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Brand ID is required." }, { status: 400 });
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found." }, { status: 404 });
    }

    /*
     * Support quick status toggle.
     * The UI sends only:
     * { id, isActive }
     */
    if (typeof body.isActive === "boolean" && body.name === undefined && body.slug === undefined) {
      brand.isActive = body.isActive;

      await brand.save();

      return NextResponse.json({
        success: true,
        message: "Brand status updated.",
        brand,
      });
    }

    const { name, slug, description = "", logo = "", website = "", isActive = true } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
    }

    const generatedSlug = createSlug(slug || name);

    if (!generatedSlug) {
      return NextResponse.json({ error: "A valid brand slug is required." }, { status: 400 });
    }

    const uniqueSlug = await generateUniqueSlug(generatedSlug, id);

    brand.name = name.trim();
    brand.slug = uniqueSlug;
    brand.description = description;
    brand.logo = logo;
    brand.website = website;
    brand.isActive = Boolean(isActive);

    await brand.save();

    return NextResponse.json({
      success: true,
      message: "Brand updated successfully.",
      brand,
    });
  } catch (error: any) {
    console.error("Admin brands PATCH error:", error);

    if (error?.code === 11000) {
      return NextResponse.json({ error: "Brand slug already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to update brand." }, { status: 500 });
  }
}

/* =========================================================
   DELETE BRAND
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
      return NextResponse.json({ error: "Brand ID is required." }, { status: 400 });
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found." }, { status: 404 });
    }

    const linkedProducts = await Product.countDocuments({
      brand: id,
    });

    if (linkedProducts > 0) {
      return NextResponse.json(
        {
          error: `This brand is linked to ${linkedProducts} products. Reassign those products before deleting the brand.`,
        },
        { status: 400 },
      );
    }

    await Brand.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully.",
    });
  } catch (error) {
    console.error("Admin brands DELETE error:", error);

    return NextResponse.json({ error: "Failed to delete brand." }, { status: 500 });
  }
}
