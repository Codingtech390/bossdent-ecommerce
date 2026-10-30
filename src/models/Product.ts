import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductSpecification {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  brand: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  specifications: IProductSpecification[];
  images: string[];
  defaultSku: string;
  basePrice: number;
  baseComparePrice?: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  badges: string[];
  isQuotationOnly: boolean;
  isFreebieEligible: boolean;
  freebieTitle?: string;
  rewardCoins: number;
  inStock: boolean;
  totalStock: number;
  warrantyMonths?: number;
  packageContents?: string;
  expiryNotice?: string;
  returnPolicyDays: number;
  active: boolean;
  provenance: string;
  variantAttributeNames: string[];
  views: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSpecificationSchema = new Schema<IProductSpecification>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategory: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    shortDescription: { type: String, default: "" },
    fullDescription: { type: String, default: "" },
    features: [{ type: String }],
    specifications: [ProductSpecificationSchema],
    images: [{ type: String }],
    defaultSku: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0, index: true },
    baseComparePrice: { type: Number, min: 0 },
    discountPercent: { type: Number, default: 0, index: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5, index: true },
    reviewCount: { type: Number, default: 0 },
    badges: [{ type: String, index: true }], // "Best Seller", "Hot Seller", "New Arrival", "Offer", "DentalKart Verified"
    isQuotationOnly: { type: Boolean, default: false },
    isFreebieEligible: { type: Boolean, default: false, index: true },
    freebieTitle: { type: String },
    rewardCoins: { type: Number, default: 20 },
    inStock: { type: Boolean, default: true, index: true },
    totalStock: { type: Number, default: 50 },
    warrantyMonths: { type: Number, default: 0 },
    packageContents: { type: String, default: "" },
    expiryNotice: { type: String, default: "Standard Fresh Batch (Minimum 18 months expiry)" },
    returnPolicyDays: { type: Number, default: 7 },
    active: { type: Boolean, default: true, index: true },
    provenance: { type: String, default: "DentalKart Verified Catalogue" },
    variantAttributeNames: [{ type: String }],
    views: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

// Full-text search index on title, shortDescription, specifications
ProductSchema.index({
  title: "text",
  shortDescription: "text",
  "specifications.value": "text",
});

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
