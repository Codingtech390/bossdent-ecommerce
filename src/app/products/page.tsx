import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  PackageOpen,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import "@/models";

import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export const dynamic = "force-dynamic";

const PRODUCTS_PER_PAGE = 12;

type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
};

type ProductImage = {
  url?: string;
  alt?: string;
};

type ProductRecord = {
  _id: string;
  name?: string;
  title?: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  compareAtPrice?: number;
  images?: Array<string | ProductImage>;
  listingImage?: string;
  image?: string;
  thumbnail?: string;
  sku?: string;
  brand?: {
    name?: string;
    slug?: string;
  } | null;
  category?: {
    name?: string;
    slug?: string;
  } | null;
};

type CategoryRecord = {
  _id: string;
  name: string;
  slug: string;
};

function getProductName(product: ProductRecord): string {
  return product.name || product.title || "Untitled product";
}

function getProductImage(product: ProductRecord): {
  url: string;
  alt: string;
} | null {
  if (product.listingImage?.trim()) {
    return {
      url: product.listingImage.trim(),
      alt: getProductName(product),
    };
  }

  const images = product.images || [];

  for (const image of images) {
    if (typeof image === "string" && image.trim()) {
      return {
        url: image.trim(),
        alt: getProductName(product),
      };
    }

    if (
      typeof image === "object" &&
      image !== null &&
      typeof image.url === "string" &&
      image.url.trim()
    ) {
      return {
        url: image.url.trim(),
        alt: image.alt || getProductName(product),
      };
    }
  }

  const fallbackImage = product.image || product.thumbnail;

  if (fallbackImage?.trim()) {
    return {
      url: fallbackImage.trim(),
      alt: getProductName(product),
    };
  }

  return null;
}

