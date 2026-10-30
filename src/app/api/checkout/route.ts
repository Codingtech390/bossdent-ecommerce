import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import { User } from "@/models/User";
import { Coupon } from "@/models/Coupon";
import { RewardTransaction } from "@/models/Membership";
import { extractSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = extractSessionFromRequest(req);
    const sessionId = req.cookies.get("dk_cart_session")?.value || "";

    const body = await req.json();
    const {
      shippingAddress,
      guestInfo,
      paymentMethod = "demo",
    } = body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.pincode || !shippingAddress.phone) {
      return NextResponse.json({ error: "Complete shipping address is required" }, { status: 400 });
    }

    const query: Record<string, unknown> = session ? { user: session.userId } : { sessionId };
    const cart = await Cart.findOne(query);

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    // 1. Recalculate Subtotal & Verify Stock
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.active) {
        return NextResponse.json({ error: `Product ${item.title} is no longer available` }, { status: 400 });
      }

      let unitPrice = product.basePrice;
      let availableStock = product.totalStock;

      if (item.variant) {
        const variant = await ProductVariant.findById(item.variant);
        if (variant && variant.active) {
          unitPrice = variant.price;
          availableStock = variant.stock;
        }
      }

      if (item.isFreebie && product.isFreebieEligible) {
        unitPrice = 1;
      }

      if (item.quantity > availableStock) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.title}. Only ${availableStock} units available.` },
          { status: 400 }
        );
      }

      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      orderItems.push({
        product: product._id,
        variant: item.variant,
        sku: item.sku,
        title: item.title,
        variantTitle: item.variantTitle,
        image: item.image,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        isFreebie: Boolean(item.isFreebie),
      });
    }

    // 2. Validate Coupon
    let couponDiscount = 0;
    let couponCode = undefined;

    if (cart.appliedCoupon?.code) {
      const coupon = await Coupon.findOne({
        code: cart.appliedCoupon.code,
        isActive: true,
        validUntil: { $gte: new Date() },
      });

      if (coupon && calculatedSubtotal >= coupon.minOrderValue) {
        couponCode = coupon.code;
        if (coupon.discountType === "fixed") {
          couponDiscount = Math.min(coupon.discountValue, calculatedSubtotal);
        } else {
          couponDiscount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
            couponDiscount = coupon.maxDiscount;
          }
        }
      }
    }

    // 3. Validate Dentacoins
    let coinsDiscount = 0;
    let userDoc = null;

    if (session && cart.rewardCoinsRedeemed > 0) {
      userDoc = await User.findById(session.userId);
      if (userDoc) {
        const maxPercent = userDoc.membershipTier === "plus" ? 0.2 : 0.1;
        const maxAllowed = Math.floor(calculatedSubtotal * maxPercent);
        coinsDiscount = Math.min(cart.rewardCoinsRedeemed, userDoc.dentacoins, maxAllowed);
      }
    }

    // 4. Shipping Fee
    const isPlus = session?.membershipTier === "plus" || userDoc?.membershipTier === "plus";
    const shippingThreshold = isPlus ? 499 : 999;
    const shippingFee = calculatedSubtotal >= shippingThreshold ? 0 : 99;

    // 5. Final Total
    const finalTotal = Math.max(0, calculatedSubtotal - couponDiscount - coinsDiscount + shippingFee);

    // 6. Dentacoins earned
    const earnedCoins = Math.floor(calculatedSubtotal / 50) * (isPlus ? 2 : 1);

    // 7. Deduct Stock safely
    for (const item of cart.items) {
      if (item.variant) {
        await ProductVariant.findByIdAndUpdate(item.variant, {
          $inc: { stock: -item.quantity },
        });
      }
      await Product.findByIdAndUpdate(item.product, {
        $inc: { totalStock: -item.quantity, salesCount: item.quantity },
      });
    }

    // 8. Deduct redeemed coins from user balance & record ledger
    if (userDoc && coinsDiscount > 0) {
      userDoc.dentacoins = Math.max(0, userDoc.dentacoins - coinsDiscount);
      await userDoc.save();

      await RewardTransaction.create({
        user: userDoc._id,
        amount: -coinsDiscount,
        type: "redeemed",
        description: `Redeemed on order`,
        balanceAfter: userDoc.dentacoins,
      });
    }

    // 9. Generate Unique Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `DK-${dateStr}-${randomHex}`;

    // 10. Create Order Record
    const order = await Order.create({
      orderNumber,
      user: session ? session.userId : undefined,
      guestInfo: !session ? guestInfo : undefined,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        clinicName: shippingAddress.clinicName,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },
      pricing: {
        subtotal: calculatedSubtotal,
        discount: couponDiscount,
        couponCode,
        dentacoinsRedeemed: coinsDiscount,
        dentacoinsDiscount: coinsDiscount,
        shippingFee,
        total: finalTotal,
      },
      dentacoinsEarned: earnedCoins,
      payment: {
        method: paymentMethod === "cod" ? "cod" : "online",
        status: paymentMethod === "cod" ? "pending" : "paid",
        provider: "demo",
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        paidAt: paymentMethod === "cod" ? undefined : new Date(),
      },
      shipment: {
        carrier: "Delhivery Medical Express",
        trackingNumber: `DLV${Math.floor(100000000 + Math.random() * 900000000)}IN`,
        trackingUrl: "https://www.delhivery.com/track",
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      orderStatus: "confirmed",
      timeline: [
        {
          status: "Order Confirmed",
          timestamp: new Date(),
          note: paymentMethod === "cod" ? "Cash on delivery order received." : "Online payment received successfully.",
        },
        {
          status: "Under Batch Quality Verification",
          timestamp: new Date(),
          note: "Sterilization and expiry check scheduled.",
        },
      ],
    });

    // 11. Credit earned coins to user account if logged in
    if (userDoc && earnedCoins > 0) {
      userDoc.dentacoins += earnedCoins;
      await userDoc.save();

      await RewardTransaction.create({
        user: userDoc._id,
        amount: earnedCoins,
        type: "earned",
        orderId: order._id,
        description: `Earned from Order #${orderNumber}`,
        balanceAfter: userDoc.dentacoins,
      });
    }

    // 12. Reset cart
    cart.items = [];
    cart.appliedCoupon = undefined;
    cart.rewardCoinsRedeemed = 0;
    await cart.save();

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: order._id,
    });
  } catch (err: unknown) {
    console.error("Checkout API error:", err);
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 });
  }
}
