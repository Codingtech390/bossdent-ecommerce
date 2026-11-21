import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Collection } from "@/models/Collection";
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
      query._id = { $ne: excludeId };
    }

    const existing = await Collection.findOne(query).lean();

    if (!existing) {
      return finalSlug;
    }

    counter++;
    finalSlug = `${slug}-${counter}`;
  }
}

function serializeCollection(collection: any) {
  return {
    _id: String(collection._id),
    name: collection.name,
    slug: collection.slug,
    description: collection.description || "",
    image: collection.image || "",
    isActive: Boolean(collection.isActive),
    featured: Boolean(collection.featured),
    sortOrder: Number(collection.sortOrder || 0),
    createdAt: collection.createdAt ? new Date(collection.createdAt).toISOString() : "",
  };
}

/* =========================================================
   GET COLLECTIONS
========================================================= */

export async function GET(req: NextRequest) {
  try {
    const session = requireAdmin(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const collections = await Collection.find({}).sort({ sortOrder: 1, name: 1 }).lean();

    return NextResponse.json({
      success: true,
      collections: collections.map(serializeCollection),
    });
  } catch (error) {
    console.error("Admin collections GET error:", error);

    return NextResponse.json({ error: "Failed to fetch collections." }, { status: 500 });
  }
}

/* =========================================================
   CREATE COLLECTION
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
      image = "",
      isActive = true,
      featured = false,
      sortOrder = 0,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Collection name is required." }, { status: 400 });
    }

    const generatedSlug = createSlug(slug || name);

    if (!generatedSlug) {
      return NextResponse.json({ error: "A valid collection slug is required." }, { status: 400 });
    }

    const uniqueSlug = await generateUniqueSlug(generatedSlug);

    const collection = await Collection.create({
      name: name.trim(),
      slug: uniqueSlug,
      description,
      image,
      isActive: Boolean(isActive),
      featured: Boolean(featured),
      sortOrder: Number(sortOrder) || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Collection created successfully.",
        collection: serializeCollection(collection),
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Admin collections POST error:", error);

    if (error?.code === 11000) {
      return NextResponse.json({ error: "Collection slug already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create collection." }, { status: 500 });
  }
}

/* =========================================================
   UPDATE COLLECTION
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
      return NextResponse.json({ error: "Collection ID is required." }, { status: 400 });
    }

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found." }, { status: 404 });
    }

    /*
     * Quick status / featured / sort-order updates.
     */

    const quickUpdate =
      body.name === undefined &&
      body.slug === undefined &&
      body.description === undefined &&
      body.image === undefined;

    if (quickUpdate) {
      if (typeof body.isActive === "boolean") {
        collection.isActive = body.isActive;
      }

      if (typeof body.featured === "boolean") {
        collection.featured = body.featured;
      }

      if (body.sortOrder !== undefined) {
        collection.sortOrder = Number(body.sortOrder) || 0;
      }

      await collection.save();

      return NextResponse.json({
        success: true,
        message: "Collection updated successfully.",
        collection: serializeCollection(collection),
      });
    }

    /*
     * Full update.
     */

    const {
      name,
      slug,
      description = "",
      image = "",
      isActive = true,
      featured = false,
      sortOrder = 0,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Collection name is required." }, { status: 400 });
    }

    const generatedSlug = createSlug(slug || name);

    if (!generatedSlug) {
      return NextResponse.json({ error: "A valid collection slug is required." }, { status: 400 });
    }

    const uniqueSlug = await generateUniqueSlug(generatedSlug, id);

    collection.name = name.trim();
    collection.slug = uniqueSlug;
    collection.description = description;
    collection.image = image;
    collection.isActive = Boolean(isActive);
    collection.featured = Boolean(featured);
    collection.sortOrder = Number(sortOrder) || 0;

    await collection.save();

    return NextResponse.json({
      success: true,
      message: "Collection updated successfully.",
      collection: serializeCollection(collection),
    });
  } catch (error: any) {
    console.error("Admin collections PATCH error:", error);

    if (error?.code === 11000) {
      return NextResponse.json({ error: "Collection slug already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to update collection." }, { status: 500 });
  }
}

/* =========================================================
   DELETE COLLECTION
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
      return NextResponse.json({ error: "Collection ID is required." }, { status: 400 });
    }

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found." }, { status: 404 });
    }

    await Collection.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Collection deleted successfully.",
    });
  } catch (error) {
    console.error("Admin collections DELETE error:", error);

    return NextResponse.json({ error: "Failed to delete collection." }, { status: 500 });
  }
}