function formatPrice(value?: number): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildHref(params: SearchParams, updates: Partial<SearchParams>): string {
  const next: SearchParams = {
    ...params,
    ...updates,
  };

  const query = new URLSearchParams();

  Object.entries(next).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const queryString = query.toString();

  return queryString ? `/products?${queryString}` : "/products";
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  await connectToDatabase();

  const params = searchParams;

  const currentPage = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);

  const searchTerm = params.q?.trim() || "";

  // --------------------------------------------------
  // PRODUCT FILTERS
  // --------------------------------------------------

  const filter: Record<string, unknown> = {
    active: true,
  };

  if (searchTerm) {
    filter.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { title: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { shortDescription: { $regex: searchTerm, $options: "i" } },
      { sku: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (params.category) {
    filter.category = params.category;
  }

  // --------------------------------------------------
  // SORTING
  // --------------------------------------------------

  const sortOptions: Record<string, Record<string, 1 | -1>> = {
    newest: {
      createdAt: -1,
    },
    name: {
      name: 1,
      title: 1,
    },
    priceLow: {
      price: 1,
    },
    priceHigh: {
      price: -1,
    },
  };

  const selectedSort = params.sort && sortOptions[params.sort] ? params.sort : "newest";

  const sort = sortOptions[selectedSort];

  // --------------------------------------------------
  // DATABASE QUERIES
  // --------------------------------------------------

  const [rawProducts, totalProducts, rawCategoryIds] = await Promise.all([
    Product.find(filter)
      .populate("brand", "name slug")
      .populate("category", "name slug")
      .sort(sort)
      .skip((currentPage - 1) * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE)
      .lean(),

    Product.countDocuments(filter),

    Product.distinct("category", {
      active: true,
    }),
  ]);

  const products = JSON.parse(JSON.stringify(rawProducts)) as ProductRecord[];

  // --------------------------------------------------
  // CATEGORY FILTER DATA
  // --------------------------------------------------

  const categoryIds = rawCategoryIds.filter(Boolean);

  const rawCategories = categoryIds.length
    ? await Category.find({
        _id: {
          $in: categoryIds,
        },
        isActive: true,
      })
        .select("name slug")
        .sort({
          name: 1,
        })
        .lean()
    : [];

  const categories = JSON.parse(JSON.stringify(rawCategories)) as CategoryRecord[];

  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#f4f1ed] text-[#252522]">
      {/* ================================================
          HERO
      ================================================= */}

      {/* ================================================
    PRODUCTS HERO — IMAGE + MAUVE OVERLAY
================================================= */}

      <section className="relative isolate min-h-[680px] overflow-hidden bg-[#786b7b] sm:min-h-[740px] lg:min-h-[780px]">
        {/* Background image */}
        <div
          className="absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/bossdent-hero-poster.png')",
          }}
        />

        {/* Dark mauve overlay */}
        <div className="absolute inset-0 -z-20 bg-[#241b2b]/65" />

        {/* Directional gradient for text readability */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#211827]/90 via-[#382a3d]/65 to-[#382a3d]/15" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#241b2b]/50 to-transparent" />

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-32 top-10 h-[480px] w-[480px] rounded-full border border-white/15 lg:h-[620px] lg:w-[620px]" />

        <div className="pointer-events-none absolute -right-12 top-28 h-[330px] w-[330px] rounded-full border border-white/10 lg:h-[450px] lg:w-[450px]" />

        {/* Hero content */}
        <div className="relative mx-auto flex min-h-[680px] max-w-[1440px] items-center px-5 pb-16 pt-[230px] sm:min-h-[740px] sm:px-8 sm:pb-20 sm:pt-[250px] lg:min-h-[780px] lg:px-14 lg:pb-24 lg:pt-[250px]">
          <div className="max-w-[850px]">
            <div className="mb-7 flex items-center gap-4">
              <span className="h-px w-10 bg-[#c6a9d3]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#ddc8e7] sm:text-xs">
                The Bossdent Collection
              </p>
            </div>

            <h1 className="font-serif text-[clamp(3.6rem,8vw,7.5rem)] font-normal leading-[0.91] tracking-[-0.045em] text-white">
              Products for
              <br />
              <span className="font-normal italic text-[#c7a6d7]">better practice.</span>
            </h1>

            <p className="mt-8 max-w-[560px] text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
              Explore our collection of dental products and professional essentials, selected for
              modern dental practices.
            </p>

            <a
              href="#catalogue"
              className="group mt-10 inline-flex items-center gap-4 border border-white/45 px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:border-[#c7a6d7] hover:bg-[#9478a5] hover:text-white"
            >
              Explore the collection
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>

            {/* Bottom editorial detail */}
            <div className="mt-16 flex items-center gap-5 border-t border-white/20 pt-5 sm:mt-20">
              <span className="text-[9px] uppercase tracking-[0.22em] text-white/55">BOSSDENT</span>

              <span className="h-px w-8 bg-white/30" />

              <span className="text-[9px] uppercase tracking-[0.22em] text-white/55">
                Dental essentials & professional supplies
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          CATALOGUE
      ================================================= */}

      <section
        id="catalogue"
        className="mx-auto max-w-[1440px] scroll-mt-20 px-5 py-14 sm:px-8 lg:px-14 lg:py-20"
      >
        {/* Heading */}

        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-[#ded8d3] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9478a5]">
              Browse our range
            </p>

            <h2 className="mt-2 font-serif text-4xl tracking-tight text-[#252522] sm:text-5xl">
              The collection
            </h2>

            <p className="mt-3 text-xs text-[#88817d]">
              {totalProducts} {totalProducts === 1 ? "product" : "products"}
              {searchTerm ? ` matching “${searchTerm}”` : ""}
            </p>
          </div>

          {/* Search */}

          <form
            action="/products"
            method="GET"
            className="flex w-full max-w-md items-center border-b border-[#bdb3bb] pb-3 transition-colors focus-within:border-[#9478a5]"
          >
            {params.category && <input type="hidden" name="category" value={params.category} />}

            {selectedSort !== "newest" && <input type="hidden" name="sort" value={selectedSort} />}

            <Search className="mr-3 h-4 w-4 shrink-0 text-[#9478a5]" />

            <input
              type="search"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search products..."
              className="w-full bg-transparent text-sm text-[#252522] outline-none placeholder:text-[#aaa19f]"
            />

            <button
              type="submit"
              className="ml-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#786b7b] transition-colors hover:text-[#9478a5]"
            >
              Search
            </button>
          </form>
        </div>

        {/* Main layout */}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          {/* ============================================
              SIDEBAR
          ============================================ */}

          <aside className="space-y-9">
            <div>
              <div className="mb-5 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#9478a5]" />

                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Categories</h3>
              </div>

              <div className="space-y-0">
                <Link
                  href={buildHref(params, {
                    category: undefined,
                    page: undefined,
                  })}
                  className={`flex items-center justify-between border-b border-[#e5ded9] py-3 text-sm transition-colors ${
                    !params.category
                      ? "font-semibold text-[#9478a5]"
                      : "text-[#77716f] hover:text-[#9478a5]"
                  }`}
                >
                  All products
                  {!params.category && <span className="h-1.5 w-1.5 rounded-full bg-[#9478a5]" />}
                </Link>

                {categories.map((category) => (
                  <Link
                    key={category._id}
                    href={buildHref(params, {
                      category: category._id,
                      page: undefined,
                    })}
                    className={`flex items-center justify-between border-b border-[#e5ded9] py-3 text-sm transition-colors ${
                      params.category === category._id
                        ? "font-semibold text-[#9478a5]"
                        : "text-[#77716f] hover:text-[#9478a5]"
                    }`}
                  >
                    <span>{category.name}</span>

                    {params.category === category._id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#9478a5]" />
                    )}
                  </Link>
                ))}

                {categories.length === 0 && (
                  <p className="py-3 text-xs leading-6 text-[#99918d]">
                    Categories will appear here when available.
                  </p>
                )}
              </div>
            </div>

            {/* Assistance */}

            <div className="border-t border-[#ded8d3] pt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786b7b]">
                Need assistance?
              </p>

              <p className="mt-3 text-sm leading-6 text-[#88817d]">
                Looking for something specific for your practice? We would be happy to help.
              </p>

              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9478a5] transition-colors hover:text-[#786b7b]"
              >
                Get in touch
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>

          {/* ============================================
              PRODUCTS
          ============================================ */}

          <div>
            {/* Results toolbar */}

            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-[#88817d]">
                Showing <span className="font-semibold text-[#252522]">{products.length}</span> of{" "}
                {totalProducts} products
              </p>

              <form action="/products" method="GET" className="flex items-center gap-3">
                {params.q && <input type="hidden" name="q" value={params.q} />}

                {params.category && <input type="hidden" name="category" value={params.category} />}

                <select
                  name="sort"
                  defaultValue={selectedSort}
                  className="border-b border-[#bdb3bb] bg-transparent py-2 text-xs text-[#786b7b] outline-none focus:border-[#9478a5]"
                  aria-label="Sort products"
                >
                  <option value="newest">Newest first</option>
                  <option value="name">Name A–Z</option>
                  <option value="priceLow">Price: low to high</option>
                  <option value="priceHigh">Price: high to low</option>
                </select>

                <button
                  type="submit"
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9478a5] transition-colors hover:text-[#786b7b]"
                >
                  Apply
                </button>
              </form>
            </div>

            {/* Product grid */}

            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const image = getProductImage(product);
                  const productName = getProductName(product);

                  const price = formatPrice(product.price);
                  const comparePrice = formatPrice(product.compareAtPrice);

                  const hasComparePrice =
                    typeof product.compareAtPrice === "number" &&
                    typeof product.price === "number" &&
                    product.compareAtPrice > product.price;

                  return (
                    <article key={product._id} className="group min-w-0">
                      <Link
                        href={`/products/${product.slug}`}
                        className="block"
                        aria-label={`View ${productName}`}
                      >
                        {/* Image */}

                        <div className="relative aspect-[4/4.6] overflow-hidden bg-[#ebe6e2]">
                          {image ? (
                            <img
                              src={image.url}
                              alt={image.alt}
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-contain p-7 transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                            />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3 text-[#b2a8ad]">
                              <PackageOpen className="h-9 w-9 stroke-[1]" />

                              <span className="text-[9px] uppercase tracking-[0.2em]">
                                Image unavailable
                              </span>
                            </div>
                          )}

                          {/* Hover action */}

                          <span className="absolute bottom-4 right-4 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-[#9478a5] text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </div>

                        {/* Product information */}

                        <div className="pt-5">
                          {product.brand?.name && (
                            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9478a5]">
                              {product.brand.name}
                            </p>
                          )}

                          <h3 className="font-serif text-[1.45rem] leading-[1.16] text-[#252522] transition-colors duration-300 group-hover:text-[#9478a5]">
                            {productName}
                          </h3>

                          {product.shortDescription && (
                            <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#88817d]">
                              {product.shortDescription}
                            </p>
                          )}

                          {/* Price */}

                          {(price || comparePrice) && (
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              {price && (
                                <span className="text-sm font-semibold text-[#252522]">
                                  {price}
                                </span>
                              )}

                              {hasComparePrice && comparePrice && (
                                <span className="text-xs text-[#a69c98] line-through">
                                  {comparePrice}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer */}

                          <div className="mt-5 flex items-center justify-between border-t border-[#e5ded9] pt-3">
                            <span className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#88817d] transition-colors group-hover:text-[#9478a5]">
                              View product
                            </span>

                            <ArrowUpRight className="h-3.5 w-3.5 text-[#9478a5] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Empty state */

              <div className="flex min-h-[360px] flex-col items-center justify-center border border-dashed border-[#d7cdd3] px-6 text-center">
                <PackageOpen className="h-10 w-10 stroke-[1] text-[#b4a5b5]" />

                <h3 className="mt-5 font-serif text-3xl text-[#252522]">Nothing here just yet</h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-[#88817d]">
                  We couldn't find products matching your selection. Try another search or browse
                  the full collection.
                </p>

                <Link
                  href="/products"
                  className="mt-6 border border-[#9478a5] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#786b7b] transition-colors hover:bg-[#9478a5] hover:text-white"
                >
                  View all products
                </Link>
              </div>
            )}

            {/* ==========================================
                PAGINATION
            ========================================== */}

            {totalPages > 1 && (
              <div className="mt-16 flex flex-wrap items-center justify-between gap-5 border-t border-[#ded8d3] pt-7">
                <p className="text-xs text-[#88817d]">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={buildHref(params, {
                        page: String(currentPage - 1),
                      })}
                      className="flex h-10 items-center gap-2 border border-[#d8ced5] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#786b7b] transition-colors hover:border-[#9478a5] hover:bg-[#9478a5] hover:text-white"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Previous
                    </Link>
                  )}

                  {currentPage < totalPages && (
                    <Link
                      href={buildHref(params, {
                        page: String(currentPage + 1),
                      })}
                      className="flex h-10 items-center gap-2 border border-[#9478a5] bg-[#9478a5] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#786b7b]"
                    >
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================
          CONSULTATION STRIP
      ================================================= */}

      <section className="bg-[#e9e2e9]">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-7 px-5 py-14 sm:px-8 md:flex-row md:items-center lg:px-14 lg:py-16">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9478a5]">
              A more considered way to source
            </p>

            <h2 className="mt-3 font-serif text-3xl leading-tight text-[#252522] sm:text-4xl">
              Let’s find what your practice needs.
            </h2>
          </div>

          <Link
            href="/contact"
            className="inline-flex w-fit items-center gap-3 border border-[#9478a5] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#786b7b] transition-all duration-300 hover:bg-[#9478a5] hover:text-white"
          >
            Book a consultation
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
