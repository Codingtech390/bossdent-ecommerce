import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Brand } from "@/models/Brand";
import { ProductCard } from "@/components/product/ProductCard";
import { Filter, ArrowUpDown, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: { slug: string };
  searchParams: {
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  };
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  await connectToDatabase();

  const category = await Category.findOne({ slug: params.slug }).lean();
  if (!category) {
    notFound();
  }

  // Find subcategories if this is root
  const subcategories = await Category.find({ parentId: category._id }).lean();
  const catIds = [category._id, ...subcategories.map((s) => s._id)];

  // Build Filter Query
  const filterQuery: Record<string, any> = {
    active: true,
    $or: [{ category: { $in: catIds } }, { subcategory: { $in: catIds } }],
  };

  if (searchParams.brand) {
    const brandDoc = await Brand.findOne({ slug: searchParams.brand });
    if (brandDoc) {
      filterQuery.brand = brandDoc._id;
    }
  }

  if (searchParams.inStock === "true") {
    filterQuery.inStock = true;
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    filterQuery.basePrice = {};
    if (searchParams.minPrice) filterQuery.basePrice.$gte = Number(searchParams.minPrice);
    if (searchParams.maxPrice) filterQuery.basePrice.$lte = Number(searchParams.maxPrice);
  }

  // Sorting
  let sortOption: Record<string, 1 | -1> = { salesCount: -1 };
  if (searchParams.sort === "price-low") sortOption = { basePrice: 1 };
  if (searchParams.sort === "price-high") sortOption = { basePrice: -1 };
  if (searchParams.sort === "rating") sortOption = { rating: -1 };
  if (searchParams.sort === "newest") sortOption = { createdAt: -1 };

  // Pagination
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

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/categories" className="hover:text-dk-teal-800">Categories</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">{category.name}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-dk-teal-900 to-dk-teal-800 text-white rounded-2xl p-6 md:p-8 shadow-md">
        <h1 className="text-2xl md:text-3xl font-black">{category.name}</h1>
        {category.description && (
          <p className="text-xs md:text-sm text-slate-200 mt-2 max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-dk-orange-300">
          <span>{totalCount} Verified Dental Products Available</span>
        </div>
      </div>

      {/* Subcategory Pills */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {subcategories.map((sub: any) => (
            <Link
              key={sub._id}
              href={`/categories/${sub.slug}`}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:border-dk-teal-600 hover:bg-dk-teal-50 text-xs font-medium text-slate-700 transition-colors"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Main Layout: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
        {/* Filters Sidebar */}
        <aside className="space-y-6 bg-white p-5 rounded-xl border border-slate-200 h-fit text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Filter className="w-4 h-4 text-dk-teal-800" /> Filters
            </span>
            <Link
              href={`/categories/${params.slug}`}
              className="text-xs text-dk-orange-600 font-semibold hover:underline"
            >
              Reset All
            </Link>
          </div>

          {/* Filter by In Stock */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Availability</h4>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={searchParams.inStock === "true"}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.checked) url.searchParams.set("inStock", "true");
                  else url.searchParams.delete("inStock");
                  window.location.href = url.toString();
                }}
                className="rounded border-slate-300 text-dk-teal-700 focus:ring-dk-teal-700"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Filter by Brands */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Brands</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar: Sort & Results Count */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-medium text-slate-600">
              Showing <strong className="text-slate-900">{products.length}</strong> of <strong className="text-slate-900">{totalCount}</strong> items
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                defaultValue={searchParams.sort || "recommended"}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("sort", e.target.value);
                  window.location.href = url.toString();
                }}
                className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No dental products match your selected filters. Try resetting the filters or checking other categories.
              </p>
              <Link
                href={`/categories/${params.slug}`}
                className="inline-block mt-2 px-4 py-2 bg-dk-teal-800 text-white rounded-lg text-xs font-semibold"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <Link
                  key={pNum}
                  href={`/categories/${params.slug}?page=${pNum}${searchParams.brand ? `&brand=${searchParams.brand}` : ""}${searchParams.sort ? `&sort=${searchParams.sort}` : ""}`}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    page === pNum
                      ? "bg-dk-teal-800 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pNum}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
