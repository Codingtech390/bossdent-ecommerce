import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import { Brand } from "@/models/Brand";
import { Category } from "@/models/Category";
import { extractSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
      slug,
      brandId,
      categoryId,
      subcategoryId,
      shortDescription = "",
      fullDescription = "",
      features = [],
      specifications = [],
      images = [],
      defaultSku,
      basePrice,
      baseComparePrice,
      badges = [],
      isQuotationOnly = false,
      isFreebieEligible = false,
      freebieTitle = "",
      rewardCoins = 20,
      totalStock = 0,
      warrantyMonths = 0,
      packageContents = "",
      expiryNotice = "",
      returnPolicyDays = 7,
      active = true,
      provenance = "Bossdent Catalogue",
      variantAttributeNames = [],
      variants = [],
    } = body;

    if (!title?.trim() || !brandId || !categoryId || !defaultSku?.trim()) {
      return NextResponse.json(
        {
          error: "Title, brand, category and SKU are required.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(brandId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: "Invalid brand or category." }, { status: 400 });
    }

    const brandExists = await Brand.exists({
      _id: brandId,
    });

    const categoryExists = await Category.exists({
      _id: categoryId,
    });

    if (!brandExists) {
      return NextResponse.json({ error: "Selected brand does not exist." }, { status: 400 });
    }

    if (!categoryExists) {
      return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });
    }

    const price = Number(basePrice);

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Please enter a valid price." }, { status: 400 });
    }

    const comparePrice =
      baseComparePrice === "" || baseComparePrice === undefined || baseComparePrice === null
        ? undefined
        : Number(baseComparePrice);

    const stock = Math.max(0, Number(totalStock) || 0);

    const generatedSlug =
      slug?.trim() ||
      title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");

    const discountPercent =
      comparePrice && comparePrice > price
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : 0;

    const existingSlug = await Product.findOne({
      slug: generatedSlug,
    });

    if (existingSlug) {
      return NextResponse.json(
        {
          error: "This product slug already exists. Please use a different slug.",
        },
        { status: 409 },
      );
    }

    const product = await Product.create({
      title: title.trim(),
      slug: generatedSlug,

      brand: brandId,
      category: categoryId,
      subcategory: subcategoryId || undefined,

      shortDescription,
      fullDescription,

      features: Array.isArray(features)
        ? features.filter((feature: string) => typeof feature === "string" && feature.trim())
        : [],

      specifications: Array.isArray(specifications)
        ? specifications.filter(
            (specification: any) => specification?.key?.trim() && specification?.value?.trim(),
          )
        : [],

      images: Array.isArray(images)
        ? images.filter((image: string) => typeof image === "string" && image.trim())
        : [],

      defaultSku: defaultSku.trim().toUpperCase(),

      basePrice: price,
      baseComparePrice: comparePrice,
      discountPercent,

      badges,

      isQuotationOnly,
      isFreebieEligible,
      freebieTitle,

      rewardCoins: Number(rewardCoins) || 0,

      totalStock: stock,
      inStock: stock > 0,

      warrantyMonths: Number(warrantyMonths) || 0,

      packageContents,
      expiryNotice,

      returnPolicyDays: Number(returnPolicyDays) || 0,

      active,

      provenance,

      variantAttributeNames,
    });

    /*
     * Create variants supplied by the form.
     */

    const validVariants = Array.isArray(variants)
      ? variants.filter((variant: any) => variant?.sku?.trim())
      : [];

    if (validVariants.length > 0) {
      await ProductVariant.insertMany(
        validVariants.map((variant: any) => ({
          product: product._id,

          sku: variant.sku.trim().toUpperCase(),

          title: variant.title || "Default",

          attributes: variant.attributes || {},

          price: Number(variant.price ?? price),

          comparePrice:
            variant.comparePrice === "" || variant.comparePrice === undefined
              ? undefined
              : Number(variant.comparePrice),

          stock: Math.max(0, Number(variant.stock) || 0),

          image: variant.image || "",
          barcode: variant.barcode || "",
          active: variant.active !== false,
        })),
      );
    } else {
      /*
       * Automatically create a default variant
       * so existing cart/checkout functionality
       * can continue to use ProductVariant.
       */

      await ProductVariant.create({
        product: product._id,
        sku: product.defaultSku,
        title: "Default",
        attributes: {},
        price: product.basePrice,
        comparePrice: product.baseComparePrice,
        stock: product.totalStock,
        image: product.images?.[0] || "",
        active: true,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Admin product CREATE error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          error: "Product slug or SKU already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: error?.message || "Failed to create product.",
      },
      { status: 500 },
    );
  }
}
