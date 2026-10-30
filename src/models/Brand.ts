import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo: string;
  description: string;
  originCountry: string;
  isFeatured: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    originCountry: { type: String, default: "India" },
    isFeatured: { type: Boolean, default: false, index: true },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Brand: Model<IBrand> =
  mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);
