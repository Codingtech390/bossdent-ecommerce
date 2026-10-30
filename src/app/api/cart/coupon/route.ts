import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Coupon } from "@/models/Coupon";
import { extractSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = extractSessionFromRequest(req);
    const sessionId = req.cookies.get("dk_cart_session")?.value || "";

    const { code, remove } = await req.json();

    const query: Record<string, unknown> = session ? { user: session.userId } : { sessionId };
    const cart = await Cart.findOne(query);

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    if (remove) {
      cart.appliedCoupon = undefined;
      await cart.save();
      return NextResponse.json({ success: true, message: "Coupon removed", cart });
    }

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      validUntil: { $gte: new Date() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid or expired coupon code" },
        { status: 400 }
      );
    }

    // Check membership tier eligibility
    const userTier = session?.membershipTier || "none";
    if (coupon.applicableTiers.includes("plus") && !coupon.applicableTiers.includes("all")) {
      if (userTier !== "plus") {
        return NextResponse.json(
          { error: "This promo code is exclusively reserved for DentalKart Plus members." },
          { status: 403 }
        );
      }
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          error: `Minimum order value for this coupon is ₹${coupon.minOrderValue}. Add items worth ₹${coupon.minOrderValue - subtotal} more.`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "fixed") {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    } else {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }

    cart.appliedCoupon = {
      code: coupon.code,
      discountAmount,
      description: coupon.description,
    };

    await cart.save();

    return NextResponse.json({
      success: true,
      message: `Coupon ${coupon.code} applied! Saved ₹${discountAmount}`,
      cart,
    });
  } catch (err: unknown) {
    console.error("Coupon apply error:", err);
    return NextResponse.json({ error: "Failed to apply coupon" }, { status: 500 });
  }
}
