import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { ClinicEnquiry } from "@/models/ClinicEnquiry";
import { extractSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    await connectToDatabase();

    const [totalOrders, totalProducts, totalUsers, totalEnquiries, recentOrders, ordersAggregate] =
      await Promise.all([
        Order.countDocuments(),
        Product.countDocuments(),
        User.countDocuments({ role: "customer" }),
        ClinicEnquiry.countDocuments(),
        Order.find().sort({ createdAt: -1 }).limit(5).lean(),
        Order.aggregate([
          { $match: { "payment.status": "paid" } },
          { $group: { _id: null, totalRevenue: { $sum: "$pricing.total" } } },
        ]),
      ]);

    const totalRevenue = ordersAggregate[0]?.totalRevenue || 0;

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        totalEnquiries,
      },
      recentOrders,
    });
  } catch (err: unknown) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
