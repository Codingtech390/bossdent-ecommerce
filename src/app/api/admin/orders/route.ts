import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { extractSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const orders = await Order.find({})
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (err: unknown) {
    console.error("Admin orders GET error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
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
    const { orderId, orderStatus, trackingNumber, carrier, timelineNote } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (trackingNumber) {
      if (!order.shipment) order.shipment = {};
      order.shipment.trackingNumber = trackingNumber;
    }

    if (carrier) {
      if (!order.shipment) order.shipment = {};
      order.shipment.carrier = carrier;
    }

    if (timelineNote || orderStatus) {
      order.timeline.push({
        status: orderStatus || order.orderStatus,
        timestamp: new Date(),
        note: timelineNote || `Status updated to ${orderStatus || order.orderStatus} by Admin`,
      });
    }

    await order.save();
    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    console.error("Admin orders PATCH error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
