"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { usePincode } from "@/context/PincodeContext";
import { formatPrice } from "@/lib/utils";

interface Variant {
  _id: string;
  sku?: string;
  title?: string;
  attributes?: Record<string, string>;
  price?: number;
  comparePrice?: number;
  stock?: number;
  image?: string;
}

interface ProductDetailProps {
  product: any;
  variants: Variant[];
  reviews: any[];
  relatedProducts: any[];
}

function getImageUrl(image: any): string | null {
  if (!image) return null;

  if (typeof image === "string") return image;

  if (typeof image === "object") {
    return image.url || image.secure_url || image.src || null;
  }

  return null;
}

function getProductImages(product: any): string[] {
  const images = Array.isArray(product?.images)
    ? product.images
        .map((image: any) => getImageUrl(image))
        .filter(Boolean)
    : [];

  const extraImages = [
    getImageUrl(product?.listingImage),
    getImageUrl(product?.image),
    getImageUrl(product?.thumbnail),
  ].filter(Boolean);

  return Array.from(new Set([...images, ...extraImages])) as string[];
}

function getProductName(product: any): string {
  return product?.title || product?.name || "Product";
}

function getProductPrice(product: any): number {
  return Number(
    product?.basePrice ?? product?.price ?? product?.sellingPrice ?? 0
  );
}

