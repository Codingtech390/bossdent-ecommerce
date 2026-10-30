import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { User } from "@/models/User";
import { extractSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = extractSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Please log in to redeem your Dentacoins" },
        { status: 401 }
      );
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { coins, remove } = await req.json();
    const cart = await Cart.findOne({ user: session.userId });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    if (remove) {
      cart.rewardCoinsRedeemed = 0;
      await cart.save();
      return NextResponse.json({ success: true, message: "Dentacoins removed", cart });
    }

    const coinsToRedeem = Number(coins);
    if (isNaN(coinsToRedeem) || coinsToRedeem <= 0) {
      return NextResponse.json({ error: "Invalid coin amount" }, { status: 400 });
    }

    if (coinsToRedeem > user.dentacoins) {
      return NextResponse.json(
        { error: `Insufficient Dentacoins. Your balance is ${user.dentacoins} coins.` },
        { status: 400 }
      );
    }

    // Subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    // Max redemption ceiling: 20% for Plus, 10% for Regular
    const maxPercent = user.membershipTier === "plus" ? 0.2 : 0.1;
    const maxAllowedDiscount = Math.floor(subtotal * maxPercent);

    if (coinsToRedeem > maxAllowedDiscount) {
      return NextResponse.json(
        {
          error: `You can redeem up to ${Math.round(maxPercent * 100)}% of cart value (max ${maxAllowedDiscount} Dentacoins) on this order.`,
        },
        { status: 400 }
      );
    }

    cart.rewardCoinsRedeemed = coinsToRedeem;
    await cart.save();

    return NextResponse.json({
      success: true,
      message: `Redeemed ${coinsToRedeem} Dentacoins! Saved ₹${coinsToRedeem}`,
      cart,
    });
  } catch (err: unknown) {
    console.error("Coins error:", err);
    return NextResponse.json({ error: "Failed to apply Dentacoins" }, { status: 500 });
  }
}
