import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { extractSessionFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ wishlist: [] });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).populate("wishlist");
    return NextResponse.json({ wishlist: user?.wishlist || [] });
  } catch (err: unknown) {
    console.error("Wishlist GET error:", err);
    return NextResponse.json({ wishlist: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Please log in to use your wishlist" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const objId = new mongoose.Types.ObjectId(productId);
    const index = user.wishlist.findIndex((id) => id.toString() === productId);

    let isWishlisted = false;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      isWishlisted = false;
    } else {
      user.wishlist.push(objId);
      isWishlisted = true;
    }

    await user.save();
    return NextResponse.json({
      success: true,
      isWishlisted,
      wishlistCount: user.wishlist.length,
    });
  } catch (err: unknown) {
    console.error("Wishlist toggle error:", err);
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}
