"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import {
  Star,
  Heart,
  ShoppingBag,
  Sparkles,
  Gift,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export interface ProductCardData {
  _id: string;
  title: string;
  slug: string;
  brand?: { name: string; slug: string } | string;
  basePrice: number;
  baseComparePrice?: number;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  images: string[];
  badges?: string[];
  inStock?: boolean;
  totalStock?: number;
  rewardCoins?: number;
  isFreebieEligible?: boolean;
  freebieTitle?: string;
  variantAttributeNames?: string[];
  defaultSku?: string;
  isQuotationOnly?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const brandName = typeof product.brand === "object" && product.brand ? product.brand.name : "Bossdent";
  const brandSlug = typeof product.brand === "object" && product.brand ? product.brand.slug : "";

  const discount = product.discountPercent || (product.baseComparePrice && product.baseComparePrice > product.basePrice
    ? Math.round(((product.baseComparePrice - product.basePrice) / product.baseComparePrice) * 100)
    : 0);

  const primaryImage = product.images?.[0] || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80";
  const secondaryImage = product.images?.[1] || primaryImage;

  const hasVariants = product.variantAttributeNames && product.variantAttributeNames.length > 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.isQuotationOnly) return;

    setIsAdding(true);
    await addToCart({
      productId: product._id,
      quantity: 1,
      isFreebie: false,
    });
    setIsAdding(false);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setIsWishlisted(!isWishlisted);
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
    } catch {
      setIsWishlisted(isWishlisted);
    }
  };

  return (
    <div
      className={`bossdent-product-card group relative flex h-full flex-col overflow-hidden ${className}`}
    >
      {/* Badges Bar */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start max-w-[80%]">
        {product.badges && product.badges.length > 0 && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide ${
              product.badges[0].toLowerCase().includes("seller")
                ? "bg-amber-500 text-white"
                : product.badges[0].toLowerCase().includes("freebie") || product.badges[0].includes("₹1")
                ? "bg-emerald-600 text-white"
                : "bg-dk-teal-800 text-white"
            }`}
          >
            {product.badges[0]}
          </span>
        )}
        {discount > 0 && (
          <span className="text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        aria-label="Save to Wishlist"
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 shadow-sm flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? "fill-rose-500 text-rose-500" : ""
          }`}
        />
      </button>

      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="bossdent-product-image relative block w-full pt-[90%] overflow-hidden"
      >
        <Image
          src={primaryImage}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Details Container */}
      <div className="p-3.5 flex-1 flex flex-col justify-between text-xs">
        <div>
          {/* Brand & Stock Status */}
          <div className="flex items-center justify-between mb-1 text-[11px]">
            {brandSlug ? (
              <Link
                href={`/brands/${brandSlug}`}
                className="font-bold text-dk-teal-700 hover:text-dk-teal-900 uppercase tracking-wider"
              >
                {brandName}
              </Link>
            ) : (
              <span className="font-bold text-dk-teal-700 uppercase tracking-wider">
                {brandName}
              </span>
            )}

            {product.inStock ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-0.5 text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock
              </span>
            ) : (
              <span className="text-rose-600 font-semibold text-[10px]">Out of Stock</span>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/products/${product.slug}`}
            className="font-semibold text-slate-900 hover:text-dk-teal-800 line-clamp-2 leading-snug mb-1.5"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              <span>{(product.rating || 4.5).toFixed(1)}</span>
              <Star className="w-2.5 h-2.5 fill-white ml-0.5" />
            </div>
            <span className="text-[11px] text-slate-500">
              ({product.reviewCount || 24})
            </span>
          </div>

          {/* Variant Notice if multiple options exist */}
          {hasVariants && (
            <div className="text-[11px] text-dk-teal-800 bg-dk-teal-50 px-2 py-0.5 rounded border border-dk-teal-100 mb-2 inline-block">
              Multiple {product.variantAttributeNames?.join(" & ")} Options
            </div>
          )}

          {/* Freebie or Offer Notice */}
          {product.isFreebieEligible && (
            <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 mb-2 flex items-center gap-1">
              <Gift className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span className="truncate">{product.freebieTitle || "Freebie Eligible"}</span>
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-slate-100 mt-2">
          {product.isQuotationOnly ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-dk-teal-900 block">Clinic Equipment</span>
                <span className="text-[10px] text-slate-500">Official Quote Available</span>
              </div>
              <Link
                href={`/products/${product.slug}#quote`}
                className="px-3 py-1.5 bg-dk-teal-800 hover:bg-dk-teal-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                Get Quote <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-base font-extrabold text-slate-900">
                  {formatPrice(product.basePrice)}
                </span>
                {product.baseComparePrice && product.baseComparePrice > product.basePrice && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatPrice(product.baseComparePrice)}
                  </span>
                )}
              </div>

              {/* Reward Coins */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-700 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Earn {product.rewardCoins || 20} Coins
                </span>

                {hasVariants ? (
                  <Link
                    href={`/products/${product.slug}`}
                    className="px-3 py-1.5 bg-dk-teal-50 hover:bg-dk-teal-100 text-dk-teal-900 border border-dk-teal-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    Select Options <ChevronRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <button
                    onClick={handleQuickAdd}
                    disabled={isAdding || !product.inStock}
                    className="px-3.5 py-1.5 bg-dk-orange-500 hover:bg-dk-orange-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isAdding ? "Adding..." : "Add"}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}