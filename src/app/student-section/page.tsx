import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductCard } from "@/components/product/ProductCard";
import { GraduationCap, ChevronRight, BookOpen, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentSectionPage() {
  await connectToDatabase();

  const studentProducts = await Product.find({
    active: true,
    $or: [
      { badges: "Budget Friendly" },
      { categorySlug: "instruments-and-surgery" },
      { title: /Kit|Starter|Forceps/i },
    ],
  })
    .populate("brand", "name slug")
    .limit(8)
    .lean();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Student Section</span>
      </div>

      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 md:p-8 rounded-2xl shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-6 h-6 text-purple-300" />
          <span className="text-xs font-bold uppercase tracking-widest bg-black/30 text-purple-200 px-3 py-1 rounded-full">
            BDS &amp; MDS Academic Store
          </span>
        </div>
        <h1 className="text-3xl font-black">Dental Student &amp; Intern Supplies</h1>
        <p className="text-xs md:text-sm text-purple-200 mt-1 max-w-xl">
          Complete pre-clinical instrument sets, typhodont jaws, endodontic training blocks, and high-precision diamond burs curated for dental colleges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs space-y-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-sm text-slate-900">Pre-Clinical Conservative Kits</h3>
          <p className="text-slate-500">Typodont teeth, cavity preparation burs, wax carvers, and amalgam carriers.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs space-y-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">Prosthodontics Starter Bundles</h3>
          <p className="text-slate-500">Impression trays, plaster knives, articulators, and polishing lathes.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs space-y-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900">Institutional Student Pricing</h3>
          <p className="text-slate-500">Bulk discounts for batch orders with college clinic delivery.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Recommended Student Equipment &amp; Instruments
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {studentProducts.map((p: any) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
