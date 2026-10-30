import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress {
  _id?: string;
  fullName: string;
  clinicName?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "customer" | "admin";
  clinicName?: string;
  gstNumber?: string;
  dciNumber?: string; // Dental Council of India registration number
  addresses: IAddress[];
  dentacoins: number; // Reward points balance
  membershipTier: "none" | "plus";
  membershipExpiresAt?: Date;
  wishlist: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  fullName: { type: String, required: true },
  clinicName: { type: String },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true, index: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String },
    phone: { type: String, index: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    clinicName: { type: String },
    gstNumber: { type: String },
    dciNumber: { type: String },
    addresses: [AddressSchema],
    dentacoins: { type: Number, default: 100 }, // Welcome bonus
    membershipTier: { type: String, enum: ["none", "plus"], default: "none" },
    membershipExpiresAt: { type: Date },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
