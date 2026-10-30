import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  sku: string;
  title: string;
  variantTitle?: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isFreebie?: boolean;
}

export interface IOrderTimeline {
  status: string;
  timestamp: Date;
  note: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    clinicName?: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    couponCode?: string;
    dentacoinsRedeemed: number;
    dentacoinsDiscount: number;
    shippingFee: number;
    total: number;
  };
  dentacoinsEarned: number;
  payment: {
    method: "online" | "upi" | "card" | "cod" | "demo";
    status: "pending" | "paid" | "failed" | "refunded";
    provider: string;
    transactionId?: string;
    paidAt?: Date;
  };
  shipment: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: Date;
    dispatchedAt?: Date;
    deliveredAt?: Date;
  };
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  timeline: IOrderTimeline[];
  cancellationReason?: string;
  returnDetails?: {
    requestedAt?: Date;
    reason?: string;
    status: "none" | "requested" | "approved" | "rejected" | "refunded";
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    sku: { type: String, required: true },
    title: { type: String, required: true },
    variantTitle: { type: String },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    isFreebie: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrderTimelineSchema = new Schema<IOrderTimeline>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guestInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      clinicName: { type: String },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      couponCode: { type: String },
      dentacoinsRedeemed: { type: Number, default: 0 },
      dentacoinsDiscount: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    dentacoinsEarned: { type: Number, default: 0 },
    payment: {
      method: { type: String, enum: ["online", "upi", "card", "cod", "demo"], default: "demo" },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "paid",
        index: true,
      },
      provider: { type: String, default: "demo" },
      transactionId: { type: String },
      paidAt: { type: Date },
    },
    shipment: {
      carrier: { type: String, default: "Delhivery Medical Express" },
      trackingNumber: { type: String },
      trackingUrl: { type: String },
      estimatedDelivery: { type: Date },
      dispatchedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "confirmed",
      index: true,
    },
    timeline: [OrderTimelineSchema],
    cancellationReason: { type: String },
    returnDetails: {
      requestedAt: { type: Date },
      reason: { type: String },
      status: {
        type: String,
        enum: ["none", "requested", "approved", "rejected", "refunded"],
        default: "none",
      },
    },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
