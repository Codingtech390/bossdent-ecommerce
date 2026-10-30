import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Brand } from "@/models/Brand";
import { ProductCard } from "@/components/product/ProductCard";
import { Search, Filter, ArrowUpDown, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: {
    q?: string;
    brand?: string;
    sort?: string;
    page?: string;
  };
}

export default async function SearchResultsPage({ searchParams }: SearchPageProps) {
  const query = (searchParams.q || "").trim();

  await connectToDatabase();

  const filterQuery: Record<string, any> = { active: true };

  if (query) {
    const regex = new RegExp(query, "i");
    filterQuery.$or = [
      { title: regex },
      { defaultSku: regex },
      { shortDescription: regex },
      { "specifications.value": regex },
    ];
  }

  if (searchParams.brand) {
    const brandDoc = await Brand.findOne({ slug: searchParams.brand });
    if (brandDoc) filterQuery.brand = brandDoc._id;
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

  const [products, totalCount, allBrands] = await Promise.all([
    Product.find(filterQuery)
      .populate("brand", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filterQuery),
    Brand.find({}).sort({ name: 1 }).lean(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Search Results</span>
      </div>

      {/* Search Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Catalogue Search
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
            {query ? (
              <span>
                Results for &ldquo;<span className="text-dk-teal-800">{query}</span>&rdquo;
              </span>
            ) : (
              "All Dental Supplies"
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Found {totalCount} matching products across verified medical categories
          </p>
        </div>

        {/* Clear / New Search */}
        {query && (
          <Link
            href="/search"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200"
          >
            Clear Search
          </Link>
        )}
      </div>

      {/* Grid and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <aside className="bg-white p-5 rounded-xl border border-slate-200 h-fit space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Filter className="w-4 h-4 text-dk-teal-800" /> Filter Brands
            </span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {allBrands.map((b: any) => (
              <label key={b._id} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  checked={searchParams.brand === b.slug}
                  onChange={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("brand", b.slug);
                    window.location.href = url.toString();
                  }}
                  className="text-dk-teal-700 focus:ring-dk-teal-700"
                />
                <span>{b.name}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Product Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sort bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">
              Showing {products.length} of {totalCount}
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
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn&apos;t find any dental supplies matching &ldquo;{query}&rdquo;. Check spelling, try common terms like &ldquo;Composite&rdquo;, &ldquo;Airotor&rdquo;, or &ldquo;Files&rdquo;.
              </p>
              <div className="pt-2">
                <Link
                  href="/categories"
                  className="px-4 py-2 bg-dk-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-dk-teal-900"
                >
                  Browse All Categories
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
