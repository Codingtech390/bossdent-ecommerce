import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  CircleDot,
  Filter,
  PackageSearch,
} from "lucide-react";

import "@/models";

import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Brand } from "@/models/Brand";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryFilters, CategorySort } from "@/components/category/CategoryFilters";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: {
    slug: string;
  };
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

  // Find the selected category
  const category = await Category.findOne({
    slug: params.slug,
  }).lean();

  if (!category) {
    notFound();
  }

  // Find subcategories
  const subcategories = await Category.find({
    parentId: category._id,
  })
    .sort({ order: 1, name: 1 })
    .lean();

  const categoryIds = [category._id, ...subcategories.map((subcategory) => subcategory._id)];

  // Build product filter query
  const filterQuery: Record<string, any> = {
    active: true,
    $or: [{ category: { $in: categoryIds } }, { subcategory: { $in: categoryIds } }],
  };

  // Filter by brand
  if (searchParams.brand) {
    const brandDoc = await Brand.findOne({
      slug: searchParams.brand,
    }).lean();

    if (brandDoc) {
      filterQuery.brand = brandDoc._id;
    }
  }

  // Filter by availability
  if (searchParams.inStock === "true") {
    filterQuery.inStock = true;
  }

  // Filter by minimum and maximum price
  if (searchParams.minPrice || searchParams.maxPrice) {
    filterQuery.basePrice = {};

    if (searchParams.minPrice) {
      filterQuery.basePrice.$gte = Number(searchParams.minPrice);
    }

    if (searchParams.maxPrice) {
      filterQuery.basePrice.$lte = Number(searchParams.maxPrice);
    }
  }

  // Sorting
  let sortOption: Record<string, 1 | -1> = {
    salesCount: -1,
  };

  if (searchParams.sort === "price-low") {
    sortOption = { basePrice: 1 };
  }

  if (searchParams.sort === "price-high") {
    sortOption = { basePrice: -1 };
  }

  if (searchParams.sort === "rating") {
    sortOption = { rating: -1 };
  }

  if (searchParams.sort === "newest") {
    sortOption = { createdAt: -1 };
  }

  // Pagination
  const requestedPage = Math.max(1, Number(searchParams.page) || 1);

  const limit = 12;
  const totalCount = await Product.countDocuments(filterQuery);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * limit;

  // Fetch products and brands
  const [products, allBrands] = await Promise.all([
    Product.find(filterQuery)
      .populate("brand", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),

    Brand.find({}).sort({ name: 1 }).lean(),
  ]);

  // Prepare brand options for the client-side filters
  const brandOptions = allBrands.map((brand: any) => ({
    _id: String(brand._id),
    name: brand.name,
    slug: brand.slug,
  }));

  // Preserve every active filter when changing pages
  const getPaginationUrl = (pageNumber: number) => {
    const query = new URLSearchParams();

    if (searchParams.brand) {
      query.set("brand", searchParams.brand);
    }

    if (searchParams.inStock) {
      query.set("inStock", searchParams.inStock);
    }

    if (searchParams.minPrice) {
      query.set("minPrice", searchParams.minPrice);
    }

    if (searchParams.maxPrice) {
      query.set("maxPrice", searchParams.maxPrice);
    }

    if (searchParams.sort) {
      query.set("sort", searchParams.sort);
    }

    query.set("page", String(pageNumber));

    return `/categories/${params.slug}?${query.toString()}`;
  };

  const paginationPages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const firstResult = totalCount === 0 ? 0 : skip + 1;
  const lastResult = Math.min(skip + products.length, totalCount);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1ed] text-[#252522]">
      {/* =====================================================
          EDITORIAL CATEGORY HEADER
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-[#e5dedf] bg-[#eee8ed]">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-32 h-[300px] w-[300px] rounded-full border border-[#9478a5]/10 sm:h-[440px] sm:w-[440px]" />

        <div className="pointer-events-none absolute -right-10 -top-20 h-[210px] w-[210px] rounded-full border border-[#9478a5]/15 sm:h-[320px] sm:w-[320px]" />

        <div className="relative mx-auto max-w-[1440px] px-5 pb-10 pt-8 sm:px-8 sm:pb-14 sm:pt-10 lg:px-14">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-[9px] font-medium uppercase tracking-[0.17em] text-[#92888e] sm:text-[10px]"
          >
            <Link href="/" className="transition-colors hover:text-[#9478a5]">
              Home
            </Link>

            <ChevronRight className="h-3 w-3 text-[#b7aab5]" />

            <Link href="/categories" className="transition-colors hover:text-[#9478a5]">
              Categories
            </Link>

            <ChevronRight className="h-3 w-3 text-[#b7aab5]" />

            <span className="max-w-[220px] truncate font-semibold text-[#786b7b]">
              {category.name}
            </span>
          </nav>

          {/* Category introduction */}
          <div className="mt-12 flex flex-col justify-between gap-8 sm:mt-16 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#9478a5]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.27em] text-[#9478a5]">
                  Explore the collection
                </span>
              </div>

              <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[0.98] tracking-[-0.04em] text-[#252522]">
                {category.name}
                <span className="ml-2 font-normal italic text-[#9478a5]">collection.</span>
              </h1>

              {category.description && (
                <p className="mt-5 max-w-xl text-xs leading-7 text-[#77716f] sm:text-sm">
                  {category.description}
                </p>
              )}

              {!category.description && (
                <p className="mt-5 max-w-xl text-xs leading-7 text-[#77716f] sm:text-sm">
                  Explore our carefully selected range of dental products, professional instruments
                  and solutions for your practice.
                </p>
              )}
            </div>

            {/* Results summary */}
            <div className="flex shrink-0 items-center gap-4 border-t border-[#dcd2dc] pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c9bdc9] text-[#9478a5]">
                <PackageSearch className="h-5 w-5" />
              </div>

              <div>
                <p className="font-serif text-3xl leading-none text-[#252522]">{totalCount}</p>

                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.15em] text-[#92888e]">
                  Products available
                </p>
              </div>
            </div>
          </div>

          {/* Category metadata */}
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[#dcd2dc] pt-5">
            <div className="flex items-center gap-2">
              <CircleDot className="h-3 w-3 text-[#9478a5]" />

              <span className="text-[9px] uppercase tracking-[0.16em] text-[#92888e]">
                Bossdent collection
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#b7aab5]" />

              <span className="text-[9px] uppercase tracking-[0.16em] text-[#92888e]">
                Professional dental supplies
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#b7aab5]" />

              <span className="text-[9px] uppercase tracking-[0.16em] text-[#92888e]">
                {subcategories.length} subcategories
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SUBCATEGORY NAVIGATION
      ===================================================== */}

      {subcategories.length > 0 && (
        <section className="border-b border-[#e7dfdc] bg-[#f8f6f3]">
          <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-14">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9478a5]">
                  Browse by speciality
                </p>

                <h2 className="mt-1 font-serif text-xl text-[#302a2d]">Explore subcategories</h2>
              </div>

              <span className="text-[9px] uppercase tracking-[0.13em] text-[#aaa09c]">
                {subcategories.length} available
              </span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {subcategories.map((sub: any) => (
                <Link
                  key={String(sub._id)}
                  href={`/categories/${sub.slug}`}
                  className="group inline-flex shrink-0 items-center gap-3 rounded-full border border-[#ded4de] bg-[#f4f1ed] px-4 py-2.5 text-[10px] font-medium text-[#655b65] transition-all duration-300 hover:border-[#9478a5] hover:bg-[#9478a5] hover:text-white"
                >
                  {sub.name}

                  <ArrowUpRight className="h-3 w-3 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          PRODUCT CATALOGUE
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 sm:px-8 sm:pb-24 sm:pt-14 lg:px-14">
        {/* Section heading */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-7 bg-[#9478a5]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9478a5]">
                The Bossdent catalogue
              </span>
            </div>

            <h2 className="font-serif text-3xl leading-tight tracking-[-0.025em] text-[#252522] sm:text-4xl">
              Discover the range.
            </h2>
          </div>

          <Link
            href="/categories"
            className="group inline-flex w-fit items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#786b7b] transition-colors hover:text-[#9478a5]"
          >
            All categories
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 items-stretch gap-7 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-9 xl:grid-cols-[265px_minmax(0,1fr)]">
          {/* Filters sidebar */}
          <div className="h-full lg:sticky lg:top-28">
            <CategoryFilters
              brands={brandOptions}
              selectedBrand={searchParams.brand}
              inStockOnly={searchParams.inStock === "true"}
              sort={searchParams.sort || "recommended"}
            />
          </div>

          {/* Product area */}
          <div className="min-w-0 space-y-6">
            {/* Results and sorting bar */}
            <div className="flex flex-col justify-between gap-4 border-y border-[#ded8d3] py-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-medium text-[#77716f]">
                  Showing{" "}
                  <span className="font-semibold text-[#252522]">
                    {firstResult}–{lastResult}
                  </span>{" "}
                  of <span className="font-semibold text-[#252522]">{totalCount}</span> products
                </p>

                {(searchParams.brand || searchParams.inStock === "true") && (
                  <p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-[#9478a5]">
                    Active filters applied
                  </p>
                )}
              </div>

              <CategorySort sort={searchParams.sort || "recommended"} />
            </div>

            {/* Product grid */}
            {products.length === 0 ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center border border-[#e5dce5] bg-[#fbf9f7] px-6 py-14 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#ded4de] bg-[#eee8ed] text-[#9478a5]">
                  <Filter className="h-6 w-6" />
                </div>

                <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9478a5]">
                  No matching products
                </p>

                <h3 className="mt-2 font-serif text-3xl text-[#302a2d]">Nothing here just yet.</h3>

                <p className="mt-3 max-w-sm text-xs leading-6 text-[#77716f]">
                  We couldn't find products matching your selected filters. Try adjusting your
                  filters or explore the complete category.
                </p>

                <Link
                  href={`/categories/${params.slug}`}
                  className="mt-7 inline-flex items-center gap-3 bg-[#9478a5] px-6 py-3.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#786b7b]"
                >
                  Clear all filters
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                  {products.map((product: any) => (
                    <ProductCard key={String(product._id)} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center justify-between gap-4 border-t border-[#ded8d3] pt-7 sm:flex-row">
                    <p className="text-[10px] text-[#92888e]">
                      Page <span className="font-semibold text-[#514751]">{page}</span> of{" "}
                      <span className="font-semibold text-[#514751]">{totalPages}</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {/* Previous */}
                      {page > 1 && (
                        <Link
                          href={getPaginationUrl(page - 1)}
                          aria-label="Previous page"
                          className="flex h-9 w-9 items-center justify-center border border-[#ded4de] bg-[#fbf9f7] text-[#786b7b] transition-colors hover:border-[#9478a5] hover:bg-[#9478a5] hover:text-white"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </Link>
                      )}

                      {paginationPages.map((pageNumber) => (
                        <Link
                          key={pageNumber}
                          href={getPaginationUrl(pageNumber)}
                          aria-current={page === pageNumber ? "page" : undefined}
                          className={`flex h-9 min-w-9 items-center justify-center px-3 text-[10px] font-semibold transition-all ${
                            page === pageNumber
                              ? "bg-[#9478a5] text-white shadow-[0_5px_14px_rgba(148,120,165,0.2)]"
                              : "border border-[#ded4de] bg-[#fbf9f7] text-[#786b7b] hover:border-[#9478a5] hover:text-[#9478a5]"
                          }`}
                        >
                          {pageNumber}
                        </Link>
                      ))}

                      {/* Next */}
                      {page < totalPages && (
                        <Link
                          href={getPaginationUrl(page + 1)}
                          aria-label="Next page"
                          className="flex h-9 w-9 items-center justify-center border border-[#ded4de] bg-[#fbf9f7] text-[#786b7b] transition-colors hover:border-[#9478a5] hover:bg-[#9478a5] hover:text-white"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CLOSING BRAND STRIP
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#e9e2e9]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[#9478a5]/15" />

        <div className="relative mx-auto flex max-w-[1440px] flex-col justify-between gap-7 px-5 py-12 sm:px-8 md:flex-row md:items-center lg:px-14 lg:py-16">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9478a5]">
              Personalised assistance
            </p>

            <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight text-[#252522] sm:text-4xl">
              The right choice starts with a conversation.
            </h2>

            <p className="mt-3 max-w-lg text-xs leading-6 text-[#77716f]">
              Our team can help you explore product information and find suitable solutions for your
              practice.
            </p>
          </div>

          <Link
            href="/contact"
            className="group inline-flex w-fit shrink-0 items-center gap-4 bg-[#9478a5] px-7 py-4 text-[9px] font-semibold uppercase tracking-[0.19em] text-white transition-all duration-300 hover:bg-[#786b7b]"
          >
            Speak with our team
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}
