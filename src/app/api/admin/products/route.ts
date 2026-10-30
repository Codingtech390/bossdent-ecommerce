import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import { Brand } from "@/models/Brand";
import { Category } from "@/models/Category";
import { extractSessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const products = await Product.find({})
      .populate("brand", "name slug")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ products });
  } catch (err: unknown) {
    console.error("Admin products GET error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const {
      title,
      brandId,
      categoryId,
      basePrice,
      baseComparePrice,
      defaultSku,
      totalStock = 20,
      shortDescription = "",
      fullDescription = "",
      badges = [],
      images = [],
    } = body;

    if (!title || !brandId || !categoryId || !basePrice || !defaultSku) {
      return NextResponse.json(
        { error: "Title, brand, category, basePrice, and defaultSku are required." },
        { status: 400 }
      );
    }

    const slug = slugify(title);
    const discountPercent =
      baseComparePrice && baseComparePrice > basePrice
        ? Math.round(((baseComparePrice - basePrice) / baseComparePrice) * 100)
        : 0;

    const product = await Product.create({
      title,
      slug,
      brand: brandId,
      category: categoryId,
      basePrice: Number(basePrice),
      baseComparePrice: baseComparePrice ? Number(baseComparePrice) : undefined,
      discountPercent,
      defaultSku: defaultSku.toUpperCase().trim(),
      totalStock: Number(totalStock),
      inStock: Number(totalStock) > 0,
      shortDescription,
      fullDescription,
      badges,
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80"],
      active: true,
      provenance: "Admin Catalog Dashboard",
    });

    // Create default variant
    await ProductVariant.create({
      product: product._id,
      sku: defaultSku.toUpperCase().trim(),
      title: "Standard Pack",
      price: Number(basePrice),
      comparePrice: baseComparePrice ? Number(baseComparePrice) : undefined,
      stock: Number(totalStock),
      active: true,
    });

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    console.error("Admin products POST error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { productId, basePrice, totalStock, inStock, active } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const updateFields: Record<string, any> = {};
    if (typeof basePrice === "number") updateFields.basePrice = basePrice;
    if (typeof totalStock === "number") {
      updateFields.totalStock = totalStock;
      updateFields.inStock = totalStock > 0;
    }
    if (typeof inStock === "boolean") updateFields.inStock = inStock;
    if (typeof active === "boolean") updateFields.active = active;

    const updated = await Product.findByIdAndUpdate(productId, updateFields, { new: true });
    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    console.error("Admin product PATCH error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
