import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import { ArrowRight, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesIndexPage() {
  await connectToDatabase();

  const rootCategories = await Category.find({ level: 0 }).sort({ order: 1 }).lean();
  const subcategories = await Category.find({ level: 1 }).sort({ order: 1 }).lean();

  const subMap = new Map<string, any[]>();
  for (const sub of subcategories) {
    if (sub.parentId) {
      const pid = sub.parentId.toString();
      if (!subMap.has(pid)) subMap.set(pid, []);
      subMap.get(pid)?.push(sub);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-dk-teal-800">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Categories</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-7 h-7 text-dk-teal-800" />
          Complete Dental Catalogue Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Browse specialized dental consumables, endodontic equipment, surgical instruments, and clinic packages.
        </p>
      </div>

      {/* Grid of Root Categories with Subcategories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rootCategories.map((cat: any) => {
          const subs = subMap.get(cat._id.toString()) || [];
          return (
            <div
              key={cat._id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:border-dk-teal-600 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-slate-900">{cat.name}</h2>
                  <span className="text-[11px] font-bold text-dk-teal-700 bg-dk-teal-50 px-2 py-0.5 rounded">
                    {cat.productCount} Products
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{cat.description}</p>

                {subs.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Subcategories:
                    </span>
                    {subs.map((sub: any) => (
                      <Link
                        key={sub._id}
                        href={`/categories/${sub.slug}`}
                        className="block text-xs text-slate-700 hover:text-dk-orange-600 transition-colors py-0.5 font-medium"
                      >
                        • {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-xs font-bold text-dk-teal-800 hover:text-dk-teal-950 flex items-center justify-between group"
                >
                  <span>Explore {cat.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
