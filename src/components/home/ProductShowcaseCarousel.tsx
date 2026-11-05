"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

interface ShowcaseProduct {
  _id: string;
  title: string;
  slug: string;
  images?: string[];
  basePrice?: number;
  shortDescription?: string;
  badges?: string[];
}

interface ProductShowcaseCarouselProps {
  products: ShowcaseProduct[];
}

export function ProductShowcaseCarousel({ products }: ProductShowcaseCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const productList = products.filter((product) => product && product.slug && product.title);

  useEffect(() => {
    if (productList.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % productList.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [productList.length]);

  if (productList.length === 0) return null;

  const activeProduct = productList[activeIndex];
  const productImage = activeProduct.images?.find(
    (image) => typeof image === "string" && image.trim().length > 0,
  );

  const formatPrice = (price?: number) => {
    if (typeof price !== "number" || !Number.isFinite(price)) return null;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const goTo = (index: number) => {
    setActiveIndex((index + productList.length) % productList.length);
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrevious = () => goTo(activeIndex - 1);

  return (
    <section className="bg-[#f7f6f2] px-5 pb-7 pt-7 sm:px-8 sm:pb-9 sm:pt-9 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="group relative isolate min-h-[330px] overflow-hidden rounded-[5px] border border-[#e6dfdc] bg-[#968a98] shadow-[0_12px_35px_rgba(52,43,49,0.09)] sm:min-h-[390px] lg:min-h-[430px]">
          {/* Background texture */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.23),transparent_35%),linear-gradient(115deg,#968a98_0%,#a99ca9_48%,#817482_100%)]" />

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-24 -top-36 -z-10 h-[420px] w-[420px] rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -right-10 -top-20 -z-10 h-[300px] w-[300px] rounded-full border border-white/15" />

          {/* Slide content */}
          <div
            key={activeProduct._id}
            className="grid min-h-[330px] grid-cols-1 items-center gap-3 px-7 py-8 sm:min-h-[390px] sm:px-12 sm:py-10 md:grid-cols-[1fr_0.9fr] md:gap-8 lg:min-h-[430px] lg:px-16"
          >
            {/* Product information */}
            <div className="relative z-10 flex flex-col items-start text-white">
              <span className="mb-4 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/80 sm:text-[10px]">
                <span className="h-px w-7 bg-white/70" />
                Featured product
              </span>

              {activeProduct.badges?.[0] && (
                <span className="mb-3 rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
                  {activeProduct.badges[0]}
                </span>
              )}

              <h2 className="max-w-[620px] font-serif text-[34px] font-normal leading-[1.05] tracking-[-0.035em] sm:text-[44px] md:text-[48px] lg:text-[58px]">
                {activeProduct.title}
              </h2>

              <p className="mt-4 max-w-[470px] text-xs leading-6 text-white/85 sm:text-sm sm:leading-7">
                {activeProduct.shortDescription ||
                  "Explore this carefully selected product for your dental practice."}
              </p>

              {formatPrice(activeProduct.basePrice) && (
                <p className="mt-5 font-serif text-2xl text-white sm:text-3xl">
                  {formatPrice(activeProduct.basePrice)}
                </p>
              )}

              <Link
                href={`/products/${activeProduct.slug}`}
                className="group/cta mt-6 inline-flex min-h-[43px] items-center gap-5 rounded-[3px] bg-[#f7f6f2] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#514751] transition-all duration-300 hover:bg-white hover:shadow-lg sm:min-h-[48px] sm:px-7 sm:text-xs"
              >
                Explore product
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1" />
              </Link>
            </div>

            {/* Product image */}
            <div className="relative mx-auto flex h-[190px] w-full max-w-[430px] items-center justify-center sm:h-[230px] md:h-[300px] lg:h-[340px]">
              <div className="absolute h-[80%] w-[80%] rounded-full bg-white/15 blur-3xl" />

              {productImage ? (
                <Image
                  src={productImage}
                  alt={activeProduct.title}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 90vw, 42vw"
                  className="relative z-10 object-contain p-3 drop-shadow-[0_18px_20px_rgba(35,25,35,0.22)] transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="relative z-10 flex h-full w-full items-center justify-center border border-white/25 bg-white/10 text-center text-xs text-white/80">
                  Product image coming soon
                </div>
              )}
            </div>
          </div>

          {/* Previous / next controls */}
          {productList.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrevious}
                aria-label="Previous product"
                className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#f7f6f2] text-[#554b55] shadow-md transition hover:scale-105 hover:bg-white sm:left-5 sm:h-11 sm:w-11"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next product"
                className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#f7f6f2] text-[#554b55] shadow-md transition hover:scale-105 hover:bg-white sm:right-5 sm:h-11 sm:w-11"
              >
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}

          {/* Slide indicators */}
          {productList.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {productList.map((product, index) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show product ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className={`h-[5px] rounded-full transition-all duration-300 ${
                    activeIndex === index ? "w-8 bg-white" : "w-2 bg-white/45 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Slide counter */}
          <span className="absolute right-5 top-5 z-20 text-[9px] font-medium tracking-[0.18em] text-white/75">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(productList.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
