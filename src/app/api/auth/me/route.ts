import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { extractSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select("-password");
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        clinicName: user.clinicName,
        gstNumber: user.gstNumber,
        dciNumber: user.dciNumber,
        dentacoins: user.dentacoins,
        membershipTier: user.membershipTier,
        membershipExpiresAt: user.membershipExpiresAt,
        addresses: user.addresses,
        wishlist: user.wishlist,
      },
    });
  } catch (err: unknown) {
    console.error("Get current user error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
