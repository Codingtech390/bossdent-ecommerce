import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { formatPrice } from "@/lib/utils";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderSuccessProps {
  params: { orderNumber: string };
}

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  await connectToDatabase();

  const order = await Order.findOne({ orderNumber: params.orderNumber }).lean();
  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Success Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Payment &amp; Order Verified
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
            Thank you! Your dental order has been placed.
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Order Confirmation # <strong className="font-mono text-slate-900">{order.orderNumber}</strong>. A tax invoice has been generated for your clinic records.
          </p>
        </div>

        {/* Order Meta Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-dk-teal-700" />
            <span>Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-dk-orange-500" />
            <span>Carrier: {order.shipment?.carrier || "Delhivery Medical"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700 font-bold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>+{order.dentacoinsEarned} Dentacoins Credited</span>
          </div>
        </div>
      </div>

      {/* Shipment & Tracking Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm text-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Package className="w-5 h-5 text-dk-teal-800" /> Shipment &amp; Destination Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block text-sm">Delivery Address</span>
            <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
            {order.shippingAddress.clinicName && (
              <p className="text-dk-teal-800 font-medium">{order.shippingAddress.clinicName}</p>
            )}
            <p className="text-slate-600">{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-slate-600">{order.shippingAddress.addressLine2}</p>
            )}
            <p className="text-slate-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <p className="text-slate-600 font-mono mt-1">Phone: {order.shippingAddress.phone}</p>
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block text-sm">Logistics &amp; Tracking</span>
            <div className="space-y-1 text-slate-700">
              <p>
                Status: <strong className="uppercase text-dk-teal-800">{order.orderStatus}</strong>
              </p>
              <p>
                Tracking Number: <strong className="font-mono text-slate-900">{order.shipment?.trackingNumber || "Pending Dispatch"}</strong>
              </p>
              <p>
                Payment: <strong className="capitalize text-slate-900">{order.payment.method} ({order.payment.status})</strong>
              </p>
            </div>

            {order.timeline && order.timeline.length > 0 && (
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Order Updates:</span>
                {order.timeline.map((item: any, i: number) => (
                  <div key={i} className="text-[11px] text-slate-600">
                    • <strong>{item.status}</strong>: {item.note}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ordered Items Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-4 shadow-sm text-xs">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Purchased Dental Supplies ({order.items.length})
        </h2>

        <div className="divide-y divide-slate-100">
          {order.items.map((item: any) => (
            <div key={item.sku} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 relative rounded-lg border border-slate-100 bg-slate-50 overflow-hidden flex-shrink-0">
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

              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-slate-900">
                  {formatPrice(item.lineTotal)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {formatPrice(item.unitPrice)} each
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Totals */}
        <div className="pt-4 border-t border-slate-200 max-w-xs ml-auto space-y-1.5 text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">{formatPrice(order.pricing.subtotal)}</span>
          </div>
          {order.pricing.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Coupon Discount</span>
              <span>-{formatPrice(order.pricing.discount)}</span>
            </div>
          )}
          {order.pricing.dentacoinsDiscount > 0 && (
            <div className="flex justify-between text-amber-600 font-semibold">
              <span>Dentacoins Redeemed</span>
              <span>-{formatPrice(order.pricing.dentacoinsDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-bold text-slate-900">
              {order.pricing.shippingFee === 0 ? "FREE" : formatPrice(order.pricing.shippingFee)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-black text-slate-900">
            <span>Total Paid</span>
            <span className="text-dk-teal-900">{formatPrice(order.pricing.total)}</span>
          </div>
        </div>
      </div>

      {/* Continue Actions */}
      <div className="text-center pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-dk-teal-800 hover:bg-dk-teal-900 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
        >
          Return to Storefront <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
