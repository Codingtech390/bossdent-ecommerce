import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { extractSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* =========================================================
   AUTH
========================================================= */

function isAdmin(req: NextRequest) {
  const session = extractSessionFromRequest(req);
  return Boolean(session && session.role === "admin");
}

/* =========================================================
   SERIALIZE ORDER
   Converts your actual Order model into the shape used by
   OrdersManager.tsx without changing the database schema.
========================================================= */

function serializeOrder(order: any) {
  const shippingAddress = order.shippingAddress || {};
  const pricing = order.pricing || {};
  const payment = order.payment || {};
  const shipment = order.shipment || {};

  const customer = order.user || null;
  const guest = order.guestInfo || {};

  return {
    _id: String(order._id),

    orderNumber: order.orderNumber,

    user: customer
      ? {
          _id: String(customer._id),
          name: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || "",
        }
      : {
          name: guest.name || shippingAddress.fullName || "",
          email: guest.email || shippingAddress.email || "",
          phone: guest.phone || shippingAddress.phone || "",
        },

    items: (order.items || []).map((item: any) => ({
      _id: item._id ? String(item._id) : undefined,
      product: item.product ? String(item.product) : "",
      name: item.title || "",
      title: item.title || "",
      slug: item.slug || "",
      sku: item.sku || "",
      image: item.image || "",
      price: Number(item.unitPrice || 0),
      unitPrice: Number(item.unitPrice || 0),
      quantity: Number(item.quantity || 0),
      lineTotal: Number(item.lineTotal || 0),
      variantTitle: item.variantTitle || "",
      isFreebie: Boolean(item.isFreebie),
    })),

    shippingAddress: {
      fullName: shippingAddress.fullName || "",
      clinicName: shippingAddress.clinicName || "",
      email: guest.email || customer?.email || "",
      phone: shippingAddress.phone || guest.phone || "",
      addressLine1: shippingAddress.addressLine1 || "",
      addressLine2: shippingAddress.addressLine2 || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      postalCode: shippingAddress.pincode || "",
      pincode: shippingAddress.pincode || "",
      country: shippingAddress.country || "India",
    },

    subtotal: Number(pricing.subtotal || 0),
    shipping: Number(pricing.shippingFee || 0),
    discount: Number(pricing.discount || 0),
    total: Number(pricing.total || 0),

    pricing: {
      subtotal: Number(pricing.subtotal || 0),
      discount: Number(pricing.discount || 0),
      couponCode: pricing.couponCode || "",
      dentacoinsRedeemed: Number(pricing.dentacoinsRedeemed || 0),
      dentacoinsDiscount: Number(pricing.dentacoinsDiscount || 0),
      shippingFee: Number(pricing.shippingFee || 0),
      total: Number(pricing.total || 0),
    },

    currency: "INR",

    status: order.orderStatus || "pending",
    orderStatus: order.orderStatus || "pending",

    paymentStatus: payment.status || "pending",

    payment: {
      method: payment.method || "",
      status: payment.status || "pending",
      provider: payment.provider || "",
      transactionId: payment.transactionId || "",
      paidAt: payment.paidAt || null,
    },

    paymentProvider: payment.provider || "",
    razorpayPaymentId: payment.provider === "razorpay" ? payment.transactionId || "" : "",
    cashfreePaymentId: payment.provider === "cashfree" ? payment.transactionId || "" : "",

    shipment: {
      carrier: shipment.carrier || "",
      courier: shipment.carrier || "",
      trackingNumber: shipment.trackingNumber || "",
      trackingUrl: shipment.trackingUrl || "",
      estimatedDelivery: shipment.estimatedDelivery || null,
      dispatchedAt: shipment.dispatchedAt || null,
      shippedAt: shipment.dispatchedAt || null,
      deliveredAt: shipment.deliveredAt || null,
    },

    timeline: order.timeline || [],

    cancellationReason: order.cancellationReason || "",

    returnDetails: order.returnDetails || null,

    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : "",

    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : "",
  };
}

/* =========================================================
   GET ORDERS
========================================================= */

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || 1));

    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const paymentStatus = searchParams.get("paymentStatus") || "all";

    const filter: Record<string, any> = {};

    /* Order status */

    if (status !== "all") {
      filter.orderStatus = status;
    }

    /* Payment status */

    if (paymentStatus !== "all") {
      filter["payment.status"] = paymentStatus;
    }

    /* Search */

    if (search) {
      filter.$or = [
        {
          orderNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          "guestInfo.name": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "guestInfo.email": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "guestInfo.phone": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shippingAddress.fullName": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shippingAddress.phone": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shippingAddress.city": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shippingAddress.pincode": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shipment.trackingNumber": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      orders: orders.map(serializeOrder),
      page,
      limit,
      total,
      totalPages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Admin orders GET error:", error);

    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

/* =========================================================
   PATCH ORDER
========================================================= */

export async function PATCH(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();

    const { orderId, status, paymentStatus, shipment } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const allowedOrderStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];

    const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    if (status !== undefined && !allowedOrderStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    if (paymentStatus !== undefined && !allowedPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const previousStatus = order.orderStatus;

    /* =====================================================
       UPDATE ORDER STATUS
    ===================================================== */

    if (status !== undefined) {
      order.orderStatus = status;

      if (status !== previousStatus) {
        order.timeline.push({
          status,
          timestamp: new Date(),
          note: `Order status updated to ${status} by admin.`,
        });
      }
    }

    /* =====================================================
       UPDATE PAYMENT
    ===================================================== */

    if (paymentStatus !== undefined) {
      order.payment.status = paymentStatus;

      if (paymentStatus === "paid" && !order.payment.paidAt) {
        order.payment.paidAt = new Date();
      }

      order.timeline.push({
        status: `payment_${paymentStatus}`,
        timestamp: new Date(),
        note: `Payment status updated to ${paymentStatus} by admin.`,
      });
    }

    /* =====================================================
       UPDATE SHIPMENT
       shipment is a plain object in this model.
       Do NOT use shipment.toObject().
    ===================================================== */

    if (shipment && typeof shipment === "object") {
      const currentShipment = order.shipment || {};

      order.shipment = {
        carrier:
          typeof shipment.carrier === "string"
            ? shipment.carrier.trim()
            : typeof shipment.courier === "string"
              ? shipment.courier.trim()
              : currentShipment.carrier,

        trackingNumber:
          typeof shipment.trackingNumber === "string"
            ? shipment.trackingNumber.trim()
            : currentShipment.trackingNumber,

        trackingUrl:
          typeof shipment.trackingUrl === "string"
            ? shipment.trackingUrl.trim()
            : currentShipment.trackingUrl,

        estimatedDelivery: currentShipment.estimatedDelivery,

        dispatchedAt: currentShipment.dispatchedAt,

        deliveredAt: currentShipment.deliveredAt,
      };
    }

    /* =====================================================
       SHIPPING STATUS / DATES
    ===================================================== */

    if (status === "shipped") {
      if (!order.shipment.dispatchedAt) {
        order.shipment.dispatchedAt = new Date();
      }

      order.timeline.push({
        status: "shipment_dispatched",
        timestamp: new Date(),
        note: "Shipment marked as dispatched.",
      });
    }

    if (status === "delivered") {
      if (!order.shipment.deliveredAt) {
        order.shipment.deliveredAt = new Date();
      }

      order.timeline.push({
        status: "shipment_delivered",
        timestamp: new Date(),
        note: "Shipment marked as delivered.",
      });
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: updatedOrder ? serializeOrder(updatedOrder) : null,
    });
  } catch (error) {
    console.error("Admin orders PATCH error:", error);

    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}
