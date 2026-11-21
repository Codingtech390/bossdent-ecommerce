import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import { Brand } from "@/models/Brand";
import { Category } from "@/models/Category";
import { extractSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isAdmin(req: NextRequest) {
  const session = extractSessionFromRequest(req);

  return Boolean(session && session.role === "admin");
}

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(id)
      .populate({
        path: "brand",
        model: Brand,
        select: "name slug",
      })
      .populate({
        path: "category",
        model: Category,
        select: "name slug",
      })
      .populate({
        path: "subcategory",
        model: Category,
        select: "name slug",
      })
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const variants = await ProductVariant.find({
      product: id,
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      product,
      variants,
    });
  } catch (error) {
    console.error("Admin product GET error:", error);

    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await connectToDatabase();

    const body = await req.json();

    const {
      title,
      slug,
      brandId,
      categoryId,
      subcategoryId,
      shortDescription,
      fullDescription,
      features,
      specifications,
      images,
      defaultSku,
      basePrice,
      baseComparePrice,
      badges,
      isQuotationOnly,
      isFreebieEligible,
      freebieTitle,
      rewardCoins,
      totalStock,
      warrantyMonths,
      packageContents,
      expiryNotice,
      returnPolicyDays,
      active,
      provenance,
      variantAttributeNames,
      variants,
    } = body;

    if (!title || !brandId || !categoryId || !defaultSku) {
      return NextResponse.json(
        {
          error: "Title, brand, category and SKU are required.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return NextResponse.json({ error: "Invalid brand" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const price = Number(basePrice);

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Invalid product price" }, { status: 400 });
    }

    const comparePrice =
      baseComparePrice === "" || baseComparePrice === null || baseComparePrice === undefined
        ? undefined
        : Number(baseComparePrice);

    const stock = Math.max(0, Number(totalStock) || 0);

    const discountPercent =
      comparePrice && comparePrice > price
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : 0;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    product.title = title.trim();
    product.slug =
      slug?.trim() ||
      title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");

    product.brand = brandId;
    product.category = categoryId;

    product.subcategory = subcategoryId || undefined;

    product.shortDescription = shortDescription || "";
    product.fullDescription = fullDescription || "";

    product.features = Array.isArray(features) ? features : [];

    product.specifications = Array.isArray(specifications)
      ? specifications.filter((item: any) => item?.key && item?.value)
      : [];

    product.images = Array.isArray(images)
      ? images.filter((image: string) => typeof image === "string" && image.trim())
      : [];

    product.defaultSku = defaultSku.trim().toUpperCase();

    product.basePrice = price;
    product.baseComparePrice = comparePrice;
    product.discountPercent = discountPercent;

    product.badges = Array.isArray(badges) ? badges : [];

    product.isQuotationOnly = Boolean(isQuotationOnly);

    product.isFreebieEligible = Boolean(isFreebieEligible);

    product.freebieTitle = freebieTitle || "";

    product.rewardCoins = Math.max(0, Number(rewardCoins) || 0);

    product.totalStock = stock;
    product.inStock = stock > 0;

    product.warrantyMonths = Number(warrantyMonths) || 0;

    product.packageContents = packageContents || "";

    product.expiryNotice = expiryNotice || "";

    product.returnPolicyDays = Math.max(0, Number(returnPolicyDays) || 0);

    product.active = Boolean(active);

    product.provenance = provenance || "Bossdent Catalogue";

    product.variantAttributeNames = Array.isArray(variantAttributeNames)
      ? variantAttributeNames
      : [];

    await product.save();

    /*
     * Update variants.
     *
     * The form sends existing variant IDs.
     * New variants have no ID and are created.
     * Variants omitted from the form are removed.
     */

    if (Array.isArray(variants)) {
      const existingVariantIds = variants
        .filter((variant: any) => variant._id)
        .map((variant: any) => variant._id);

      await ProductVariant.deleteMany({
        product: id,
        _id: {
          $nin: existingVariantIds,
        },
      });

      for (const variant of variants) {
        const variantData = {
          product: product._id,
          sku: String(variant.sku || "")
            .trim()
            .toUpperCase(),
          title: variant.title || "Default",
          attributes: variant.attributes || {},
          price: Number(variant.price ?? price),
          comparePrice:
            variant.comparePrice === "" ||
            variant.comparePrice === null ||
            variant.comparePrice === undefined
              ? undefined
              : Number(variant.comparePrice),
          stock: Math.max(0, Number(variant.stock) || 0),
          image: variant.image || "",
          barcode: variant.barcode || "",
          active: variant.active !== false,
        };

        if (variant._id) {
          await ProductVariant.findOneAndUpdate(
            {
              _id: variant._id,
              product: id,
            },
            variantData,
            {
              new: true,
              runValidators: true,
            },
          );
        } else {
          await ProductVariant.create(variantData);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    console.error("Admin product PATCH error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          error: "A product with this slug or SKU already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: error?.message || "Failed to update product",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await ProductVariant.deleteMany({
      product: id,
    });

    await Product.deleteOne({
      _id: id,
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Admin product DELETE error:", error);

    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
