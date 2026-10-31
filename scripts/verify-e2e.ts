import mongoose from "mongoose";
import { Brand, Category, Product, ProductVariant } from "../src/models";
import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing from .env.local");
  const dbName = new URL(uri).pathname.replace(/^\/+/, "").split("/")[0];
  if (dbName !== "bossdent") throw new Error(`Safety stop: verification only runs against 'bossdent'; URI selects '${dbName || "(none)"}'.`);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  try {
    const [brands, categories, products, variants] = await Promise.all([
      Brand.countDocuments(), Category.countDocuments(), Product.countDocuments(), ProductVariant.countDocuments()
    ]);
    const missingRelations = await Product.countDocuments({
      $or: [{ brand: { $exists: false } }, { category: { $exists: false } }, { defaultSku: { $in: ["", null] } }]
    });
    const noImages = await Product.countDocuments({ $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] });
    const noStock = await Product.countDocuments({ totalStock: 0 });
    console.log("BOSSDENT DATABASE VERIFICATION");
    console.log({ brands, categories, products, variants, missingRelations, productsWithoutImages: noImages, productsWithZeroStock: noStock });
    if (products < 15) throw new Error(`Expected at least 15 products; found ${products}.`);
    if (missingRelations > 0) throw new Error(`${missingRelations} products have missing required catalogue relationships.`);
    console.log("PASS: catalogue records and required relationships are present.");
    if (noImages || noStock) console.log("ACTION REQUIRED: add licensed product images and verified inventory before enabling purchase.");
  } finally {
    await mongoose.disconnect();
  }
}
main().catch((error) => {
  console.error("Verification failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
