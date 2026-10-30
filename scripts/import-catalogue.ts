import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { z } from "zod";
import { Brand, Category, Product, ProductVariant } from "../src/models";
import { slugify } from "../src/lib/utils";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dentalkart_clone";

// Schema for catalog import records with fallback for alternate field names
const ImportProductSchema = z.object({
  title: z.string().min(3),
  sku: z.string().optional(),
  defaultSku: z.string().optional(),
  brand: z.string().optional(),
  brandSlug: z.string().optional(),
  category: z.string().optional(),
  categorySlug: z.string().optional(),
  subcategory: z.string().optional(),
  subcategorySlug: z.string().optional(),
  price: z.number().optional(),
  basePrice: z.number().optional(),
  comparePrice: z.number().optional(),
  baseComparePrice: z.number().optional(),
  stock: z.number().int().nonnegative().optional(),
  totalStock: z.number().int().nonnegative().optional(),
  shortDescription: z.string().optional().default(""),
  fullDescription: z.string().optional().default(""),
  images: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
  provenance: z.string().default("Catalogue Import Pipeline"),
}).transform((data) => {
  const resolvedSku = data.sku || data.defaultSku;
  const resolvedBrand = data.brand || data.brandSlug;
  const resolvedCat = data.category || data.categorySlug;
  const resolvedPrice = data.price ?? data.basePrice;

  if (!resolvedSku) throw new Error("Missing sku or defaultSku");
  if (!resolvedBrand) throw new Error("Missing brand or brandSlug");
  if (!resolvedCat) throw new Error("Missing category or categorySlug");
  if (resolvedPrice === undefined || resolvedPrice < 0) throw new Error("Missing price or basePrice");

  return {
    title: data.title,
    sku: resolvedSku,
    brand: resolvedBrand,
    category: resolvedCat,
    subcategory: data.subcategory || data.subcategorySlug,
    price: resolvedPrice,
    comparePrice: data.comparePrice ?? data.baseComparePrice,
    stock: data.stock ?? data.totalStock ?? 10,
    shortDescription: data.shortDescription,
    fullDescription: data.fullDescription,
    images: data.images,
    features: data.features,
    specifications: data.specifications,
    provenance: data.provenance,
  };
});

export type ImportProductInput = z.infer<typeof ImportProductSchema>;

interface ImportOptions {
  filePath: string;
  dryRun?: boolean;
}

