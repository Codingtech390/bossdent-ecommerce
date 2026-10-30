import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/models/Brand";
import { Product } from "@/models/Product";
import { ProductCard } from "@/components/product/ProductCard";
import { ChevronRight, ShieldCheck, ArrowUpDown } from "lucide-react";

export const dynamic = "force-dynamic";

interface BrandDetailPageProps {
  params: { slug: string };
  searchParams: {
    sort?: string;
    page?: string;
  };
}

export default async function BrandDetailPage({ params, searchParams }: BrandDetailPageProps) {
  await connectToDatabase();

  const brand = await Brand.findOne({ slug: params.slug }).lean();
  if (!brand) {
    notFound();
  }

  // Sorting
  let sortOption: Record<string, 1 | -1> = { salesCount: -1 };
  if (searchParams.sort === "price-low") sortOption = { basePrice: 1 };
  if (searchParams.sort === "price-high") sortOption = { basePrice: -1 };
  if (searchParams.sort === "rating") sortOption = { rating: -1 };
  if (searchParams.sort === "newest") sortOption = { createdAt: -1 };

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  const [products, totalCount] = await Promise.all([
    Product.find({ brand: brand._id, active: true })
      .populate("brand", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments({ brand: brand._id, active: true }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/brands" className="hover:text-dk-teal-800">Brands</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">{brand.name}</span>
      </div>

      {/* Brand Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-dk-teal-50 text-dk-teal-800 rounded font-bold text-xs uppercase tracking-wider">
              {brand.originCountry}
            </span>
            <span className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Authorized Distributor
            </span>
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {brand.name} Dental Products
          </h1>

          <p className="text-xs text-slate-600 leading-relaxed">
            {brand.description || `Official dental catalog and instruments by ${brand.name}. Guaranteed authentic batches with complete clinical safety datasheets.`}
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center min-w-[160px]">
          <span className="text-2xl font-black text-dk-teal-900 block">{totalCount}</span>
          <span className="text-xs font-medium text-slate-500">Products Catalogued</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">
          Showing <strong className="text-slate-900">{products.length}</strong> of {totalCount} products
        </span>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Sort:</span>
          <select
            defaultValue={searchParams.sort || "recommended"}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("sort", e.target.value);
              window.location.href = url.toString();
            }}
            className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="recommended">Best Selling</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <h3 className="font-bold text-slate-800 text-sm">No products in this brand</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p: any) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
