"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { usePincode } from "@/context/PincodeContext";
import { formatPrice } from "@/lib/utils";
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Truck,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, couponDiscount, coinsDiscount, shippingFee, total, earnedCoins, refreshCart } =
    useCart();
  const { user } = useAuth();
  const { currentPincode } = usePincode();

  const [paymentMethod, setPaymentMethod] = useState<"demo" | "cod">("demo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address fields
  const [fullName, setFullName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState(currentPincode.city);
  const [state, setState] = useState(currentPincode.state);
  const [pincode, setPincode] = useState(currentPincode.pincode);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setClinicName(user.clinicName || "");

      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setAddressLine1(defaultAddr.addressLine1);
        setAddressLine2(defaultAddr.addressLine2 || "");
        setCity(defaultAddr.city);
        setState(defaultAddr.state);
        setPincode(defaultAddr.pincode);
      }
    }
  }, [user]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !phone || !addressLine1 || !city || !pincode) {
      setError("Please fill in all required shipping address fields.");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setError("Please provide a valid 6-digit Indian PIN code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName,
            clinicName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
          },
          guestInfo: !user ? { name: fullName, email, phone } : undefined,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order placement failed.");
        setIsSubmitting(false);
        return;
      }

      await refreshCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch {
      setError("Network error while placing order.");
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-xs text-slate-500">There are no items to check out.</p>
        <Link
          href="/categories"
          className="inline-block px-5 py-2.5 bg-dk-teal-800 text-white rounded-lg text-xs font-semibold"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Encrypted Secure Checkout
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
            Clinic Order &amp; Delivery Checkout
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Cart</span>
          <span>→</span>
          <span className="text-dk-teal-900 font-bold">Delivery &amp; Payment</span>
          <span>→</span>
          <span>Confirmation</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shipping Address & Payment Selection */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shipping Address Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-dk-teal-800" /> Clinic Delivery Address
              </h2>
              {user && (
                <span className="text-[11px] text-slate-500">
                  Signed in as <strong>{user.email}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Doctor / Contact Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Dental Clinic / Hospital Name (Optional)
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g. Sharma Multispeciality Dental"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mobile Number (For Courier OTP &amp; Updates) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9811223344"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Address (For Tax Invoice) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@clinic.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Clinic Street Address / Shop / Room / Floor *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Flat/Room, Building, Hospital Wing or Commercial Complex"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Area / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Near Metro Station, Hospital gate, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  6-Digit PIN Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm text-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-dk-teal-800" /> Select Payment Method
            </h2>

            <div className="space-y-3">
              {/* Online Gateway Option (Demo Sandbox) */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "demo"
                    ? "bg-dk-teal-50 border-dk-teal-700 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "demo"}
                  onChange={() => setPaymentMethod("demo")}
                  className="mt-0.5 text-dk-teal-700 focus:ring-dk-teal-700"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      Online Payment (UPI / Credit &amp; Debit Cards / NetBanking)
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Instant Confirmation
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Supports Google Pay, PhonePe, Paytm, Visa, Mastercard, RuPay, and ICICI/HDFC Corporate NetBanking.
                  </p>
                  <p className="text-[11px] text-dk-teal-700 font-medium">
                    (Sandbox Demo Mode active: test payment simulates instant verification)
                  </p>
                </div>
              </label>

              {/* Cash On Delivery Option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "bg-dk-teal-50 border-dk-teal-700 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-0.5 text-dk-teal-700 focus:ring-dk-teal-700"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      Cash on Delivery (Pay at Clinic)
                    </span>
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-slate-500">
                    Pay in cash or clinic UPI QR code upon doorstep inspection by the courier delivery agent.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Review & Final Placement */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Order Review ({cart.items.length} Items)
            </h3>

            {/* Items mini list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.sku} className="flex gap-3 items-center">
                  <div className="w-12 h-12 relative rounded-md border border-slate-100 bg-slate-50 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=100&q=80"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 truncate">{item.title}</h4>
                    <span className="text-[11px] text-slate-400">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs flex-shrink-0">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-slate-600">
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
                <span>Express Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-black text-slate-900">
                <span>Total Payable</span>
                <span className="text-dk-teal-900">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>You earn <strong>{earnedCoins} Dentacoins</strong> upon delivery!</span>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-dk-orange-500 hover:bg-dk-orange-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                </>
              ) : (
                `Place Order • ${formatPrice(total)}`
              )}
            </button>

            <div className="text-[10px] text-slate-400 text-center space-y-1">
              <p>By placing this order, you agree to Bossdent Terms of Service.</p>
              <p className="text-emerald-700 font-semibold flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Genuine Certified Batch Guarantee
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}