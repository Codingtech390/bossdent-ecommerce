import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  User,
  Brand,
  Category,
  Product,
  ProductVariant,
  Review,
  Coupon,
  MembershipPlan,
  SiteBanner,
  Order,
} from "../src/models";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dentalkart_clone";

async function seed() {
  console.log("Connecting to MongoDB for seeding:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Clear existing collections to make seed deterministic
  await Promise.all([
    User.deleteMany({}),
    Brand.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    ProductVariant.deleteMany({}),
    Review.deleteMany({}),
    Coupon.deleteMany({}),
    MembershipPlan.deleteMany({}),
    SiteBanner.deleteMany({}),
    Order.deleteMany({}),
  ]);

  console.log("Cleared existing data.");

  // 1. Create Default Users (Admin & Demo Dentist)
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  const doctorHash = await bcrypt.hash("Doctor@123", 10);

  const adminUser = await User.create({
    name: "DentalKart SuperAdmin",
    email: "admin@dentalkart.com",
    password: passwordHash,
    phone: "9876543210",
    role: "admin",
    dentacoins: 5000,
    membershipTier: "plus",
    addresses: [
      {
        fullName: "DentalKart HQ Operations",
        clinicName: "DentalKart Logistics Hub",
        phone: "9876543210",
        addressLine1: "Plot 14, Okhla Industrial Area, Phase III",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110020",
        isDefault: true,
      },
    ],
  });

  const doctorUser = await User.create({
    name: "Dr. Rajesh Sharma, MDS",
    email: "dr.sharma@dentalcare.com",
    password: doctorHash,
    phone: "9811223344",
    role: "customer",
    clinicName: "Sharma Multispeciality Dental Clinic & Implant Centre",
    gstNumber: "07AAAAA0000A1Z5",
    dciNumber: "DCI-DL-2015-8941",
    dentacoins: 450, // Has 450 Dentacoins
    membershipTier: "plus",
    membershipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    addresses: [
      {
        fullName: "Dr. Rajesh Sharma",
        clinicName: "Sharma Multispeciality Dental Care",
        phone: "9811223344",
        addressLine1: "Shop 4, Ground Floor, Sector 18 Commercial Complex",
        city: "Noida",
        state: "Uttar Pradesh",
        pincode: "201301",
        isDefault: true,
      },
    ],
  });

  console.log("Seeded Users: admin@dentalkart.com / dr.sharma@dentalcare.com");

  // Read JSON catalogue
  const dataPath = path.join(process.cwd(), "scripts/data/catalogue-data.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(rawData);

  // 2. Seed Brands
  const brandMap = new Map<string, mongoose.Types.ObjectId>();
  for (const b of data.brands) {
    const brandDoc = await Brand.create({
      name: b.name,
      slug: b.slug,
      originCountry: b.originCountry,
      isFeatured: b.isFeatured,
      description: b.description,
      logo: `https://avatar.vercel.sh/${b.slug}.svg?text=${encodeURIComponent(b.name.slice(0, 3))}`,
      productCount: 0,
    });
    brandMap.set(b.slug, brandDoc._id as mongoose.Types.ObjectId);
  }
  console.log(`Seeded ${data.brands.length} Brands.`);

  // 3. Seed Categories & Subcategories
  const categoryMap = new Map<string, mongoose.Types.ObjectId>();
  for (const c of data.categories) {
    const parentCat = await Category.create({
      name: c.name,
      slug: c.slug,
      description: c.description,
      isFeatured: c.isFeatured,
      order: c.order,
      level: 0,
      image: `https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80`,
    });
    categoryMap.set(c.slug, parentCat._id as mongoose.Types.ObjectId);

    if (c.subcategories && Array.isArray(c.subcategories)) {
      for (const [subIndex, sub] of c.subcategories.entries()) {
        const subCat = await Category.create({
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          parentId: parentCat._id,
          level: 1,
          order: subIndex + 1,
          isFeatured: false,
        });
        categoryMap.set(sub.slug, subCat._id as mongoose.Types.ObjectId);
      }
    }
  }
  console.log(`Seeded Categories and Subcategories.`);

  // 4. Seed Products and Variants
  for (const p of data.products) {
    const brandId = brandMap.get(p.brandSlug);
    const categoryId = categoryMap.get(p.categorySlug);
    const subcategoryId = p.subcategorySlug ? categoryMap.get(p.subcategorySlug) : undefined;

    if (!brandId || !categoryId) {
      console.warn(`Skipping product ${p.title} due to missing brand or category.`);
      continue;
    }

    const discountPercent = p.baseComparePrice && p.baseComparePrice > p.basePrice
      ? Math.round(((p.baseComparePrice - p.basePrice) / p.baseComparePrice) * 100)
      : 0;

    const productDoc = await Product.create({
      title: p.title,
      slug: p.slug,
      brand: brandId,
      category: categoryId,
      subcategory: subcategoryId,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      features: p.features || [],
      specifications: p.specifications || [],
      images: p.images || [],
      defaultSku: p.defaultSku,
      basePrice: p.basePrice,
      baseComparePrice: p.baseComparePrice,
      discountPercent,
      rating: 4.6 + Math.random() * 0.4,
      reviewCount: Math.floor(15 + Math.random() * 85),
      badges: p.badges || [],
      isQuotationOnly: Boolean(p.isQuotationOnly),
      isFreebieEligible: Boolean(p.isFreebieEligible),
      freebieTitle: p.freebieTitle,
      rewardCoins: p.rewardCoins || 20,
      inStock: p.inStock ?? true,
      totalStock: p.totalStock || 50,
      warrantyMonths: p.warrantyMonths || 0,
      packageContents: p.packageContents || "",
      variantAttributeNames: p.variantAttributeNames || [],
      active: true,
      salesCount: Math.floor(50 + Math.random() * 200),
      views: Math.floor(300 + Math.random() * 1000),
      provenance: "DentalKart Verified Public Catalogue",
    });

    // Update Brand & Category product counts
    await Brand.findByIdAndUpdate(brandId, { $inc: { productCount: 1 } });
    await Category.findByIdAndUpdate(categoryId, { $inc: { productCount: 1 } });
    if (subcategoryId) {
      await Category.findByIdAndUpdate(subcategoryId, { $inc: { productCount: 1 } });
    }

    // Seed Variants
    if (p.variants && Array.isArray(p.variants)) {
      for (const v of p.variants) {
        await ProductVariant.create({
          product: productDoc._id,
          sku: v.sku,
          title: v.title,
          attributes: v.attributes || {},
          price: v.price,
          comparePrice: v.comparePrice,
          stock: v.stock || 20,
          image: p.images[0] || "",
          active: true,
        });
      }
    } else {
      await ProductVariant.create({
        product: productDoc._id,
        sku: p.defaultSku,
        title: "Standard Pack",
        attributes: { Option: "Standard" },
        price: p.basePrice,
        comparePrice: p.baseComparePrice,
        stock: p.totalStock || 50,
        image: p.images[0] || "",
        active: true,
      });
    }

    // Seed sample verified reviews for the product
    await Review.create({
      product: productDoc._id,
      user: doctorUser._id,
      userName: "Dr. Rajesh Sharma, MDS",
      userClinic: "Sharma Multispeciality Dental Care",
      rating: 5,
      title: "Excellent quality and authentic batch",
      comment: `Consistently order this from DentalKart. Long expiry date, flawless packaging, and fast delivery to our clinic. Highly recommended for daily clinical practice.`,
      verifiedPurchase: true,
      status: "approved",
      helpfulCount: 8,
    });
  }
  console.log(`Seeded Products, Variants, and Clinical Reviews.`);

  // 5. Seed Coupons
  for (const c of data.coupons) {
    await Coupon.create({
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      maxDiscount: c.maxDiscount,
      validUntil: new Date(c.validUntil),
      applicableTiers: c.applicableTiers || ["all"],
      isActive: true,
    });
  }
  console.log(`Seeded Coupons.`);

  // 6. Seed Membership Plans
  for (const m of data.membershipPlans) {
    await MembershipPlan.create({
      name: m.name,
      slug: m.slug,
      price: m.price,
      durationMonths: m.durationMonths,
      benefits: m.benefits,
      isActive: true,
    });
  }
  console.log(`Seeded Membership Plans.`);

  // 7. Seed Banners
  for (const b of data.siteBanners) {
    await SiteBanner.create({
      title: b.title,
      subtitle: b.subtitle,
      badge: b.badge,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl,
      position: b.position,
      order: b.order,
      bgGradient: b.bgGradient,
      active: true,
    });
  }
  console.log(`Seeded Site Banners.`);

  // 8. Seed Sample Order for Dr. Sharma
  const sampleProduct = await Product.findOne({ slug: "3m-filtek-z250-universal-restorative-composite" });
  if (sampleProduct) {
    await Order.create({
      orderNumber: "DK-202610-89104",
      user: doctorUser._id,
      items: [
        {
          product: sampleProduct._id,
          sku: "3M-Z250-A2",
          title: sampleProduct.title,
          variantTitle: "Shade A2 - 4g Syringe",
          image: sampleProduct.images[0],
          quantity: 2,
          unitPrice: 1420,
          lineTotal: 2840,
        },
      ],
      shippingAddress: doctorUser.addresses[0],
      pricing: {
        subtotal: 2840,
        discount: 0,
        dentacoinsRedeemed: 100,
        dentacoinsDiscount: 100,
        shippingFee: 0,
        total: 2740,
      },
      dentacoinsEarned: 100,
      payment: {
        method: "online",
        status: "paid",
        provider: "demo",
        transactionId: "TXN_DEMO_91823749",
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      shipment: {
        carrier: "Delhivery Medical Express",
        trackingNumber: "DLV981273948IN",
        trackingUrl: "https://www.delhivery.com/track/package/DLV981273948IN",
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        dispatchedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      orderStatus: "shipped",
      timeline: [
        { status: "Order Placed", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: "Verified online payment received." },
        { status: "Packed & Sterilized Check", timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), note: "Batch verified with >18 months expiry." },
        { status: "Handed over to Delhivery Express", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: "Tracking # DLV981273948IN" },
      ],
    });
    console.log(`Seeded Dr. Sharma's order history.`);
  }

  console.log("Seeding finished successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
