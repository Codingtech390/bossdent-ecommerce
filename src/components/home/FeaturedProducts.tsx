import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import "@/models";

import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { FeaturedProductsCarousel } from "./FeaturedProductsCarousel";

export const dynamic = "force-dynamic";

export interface FeaturedProductData {
  _id: string;
  title: string;
  slug: string;
  brand?:
    | {
        name?: string;
        slug?: string;
      }
    | string
    | null;
  basePrice: number;
  baseComparePrice?: number;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  badges?: string[];
  inStock?: boolean;
  totalStock?: number;
  variantAttributeNames?: string[];
  isQuotationOnly?: boolean;
}

export async function FeaturedProducts() {
  await connectToDatabase();

  const products = await Product.find({ active: true })
    .populate("brand", "name slug")
    .sort({ createdAt: -1 })
    .limit(15)
    .lean();

  const serializedProducts = JSON.parse(JSON.stringify(products)) as FeaturedProductData[];

  if (!serializedProducts.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#eee8ed] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        {/* Section heading */}
        <div className="relative mb-8 overflow-hidden rounded-[5px] border border-[#e1d5e1] bg-[#e9e0e9] px-6 py-7 sm:px-9 sm:py-9">
          {/* Decorative details */}
          <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border border-[#9478a5]/15" />
          <div className="pointer-events-none absolute -right-2 -top-16 h-48 w-48 rounded-full border border-[#9478a5]/15" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#9478a5]" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#9478a5]">
                  The Bossdent selection
                </span>
              </div>

              <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] tracking-[-0.035em] text-[#252522]">
                Practice essentials.
                <span className="ml-2 font-normal italic text-[#9478a5]">Thoughtfully chosen.</span>
              </h2>

              <p className="mt-3 max-w-xl text-xs leading-6 text-[#77716f] sm:text-sm">
                Explore products selected for everyday clinical needs, precision and better
                practice.
              </p>
            </div>

            <Link
              href="/products"
              className="group inline-flex w-fit shrink-0 items-center gap-3 border-b border-[#c9bdc9] pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#786b7b] transition-colors hover:border-[#9478a5] hover:text-[#9478a5]"
            >
              View all products
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Product carousel */}
        <FeaturedProductsCarousel products={serializedProducts} />
      </div>
    </section>
  );
}
