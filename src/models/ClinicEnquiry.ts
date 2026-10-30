import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClinicEnquiry extends Document {
  doctorName: string;
  clinicName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  budgetRange: string; // e.g. "₹5 Lakh - ₹10 Lakh"
  packageType: string; // "Basic Starter Setup", "Advanced Operatory", "Digital Dentistry & CAD/CAM"
  dentalChairsCount: number;
  message?: string;
  status: "new" | "contacted" | "quotation_sent" | "closed" | "rejected";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicEnquirySchema = new Schema<IClinicEnquiry>(
  {
    doctorName: { type: String, required: true },
    clinicName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    budgetRange: { type: String, required: true },
    packageType: { type: String, default: "Full Clinic Setup" },
    dentalChairsCount: { type: Number, default: 1 },
    message: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "quotation_sent", "closed", "rejected"],
      default: "new",
      index: true,
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export const ClinicEnquiry: Model<IClinicEnquiry> =
  mongoose.models.ClinicEnquiry ||
  mongoose.model<IClinicEnquiry>("ClinicEnquiry", ClinicEnquirySchema);
