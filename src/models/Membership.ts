import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMembershipPlan extends Document {
  name: string;
  slug: string;
  price: number;
  durationMonths: number;
  benefits: {
    dentacoinsMultiplier: number; // 2x
    freeShippingThreshold: number; // ₹499
    maxCoinRedemptionPercent: number; // 20%
    priorityProcessing: boolean;
    freeDentalWebinarAccess: boolean;
  };
  isActive: boolean;
}

const MembershipPlanSchema = new Schema<IMembershipPlan>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    durationMonths: { type: Number, default: 12 },
    benefits: {
      dentacoinsMultiplier: { type: Number, default: 2 },
      freeShippingThreshold: { type: Number, default: 499 },
      maxCoinRedemptionPercent: { type: Number, default: 20 },
      priorityProcessing: { type: Boolean, default: true },
      freeDentalWebinarAccess: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MembershipPlan: Model<IMembershipPlan> =
  mongoose.models.MembershipPlan ||
  mongoose.model<IMembershipPlan>("MembershipPlan", MembershipPlanSchema);

export interface IRewardTransaction extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  type: "earned" | "redeemed" | "bonus" | "expired";
  orderId?: mongoose.Types.ObjectId;
  description: string;
  balanceAfter: number;
  createdAt: Date;
}

const RewardTransactionSchema = new Schema<IRewardTransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["earned", "redeemed", "bonus", "expired"], required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    description: { type: String, required: true },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const RewardTransaction: Model<IRewardTransaction> =
  mongoose.models.RewardTransaction ||
  mongoose.model<IRewardTransaction>("RewardTransaction", RewardTransactionSchema);
