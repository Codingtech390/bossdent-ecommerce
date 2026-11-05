
"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";

interface BrandItem {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

interface TopBrandsProps {
  brands: BrandItem[];
}

const AUTO_SCROLL_INTERVAL = 3000;
const SCROLL_AMOUNT = 390;

export function TopBrands({ brands }: TopBrandsProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Manual carousel navigation
  const scroll = (direction: "left" | "right") => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;

    if (direction === "right") {
      if (carousel.scrollLeft + SCROLL_AMOUNT >= maxScroll - 5) {
        carousel.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        carousel.scrollBy({
          left: SCROLL_AMOUNT,
          behavior: "smooth",
        });
      }
    } else {
      if (carousel.scrollLeft <= 5) {
        carousel.scrollTo({
          left: maxScroll,
          behavior: "smooth",
        });
      } else {
        carousel.scrollBy({
          left: -SCROLL_AMOUNT,
          behavior: "smooth",
        });
      }
    }
  };

  // Automatic movement every 3 seconds
  useEffect(() => {
    if (!brands || brands.length < 2) return;

    const interval = window.setInterval(() => {
      const carousel = carouselRef.current;
      if (!carousel) return;

      const maxScroll = carousel.scrollWidth - carousel.clientWidth;

      // Nothing to scroll if all brands fit in the available space
      if (maxScroll <= 0) return;

      // Return to the beginning when reaching the end
      if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
        carousel.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        carousel.scrollBy({
          left: SCROLL_AMOUNT,
          behavior: "smooth",
        });
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [brands.length]);

  if (!brands?.length) return null;

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-9 lg:px-14">

        {/* Heading */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-xl font-semibold tracking-[-0.025em] text-black sm:text-2xl">
              Top Brands
            </h2>

            <Sparkles className="h-5 w-5 text-blue-900 mt-1" />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/brands"
              className="group inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-900 transition-colors hover:text-black sm:text-xs"
            >
              View All
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            {/* Manual navigation */}
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Previous brands"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/90 bg-blue-900 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#786b7b]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Next brands"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/90 bg-blue-900 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#786b7b]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Brand carousel */}
        <div
          ref={carouselRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
        >
          {brands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brands/${brand.slug}`}
              title={brand.name}
              className="group flex w-[112px] shrink-0 snap-start flex-col items-center sm:w-[128px] lg:w-[136px]"
            >
              {/* Logo tile */}
              <div className="border relative mt-8 flex h-[100px] w-full items-center justify-center overflow-hidden rounded-[19px] bg-white px-3 py-4 shadow-[0_5px_15px_rgba(68,35,37,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white group-hover:shadow-[0_12px_24px_rgba(68,35,37,0.14)] sm:h-[128px] sm:rounded-[21px] sm:px-4 ">
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    fill
                    sizes="(max-width: 640px) 112px, 136px"
                    unoptimized
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105 sm:p-4"
                  />
                ) : (
                  <span className="text-center font-serif text-lg font-semibold tracking-wide text-blue-900 sm:text-xl">
                    {brand.name}
                  </span>
                )}
              </div>

              {/* Brand name */}
              <span className="mt-2 w-full truncate text-center text-[11px] font-medium tracking-[0.01em] text-blue-900 transition-colors group-hover:text-[#786b7b] sm:text-xs">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile scroll hint */}
        {brands.length > 2 && (
          <p className="mt-3 text-center text-[9px] uppercase tracking-[0.16em] text-[#92888e] sm:hidden">
            Swipe to explore brands
          </p>
        )}
      </div>
    </section>
  );
}
