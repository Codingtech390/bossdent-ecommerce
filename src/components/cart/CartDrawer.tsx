"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Tag,
  ArrowRight,
  ShieldCheck,
  Gift,
} from "lucide-react";

export function CartDrawer() {
  const {
    cart,
    cartCount,
    subtotal,
    couponDiscount,
    coinsDiscount,
    shippingFee,
    total,
    earnedCoins,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    applyCoins,
    removeCoins,
  } = useCart();

  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [coinsInput, setCoinsInput] = useState(100);
  const [coinsMsg, setCoinsMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (!isDrawerOpen) return null;

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMsg(null);
    const res = await applyCoupon(couponCode);
    if (res.success) {
      setCouponMsg({ text: res.message || "Coupon applied!", error: false });
      setCouponCode("");
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
      setCoinsMsg({ text: res.error || "Failed to redeem coins", error: true });
    }
  };

  const freeShippingThreshold = user?.membershipTier === "plus" ? 499 : 999;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-dk-teal-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-dk-orange-400" />
              <h2 className="font-semibold text-base">Your Cart ({cartCount})</h2>
            </div>
            <button
              onClick={closeDrawer}
              className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-slate-100 p-3 border-b border-slate-200 text-xs">
            {subtotal >= freeShippingThreshold ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Congratulations! You unlocked FREE Clinical Delivery!
              </div>
            ) : (
              <div>
                <p className="text-slate-700 mb-1.5">
                  Add <span className="font-bold text-dk-orange-600">{formatPrice(freeShippingThreshold - subtotal)}</span> more for FREE Delivery!
                </p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-dk-orange-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-700">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Browse through 20,000+ authentic dental products, composites, handpieces, and surgical instruments.
                </p>
                <button
                  onClick={closeDrawer}
                  className="mt-4 px-4 py-2 bg-dk-teal-800 text-white text-xs font-semibold rounded-lg hover:bg-dk-teal-900"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.sku}
                  className={`flex gap-3 p-3 rounded-lg border text-xs transition-colors ${
                    item.isFreebie
                      ? "bg-amber-50/50 border-amber-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="w-16 h-16 relative rounded-md border border-slate-100 bg-slate-50 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=150&q=80"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {item.isFreebie && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded mb-1">
                        <Gift className="w-2.5 h-2.5" /> FREEBIE PROMO
                      </span>
                    )}
                    <h4 className="font-semibold text-slate-800 line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                    {item.variantTitle && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {item.variantTitle}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold text-slate-900">
                        {formatPrice(item.unitPrice)}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="p-1 hover:bg-slate-50 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="p-1 hover:bg-slate-50 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.sku)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Coupons & Rewards accordion */}
            {cart.items.length > 0 && (
              <div className="pt-2 space-y-2 border-t border-slate-200 text-xs">
                {/* Coupon Code */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-2">
                    <Tag className="w-3.5 h-3.5 text-dk-teal-700" /> Have a Coupon Code?
                  </div>
                  {cart.appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded text-emerald-800 font-medium">
                      <span>
                        Applied: <strong>{cart.appliedCoupon.code}</strong> (-{formatPrice(cart.appliedCoupon.discountAmount)})
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-rose-600 hover:underline font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCouponSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Try: DENTALKART500"
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white uppercase font-mono text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-dk-teal-800 text-white rounded font-medium hover:bg-dk-teal-900"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponMsg && (
                    <p className={`mt-1.5 text-[11px] ${couponMsg.error ? "text-rose-600" : "text-emerald-600"}`}>
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                {/* Dentacoins Redeem */}
                {user && user.dentacoins > 0 && (
                  <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between font-semibold text-amber-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Redeem Dentacoins
                      </span>
                      <span className="text-[11px] font-normal text-amber-700">
                        Balance: <strong>{user.dentacoins} coins</strong>
                      </span>
                    </div>

                    {cart.rewardCoinsRedeemed > 0 ? (
                      <div className="flex items-center justify-between bg-amber-100 p-2 rounded text-amber-900 font-medium">
                        <span>
                          Redeemed: <strong>{cart.rewardCoinsRedeemed} coins</strong> (-{formatPrice(cart.rewardCoinsRedeemed)})
                        </span>
                        <button
                          onClick={removeCoins}
                          className="text-xs text-rose-600 hover:underline font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleCoinsSubmit} className="flex gap-2 mt-2">
                        <input
                          type="number"
                          min={1}
                          max={user.dentacoins}
                          value={coinsInput}
                          onChange={(e) => setCoinsInput(Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-amber-300 rounded bg-white text-xs font-mono"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-amber-600 text-white rounded font-medium hover:bg-amber-700"
                        >
                          Redeem
                        </button>
                      </form>
                    )}
                    {coinsMsg && (
                      <p className={`mt-1.5 text-[11px] ${coinsMsg.error ? "text-rose-600" : "text-emerald-700"}`}>
                        {coinsMsg.text}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.items.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {coinsDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-medium">
                  <span>Dentacoins Redeemed</span>
                  <span>-{formatPrice(coinsDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-dk-teal-900">{formatPrice(total)}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                You will earn <strong className="font-bold">{earnedCoins} Dentacoins</strong> on this order!
              </div>

              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="w-full mt-3 py-3 bg-dk-orange-500 hover:bg-dk-orange-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors text-sm"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
