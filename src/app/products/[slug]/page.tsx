import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronRight, CircleDot } from "lucide-react";

import "@/models";

import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import { Review } from "@/models/Review";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  await connectToDatabase();

  const product = await Product.findOne({
    slug: params.slug,
    active: true,
  })
    .populate("brand", "name slug")
    .populate("category", "name slug")
    .populate("subcategory", "name slug")
    .lean();

  if (!product) {
    notFound();
  }

  const productId = product._id;

  // Read the ID from the populated category document.
  const populatedCategory = product.category as any;
  const categoryId = populatedCategory?._id || product.category;

  const [variants, reviews, relatedProducts] = await Promise.all([
    ProductVariant.find({
      product: productId,
      active: true,
    }).lean(),

    Review.find({
      product: productId,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .lean(),

    Product.find({
      category: categoryId,
      _id: { $ne: productId },
      active: true,
    })
      .populate("brand", "name slug")
      .limit(4)
      .lean(),
  ]);

  // Serialize MongoDB documents before passing them to the client component.
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedVariants = JSON.parse(JSON.stringify(variants));
  const serializedReviews = JSON.parse(JSON.stringify(reviews));
  const serializedRelatedProducts = JSON.parse(JSON.stringify(relatedProducts));

  const productTitle = product.title || "Product details";

  const category = product.category as {
    name?: string;
    slug?: string;
  } | null;

  const brand = product.brand as {
    name?: string;
    slug?: string;
  } | null;

  const sku = (product as any).sku || (product as any).defaultSku || "COLLECTION";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1ed] text-[#252522]">
      {/* =========================================
    EDITORIAL HERO / BREADCRUMB HEADER
========================================= */}

      <section
        className="relative isolate min-h-[540px] overflow-hidden border-b border-[#e5dedf] bg-[#eee8ed] bg-cover bg-center lg:min-h-[590px]"
        style={{
          backgroundImage: "url('/images/bossdent-productDetails-hero-1.png')",
          backgroundPosition: "center 55%",
        }}
      >
        {/* Subtle text readability gradient — keeps the photograph visible */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#f4f1ed]/45 via-[#f4f1ed]/15 to-transparent" />

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-[300px] w-[300px] rounded-full border border-[#9478a5]/20 sm:h-[440px] sm:w-[440px]" />

        <div className="pointer-events-none absolute -right-10 -top-20 -z-10 h-[210px] w-[210px] rounded-full border border-[#9478a5]/20 sm:h-[320px] sm:w-[320px]" />

        <div className="relative mx-auto max-w-[1440px] px-5 pb-10 pt-36 sm:px-8 sm:pb-12 sm:pt-40 lg:px-14 lg:pb-14 lg:pt-44">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-[9px] font-medium uppercase tracking-[0.17em] text-[#ffffff] sm:text-[10px]"
          >
            <Link href="/" className="transition-colors hover:text-[#ffffff]">
              Home
            </Link>

            <ChevronRight className="h-3 w-3 text-[#b7aab5]" />

            <Link href="/products" className="transition-colors hover:text-[#9478a5]">
              Products
            </Link>

            {category?.slug && (
              <>
                <ChevronRight className="h-3 w-3 text-[#ffffff]" />

                <Link
                  href={`/categories/${category.slug}`}
                  className="max-w-[150px] truncate transition-colors hover:text-[#9478a5]"
                >
                  {category.name}
                </Link>
              </>
            )}

            <ChevronRight className="h-3 w-3 text-[#b7aab5]" />

            <span className="max-w-[180px] truncate font-semibold text-[#ffffff]">
              {productTitle}
            </span>
          </nav>

          {/* Main hero content */}
          <div className="mt-12 flex flex-col justify-between gap-9 sm:mt-14 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[#9478a5]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.27em] text-[#000]">
                  Discover the details
                </span>
              </div>

              <h1 className="font-serif text-[clamp(2.6rem,5vw,4.5rem)] leading-[0.98] tracking-[-0.035em] text-[#252522]">
                Thoughtfully selected.
                <br />
                <span className="font-normal italic text-[#9478a5]">Made for better practice.</span>
              </h1>

              <p className="mt-6 max-w-lg text-xs leading-7 text-[#000] sm:text-sm">
                Explore product details, discover specifications and find the right essentials for
                your professional needs.
              </p>
            </div>

            {/* Back link */}
            <Link
              href="/products"
              className="group inline-flex w-fit shrink-0 items-center gap-3 border-b border-[#c9bdc9] pb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#fff] transition-colors hover:border-[#9478a5] hover:text-[#9478a5]"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              Back to collection
              <ArrowUpRight className="h-3 w-3 opacity-50" />
            </Link>
          </div>

          {/* Collection metadata */}
          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[#cfc3cd]/70 pt-5">
            <div className="flex items-center gap-2">
              <CircleDot className="h-3 w-3 text-[#9478a5]" />

              <span className="text-[9px] uppercase tracking-[0.16em] text-[#fff]">
                Bossdent collection
              </span>
            </div>

            {category?.name && (
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#b7aab5]" />

                <span className="text-[9px] uppercase tracking-[0.16em] text-[#fff]">
                  {category.name}
                </span>
              </div>
            )}

            {brand?.name && (
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#b7aab5]" />

                <span className="text-[9px] uppercase tracking-[0.16em] text-[#fff]">
                  {brand.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================
          PRODUCT DETAIL CONTENT
      ========================================= */}

      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-14 lg:pb-28">
        {/* Section label */}
        <div className="mb-7 flex items-center justify-between gap-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9478a5]">
            Product overview
          </p>

          <span className="text-[9px] uppercase tracking-[0.16em] text-[#aaa09c]">
            BOSSDENT / {sku}
          </span>
        </div>

        <div className="border-t border-[#ded8d3] pt-8">
          <ProductDetailClient
            product={serializedProduct}
            variants={serializedVariants}
            reviews={serializedReviews}
            relatedProducts={serializedRelatedProducts}
          />
        </div>
      </section>

      {/* =========================================
          CLOSING BRAND STRIP
      ========================================= */}

      <section className="relative isolate overflow-hidden bg-[#e9e2e9]">
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