export async function runCatalogueImport({ filePath, dryRun = false }: ImportOptions) {
  console.log(`\n========================================`);
  console.log(`DentalKart Catalogue Importer`);
  console.log(`Mode: ${dryRun ? "DRY-RUN (No DB Writes)" : "LIVE INSERT / UPDATE"}`);
  console.log(`Source File: ${filePath}`);
  console.log(`========================================\n`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Import file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let records: unknown[];

  try {
    records = JSON.parse(raw);
    if (!Array.isArray(records)) {
      if (typeof records === "object" && records !== null && "products" in records) {
        records = (records as { products: unknown[] }).products;
      } else {
        throw new Error("JSON must be an array of products or contain a 'products' array.");
      }
    }
  } catch (err: unknown) {
    throw new Error(`Failed to parse file: ${(err as Error).message}`);
  }

  if (!dryRun) {
    await mongoose.connect(MONGODB_URI);
  }

  const stats = {
    total: records.length,
    valid: 0,
    invalid: 0,
    skipped: 0,
    createdProducts: 0,
    createdVariants: 0,
    updatedVariants: 0,
    errors: [] as { index: number; reason: string }[],
  };

  const seenSkus = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    const rawRecord = records[i];
    const parseResult = ImportProductSchema.safeParse(rawRecord);

    if (!parseResult.success) {
      stats.invalid++;
      stats.errors.push({
        index: i,
        reason: parseResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      });
      continue;
    }

    const item = parseResult.data;
    const normalizedSku = item.sku.toUpperCase().trim();

    if (seenSkus.has(normalizedSku)) {
      stats.skipped++;
      stats.errors.push({ index: i, reason: `Duplicate SKU in batch: ${normalizedSku}` });
      continue;
    }
    seenSkus.add(normalizedSku);
    stats.valid++;

    if (dryRun) continue;

    // 1. Ensure Brand
    const brandSlug = slugify(item.brand);
    let brandDoc = await Brand.findOne({ slug: brandSlug });
    if (!brandDoc) {
      brandDoc = await Brand.create({
        name: item.brand,
        slug: brandSlug,
        originCountry: "India",
        isFeatured: false,
      });
    }

    // 2. Ensure Category & Subcategory
    const catSlug = slugify(item.category);
    let categoryDoc = await Category.findOne({ slug: catSlug });
    if (!categoryDoc) {
      categoryDoc = await Category.create({
        name: item.category,
        slug: catSlug,
        level: 0,
        isFeatured: false,
      });
    }

    let subcategoryDoc = null;
    if (item.subcategory) {
      const subSlug = slugify(item.subcategory);
      subcategoryDoc = await Category.findOne({ slug: subSlug });
      if (!subcategoryDoc) {
        subcategoryDoc = await Category.create({
          name: item.subcategory,
          slug: subSlug,
          parentId: categoryDoc._id,
          level: 1,
          isFeatured: false,
        });
      }
    }

    // 3. Upsert Product
    const productSlug = slugify(item.title);
    let productDoc = await Product.findOne({ slug: productSlug });
    const discountPercent = item.comparePrice && item.comparePrice > item.price
      ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)
      : 0;

    if (!productDoc) {
      productDoc = await Product.create({
        title: item.title,
        slug: productSlug,
        brand: brandDoc._id,
        category: categoryDoc._id,
        subcategory: subcategoryDoc ? subcategoryDoc._id : undefined,
        shortDescription: item.shortDescription,
        fullDescription: item.fullDescription,
        features: item.features,
        specifications: item.specifications,
        images: item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80"],
        defaultSku: normalizedSku,
        basePrice: item.price,
        baseComparePrice: item.comparePrice,
        discountPercent,
        inStock: item.stock > 0,
        totalStock: item.stock,
        provenance: item.provenance,
        active: true,
      });
      stats.createdProducts++;
    }

    // 4. Upsert Variant
    const existingVariant = await ProductVariant.findOne({ sku: normalizedSku });
    if (!existingVariant) {
      await ProductVariant.create({
        product: productDoc._id,
        sku: normalizedSku,
        title: item.title,
        price: item.price,
        comparePrice: item.comparePrice,
        stock: item.stock,
        active: true,
      });
      stats.createdVariants++;
    } else {
      existingVariant.price = item.price;
      existingVariant.comparePrice = item.comparePrice;
      existingVariant.stock = item.stock;
      await existingVariant.save();
      stats.updatedVariants++;
    }
  }

  console.log(`\n========================================`);
  console.log(`IMPORT SUMMARY:`);
  console.log(`- Total Records in File:   ${stats.total}`);
  console.log(`- Valid Records:           ${stats.valid}`);
  console.log(`- Invalid Records:         ${stats.invalid}`);
  console.log(`- Duplicate SKUs Skipped:  ${stats.skipped}`);
  if (!dryRun) {
    console.log(`- Products Created:        ${stats.createdProducts}`);
    console.log(`- Variants Created:        ${stats.createdVariants}`);
    console.log(`- Variants Updated:        ${stats.updatedVariants}`);
    await mongoose.disconnect();
  }
  console.log(`========================================\n`);

  if (stats.errors.length > 0) {
    console.log(`Sample Errors (First 5):`);
    stats.errors.slice(0, 5).forEach((e) => console.log(`  Row ${e.index}: ${e.reason}`));
  }

  return stats;
}

// CLI entrypoint
if (process.argv[1]?.includes("import-catalogue")) {
  const filePath = process.argv[2] || path.join(process.cwd(), "scripts/data/catalogue-data.json");
  const isDryRun = process.argv.includes("--dry-run");

  runCatalogueImport({ filePath, dryRun: isDryRun }).catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  });
}
