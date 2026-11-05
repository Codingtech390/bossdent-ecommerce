import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { Product } from "../src/models";

/**
 * Bulk product image importer for Bossdent.
 *
 * Usage:
 * npx tsx scripts/import-product-images.ts --dry-run
 * npx tsx scripts/import-product-images.ts
 * npx tsx scripts/import-product-images.ts --overwrite
 */

const IMAGE_DIRECTORY = path.join(process.cwd(), "public", "images", "products");

const products = [
  {
    slug: "labodent-dentwerk-hd-dental-3d-printer-model-resin",
    file: "labodent-dentwerk-hd-resin.png",
    alt: "Labodent DentWERK HD Dental 3D Printer Model Resin",
  },
  {
    slug: "dentaltech-universal-prosthetic-driver-kit",
    file: "dentaltech-prosthetic-driver-kit.jpg",
    alt: "Dentaltech Universal Prosthetic Driver Kit",
  },
  {
    slug: "frank-dental-tapered-round-diamond-bur-tr-series-coarse",
    file: "frank-dental-diamond-bur-tr.jpg",
    alt: "Frank Dental Tapered Round Diamond Bur TR Series Coarse",
  },
  {
    slug: "uu-ortho-trialign-pro-multi-layer-aligner-sheets-round-pack-of-10",
    file: "uu-ortho-trialign-sheets.png",
    alt: "UU Ortho TriAlign Pro Multi-Layer Aligner Sheets",
  },
  {
    slug: "waldent-bestetch-plus-37-percent-phosphoric-acid-etchant",
    file: "waldent-bestetch-plus.png",
    alt: "Waldent BESTEtch Plus 37% Phosphoric Acid Etchant",
  },
  {
    slug: "dentsmind-dm-f1-niti-gold-rotary-files-21mm-pack-of-6",
    file: "dentsmind-dm-f1-rotary-files.png",
    alt: "DentsMind DM-F1 NiTi Gold Rotary Files",
  },
  {
    slug: "dentaltech-straight-abutments-rs",
    file: "dentaltech-straight-abutments.png",
    alt: "Dentaltech Straight Abutments RS",
  },
  {
    slug: "waldent-rctprep-edta",
    file: "waldent-rctprep-edta.png",
    alt: "Waldent RCTprep EDTA",
  },
  {
    slug: "dentsply-spectrum-composite-kit",
    file: "dentsply-spectrum-composite-kit.png",
    alt: "Dentsply Spectrum Composite Kit",
  },
  {
    slug: "icpa-nummit-topical-anesthetic-spray",
    file: "icpa-nummit-anesthetic-spray.png",
    alt: "ICPA Nummit Topical Anesthetic Spray",
  },
  {
    slug: "patient-apron",
    file: "patient-apron.png",
    alt: "Dental Patient Apron",
  },
  {
    slug: "gi-dental-mouth-mirror-no-5-tops-pack-of-10",
    file: "gi-dental-mouth-mirror-no5.png",
    alt: "GI Dental Mouth Mirror No. 5 Tops Pack of 10",
  },
  {
    slug: "gdc-automatic-crown-remover-standard",
    file: "gdc-automatic-crown-remover.png",
    alt: "GDC Automatic Crown Remover Standard",
  },
  {
    slug: "sdi-pola-office-plus-1-patient-kit",
    file: "sdi-pola-office-plus-kit.png",
    alt: "SDI Pola Office Plus 1 Patient Kit",
  },
  {
    slug: "medicept-glass-ionomer-universal-liquid",
    file: "medicept-glass-ionomer-liquid.png",
    alt: "Medicept Glass Ionomer Universal Liquid",
  },
] as const;

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local was not found in the project root.");
  }

  const content = fs.readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);

    if (!match) continue;

    const key = match[1];
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getDatabaseUri(): string {
  loadLocalEnv();

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from .env.local.");
  }

  let databaseName = "";

  try {
    databaseName = new URL(uri).pathname.replace(/^\/+/, "").split("/")[0];
  } catch {
    throw new Error("MONGODB_URI is not a valid MongoDB connection URI.");
  }

  if (databaseName !== "bossdent") {
    throw new Error(
      `Safety stop: expected database 'bossdent', found '${databaseName || "(not specified)"}'.`,
    );
  }

  return uri;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const overwrite = process.argv.includes("--overwrite");

  console.log("\n==================================");
  console.log(" BOSSDENT PRODUCT IMAGE IMPORTER");
  console.log("==================================\n");

  console.log(`Images configured: ${products.length}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "DATABASE UPDATE"}`);
  console.log(`Overwrite existing images: ${overwrite ? "YES" : "NO"}`);
  console.log("");

  // Validate all local image files before connecting to MongoDB.
  const missingFiles = products.filter(
    (product) => !fs.existsSync(path.join(IMAGE_DIRECTORY, product.file)),
  );

  if (missingFiles.length > 0) {
    console.error("The following image files are missing:");

    missingFiles.forEach((product) => {
      console.error(`  - ${product.file}`);
    });

    throw new Error("Image validation failed. No database updates performed.");
  }

  console.log("✓ All 15 local image files found.");

  const uri = getDatabaseUri();

  await mongoose.connect(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 15000,
  });

  try {
    const operations: any[] = [];

    let skipped = 0;

    // Validate every product before performing any writes.
    for (const item of products) {
      const product = await Product.findOne({
        slug: item.slug,
      }).select("_id title images");

      if (!product) {
        throw new Error(`Product not found in MongoDB: ${item.slug}. No updates performed.`);
      }

      const existingImages = Array.isArray(product.images) ? product.images : [];

      if (existingImages.length > 0 && !overwrite) {
        console.log(`SKIPPED: ${item.slug} (image already exists)`);
        skipped++;
        continue;
      }

      const imageUrl = `/images/products/${item.file}`;

      operations.push({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              images: [imageUrl],
            },
          },
        },
      });

      console.log(`${dryRun ? "READY" : "QUEUED"}: ${item.slug} → ${item.file}`);
    }

    if (dryRun) {
      console.log("\nDRY RUN COMPLETE.");
      console.log(`Images ready to assign: ${operations.length}`);
      console.log(`Already populated and skipped: ${skipped}`);
      console.log("No database records were changed.");
      return;
    }

    if (operations.length === 0) {
      console.log("\nNothing to update. All products already have images.");
      return;
    }

    const result = await Product.bulkWrite(operations, {
      ordered: true,
    });

    console.log("\n==================================");
    console.log(" IMAGE IMPORT COMPLETED");
    console.log("==================================");
    console.log(`Products matched: ${result.matchedCount}`);
    console.log(`Products updated: ${result.modifiedCount}`);
    console.log(`Products skipped: ${skipped}`);

    if (result.modifiedCount !== operations.length) {
      throw new Error(
        "The number of updated products does not match the expected count. Please verify the database.",
      );
    }

    console.log("\n✓ Product images successfully assigned.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("\nIMAGE IMPORT FAILED:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
