import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductCard } from "@/components/product/ProductCard";
import { Gift, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FreebiesPage() {
  await connectToDatabase();

  const freebieProducts = await Product.find({
    active: true,
    isFreebieEligible: true,
  })
    .populate("brand", "name slug")
    .lean();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Freebies &amp; Gifts @ ₹1</span>
      </div>

      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 md:p-8 rounded-2xl shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-6 h-6 text-amber-300" />
          <span className="text-xs font-bold uppercase tracking-widest bg-emerald-950/60 text-emerald-200 px-3 py-1 rounded-full">
            Bossdent Exclusive Perks
          </span>
        </div>
        <h1 className="text-3xl font-black">Claim Professional Freebies &amp; Gifts @ ₹1</h1>
        <p className="text-xs md:text-sm text-emerald-100 mt-1 max-w-xl">
          Complimentary dental instruments, burs, and clinical supplies available as promotional gift add-ons on qualifying orders.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 space-y-1">
        <h3 className="font-bold flex items-center gap-1.5 text-sm">
          <Sparkles className="w-4 h-4 text-emerald-600" /> How Bossdent Freebies Work:
        </h3>
        <p>1. Browse eligible promotional products below.</p>
        <p>2. Products labelled &ldquo;Gift at ₹1&rdquo; can be added directly or unlocked at checkout when qualifying cart thresholds are met.</p>
        <p>3. One promotional gift eligible per clinical order while promotional stocks last.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {freebieProducts.map((p: any) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}