import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ClinicEnquiry } from "@/models/ClinicEnquiry";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      doctorName,
      clinicName,
      email,
      phone,
      city,
      state,
      pincode,
      budgetRange,
      packageType,
      dentalChairsCount,
      message,
    } = body;

    if (!doctorName || !email || !phone || !city) {
      return NextResponse.json(
        { error: "Doctor name, email, phone, and city are required." },
        { status: 400 }
      );
    }

    const enquiry = await ClinicEnquiry.create({
      doctorName,
      clinicName: clinicName || "New Clinic Setup",
      email,
      phone,
      city,
      state: state || "India",
      pincode: pincode || "110001",
      budgetRange: budgetRange || "₹5 Lakh - ₹10 Lakh",
      packageType: packageType || "Full Clinic Setup",
      dentalChairsCount: Number(dentalChairsCount) || 1,
      message,
      status: "new",
    });

    return NextResponse.json({
      success: true,
      message: "Clinic setup consultation enquiry submitted! Our biomedical engineer will contact you within 24 hours.",
      enquiryId: enquiry._id,
    });
  } catch (err: unknown) {
    console.error("Clinic enquiry error:", err);
    return NextResponse.json({ error: "Failed to submit enquiry." }, { status: 500 });
  }
}
