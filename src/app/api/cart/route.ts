import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import { Coupon } from "@/models/Coupon";
import { extractSessionFromRequest } from "@/lib/auth";

function getCartSessionId(req: NextRequest, res?: NextResponse): string {
  const cookieSession = req.cookies.get("dk_cart_session")?.value;
  if (cookieSession) return cookieSession;
  const newSession = "dk_cs_" + Math.random().toString(36).substring(2, 15) + Date.now();
  if (res) {
    res.cookies.set("dk_cart_session", newSession, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
  }
  return newSession;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = extractSessionFromRequest(req);
    const sessionId = req.cookies.get("dk_cart_session")?.value || "";

    const query: Record<string, unknown> = {};
    if (session) {
      query.$or = [{ user: session.userId }, { sessionId }];
    } else {
      query.sessionId = sessionId;
    }

    let cart = await Cart.findOne(query).populate("items.product");
    if (!cart) {
      cart = new Cart({
        user: session ? session.userId : undefined,
        sessionId: sessionId || "dk_cs_" + Math.random().toString(36).substring(2, 15),
        items: [],
        rewardCoinsRedeemed: 0,
      });
      await cart.save();
    }

    return NextResponse.json({ cart });
  } catch (err: unknown) {
    console.error("Cart GET error:", err);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = extractSessionFromRequest(req);
    const res = NextResponse.json({ success: true });
    const sessionId = getCartSessionId(req, res);

    const body = await req.json();
    const { productId, variantId, quantity = 1, isFreebie = false } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product || !product.active) {
      return NextResponse.json({ error: "Product not available" }, { status: 404 });
    }

    let unitPrice = product.basePrice;
    let comparePrice = product.baseComparePrice;
    let sku = product.defaultSku;
    let variantTitle = "Standard";

    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (variant && variant.active) {
        unitPrice = variant.price;
        comparePrice = variant.comparePrice;
        sku = variant.sku;
        variantTitle = variant.title;
      }
    }

    // Freebie special pricing
    if (isFreebie && product.isFreebieEligible) {
      unitPrice = 1; // Promotional ₹1 gift
      variantTitle = `${variantTitle} (Promotional Gift at ₹1)`;
    }

    const query: Record<string, unknown> = session ? { user: session.userId } : { sessionId };
    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = new Cart({
        user: session ? session.userId : undefined,
        sessionId,
        items: [],
        rewardCoinsRedeemed: 0,
      });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.sku === sku && Boolean(item.isFreebie) === Boolean(isFreebie)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        variant: variantId ? variantId : undefined,
        sku,
        title: product.title,
        variantTitle,
        image: product.images[0] || "",
        quantity,
        unitPrice,
        comparePrice,
        isFreebie: Boolean(isFreebie),
      });
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      cart,
      message: `Added ${product.title} to cart`,
    });
  } catch (err: unknown) {
    console.error("Cart POST error:", err);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = extractSessionFromRequest(req);
    const sessionId = req.cookies.get("dk_cart_session")?.value || "";

    const body = await req.json();
    const { sku, quantity, remove } = body;

    const query: Record<string, unknown> = session ? { user: session.userId } : { sessionId };
    const cart = await Cart.findOne(query);

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    if (remove) {
      cart.items = cart.items.filter((item) => item.sku !== sku);
    } else if (typeof quantity === "number") {
      if (quantity <= 0) {
        cart.items = cart.items.filter((item) => item.sku !== sku);
      } else {
        const item = cart.items.find((i) => i.sku === sku);
        if (item) {
          item.quantity = quantity;
        }
      }
    }

    await cart.save();
    return NextResponse.json({ success: true, cart });
  } catch (err: unknown) {
    console.error("Cart PATCH error:", err);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
