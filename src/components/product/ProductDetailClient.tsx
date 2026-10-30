"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { usePincode } from "@/context/PincodeContext";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Zap,
  Gift,
  CheckCircle2,
  MapPin,
  Calendar,
  Layers,
  Heart,
  Share2,
} from "lucide-react";

interface Variant {
  _id: string;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  price: number;
  comparePrice?: number;
  stock: number;
  image?: string;
}

interface ProductDetailProps {
  product: any;
  variants: Variant[];
  reviews: any[];
  relatedProducts: any[];
}

export function ProductDetailClient({
  product,
  variants,
  reviews,
  relatedProducts,
}: ProductDetailProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { currentPincode, openPincodeModal } = usePincode();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants.length > 0 ? variants[0] : null
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0] || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80"
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "reviews">("specs");

  // Dynamic price & SKU depending on selected variant
  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const currentComparePrice = selectedVariant
    ? selectedVariant.comparePrice
    : product.baseComparePrice;
  const currentSku = selectedVariant ? selectedVariant.sku : product.defaultSku;
  const currentStock = selectedVariant ? selectedVariant.stock : product.totalStock;
  const isAvailable = currentStock > 0 && product.inStock;

  const discountPercent =
    currentComparePrice && currentComparePrice > currentPrice
      ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
      : 0;

  // Group attributes across all variants
  const attributeGroups = useMemo(() => {
    const groups: Record<string, Set<string>> = {};
    for (const v of variants) {
      if (v.attributes) {
        for (const [key, val] of Object.entries(v.attributes)) {
          if (!groups[key]) groups[key] = new Set();
          groups[key].add(val);
        }
      }
    }
    return Object.entries(groups).map(([k, set]) => ({
      name: k,
      values: Array.from(set),
    }));
  }, [variants]);

  const handleSelectAttribute = (attrName: string, attrVal: string) => {
    const matched = variants.find((v) => v.attributes && v.attributes[attrName] === attrVal);
    if (matched) {
      setSelectedVariant(matched);
      if (matched.image) {
        setSelectedImage(matched.image);
      }
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart({
      productId: product._id,
      variantId: selectedVariant?._id,
      quantity,
    });
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    await addToCart({
      productId: product._id,
      variantId: selectedVariant?._id,
      quantity,
    });
    setIsBuyingNow(false);
    router.push("/checkout");
  };

  return (
    <div className="space-y-12">
      {/* Top Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Left: Gallery & Zoom Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
            <Image
              src={selectedImage}
              alt={product.title}
              fill
              priority
              className="object-contain p-6 transition-all duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 relative rounded-lg border-2 bg-slate-50 overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? "border-dk-teal-700 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details, Variant Selection, Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            {/* Brand & Stock Header */}
            <div className="flex items-center justify-between text-xs">
              <Link
                href={`/brands/${product.brand?.slug || ""}`}
                className="font-bold text-dk-teal-700 hover:underline uppercase tracking-wider"
              >
                {product.brand?.name || "DentalKart Verified Brand"}
              </Link>
              <span className="text-slate-400 font-mono">SKU: {currentSku}</span>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
              {product.title}
            </h1>

            {/* Ratings & Authenticity */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center bg-emerald-700 text-white font-bold px-2 py-0.5 rounded">
                <span>{(product.rating || 4.5).toFixed(1)}</span>
                <Star className="w-3 h-3 fill-white ml-1" />
              </div>
              <span className="text-slate-500 font-medium">
                {product.reviewCount || 34} Ratings &amp; Reviews
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Genuine Certified
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl font-black text-slate-900">
                  {formatPrice(currentPrice)}
                </span>
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(currentComparePrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-700">
                    Save {discountPercent}% ({formatPrice(currentComparePrice! - currentPrice)})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Inclusive of all taxes. GST invoice with Doctor&apos;s registration number available.
              </p>
            </div>

            {/* Dentacoins Bonus Box */}
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Earn <strong>{product.rewardCoins || 50} Dentacoins</strong> (₹{(product.rewardCoins || 50)}) on this purchase!
              </span>
            </div>

            {/* Freebie Eligible Tag */}
            {product.isFreebieEligible && (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                <Gift className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Promotional Gift Included:</strong> {product.freebieTitle || "Free Dental Diagnostic Mirror & Probe Kit"}
                </span>
              </div>
            )}

            {/* Variant Selectors */}
            {attributeGroups.length > 0 && (
              <div className="space-y-3 pt-2">
                {attributeGroups.map((group) => (
                  <div key={group.name} className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      Select {group.name}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((val) => {
                        const isSelected =
                          selectedVariant?.attributes?.[group.name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleSelectAttribute(group.name, val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-dk-teal-800 text-white border-dk-teal-800 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-dk-teal-600"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pincode Delivery Estimator */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-dk-teal-800" /> Delivery Options
                </span>
                <button
                  type="button"
                  onClick={openPincodeModal}
                  className="text-dk-orange-600 font-bold hover:underline"
                >
                  Change PIN
                </button>
              </div>
              <p className="text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Delivering to <strong>{currentPincode.pincode}</strong> ({currentPincode.city})
              </p>
              <p className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Expected Delivery in {currentPincode.deliveryDays} business days • COD Eligible
              </p>
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            {product.isQuotationOnly ? (
              <div className="p-4 bg-dk-teal-50 rounded-xl border border-dk-teal-200">
                <h3 className="font-bold text-sm text-dk-teal-950">Heavy Clinic Equipment</h3>
                <p className="text-xs text-slate-600 mt-1 mb-3">
                  This item requires verified clinic dimensions, installation planning, and customized financing.
                </p>
                <Link
                  href="/clinic-setup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-dk-teal-800 hover:bg-dk-teal-900 text-white font-bold rounded-lg text-xs"
                >
                  Request Official Clinic Quotation
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 px-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2 py-2 text-slate-600 hover:text-black font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 font-bold text-sm text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2 py-2 text-slate-600 hover:text-black font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isAvailable || isAdding}
                  className="flex-1 py-3 px-6 bg-dk-teal-800 hover:bg-dk-teal-900 disabled:opacity-50 text-white font-bold rounded-lg text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
                </button>

                {/* Buy Now */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!isAvailable || isBuyingNow}
                  className="flex-1 py-3 px-6 bg-dk-orange-500 hover:bg-dk-orange-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs md:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{isBuyingNow ? "Processing..." : "Buy Now"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Specifications, Features, Clinical Reviews */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold pb-3">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "specs"
                ? "border-dk-teal-800 text-dk-teal-900"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "features"
                ? "border-dk-teal-800 text-dk-teal-900"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Clinical Features &amp; Package
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "reviews"
                ? "border-dk-teal-800 text-dk-teal-900"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Doctor Reviews ({reviews.length})
          </button>
        </div>

        <div className="pt-6">
          {activeTab === "specs" && (
            <div className="space-y-6">
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                {product.fullDescription || product.shortDescription}
              </p>

              {product.specifications && product.specifications.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-w-2xl">
                  <table className="w-full text-xs">
                    <tbody>
                      {product.specifications.map((spec: any, idx: number) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}
                        >
                          <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3 border-b border-slate-100">
                            {spec.key}
                          </td>
                          <td className="py-2.5 px-4 text-slate-900 border-b border-slate-100">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-4 max-w-2xl text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Key Product Features</h4>
              <ul className="space-y-2 text-slate-700">
                {product.features?.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-dk-teal-700 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {product.packageContents && (
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Package Contents</h4>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {product.packageContents}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4 max-w-2xl text-xs">
              <h4 className="font-bold text-slate-900 text-sm">
                Verified Doctor Reviews ({reviews.length})
              </h4>
              {reviews.length === 0 ? (
                <p className="text-slate-500">No reviews yet for this product batch.</p>
              ) : (
                reviews.map((r: any) => (
                  <div key={r._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-emerald-700 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">
                          {r.rating} <Star className="w-2.5 h-2.5 fill-white ml-0.5" />
                        </div>
                        <span className="font-bold text-slate-900">{r.title}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Dental Purchase
                      </span>
                    </div>
                    <p className="text-slate-700">{r.comment}</p>
                    <div className="text-[11px] text-slate-500 font-medium">
                      By <strong>{r.userName}</strong> {r.userClinic && `• ${r.userClinic}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900">
            Frequently Purchased Together / Related Supplies
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
