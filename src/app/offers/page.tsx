import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { ProductCard } from "@/components/product/ProductCard";
import { Percent, Tag, ChevronRight, Copy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  await connectToDatabase();

  const [products, coupons] = await Promise.all([
    Product.find({ active: true, discountPercent: { $gt: 15 } })
      .populate("brand", "name slug")
      .sort({ discountPercent: -1 })
      .lean(),
    Coupon.find({ isActive: true }).lean(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Offer Zone</span>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-dk-orange-600 to-rose-600 text-white p-6 md:p-8 rounded-2xl shadow-md">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-dk-orange-600 px-3 py-1 rounded-full mb-2">
          <Percent className="w-3.5 h-3.5" /> MAXIMUM CLINIC SAVINGS
        </span>
        <h1 className="text-3xl font-black">Offer Zone &amp; Promo Codes</h1>
        <p className="text-xs md:text-sm text-orange-100 mt-1 max-w-xl">
          Discover exclusive price slashes, seasonal bulk offers, and coupon codes on high-volume dental consumables and equipment.
        </p>
      </div>

      {/* Active Coupons Grid */}
      {coupons.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-dk-teal-800" /> Active Promotional Coupons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((c: any) => (
              <div
                key={c._id}
                className="bg-white border-2 border-dashed border-dk-teal-300 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-black text-dk-teal-800 bg-dk-teal-50 px-2.5 py-1 rounded border border-dk-teal-200">
                      {c.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Min Order: ₹{c.minOrderValue}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{c.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  {c.applicableTiers?.includes("plus")
                    ? "Exclusive for DentalKart Plus Members"
                    : "Valid for all verified clinics"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discounted Products Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Discounted Dental Products ({products.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p: any) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