export function ProductDetailClient({
  product,
  variants,
  reviews,
  relatedProducts,
}: ProductDetailProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { currentPincode, openPincodeModal } = usePincode();

  const images = useMemo(() => getProductImages(product), [product]);

  const [selectedImage, setSelectedImage] = useState<string>(
    images[0] || ""
  );

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants.length > 0 ? variants[0] : null
  );

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "features" | "reviews"
  >("description");

  const [mobileImageIndex, setMobileImageIndex] = useState(0);

  const attributeGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};

    variants.forEach((variant) => {
      Object.entries(variant.attributes || {}).forEach(([key, value]) => {
        if (!groups[key]) groups[key] = [];

        if (!groups[key].includes(value)) {
          groups[key].push(value);
        }
      });
    });

    return Object.entries(groups).map(([name, values]) => ({
      name,
      values,
    }));
  }, [variants]);

  const currentPrice = Number(
    selectedVariant?.price ?? getProductPrice(product)
  );

  const currentComparePrice = Number(
    selectedVariant?.comparePrice ??
      product?.baseComparePrice ??
      product?.comparePrice ??
      0
  );

  const currentSku =
    selectedVariant?.sku || product?.defaultSku || product?.sku || "";

  const currentStock =
    selectedVariant?.stock ?? product?.totalStock ?? product?.stock;

  const isAvailable =
    product?.inStock !== false &&
    (currentStock === undefined ||
      currentStock === null ||
      Number(currentStock) > 0);

  const discountPercent =
    currentComparePrice > currentPrice && currentComparePrice > 0
      ? Math.round(
          ((currentComparePrice - currentPrice) / currentComparePrice) * 100
        )
      : 0;

  const productDescription =
    product?.fullDescription ||
    product?.description ||
    product?.shortDescription ||
    "";

  const brandName =
    typeof product?.brand === "object"
      ? product.brand?.name
      : "";

  const brandSlug =
    typeof product?.brand === "object"
      ? product.brand?.slug
      : "";

  const selectVariant = (variant: Variant) => {
    setSelectedVariant(variant);

    const variantImage = getImageUrl(variant.image);

    if (variantImage) {
      setSelectedImage(variantImage);
    }
  };

  const handleSelectAttribute = (attributeName: string, value: string) => {
    const matchedVariant = variants.find(
      (variant) => variant.attributes?.[attributeName] === value
    );

    if (matchedVariant) {
      selectVariant(matchedVariant);
    }
  };

  const handleAddToCart = async () => {
    if (!isAvailable || isAdding) return;

    try {
      setIsAdding(true);

      await addToCart({
        productId: product._id,
        variantId: selectedVariant?._id,
        quantity,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAvailable || isBuyingNow) return;

    try {
      setIsBuyingNow(true);

      await addToCart({
        productId: product._id,
        variantId: selectedVariant?._id,
        quantity,
      });

      router.push("/checkout");
    } finally {
      setIsBuyingNow(false);
    }
  };

  const changeImage = (direction: number) => {
    if (!images.length) return;

    const nextIndex =
      (mobileImageIndex + direction + images.length) % images.length;

    setMobileImageIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  };

  const relatedImage = (item: any) => {
    const itemImages = getProductImages(item);
    return itemImages[0] || null;
  };

  return (
    <div className="space-y-16">
      {/* Main product layout */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Product gallery */}
        <div className="min-w-0">
          <div className="group relative aspect-[4/4.7] overflow-hidden bg-[#eee8ed]">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.title || "Product image"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-5 transition-transform duration-700 group-hover:scale-[1.025] sm:p-8"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-[#9478a5]">
                <ShoppingBag className="h-10 w-10 stroke-[1]" />
                <span className="text-[10px] uppercase tracking-[0.2em]">
                  Product image unavailable
                </span>
              </div>
            )}

            {discountPercent > 0 && (
              <span className="absolute left-5 top-5 bg-[#9478a5] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                Save {discountPercent}%
              </span>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => changeImage(-1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#786b7b] opacity-100 shadow-sm transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => changeImage(1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#786b7b] opacity-100 shadow-sm transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Image thumbnails */}
          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedImage(image);
                    setMobileImageIndex(index);
                  }}
                  aria-label={`View product image ${index + 1}`}
                  className={`relative h-[76px] w-[76px] shrink-0 overflow-hidden border bg-[#eee8ed] transition ${
                    selectedImage === image
                      ? "border-[#9478a5]"
                      : "border-[#e3dce2] hover:border-[#b8a5bd]"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title || "Product"} image ${index + 1}`}
                    fill
                    sizes="76px"
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="flex min-w-0 flex-col lg:pt-3">
          {/* Brand and SKU */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded6d9] pb-4">
            {brandName && brandSlug ? (
              <Link
                href={`/brands/${brandSlug}`}
                className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9478a5] transition-colors hover:text-[#786b7b]"
              >
                {brandName}
              </Link>
            ) : (
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9478a5]">
                Bossdent
              </span>
            )}

            {currentSku && (
              <span className="text-[9px] tracking-[0.12em] text-[#92888e]">
                SKU: {currentSku}
              </span>
            )}
          </div>

          {/* Title and price */}
          <div className="pt-6">
            <h1 className="font-serif text-[clamp(2.3rem,4vw,3.8rem)] leading-[1.02] tracking-[-0.035em] text-[#252522]">
              {product.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="text-2xl font-medium tracking-tight text-[#786b7b] sm:text-3xl">
                {formatPrice(currentPrice)}
              </span>

              {currentComparePrice > currentPrice && (
                <span className="text-sm text-[#aaa09c] line-through">
                  {formatPrice(currentComparePrice)}
                </span>
              )}

              {discountPercent > 0 && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9478a5]">
                  {discountPercent}% off
                </span>
              )}
            </div>

            {productDescription && (
              <p className="mt-5 max-w-xl text-[12px] leading-7 text-[#77716f] sm:text-[13px]">
                {product.shortDescription || productDescription}
              </p>
            )}
          </div>

          {/* Variant selectors */}
          {attributeGroups.length > 0 && (
            <div className="mt-8 space-y-6">
              {attributeGroups.map((group) => (
                <div key={group.name}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#92888e]">
                      Select {group.name}
                    </span>

                    {selectedVariant?.attributes?.[group.name] && (
                      <span className="text-[10px] text-[#786b7b]">
                        {selectedVariant.attributes[group.name]}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value) => {
                      const isSelected =
                        selectedVariant?.attributes?.[group.name] === value;

                      const matchingVariant = variants.find(
                        (variant) =>
                          variant.attributes?.[group.name] === value
                      );

                      const isOutOfStock =
                        matchingVariant?.stock !== undefined &&
                        matchingVariant.stock <= 0;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            handleSelectAttribute(group.name, value)
                          }
                          disabled={isOutOfStock}
                          className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-[10px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
                            isSelected
                              ? "border-[#786b7b] bg-[#786b7b] text-white"
                              : "border-[#d5cbd3] bg-transparent text-[#786b7b] hover:border-[#9478a5] hover:bg-[#eee8ed]"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Availability */}
          <div className="mt-7 flex items-center gap-2 border-y border-[#ded6d9] py-4">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isAvailable ? "bg-[#78936e]" : "bg-[#b46f79]"
              }`}
            />

            <span className="text-[10px] uppercase tracking-[0.12em] text-[#77716f]">
              {isAvailable ? "Available" : "Currently unavailable"}
            </span>
          </div>

          {/* Quantity and actions */}
          {product.isQuotationOnly ? (
            <div className="mt-7 border border-[#d9ced9] bg-[#eee8ed] p-5">
              <p className="font-serif text-2xl text-[#252522]">
                Request a quotation
              </p>

              <p className="mt-2 text-[11px] leading-6 text-[#77716f]">
                Contact our team for product details and a personalised
                quotation.
              </p>

              <Link
                href="/clinic-setup"
                className="mt-5 inline-flex items-center gap-3 bg-[#9478a5] px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#786b7b]"
              >
                Request quotation
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#92888e]">
                  Quantity
                </label>

                <span className="text-[9px] uppercase tracking-[0.12em] text-[#aaa09c]">
                  {currentStock !== undefined && currentStock !== null
                    ? `${currentStock} available`
                    : ""}
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex h-12 w-full items-center justify-between border border-[#cfc4ce] sm:w-[132px]">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-full w-10 items-center justify-center text-[#786b7b] transition hover:bg-[#eee8ed] disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span className="text-xs font-medium text-[#252522]">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        currentStock
                          ? Math.min(Number(currentStock), value + 1)
                          : value + 1
                      )
                    }
                    disabled={
                      currentStock !== undefined &&
                      currentStock !== null &&
                      quantity >= Number(currentStock)
                    }
                    aria-label="Increase quantity"
                    className="flex h-full w-10 items-center justify-center text-[#786b7b] transition hover:bg-[#eee8ed] disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isAvailable || isAdding}
                  className="flex h-12 flex-1 items-center justify-center gap-3 bg-[#9478a5] px-6 text-[9px] font-semibold uppercase tracking-[0.17em] text-white transition-all duration-300 hover:bg-[#786b7b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isAdding ? "Adding..." : "Add to cart"}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!isAvailable || isBuyingNow}
                  className="flex h-12 items-center justify-center gap-2 border border-[#9478a5] px-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#786b7b] transition-all duration-300 hover:bg-[#eee8ed] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isBuyingNow ? "Processing..." : "Buy now"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Delivery information */}
          <div className="mt-7 border border-[#ded6d9] bg-[#eee8ed]/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#9478a5]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#786b7b]">
                  Delivery information
                </span>
              </div>

              <button
                type="button"
                onClick={openPincodeModal}
                className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9478a5] underline underline-offset-4 transition hover:text-[#786b7b]"
              >
                {currentPincode?.pincode ? "Change PIN" : "Check PIN"}
              </button>
            </div>

            {currentPincode?.pincode ? (
              <p className="mt-3 flex items-center gap-2 text-[11px] text-[#77716f]">
                <MapPin className="h-3.5 w-3.5 text-[#9478a5]" />
                Delivering to{" "}
                <strong className="font-semibold text-[#252522]">
                  {currentPincode.pincode}
                </strong>
                {currentPincode.city ? `, ${currentPincode.city}` : ""}
              </p>
            ) : (
              <p className="mt-3 text-[11px] leading-5 text-[#77716f]">
                Enter your PIN code to check delivery availability.
              </p>
            )}
          </div>

          {/* Selected variant summary */}
          {selectedVariant && (
            <div className="mt-6 flex items-center gap-3 border border-[#d5cbd3] p-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-[#eee8ed]">
                {getImageUrl(selectedVariant.image) ? (
                  <Image
                    src={getImageUrl(selectedVariant.image)!}
                    alt={selectedVariant.title || "Selected variant"}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                ) : selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.title || "Product"}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium text-[#786b7b]">
                  {selectedVariant.title || product.title}
                </p>

                {selectedVariant.price !== undefined && (
                  <p className="mt-1 text-[10px] text-[#92888e]">
                    {formatPrice(selectedVariant.price)}
                  </p>
                )}
              </div>

              <div className="hidden min-w-0 max-w-[150px] sm:block">
                <span className="block truncate text-[9px] text-[#92888e]">
                  {Object.entries(selectedVariant.attributes || {})
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" · ") || "Selected option"}
                </span>
              </div>

              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#9478a5] text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Product information tabs */}
      <section className="border-t border-[#ded6d9] pt-10">
        <div className="flex flex-wrap gap-x-7 gap-y-3 border-b border-[#ded6d9]">
          {[
            { id: "description", label: "Description" },
            { id: "specifications", label: "Specifications" },
            { id: "features", label: "Features" },
            { id: "reviews", label: `Reviews (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative pb-4 text-[9px] font-semibold uppercase tracking-[0.15em] transition-colors ${
                activeTab === tab.id
                  ? "text-[#786b7b]"
                  : "text-[#aaa09c] hover:text-[#786b7b]"
              }`}
            >
              {tab.label}

              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#9478a5]" />
              )}
            </button>
          ))}
        </div>

        <div className="max-w-4xl py-8">
          {activeTab === "description" && (
            <div>
              <h2 className="font-serif text-2xl text-[#252522]">
                About this product
              </h2>

              <p className="mt-4 whitespace-pre-line text-[12px] leading-7 text-[#77716f]">
                {productDescription || "Product description is not available."}
              </p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div>
              <h2 className="font-serif text-2xl text-[#252522]">
                Technical specifications
              </h2>

              {Array.isArray(product.specifications) &&
              product.specifications.length > 0 ? (
                <div className="mt-5 divide-y divide-[#e5dedf] border-y border-[#e5dedf]">
                  {product.specifications.map((spec: any, index: number) => (
                    <div
                      key={spec._id || index}
                      className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[1fr_2fr] sm:gap-6"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#786b7b]">
                        {spec.key}
                      </span>

                      <span className="text-[11px] leading-6 text-[#77716f]">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-[12px] text-[#92888e]">
                  No specifications have been added for this product.
                </p>
              )}
            </div>
          )}

          {activeTab === "features" && (
            <div>
              <h2 className="font-serif text-2xl text-[#252522]">
                Product features
              </h2>

              {Array.isArray(product.features) &&
              product.features.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {product.features.map((feature: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-[12px] leading-6 text-[#77716f]"
                    >
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[#9478a5]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[12px] text-[#92888e]">
                  No additional features have been added for this product.
                </p>
              )}

              {product.packageContents && (
                <div className="mt-8 border-t border-[#ded6d9] pt-6">
                  <h3 className="font-serif text-xl text-[#252522]">
                    Package contents
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-[12px] leading-7 text-[#77716f]">
                    {product.packageContents}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h2 className="font-serif text-2xl text-[#252522]">
                Customer reviews
              </h2>

              {reviews.length === 0 ? (
                <p className="mt-4 text-[12px] text-[#92888e]">
                  No approved reviews are available for this product yet.
                </p>
              ) : (
                <div className="mt-5 divide-y divide-[#e5dedf]">
                  {reviews.map((review: any) => (
                    <article
                      key={review._id}
                      className="py-5 first:pt-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-[12px] font-semibold text-[#786b7b]">
                          {review.title || "Customer review"}
                        </h3>

                        {review.rating !== undefined && (
                          <span className="text-[10px] font-medium text-[#9478a5]">
                            {review.rating} / 5
                          </span>
                        )}
                      </div>

                      {review.comment && (
                        <p className="mt-3 text-[12px] leading-7 text-[#77716f]">
                          {review.comment}
                        </p>
                      )}

                      {(review.userName || review.userClinic) && (
                        <p className="mt-3 text-[10px] text-[#92888e]">
                          {review.userName}
                          {review.userClinic ? ` · ${review.userClinic}` : ""}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#ded6d9] pt-10">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9478a5]">
                Explore more
              </p>

              <h2 className="mt-2 font-serif text-3xl text-[#252522]">
                Related products
              </h2>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#786b7b] transition-colors hover:text-[#9478a5]"
            >
              View all products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((item: any) => {
              const image = relatedImage(item);
              const name = getProductName(item);
              const price = getProductPrice(item);

              return (
                <Link
                  key={item._id}
                  href={`/products/${item.slug}`}
                  className="group min-w-0"
                >
                  <div className="relative aspect-[4/4.5] overflow-hidden bg-[#eee8ed]">
                    {image ? (
                      <Image
                        src={image}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#9478a5]">
                        <ShoppingBag className="h-8 w-8 stroke-[1]" />
                      </div>
                    )}

                    <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#786b7b] shadow-sm transition-colors group-hover:bg-[#9478a5] group-hover:text-white">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="pt-3">
                    <h3 className="line-clamp-2 text-[11px] font-medium leading-5 text-[#252522] transition-colors group-hover:text-[#9478a5]">
                      {name}
                    </h3>

                    {price > 0 && (
                      <p className="mt-2 text-[11px] text-[#786b7b]">
                        {formatPrice(price)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
