import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { ClinicEnquiry } from "@/models/ClinicEnquiry";
import { formatPrice } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowRight,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Building2,
  Truck,
  Clock3,
  CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-blue-50 text-blue-700 ring-blue-200",
  shipped: "bg-violet-50 text-violet-700 ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function getStatusStyle(status: string) {
  return statusStyles[status?.toLowerCase()] ?? "bg-slate-100 text-slate-700 ring-slate-200";
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500">{description}</p>
    </div>
  );
}

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
        {
          $group: {
            _id: null,
            total: { $sum: "$pricing.total" },
          },
        },
      ]),
    ]);

  const totalRevenue = revenueAggregate[0]?.total || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-700">Dashboard Overview</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome to your dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Overview of your store's current activity and performance.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-950"
        >
          View Orders
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatPrice(totalRevenue)}
          description="Revenue from paid orders"
          icon={DollarSign}
          accent="bg-emerald-50 text-emerald-700"
        />

        <MetricCard
          title="Total Orders"
          value={totalOrders.toLocaleString("en-IN")}
          description="All orders received"
          icon={ShoppingBag}
          accent="bg-blue-50 text-blue-700"
        />

        <MetricCard
          title="Products"
          value={totalProducts.toLocaleString("en-IN")}
          description="Products currently in catalog"
          icon={Package}
          accent="bg-violet-50 text-violet-700"
        />

        <MetricCard
          title="Customers"
          value={totalUsers.toLocaleString("en-IN")}
          description="Registered customer accounts"
          icon={Users}
          accent="bg-orange-50 text-orange-700"
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Clinic Enquiries</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalEnquiries.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <ArrowUpRight className="h-5 w-5 text-slate-400" />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Paid Revenue</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">{formatPrice(totalRevenue)}</p>
            </div>
          </div>

          <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Verified
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>

            <p className="mt-1 text-sm text-slate-500">Latest customer orders from your store.</p>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900 transition hover:text-blue-700"
          >
            View all orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Order
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Items
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Amount
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Shipping
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <tr key={order._id.toString()} className="transition hover:bg-slate-50/80">
                    {/* Order */}
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm font-bold text-blue-950">
                        {order.orderNumber || "N/A"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Date unavailable"}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {order.shippingAddress?.fullName || "Unknown customer"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.shippingAddress?.city || "City unavailable"}
                        {order.shippingAddress?.pincode
                          ? ` · ${order.shippingAddress.pincode}`
                          : ""}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        <Package className="h-3.5 w-3.5" />
                        {order.items?.length ?? 0} items
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">
                        {formatPrice(order.pricing?.total || 0)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${getStatusStyle(
                          order.orderStatus || "pending",
                        )}`}
                      >
                        {order.orderStatus || "Unknown"}
                      </span>
                    </td>

                    {/* Shipping */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Truck className="h-4 w-4 text-slate-400" />

                        <span>{order.shipment?.carrier || "Not assigned"}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                      <ShoppingBag className="h-5 w-5 text-slate-400" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-900">No orders yet</h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Orders will appear here when customers make purchases.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {recentOrders.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
            <p className="text-xs text-slate-500">
              Showing the latest {recentOrders.length} orders
            </p>

            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-700"
            >
              Manage orders
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
