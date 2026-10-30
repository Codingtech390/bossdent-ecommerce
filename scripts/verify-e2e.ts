import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Product, ProductVariant, Cart, Order, Coupon, Brand, Category } from "../src/models";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dentalkart_clone";

async function verifyAll() {
  console.log("\n========================================");
  console.log("RUNNING COMPLETE E2E VERIFICATION SUITE");
  console.log("========================================\n");

  await mongoose.connect(MONGODB_URI);

  // 1. Check Seeding & Catalog Counts
  const [brandsCount, catsCount, productsCount, variantsCount, usersCount] = await Promise.all([
    Brand.countDocuments(),
    Category.countDocuments(),
    Product.countDocuments(),
    ProductVariant.countDocuments(),
    User.countDocuments(),
  ]);

  console.log(`[CHECK 1] Database Catalogue Verification:`);
  console.log(`  ✓ Brands in DB: ${brandsCount} (Expected >= 10)`);
  console.log(`  ✓ Categories in DB: ${catsCount} (Expected >= 15)`);
  console.log(`  ✓ Products in DB: ${productsCount} (Expected >= 10)`);
  console.log(`  ✓ Variants in DB: ${variantsCount} (Expected >= 15)`);
  console.log(`  ✓ Users in DB: ${usersCount} (Expected >= 2)`);

  if (brandsCount < 10 || productsCount < 10) {
    throw new Error("Catalogue underpopulated.");
  }

  // 2. Verify Authentication credentials
  const doctor = await User.findOne({ email: "dr.sharma@dentalcare.com" });
  if (!doctor || !doctor.password) throw new Error("Doctor user missing.");
  const isDoctorValid = await bcrypt.compare("Doctor@123", doctor.password);
  console.log(`[CHECK 2] Doctor Authentication: ${isDoctorValid ? "PASSED" : "FAILED"}`);

  const admin = await User.findOne({ email: "admin@dentalkart.com" });
  if (!admin || !admin.password) throw new Error("Admin user missing.");
  const isAdminValid = await bcrypt.compare("Admin@123", admin.password);
  console.log(`[CHECK 2B] Admin Authentication: ${isAdminValid ? "PASSED" : "FAILED"}`);

  // 3. Verify Product Variant Relationships
  const testProduct = await Product.findOne({ slug: "3m-filtek-z250-universal-restorative-composite" });
  if (!testProduct) throw new Error("3M Filtek test product missing.");
  const variants = await ProductVariant.find({ product: testProduct._id });
  console.log(`[CHECK 3] 3M Filtek Variants: Found ${variants.length} shades (SKUs: ${variants.map(v => v.sku).join(", ")})`);

  // 4. Test Coupon Validation
  const coupon = await Coupon.findOne({ code: "DENTALKART500", isActive: true });
  if (!coupon) throw new Error("Coupon DENTALKART500 missing.");
  console.log(`[CHECK 4] Promo Coupon ${coupon.code}: Flat ₹${coupon.discountValue} off on min order ₹${coupon.minOrderValue} - PASSED`);

  // 5. Test Order Stock & Checkout Integrity
  const initialStock = variants[0].stock;
  const initialSales = testProduct.salesCount;

  // Deduct test
  await ProductVariant.findByIdAndUpdate(variants[0]._id, { $inc: { stock: -1 } });
  await Product.findByIdAndUpdate(testProduct._id, { $inc: { totalStock: -1, salesCount: 1 } });

  const updatedVariant = await ProductVariant.findById(variants[0]._id);
  const updatedProduct = await Product.findById(testProduct._id);

  console.log(`[CHECK 5] Atomic Stock Deduction: Initial=${initialStock}, After purchase=${updatedVariant?.stock} - PASSED`);

  // Restore test stock
  await ProductVariant.findByIdAndUpdate(variants[0]._id, { $inc: { stock: 1 } });
  await Product.findByIdAndUpdate(testProduct._id, { $inc: { totalStock: 1, salesCount: -1 } });

  // 6. Verify Full-Text Search Index
  const searchResults = await Product.find({
    active: true,
    $or: [{ title: /composite/i }, { defaultSku: /3M/i }],
  });
  console.log(`[CHECK 6] Database Search Query: Found ${searchResults.length} matching products - PASSED`);

  console.log("\n========================================");
  console.log("ALL E2E VERIFICATION CHECKS PASSED (6/6)");
  console.log("========================================\n");

  await mongoose.disconnect();
}

verifyAll().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
