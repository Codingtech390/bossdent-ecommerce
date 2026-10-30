import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/models/Brand";
import { Layers, ShieldCheck, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BrandsDirectoryPage() {
  await connectToDatabase();

  const brands = await Brand.find({}).sort({ name: 1 }).lean();

  // Group brands alphabetically A-Z
  const grouped: Record<string, any[]> = {};
  for (const b of brands) {
    const firstLetter = b.name.charAt(0).toUpperCase();
    const key = /[A-Z]/.test(firstLetter) ? firstLetter : "#";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(b);
  }

  const alphabet = Object.keys(grouped).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Brands Directory</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-dk-teal-900 to-slate-900 text-white p-8 rounded-2xl shadow-lg">
        <div className="max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-dk-orange-300">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Authorized Genuine Brands
          </span>
          <h1 className="text-3xl md:text-4xl font-black">
            Dental Manufacturers &amp; Brands Directory
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Browse through 450+ verified global and Indian dental manufacturers offering manufacturer warranties, ISO certifications, and verified clinical batches.
          </p>
        </div>

        {/* Quick Alphabet Anchor Bar */}
        <div className="flex flex-wrap gap-1.5 pt-6 mt-4 border-t border-white/10">
          {alphabet.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>
      </div>

      {/* Grouped Brands List */}
      <div className="space-y-10">
        {alphabet.map((letter) => (
          <div key={letter} id={`letter-${letter}`} className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b-2 border-dk-teal-800">
              <span className="w-8 h-8 rounded-lg bg-dk-teal-800 text-white font-black text-base flex items-center justify-center shadow-sm">
                {letter}
              </span>
              <h2 className="text-lg font-black text-slate-900">
                Brands starting with {letter}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {grouped[letter].map((b) => (
                <Link
                  key={b._id}
                  href={`/brands/${b.slug}`}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-dk-teal-600 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-dk-teal-900 text-sm">
                      {b.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Origin: {b.originCountry}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-dk-teal-700 font-semibold">
                      {b.productCount || 0} Products
                    </span>
                    <span className="text-slate-400 group-hover:text-dk-orange-500 font-bold">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
