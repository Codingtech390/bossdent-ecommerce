import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ClinicEnquiry } from "@/models/ClinicEnquiry";
import { extractSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const enquiries = await ClinicEnquiry.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ enquiries });
  } catch (err: unknown) {
    console.error("Admin enquiries error:", err);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { enquiryId, status, adminNotes } = body;

    const updated = await ClinicEnquiry.findByIdAndUpdate(
      enquiryId,
      { ...(status && { status }), ...(adminNotes && { adminNotes }) },
      { new: true }
    );

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (err: unknown) {
    console.error("Admin enquiries PATCH error:", err);
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}
