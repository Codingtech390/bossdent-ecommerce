"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Heart,
  PackageSearch,
  ShoppingBag,
  Star,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import type { FeaturedProductData } from "./FeaturedProducts";

interface Props {
  products: FeaturedProductData[];
}

export function FeaturedProductsCarousel({ products }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [addingId, setAddingId] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const distance = Math.max(carouselRef.current.clientWidth * 0.8, 280);

    carouselRef.current.scrollBy({
      left: direction === "right" ? distance : -distance,
      behavior: "smooth",
    });
  };

  const handleAddToCart = async (product: FeaturedProductData) => {
    if (product.isQuotationOnly || product.inStock === false) return;

    setAddingId(product._id);

    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        isFreebie: false,
      });
    } finally {
      setAddingId(null);
    }
  };

  const handleWishlist = async (product: FeaturedProductData) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const previousValue = !!wishlisted[product._id];

    setWishlisted((current) => ({
      ...current,
      [product._id]: !previousValue,
    }));

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Wishlist update failed");
      }
    } catch {
      setWishlisted((current) => ({
        ...current,
        [product._id]: previousValue,
      }));
    }
  };

  return (
    <div className="relative">
      {/* Carousel controls */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#92888e]">
          {products.length} products in this selection
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollCarousel("left")}
            aria-label="Scroll products left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8cbd9] bg-[#f4f1ed] text-[#786b7b] transition-all hover:border-[#9478a5] hover:bg-[#9478a5] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollCarousel("right")}
            aria-label="Scroll products right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8cbd9] bg-[#f4f1ed] text-[#786b7b] transition-all hover:border-[#9478a5] hover:bg-[#9478a5] hover:text-white"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable product list */}
      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
      >
        {products.map((product) => {
          const brandName =
            typeof product.brand === "object" && product.brand
              ? product.brand.name || "Bossdent"
              : typeof product.brand === "string"
                ? product.brand
                : "Bossdent";

          const primaryImage = product.images?.[0];

          const comparePrice = product.baseComparePrice || 0;

          const discount =
            product.discountPercent ||
            (comparePrice > product.basePrice && comparePrice > 0
              ? Math.round(((comparePrice - product.basePrice) / comparePrice) * 100)
              : 0);

          const hasVariants = !!product.variantAttributeNames?.length;

          const outOfStock =
            product.inStock === false ||
            (typeof product.totalStock === "number" && product.totalStock <= 0);

          return (
            <article
              key={product._id}
              className="group relative flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-[5px] border border-[#e4dcdf] bg-[#fbf9f7] transition-all duration-300 hover:-translate-y-1 hover:border-[#c9b8cc] hover:shadow-[0_14px_35px_rgba(62,43,65,0.10)] sm:w-[230px] lg:w-[220px] xl:w-[228px]"
            >
              {/* Product image */}
              <div className="relative">
                <Link
                  href={`/products/${product.slug}`}
                  className="relative block aspect-[1/1] overflow-hidden bg-white"
                >
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 220px, 230px"
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#eee8ed] text-[#a995ae]">
                      <PackageSearch className="h-10 w-10" />
                    </div>
                  )}
                </Link>

                {/* Product badges */}
                <div className="absolute left-3 top-3 z-10 flex max-w-[75%] flex-col items-start gap-1">
                  {product.badges?.slice(0, 1).map((badge) => (
                    <span
                      key={badge}
                      className="rounded-[2px] bg-[#9478a5] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-white shadow-sm"
                    >
                      {badge}
                    </span>
                  ))}

                  {discount > 0 && (
                    <span className="rounded-[2px] bg-[#786b7b] px-2 py-1 text-[8px] font-semibold text-white shadow-sm">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => handleWishlist(product)}
                  aria-label={wishlisted[product._id] ? "Remove from wishlist" : "Add to wishlist"}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e0e6] bg-white/90 text-[#8e818e] shadow-sm backdrop-blur transition-all hover:border-[#9478a5] hover:text-[#9478a5]"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      wishlisted[product._id] ? "fill-[#9478a5] text-[#9478a5]" : ""
                    }`}
                  />
                </button>

                {/* Image bottom status */}
                {outOfStock && (
                  <span className="absolute bottom-3 left-3 rounded-[2px] bg-[#252522]/80 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-white">
                    Out of stock
                  </span>
                )}
              </div>

              {/* Product details */}
              <div className="flex flex-1 flex-col p-3.5">
                <div className="mb-2 flex min-h-[14px] items-center justify-between gap-2">
                  <span className="truncate text-[9px] font-semibold uppercase tracking-[0.13em] text-[#9478a5]">
                    {brandName}
                  </span>

                  {typeof product.rating === "number" && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#786b7b]">
                      <Star className="h-3 w-3 fill-[#9478a5] text-[#9478a5]" />
                      {product.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  title={product.title}
                  className="line-clamp-2 min-h-[38px] text-[12px] font-semibold leading-[1.55] text-[#302a2d] transition-colors hover:text-[#9478a5]"
                >
                  {product.title}
                </Link>

                {typeof product.reviewCount === "number" && product.reviewCount > 0 && (
                  <p className="mt-1 text-[10px] text-[#92888e]">{product.reviewCount} reviews</p>
                )}

                {hasVariants && (
                  <p className="mt-2 line-clamp-1 text-[9px] text-[#9478a5]">
                    Options: {product.variantAttributeNames?.join(", ")}
                  </p>
                )}

                {/* Price */}
                <div className="mt-auto pt-3">
                  {product.isQuotationOnly ? (
                    <p className="text-[11px] font-semibold text-[#786b7b]">Price on request</p>
                  ) : (
                    <div className="flex min-h-7 flex-wrap items-baseline gap-2">
                      <span className="text-[16px] font-bold tracking-tight text-[#252522]">
                        {formatPrice(product.basePrice)}
                      </span>

                      {comparePrice > product.basePrice && (
                        <span className="text-[10px] text-[#aaa09c] line-through">
                          {formatPrice(comparePrice)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card actions */}
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {product.isQuotationOnly ? (
                    <Link
                      href={`/products/${product.slug}#quote`}
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[3px] bg-[#9478a5] px-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#786b7b]"
                    >
                      Request a quote
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : hasVariants ? (
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[3px] border border-[#c9bdc9] bg-[#eee8ed] px-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#786b7b] transition-colors hover:border-[#9478a5] hover:bg-[#9478a5] hover:text-white"
                    >
                      Select options
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={!!addingId || outOfStock}
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[3px] bg-[#9478a5] px-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#786b7b] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {addingId === product._id
                        ? "Adding..."
                        : outOfStock
                          ? "Unavailable"
                          : "Add to cart"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Mobile scroll hint */}
      <p className="mt-2 text-center text-[9px] uppercase tracking-[0.16em] text-[#aaa09c] sm:hidden">
        Swipe to explore more products
      </p>
    </div>
  );
}
