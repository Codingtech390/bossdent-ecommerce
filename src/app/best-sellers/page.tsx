import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import "@/models/Brand";
import { ProductCard } from "@/components/product/ProductCard";
import { Flame, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BestSellersPage() {
  await connectToDatabase();

  const products = await Product.find({
    active: true,
    $or: [{ badges: "Best Seller" }, { salesCount: { $gt: 40 } }],
  })
    .populate("brand", "name slug")
    .sort({ salesCount: -1 })
    .lean();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Best Sellers</span>
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 md:p-8 rounded-2xl shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-6 h-6 fill-white" />
          <span className="text-xs font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
            Clinical Favorites
          </span>
        </div>
        <h1 className="text-3xl font-black">Top Re-ordered Dental Supplies</h1>
        <p className="text-xs md:text-sm text-amber-50 mt-1 max-w-xl">
          The most trusted instruments, impression materials, and restoratives routinely ordered by dentists and dental institutions across India.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p: any) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
