"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const technologies = [
  {
    id: "primescan",
    tab: "PRIMESCAN® INTRAORAL SCANNER",
    title: "PRIMESCAN® INTRAORAL SCANNER",
    description:
      "Fast, comfortable 3D scans — no messy impressions — so restorations fit better and usually require fewer retakes.",
    image: "/images/technology/primescan.png",
    imageAlt: "Digital intraoral scanning in a dental clinic",
    button: "Explore Primescan",
    href: "/categories",
  },
  {
    id: "smile-design",
    tab: "DIGITAL SMILE DESIGN (SMILECLOUD)",
    title: "DIGITAL SMILE DESIGN (SMILECLOUD)",
    description:
      "We map your smile digitally before treatment, aligning proportions and aesthetics with your goals, so there are fewer surprises.",
    image: "/images/technology/digital-smile-design.png",
    imageAlt: "Digital smile design treatment preview",
    button: "Explore Digital Smile Design",
    href: "/categories",
  },
  {
    id: "cad-cam",
    tab: "CAD/CAM DESIGN + MILLING & PRINTING",
    title: "CAD/CAM DESIGN + MILLING & PRINTING",
    description:
      "Digital design and precision manufacturing bring greater consistency, accuracy and efficiency to modern dental workflows.",
    image: "/images/technology/cad-cam.png",
    imageAlt: "Dental CAD CAM design and manufacturing technology",
    button: "Explore CAD/CAM Technology",
    href: "/categories",
  },
  {
    id: "laboratory",
    tab: "IN-HOUSE PRECISION LABORATORY",
    title: "IN-HOUSE PRECISION LABORATORY",
    description:
      "Carefully coordinated laboratory workflows help support precision, quality control and dependable dental restorations.",
    image: "/images/technology/precision-laboratory.png",
    imageAlt: "Modern dental precision laboratory",
    button: "Explore Laboratory Technology",
    href: "/categories",
  },
  {
    id: "emface",
    tab: "BTL EMFACE® + EXOMIND®",
    title: "BTL EMFACE® + EXOMIND®",
    description:
      "Discover advanced aesthetic and wellness technologies designed to bring innovative treatment possibilities into modern practices.",
    image: "/images/technology/emface-exomind.png",
    imageAlt: "Advanced aesthetic treatment technology",
    button: "Explore Advanced Technology",
    href: "/categories",
  },
];

export function TechnologyShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeTechnology = technologies[activeIndex];

  return (
    <section className="w-full px-4 py-14 sm:px-6 md:py-20">
      <div
        className="mx-auto max-w-[1440px] overflow-hidden px-4 py-12 sm:px-8 md:px-12 md:py-16"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(90,75,90,0.12), transparent 95%), linear-gradient(135deg, #aaa0aa, #b8aeb8 50%, #a99faa)",
        }}
      >
        {/* Heading */}
        <div className="mx-auto mb-9 max-w-2xl text-center text-white md:mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
            Innovation meets precision
          </p>

          <h2 className="mt-3 font-sans text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            Advanced Dental Technology
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-xs leading-6 text-white/90 sm:text-sm">
            Every technology we choose serves one purpose:
            <br className="hidden sm:block" />
            improving accuracy, comfort, and long-term results.
          </p>
        </div>

        {/* Interactive technology panel */}
        <div className="mx-auto grid max-w-[1040px] gap-3 md:grid-cols-[225px_minmax(0,1fr)] md:gap-2">
          {/* Left navigation */}
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-2">
            {technologies.map((technology, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={technology.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={isActive}
                  className={`flex min-h-[58px] items-center justify-center rounded-[5px] px-3 py-3 text-center font-serif text-[9px] uppercase leading-5 tracking-[0.035em] transition-all duration-300 sm:text-[10px] md:min-h-[68px] md:px-4 ${
                    isActive
                      ? "bg-[#968a98] text-white shadow-md"
                      : "bg-[#f5f3f3] text-[#655966] hover:bg-white hover:text-[#968a98]"
                  }`}
                >
                  {technology.tab}
                </button>
              );
            })}
          </div>

          {/* Right content panel */}
          <div
            className="grid min-w-0 overflow-hidden rounded-[5px] bg-[#968a98] md:grid-cols-[1fr_255px] lg:grid-cols-[1fr_290px]"
            aria-live="polite"
          >
            {/* Text content */}
            <div
              key={activeTechnology.id}
              className="flex min-h-[270px] flex-col justify-center px-6 py-8 text-white sm:px-8 md:min-h-[320px] md:px-7 lg:px-9"
            >
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/65">
                Technology {String(activeIndex + 1).padStart(2, "0")}
              </span>

              <h3 className="mt-4 max-w-lg font-serif text-2xl font-normal uppercase leading-[1.12] tracking-[0.015em] sm:text-3xl lg:text-[32px]">
                {activeTechnology.title}
              </h3>

              <p className="mt-4 max-w-lg text-xs leading-6 text-white/95 sm:text-sm sm:leading-6">
                {activeTechnology.description}
              </p>

              <Link
                href={activeTechnology.href}
                className="group mt-6 inline-flex min-h-[44px] w-fit items-center justify-center gap-3 rounded-[5px] bg-white px-5 py-3 text-center text-[11px] font-semibold text-[#827584] transition-all duration-300 hover:bg-[#eee9ee] hover:shadow-md sm:min-w-[230px] sm:text-xs"
              >
                {activeTechnology.button}

                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>

            {/* Image */}
            <div className="relative min-h-[260px] overflow-hidden bg-[#d7d2d5] sm:min-h-[320px] md:min-h-[320px]">
              <Image
                key={activeTechnology.image}
                src={activeTechnology.image}
                alt={activeTechnology.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 290px"
                className="object-cover object-center transition-opacity duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
