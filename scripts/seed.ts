import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { Brand, Category, Product, ProductVariant } from "../src/models";

type SeedOptions = { dryRun?: boolean };

function loadLocalEnv() {
  // tsx scripts run outside Next.js, so .env.local is not loaded automatically.
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function getBossdentUri(): string {
  loadLocalEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it to .env.local and include /bossdent as the database name.");
  }

  let databaseName = "";
  try {
    databaseName = new URL(uri).pathname.replace(/^\/+/, "").split("/")[0];
  } catch {
    throw new Error("MONGODB_URI is not a valid MongoDB connection URI.");
  }

  if (databaseName !== "bossdent") {
    throw new Error(`Safety stop: this script only writes to the 'bossdent' database. Current URI database is '${databaseName || "(not specified)"}'.`);
  }
  return uri;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const uri = getBossdentUri();
  const dataPath = path.join(process.cwd(), "scripts", "data", "catalogue-data.json");

  if (!fs.existsSync(dataPath)) throw new Error(`Catalogue file not found: ${dataPath}`);
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  if (!Array.isArray(data.brands) || !Array.isArray(data.categories) || !Array.isArray(data.products)) {
    throw new Error("Catalogue JSON must contain brands, categories and products arrays.");
  }
  if (data.products.length < 15) {
    throw new Error(`Expected at least 15 catalogue products; found ${data.products.length}.`);
  }

  const allSlugs = new Set<string>();
  const allSkus = new Set<string>();
  for (const product of data.products) {
    if (!product.title || !product.slug || !product.brandSlug || !product.categorySlug ||
        !product.defaultSku || typeof product.basePrice !== "number") {
      throw new Error(`Invalid required product fields: ${product.title || product.slug || "(unnamed product)"}`);
    }
    if (allSlugs.has(product.slug)) throw new Error(`Duplicate product slug: ${product.slug}`);
    allSlugs.add(product.slug);

    const variants = Array.isArray(product.variants) && product.variants.length
      ? product.variants
      : [{ sku: product.defaultSku, title: "Standard option", attributes: {}, price: product.basePrice, comparePrice: product.baseComparePrice, stock: 0 }];
    for (const variant of variants) {
      const sku = String(variant.sku || "").toUpperCase().trim();
      if (!sku) throw new Error(`Missing variant SKU for ${product.title}`);
      if (allSkus.has(sku)) throw new Error(`Duplicate SKU in catalogue: ${sku}`);
      allSkus.add(sku);
    }
  }

  console.log(`Bossdent catalogue ${dryRun ? "DRY RUN" : "SEED"}`);
  console.log(`Brands: ${data.brands.length} | Categories: ${data.categories.length} | Products: ${data.products.length}`);
  console.log("Target database: bossdent (URI is not printed).");
  console.log("No users, carts, orders, reviews, coupons, memberships or banners will be deleted or seeded.");

  if (dryRun) {
    console.log("Validation passed. No database connection or writes performed.");
    return;
  }

  await mongoose.connect(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 15000 });

  try {
    const brandIds = new Map<string, mongoose.Types.ObjectId>();
    for (const item of data.brands) {
      let doc = await Brand.findOne({ slug: item.slug });
      if (!doc) {
        doc = await Brand.create({
          name: item.name,
          slug: item.slug,
          originCountry: item.originCountry || "Not specified",
          description: item.description || "",
          logo: "",
          isFeatured: Boolean(item.isFeatured),
          productCount: 0,
        });
      }
      brandIds.set(item.slug, doc._id as mongoose.Types.ObjectId);
    }

    const categoryIds = new Map<string, mongoose.Types.ObjectId>();
    for (const item of data.categories) {
      let parent = await Category.findOne({ slug: item.slug });
      if (!parent) {
        parent = await Category.create({
          name: item.name,
          slug: item.slug,
          description: item.description || "",
          parentId: null,
          level: 0,
          order: item.order || 0,
          icon: "",
          image: "",
          banner: "",
          isFeatured: Boolean(item.isFeatured),
          productCount: 0,
        });
      }
      categoryIds.set(item.slug, parent._id as mongoose.Types.ObjectId);

      for (const [index, sub] of (item.subcategories || []).entries()) {
        let child = await Category.findOne({ slug: sub.slug });
        if (!child) {
          child = await Category.create({
            name: sub.name,
            slug: sub.slug,
            description: sub.description || "",
            parentId: parent._id,
            level: 1,
            order: index + 1,
            icon: "",
            image: "",
            banner: "",
            isFeatured: false,
            productCount: 0,
          });
        }
        categoryIds.set(sub.slug, child._id as mongoose.Types.ObjectId);
      }
    }

    let createdProducts = 0;
    let existingProducts = 0;
    let createdVariants = 0;
    let existingVariants = 0;

    for (const item of data.products) {
      const brandId = brandIds.get(item.brandSlug);
      const categoryId = categoryIds.get(item.categorySlug);
      const subcategoryId = item.subcategorySlug
        ? categoryIds.get(item.subcategorySlug)
        : undefined;
      if (!brandId) throw new Error(`Brand '${item.brandSlug}' missing for ${item.title}`);
      if (!categoryId) throw new Error(`Category '${item.categorySlug}' missing for ${item.title}`);
      if (item.subcategorySlug && !subcategoryId)
        throw new Error(`Subcategory '${item.subcategorySlug}' missing for ${item.title}`);

      let product = await Product.findOne({ slug: item.slug });
      if (!product) {
        const compare = item.baseComparePrice;
        const discountPercent =
          compare && compare > item.basePrice
            ? Math.round(((compare - item.basePrice) / compare) * 100)
            : 0;

        product = await Product.create({
          title: item.title,
          slug: item.slug,
          brand: brandId,
          category: categoryId,
          subcategory: subcategoryId,
          shortDescription: item.shortDescription || "",
          fullDescription: item.fullDescription || item.shortDescription || "",
          features: item.features || [],
          specifications: item.specifications || [],
          images: item.images || [],
          defaultSku: String(item.defaultSku).toUpperCase(),
          basePrice: item.basePrice,
          baseComparePrice: compare,
          discountPercent,
          rating: 0,
          reviewCount: 0,
          badges: item.badges || [],
          isQuotationOnly: Boolean(item.isQuotationOnly),
          isFreebieEligible: Boolean(item.isFreebieEligible),
          freebieTitle: item.freebieTitle,
          rewardCoins: item.rewardCoins ?? 0,
          inStock: false,
          totalStock: 0,
          warrantyMonths: item.warrantyMonths ?? 0,
          packageContents: item.packageContents || "",
          expiryNotice: "",
          returnPolicyDays: 0,
          active: true,
          provenance: item.provenance || "Bossdent catalogue research",
          variantAttributeNames: item.variantAttributeNames || [],
          views: 0,
          salesCount: 0,
        });
        createdProducts++;
      } else {
        // Existing product is deliberately left untouched, including its stock, images and pricing.
        existingProducts++;
      }

      const variants =
        Array.isArray(item.variants) && item.variants.length
          ? item.variants
          : [
              {
                sku: item.defaultSku,
                title: "Standard option",
                attributes: {},
                price: item.basePrice,
                comparePrice: item.baseComparePrice,
                stock: 0,
              },
            ];

      for (const variant of variants) {
        const sku = String(variant.sku).toUpperCase().trim();
        const existing = await ProductVariant.findOne({ sku });
        if (!existing) {
          await ProductVariant.create({
            product: product._id,
            sku,
            title: variant.title || "Standard option",
            attributes: variant.attributes || {},
            price: variant.price,
            comparePrice: variant.comparePrice,
            stock: 0,
            image: "",
            active: true,
          });
          createdVariants++;
        } else {
          existingVariants++;
        }
      }
    }

    // Recalculate category and brand product counts from actual product relationships.

    // Brands
    const brandEntries = Array.from(brandIds.entries());

    for (let index = 0; index < brandEntries.length; index++) {
      const [, id] = brandEntries[index];

      const count = await Product.countDocuments({ brand: id });

      await Brand.updateOne({ _id: id }, { $set: { productCount: count } });
    }

    // Categories
    const categoryEntries = Array.from(categoryIds.entries());

    for (let index = 0; index < categoryEntries.length; index++) {
      const [, id] = categoryEntries[index];

      const count = await Product.countDocuments({
        $or: [{ category: id }, { subcategory: id }],
      });

      await Category.updateOne({ _id: id }, { $set: { productCount: count } });
    }

    console.log("Catalogue seed completed.");
    console.log(`Products created: ${createdProducts}; already existed: ${existingProducts}`);
    console.log(`Variants created: ${createdVariants}; already existed: ${existingVariants}`);
    console.log(
      "All seeded inventory starts at zero. Add approved images and verified stock before enabling purchases.",
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Catalogue seed failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
