import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  sku: string;
  title: string;
  variantTitle?: string;
  image: string;
  quantity: number;
  unitPrice: number;
  comparePrice?: number;
  isFreebie?: boolean;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  appliedCoupon?: {
    code: string;
    discountAmount: number;
    description: string;
  };
  rewardCoinsRedeemed: number;
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    sku: { type: String, required: true },
    title: { type: String, required: true },
    variantTitle: { type: String },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    isFreebie: { type: Boolean, default: false },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String, index: true },
    items: [CartItemSchema],
    appliedCoupon: {
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
      description: { type: String },
    },
    rewardCoinsRedeemed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CartSchema.index({ user: 1, sessionId: 1 });

export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
