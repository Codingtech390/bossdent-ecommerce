import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { extractSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.membershipTier = "plus";
    user.membershipExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    user.dentacoins += 200; // 200 bonus coins on joining Plus
    await user.save();

    return NextResponse.json({
      success: true,
      message: "DentalKart Plus membership activated for 1 year!",
      membershipTier: "plus",
    });
  } catch (err: unknown) {
    console.error("Membership join error:", err);
    return NextResponse.json({ error: "Failed to activate membership" }, { status: 500 });
  }
}
