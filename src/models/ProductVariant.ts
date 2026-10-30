import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductVariant extends Document {
  product: mongoose.Types.ObjectId;
  sku: string;
  title: string;
  attributes: Record<string, string>; // e.g. { Shade: "A2", Pack: "Pack of 1" }
  price: number;
  comparePrice?: number;
  stock: number;
  image?: string;
  barcode?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    title: { type: String, required: true },
    attributes: { type: Map, of: String, default: {} },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    image: { type: String },
    barcode: { type: String },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ProductVariantSchema.index({ product: 1, active: 1 });

export const ProductVariant: Model<IProductVariant> =
  mongoose.models.ProductVariant ||
  mongoose.model<IProductVariant>("ProductVariant", ProductVariantSchema);
