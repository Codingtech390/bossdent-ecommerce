import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getSessionUser } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { Package, Truck, Calendar, ChevronRight, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();
  const orders = await Order.find({ user: session.userId })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/account" className="hover:text-dk-teal-800">Account</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">My Orders</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-dk-teal-800" /> My Dental Orders &amp; Invoices
        </h1>
        <span className="text-xs font-semibold text-slate-500">{orders.length} Orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No orders found</h3>
          <p className="text-xs text-slate-500">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/categories"
            className="inline-block mt-2 px-5 py-2.5 bg-dk-teal-800 text-white rounded-lg text-xs font-semibold"
          >
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div
              key={o._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm text-xs"
            >
              {/* Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Order Placed
                    </span>
                    <span className="font-bold text-slate-800">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Total Amount
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatPrice(o.pricing.total)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Order Number
                    </span>
                    <span className="font-mono font-bold text-dk-teal-900">
                      {o.orderNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                      o.orderStatus === "delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : o.orderStatus === "shipped"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {o.orderStatus}
                  </span>
                  <Link
                    href={`/order-success/${o.orderNumber}`}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                  >
                    View Invoice
                  </Link>
                </div>
              </div>

              {/* Items */}
              <div className="p-4 sm:p-5 divide-y divide-slate-100">
                {o.items.map((item: any) => (
                  <div key={item.sku} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded-md border border-slate-100 bg-slate-50 overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=100&q=80"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                        {item.variantTitle && (
                          <span className="text-[11px] text-slate-500 block">{item.variantTitle}</span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          SKU: {item.sku} • Qty: {item.quantity}
                        </span>
                      </div>
                    </div>

                    <span className="font-bold text-slate-900 text-xs">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer status timeline note */}
              {o.shipment?.trackingNumber && (
                <div className="bg-slate-50/50 p-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-dk-orange-500" />
                    Courier: {o.shipment.carrier} • Tracking # <strong className="font-mono text-slate-800">{o.shipment.trackingNumber}</strong>
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Delivery Flow
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
