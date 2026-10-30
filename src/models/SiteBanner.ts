import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteBanner extends Document {
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl: string;
  position: "hero" | "middle" | "offer_strip" | "category_feature";
  order: number;
  active: boolean;
  bgGradient?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteBannerSchema = new Schema<ISiteBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    badge: { type: String },
    imageUrl: { type: String, required: true },
    mobileImageUrl: { type: String },
    linkUrl: { type: String, required: true },
    position: {
      type: String,
      enum: ["hero", "middle", "offer_strip", "category_feature"],
      default: "hero",
      index: true,
    },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    bgGradient: { type: String, default: "from-dk-teal-800 to-dk-teal-950" },
  },
  { timestamps: true }
);

SiteBannerSchema.index({ position: 1, active: 1, order: 1 });

export const SiteBanner: Model<ISiteBanner> =
  mongoose.models.SiteBanner ||
  mongoose.model<ISiteBanner>("SiteBanner", SiteBannerSchema);
