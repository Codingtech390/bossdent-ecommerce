import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { ClinicEnquiry } from "@/models/ClinicEnquiry";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Building2,
  ArrowRight,
  Truck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverview() {
  await connectToDatabase();

  const [totalOrders, totalProducts, totalUsers, totalEnquiries, recentOrders, revenueAggregate] =
    await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "customer" }),
      ClinicEnquiry.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(6).lean(),
      Order.aggregate([
        { $match: { "payment.status": "paid" } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
    ]);

  const totalRevenue = revenueAggregate[0]?.total || 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
            Total Revenue
          </span>
          <span className="text-xl md:text-2xl font-black text-slate-900 block">
            {formatPrice(totalRevenue)}
          </span>
          <span className="text-emerald-700 text-[10px] font-semibold">100% Verified Paid</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
            Total Orders
          </span>
          <span className="text-xl md:text-2xl font-black text-slate-900 block">
            {totalOrders}
          </span>
          <span className="text-dk-teal-700 text-[10px] font-semibold">Active Orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
            Catalogued Products
          </span>
          <span className="text-xl md:text-2xl font-black text-slate-900 block">
            {totalProducts}
          </span>
          <span className="text-sky-700 text-[10px] font-semibold">SKU Level Stocked</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
            Clinic Setup Leads
          </span>
          <span className="text-xl md:text-2xl font-black text-amber-600 block">
            {totalEnquiries}
          </span>
          <span className="text-amber-700 text-[10px] font-semibold">Doctor Consultations</span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Customer Orders</h2>
            <p className="text-[11px] text-slate-500">Latest dental clinic purchases</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-dk-teal-800 hover:underline flex items-center gap-1"
          >
            All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2">Order #</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Items</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Courier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((o: any) => (
                <tr key={o._id} className="hover:bg-slate-50">
                  <td className="py-3 font-mono font-bold text-dk-teal-900">{o.orderNumber}</td>
                  <td className="py-3">
                    <span className="font-semibold text-slate-800 block">
                      {o.shippingAddress?.fullName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {o.shippingAddress?.city} ({o.shippingAddress?.pincode})
                    </span>
                  </td>
                  <td className="py-3">{o.items.length} Supplies</td>
                  <td className="py-3 font-bold text-slate-900">
                    {formatPrice(o.pricing.total)}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-500 text-[11px]">
                    {o.shipment?.carrier || "Standard"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
