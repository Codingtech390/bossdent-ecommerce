import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId | null;
  level: number; // 0 for root category, 1 for subcategory, 2 for sub-sub
  order: number;
  icon?: string;
  image?: string;
  banner?: string;
  isFeatured: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: "" },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    level: { type: Number, default: 0, index: true },
    order: { type: Number, default: 0 },
    icon: { type: String, default: "" },
    image: { type: String, default: "" },
    banner: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false, index: true },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ parentId: 1, order: 1 });

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
