"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Tag,
  ArrowRight,
  ShieldCheck,
  Gift,
  ChevronRight,
  Truck,
} from "lucide-react";

export default function CartPage() {
  const {
    cart,
    cartCount,
    subtotal,
    couponDiscount,
    coinsDiscount,
    shippingFee,
    total,
    earnedCoins,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    applyCoins,
    removeCoins,
  } = useCart();

  const { user } = useAuth();
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [coinsInput, setCoinsInput] = useState(100);
  const [coinsMsg, setCoinsMsg] = useState<{ text: string; error: boolean } | null>(null);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponMsg(null);
    const res = await applyCoupon(couponInput);
    if (res.success) {
      setCouponMsg({ text: res.message || "Coupon applied!", error: false });
      setCouponInput("");
    } else {
      setCouponMsg({ text: res.error || "Failed to apply coupon", error: true });
    }
  };

  const handleCoinsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoinsMsg(null);
    const res = await applyCoins(coinsInput);
    if (res.success) {
      setCoinsMsg({ text: res.message || "Dentacoins applied!", error: false });
    } else {
      setCoinsMsg({ text: res.error || "Failed to apply coins", error: true });
    }
  };

  const freeShippingThreshold = user?.membershipTier === "plus" ? 499 : 999;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Your Shopping Cart is Empty</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Looks like you haven&apos;t added any dental instruments, composites, or equipment to your order yet.
        </p>
        <div className="pt-2">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-dk-teal-800 text-white font-bold rounded-xl text-xs hover:bg-dk-teal-900 transition-colors"
          >
            Start Shopping Dental Supplies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Shopping Cart</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
        <ShoppingBag className="w-7 h-7 text-dk-teal-800" />
        My Cart ({cartCount} {cartCount === 1 ? "Item" : "Items"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Progress Alert */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-sm">
            {subtotal >= freeShippingThreshold ? (
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <Truck className="w-4 h-4 text-emerald-600" />
                You have qualified for FREE Express Delivery!
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Add {formatPrice(freeShippingThreshold - subtotal)} more for FREE Delivery</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-dk-orange-500 h-full rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {cart.items.map((item) => (
              <div key={item.sku} className="p-4 sm:p-5 flex gap-4 text-xs items-center">
                <div className="w-20 h-20 relative rounded-lg border border-slate-100 bg-slate-50 overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=200&q=80"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {item.isFreebie && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded mb-1">
                      <Gift className="w-3 h-3" /> PROMOTIONAL GIFT AT ₹1
                    </span>
                  )}
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                  {item.variantTitle && (
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Option: {item.variantTitle}
                    </span>
                  )}
                  <span className="text-slate-400 font-mono text-[10px] block mt-0.5">
                    SKU: {item.sku}
                  </span>

                  <div className="flex items-center gap-4 mt-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-md bg-white">
                      <button
                        onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                        className="p-1.5 hover:bg-slate-50 text-slate-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                        className="p-1.5 hover:bg-slate-50 text-slate-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.sku)}
                      className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-base font-black text-slate-900">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatPrice(item.unitPrice)} each
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs space-y-3 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-dk-teal-800" /> Apply Promo Code
            </h3>

            {cart.appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-800 font-medium">
                <div>
                  <strong>{cart.appliedCoupon.code}</strong> Applied
                  <p className="text-[10px] text-emerald-600">Saved {formatPrice(cart.appliedCoupon.discountAmount)}</p>
                </div>
                <button onClick={removeCoupon} className="text-rose-600 font-bold hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. DENTALKART500"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-dk-teal-800 hover:bg-dk-teal-900 text-white font-bold rounded-lg"
                >
                  Apply
                </button>
              </form>
            )}

            {couponMsg && (
              <p className={`text-[11px] ${couponMsg.error ? "text-rose-600" : "text-emerald-700"}`}>
                {couponMsg.text}
              </p>
            )}
          </div>

          {/* Dentacoins Redeem */}
          {user && user.dentacoins > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs space-y-3 shadow-sm">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Redeem Dentacoins
                </span>
                <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {user.dentacoins} Coins
                </span>
              </div>

              {cart.rewardCoinsRedeemed > 0 ? (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-900">
                  <span>Redeemed <strong>{cart.rewardCoinsRedeemed} coins</strong> (-{formatPrice(cart.rewardCoinsRedeemed)})</span>
                  <button onClick={removeCoins} className="text-rose-600 font-bold hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCoinsSubmit} className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={user.dentacoins}
                    value={coinsInput}
                    onChange={(e) => setCoinsInput(Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                  >
                    Redeem Coins
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Order Summary Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs space-y-3 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Order Summary</h3>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {coinsDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-semibold">
                  <span>Dentacoins Redeemed</span>
                  <span>-{formatPrice(coinsDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-dk-teal-900">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>You will earn <strong>{earnedCoins} Dentacoins</strong> upon order completion!</span>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 bg-dk-orange-500 hover:bg-dk-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-colors"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
