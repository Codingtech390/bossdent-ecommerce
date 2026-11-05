import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  CircleDot,
  Layers,
  ShieldCheck,
} from "lucide-react";

import "@/models";

import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/models/Brand";

export const dynamic = "force-dynamic";

export default async function BrandsDirectoryPage() {
  await connectToDatabase();

  const brands = await Brand.find({}).sort({ name: 1 }).lean();

  // Group brands alphabetically A-Z
  const grouped: Record<string, any[]> = {};

  for (const brand of brands) {
    const firstLetter = String(brand.name || "")
      .charAt(0)
      .toUpperCase();

    const key = /^[A-Z]$/.test(firstLetter) ? firstLetter : "#";

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(brand);
  }

  const alphabet = Object.keys(grouped).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  const totalProducts = brands.reduce(
    (total, brand: any) => total + (Number(brand.productCount) || 0),
    0,
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1ed] text-[#252522]">
      {/* =====================================================
          EDITORIAL HERO
      ===================================================== */}

      <section
        className="relative isolate overflow-hidden border-b border-[#e5dedf] bg-[#eee8ed] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/bossdent-hero-poster-brands-1.png')",
        }}
      >

        {/* Subtle image wash */}
        <div className="absolute inset-0 -z-10 bg-white/10" />
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-32 h-[300px] w-[300px] rounded-full border border-[#9478a5]/10 sm:h-[440px] sm:w-[440px]" />

        <div className="pointer-events-none absolute -right-10 -top-20 h-[210px] w-[210px] rounded-full border border-[#9478a5]/15 sm:h-[320px] sm:w-[320px]" />

        <div className="relative z-10 mx-auto max-w-[1440px] px-5 pb-10 pt-8 sm:px-8 sm:pb-14 sm:pt-10 lg:px-14">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.17em] text-[#92888e] sm:text-[10px]"
          >
            <Link href="/" className="transition-colors hover:text-[#9478a5]">
              Home
            </Link>

            <ChevronRight className="h-3 w-3 text-[#b7aab5]" />

            <span className="font-semibold text-[#786b7b]">Brands Directory</span>
          </nav>

          {/* Hero content */}
          <div className="mt-12 flex flex-col justify-between gap-9 md:mt-16 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#9478a5]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.27em] text-[#9478a5]">
                  The brands we bring together
                </span>
              </div>

              <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[0.98] tracking-[-0.04em] text-[#252522]">
                Trusted names.
                <br />
                <span className="font-normal italic text-[#9478a5]">Thoughtfully selected.</span>
              </h1>

              <p className="mt-5 max-w-xl text-xs leading-7 text-[#77716f] sm:text-sm">
                Explore the manufacturers and dental brands featured in the Bossdent collection.
                Discover products, compare specialists and find the right solutions for your
                practice.
              </p>
            </div>

            {/* Brand statistics */}
            <div className="grid w-full shrink-0 grid-cols-2 gap-3 md:w-auto md:min-w-[310px]">
              <div className="border border-[#dcd2dc] bg-[#f4f1ed]/70 px-5 py-5">
                <Layers className="mb-4 h-4 w-4 text-[#9478a5]" />

                <p className="font-serif text-4xl leading-none text-[#252522]">{brands.length}</p>

                <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.15em] text-[#92888e]">
                  Listed brands
                </p>
              </div>

              <div className="border border-[#dcd2dc] bg-[#f4f1ed]/70 px-5 py-5">
                <CircleDot className="mb-4 h-4 w-4 text-[#9478a5]" />

                <p className="font-serif text-4xl leading-none text-[#252522]">{totalProducts}</p>

                <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.15em] text-[#92888e]">
                  Listed products
                </p>
              </div>
            </div>
          </div>

          {/* Bottom metadata */}
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[#dcd2dc] pt-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-[#9478a5]" />

              <span className="text-[9px] uppercase tracking-[0.16em] text-[#92888e]">
                Dental manufacturers
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#b7aab5]" />

              <span className="text-[9px] uppercase tracking-[0.16em] text-[#92888e]">
                Global and Indian brands
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#b7aab5]" />

              <span className="text-[9px] uppercase tracking-[0.16em] text-[#92888e]">
                Explore by name
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ALPHABETICAL NAVIGATION
      ===================================================== */}

      {alphabet.length > 0 && (
        <section className="sticky top-[76px] z-30 border-b border-[#e5dedf] bg-[#f4f1ed]/95 backdrop-blur-md">
          <div className="mx-auto max-w-[1440px] px-5 py-4 sm:px-8 lg:px-14">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9478a5]">
                Browse alphabetically
              </p>

              <span className="text-[9px] uppercase tracking-[0.13em] text-[#aaa09c]">
                {alphabet.length} groups
              </span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {alphabet.map((letter) => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="flex h-9 min-w-9 shrink-0 items-center justify-center border border-[#ded4de] bg-[#eee8ed] px-3 text-[10px] font-semibold text-[#786b7b] transition-all duration-200 hover:border-[#9478a5] hover:bg-[#9478a5] hover:text-white"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          BRANDS DIRECTORY
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-14 lg:py-20">
        {/* Section introduction */}
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-7 bg-[#9478a5]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9478a5]">
                Explore our collection
              </span>
            </div>

            <h2 className="font-serif text-3xl tracking-[-0.025em] text-[#252522] sm:text-4xl">
              Brands directory.
            </h2>

            <p className="mt-2 text-xs leading-6 text-[#77716f]">
              Browse the brands available across our dental product range.
            </p>
          </div>

          <p className="text-[10px] uppercase tracking-[0.15em] text-[#92888e]">
            {brands.length} brands listed
          </p>
        </div>

        {/* Empty state */}
        {brands.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center border border-[#e5dce5] bg-[#fbf9f7] px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#ded4de] bg-[#eee8ed] text-[#9478a5]">
              <Layers className="h-6 w-6" />
            </div>

            <h3 className="mt-5 font-serif text-3xl text-[#302a2d]">Our collection is growing.</h3>

            <p className="mt-3 max-w-sm text-xs leading-6 text-[#77716f]">
              Brand information will appear here as our directory is updated.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-3 bg-[#9478a5] px-6 py-3.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#786b7b]"
            >
              Explore products
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-14">
            {alphabet.map((letter) => (
              <section key={letter} id={`letter-${letter}`} className="scroll-mt-44">
                {/* Letter heading */}
                <div className="mb-6 flex items-center gap-4 border-b border-[#ded8d3] pb-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#d8cbd9] bg-[#eee8ed] font-serif text-2xl text-[#9478a5]">
                    {letter}
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9478a5]">
                      Brand collection
                    </p>

                    <h3 className="mt-1 font-serif text-xl text-[#302a2d]">
                      {letter === "#" ? "Other brands" : `Brands beginning with ${letter}`}
                    </h3>
                  </div>

                  <span className="ml-auto text-[9px] uppercase tracking-[0.13em] text-[#aaa09c]">
                    {grouped[letter].length} {grouped[letter].length === 1 ? "brand" : "brands"}
                  </span>
                </div>

                {/* Brand cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
                  {grouped[letter].map((brand: any) => (
                    <Link
                      key={String(brand._id)}
                      href={`/brands/${brand.slug}`}
                      className="group relative flex min-h-[155px] flex-col justify-between overflow-hidden border border-[#e3dcd8] bg-[#fbf9f7] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#9478a5]/60 hover:bg-[#eee8ed] hover:shadow-[0_12px_30px_rgba(65,45,65,0.07)] sm:min-h-[175px] sm:p-5"
                    >
                      {/* Decorative accent */}
                      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border border-[#9478a5]/10 transition-transform duration-500 group-hover:scale-125" />

                      <div className="relative">
                        <div className="mb-5 flex items-center justify-between">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ded4de] text-[#9478a5]">
                            <Layers className="h-3 w-3" />
                          </span>

                          <ArrowUpRight className="h-3.5 w-3.5 text-[#b7aab5] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#9478a5]" />
                        </div>

                        <h4 className="font-serif text-lg leading-tight text-[#302a2d] transition-colors group-hover:text-[#786b7b] sm:text-xl">
                          {brand.name}
                        </h4>

                        {brand.originCountry && (
                          <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-[#92888e]">
                            Origin: {brand.originCountry}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-5 flex items-center justify-between border-t border-[#e5dedf] pt-3">
                        <span className="text-[9px] font-semibold text-[#9478a5]">
                          {Number(brand.productCount) || 0} Products
                        </span>

                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#92888e] transition-colors group-hover:text-[#786b7b]">
                          Explore
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          CLOSING BRAND STRIP
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#e9e2e9]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[#9478a5]/15" />

        <div className="relative mx-auto flex max-w-[1440px] flex-col justify-between gap-7 px-5 py-12 sm:px-8 md:flex-row md:items-center lg:px-14 lg:py-16">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9478a5]">
              Discover Bossdent
            </p>

            <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight text-[#252522] sm:text-4xl">
              Good products begin with the right partners.
            </h2>

            <p className="mt-3 max-w-lg text-xs leading-6 text-[#77716f]">
              Explore our dental products and discover solutions for every stage of your practice.
            </p>
          </div>

          <Link
            href="/products"
            className="group inline-flex w-fit shrink-0 items-center gap-4 bg-[#9478a5] px-7 py-4 text-[9px] font-semibold uppercase tracking-[0.19em] text-white transition-all duration-300 hover:bg-[#786b7b]"
          >
            Explore products
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}
