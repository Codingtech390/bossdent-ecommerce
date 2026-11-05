"use client";

import React, { useRef } from "react";
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

export function TopBrands({ brands }: TopBrandsProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!brands?.length) return null;

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    carouselRef.current.scrollBy({
      left: direction === "right" ? 390 : -390,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-[#e9e0e9]">
      <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-9 lg:px-14">
        {/* Heading */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-xl font-semibold tracking-[-0.025em] text-black sm:text-2xl">
              Top Brands
            </h2>
            <Sparkles className="h-5 w-5 text-[#9478a5]" />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/brands"
              className="group inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#9478a5] transition-colors hover:text-black sm:text-xs"
            >
              View All
            </Link>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Previous brands"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/90 bg-white/10 text-[#9478a5] backdrop-blur-sm transition hover:bg-white hover:text-[#874b4e]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Next brands"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/90 bg-white/10 text-[#9478a5] backdrop-blur-sm transition hover:bg-white hover:text-[#874b4e]"
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
              <div className="mt-8 relative flex h-[100px] w-full items-center justify-center overflow-hidden rounded-[19px] bg-white px-3 py-4 shadow-[0_5px_15px_rgba(68,35,37,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white group-hover:shadow-[0_12px_24px_rgba(68,35,37,0.14)] sm:h-[128px] sm:rounded-[21px] sm:px-4">
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
                  <span className="text-center font-serif text-lg font-semibold tracking-wide text-[#35302f] sm:text-xl">
                    {brand.name}
                  </span>
                )}
              </div>

              {/* Brand name */}
              <span className="mt-2 w-full truncate text-center text-[11px] font-medium tracking-[0.01em] text-[#285579] transition-colors group-hover:text-[#874b4e] sm:text-xs">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile scroll hint */}
        {brands.length > 2 && (
          <p className="mt-3 text-center text-[9px] uppercase tracking-[0.16em] text-white/75 sm:hidden">
            Swipe to explore brands
          </p>
        )}
      </div>
    </section>
  );
}
