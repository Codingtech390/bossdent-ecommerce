"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const featuredCategories = [
  {
    id: "digital",
    title: "Digital Dentistry",
    subtitle: "Technology for modern practice",
    href: "/categories/equipment-and-digital-dentistry",
    image: "/images/featured-categories/digital-dentistry.png",
    layout: "wide",
    number: "01",
  },
  {
    id: "restorative",
    title: "Restorative Dentistry",
    subtitle: "Materials for precise results",
    href: "/categories/restorative-and-esthetics",
    image: "/images/featured-categories/restorative-dentistry.png",
    layout: "wide",
    number: "02",
  },
  {
    id: "instruments",
    title: "Instruments & Surgery",
    subtitle: "Essential tools for every procedure",
    href: "/categories/instruments-and-surgery",
    image: "/images/featured-categories/instruments-surgery.png",
    layout: "wide",
    number: "03",
  },
  {
    id: "endodontics",
    title: "Endodontics",
    subtitle: "Precision at every stage",
    href: "/categories/endodontics",
    image: "/images/featured-categories/endodontics.png",
    layout: "wide",
    number: "04",
  },
  {
    id: "clinic",
    title: "Clinic Setup",
    subtitle: "Equipment and essentials for your clinic",
    href: "/categories/new-clinic-setup",
    image: "/images/featured-categories/clinic-setup.png",
    layout: "tall",
    number: "05",
  },
];

export function FeaturedCategories() {
  return (
    <section className="relative overflow-hidden bg-[#f4f1ed] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        {/* Section heading */}
        <div className="mb-9 flex flex-col justify-between gap-6 sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#9478a5]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-blue-900">
                Explore our collection
              </span>
            </div>

            <h2 className="font-serif text-[clamp(2.3rem,4vw,3.8rem)] leading-[1.02] tracking-[-0.035em] text-[#252522]">
              Featured
              <span className="ml-3 italic font-normal text-blue-900">categories.</span>
            </h2>

            <p className="mt-4 max-w-lg text-xs leading-7 text-[#77716f] sm:text-sm">
              Discover carefully selected dental products, professional instruments and solutions
              for every stage of your practice.
            </p>
          </div>

          <Link
            href="/categories"
            className="group inline-flex w-fit items-center gap-3 border-b border-[#c9bdc9] pb-3 text-[9px] font-semibold uppercase tracking-[0.17em] text-blue-900 transition-colors hover:border-[#9478a5] hover:text-blue-800"
          >
            Explore all categories
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Asymmetric category grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2 lg:gap-5">
          {featuredCategories.map((category, index) => {
            const isTall = category.layout === "tall";

            return (
              <Link
                key={category.id}
                href={category.href}
                className={`group relative isolate block overflow-hidden rounded-[5px] bg-[#e9e2e9] ${
                  category.id === "digital"
                    ? "lg:col-start-1 lg:row-start-1"
                    : category.id === "restorative"
                      ? "lg:col-start-5 lg:row-start-1"
                      : category.id === "instruments"
                        ? "lg:col-start-1 lg:row-start-2"
                        : category.id === "endodontics"
                          ? "lg:col-start-5 lg:row-start-2"
                          : "lg:col-start-9 lg:row-start-1 lg:row-span-2"
                } ${
                  isTall
                    ? "min-h-[340px] sm:col-span-2 lg:col-span-4 lg:min-h-[560px]"
                    : "min-h-[260px] sm:min-h-[280px] lg:col-span-4 lg:min-h-[270px]"
                }`}
              >
                {/* Category image */}
                <img
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                  className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                />

                {/* Image overlay */}
                <div
                  className={`absolute inset-0 -z-10 transition-opacity duration-500 ${
                    isTall
                      ? "bg-gradient-to-t from-[#241d27]/80 via-[#241d27]/15 to-transparent"
                      : "bg-gradient-to-r from-[#252126]/65 via-[#252126]/15 to-transparent"
                  }`}
                />

                {/* Subtle hover tint */}
                <div className="absolute inset-0 -z-10 bg-[#9478a5]/0 transition-colors duration-500 group-hover:bg-[#9478a5]/10" />

                {/* Card content */}
                <div
                  className={`relative flex h-full min-h-inherit flex-col justify-between p-6 sm:p-7 ${
                    isTall
                      ? "min-h-[340px] sm:min-h-[280px] lg:min-h-[565px]"
                      : "min-h-[260px] sm:min-h-[280px] lg:min-h-[270px]"
                  }`}
                >
                  {/* Number and arrow */}
                  <div className="flex items-center justify-between">

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/45 text-white transition-all duration-300 group-hover:border-[#9478a5] group-hover:bg-[#9478a5]">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  {/* Title and description */}
                  <div className={isTall ? "max-w-[280px]" : "max-w-[310px]"}>

                    <h3
                      className={`font-serif leading-[1.04] tracking-[-0.025em] text-white ${
                        isTall ? "text-4xl sm:text-5xl lg:text-[2.8rem]" : "text-3xl sm:text-4xl"
                      }`}
                    >
                      {category.title}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
