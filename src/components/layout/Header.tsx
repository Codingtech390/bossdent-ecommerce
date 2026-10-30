"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { usePincode } from "@/context/PincodeContext";
import { TopTrustBar } from "./TopTrustBar";
import { Navbar } from "./Navbar";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { PincodeModal } from "./PincodeModal";
import { CartDrawer } from "../cart/CartDrawer";
import {
  MapPin,
  User as UserIcon,
  ShoppingBag,
  Heart,
  Sparkles,
  ChevronDown,
  LogOut,
  Package,
  Coins,
  Shield,
  Stethoscope,
} from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const { cartCount, openDrawer } = useCart();
  const { currentPincode, openPincodeModal } = usePincode();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <TopTrustBar />

      {/* Main Header */}
      <div className="bg-dk-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Deliver To */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-inner">
                <span className="text-dk-teal-800 font-black text-xl leading-none">DK</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white flex items-center">
                  Dental<span className="text-dk-orange-400">Kart</span>
                </span>
                <span className="text-[9px] tracking-widest text-slate-300 uppercase font-semibold">
                  India&apos;s Dental Store
                </span>
              </div>
            </Link>

            {/* Pincode Selector */}
            <button
              onClick={openPincodeModal}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dk-teal-900/60 hover:bg-dk-teal-900 border border-dk-teal-700 text-left transition-colors"
            >
              <MapPin className="w-4 h-4 text-dk-orange-400 flex-shrink-0" />
              <div className="text-xs leading-tight">
                <span className="text-[10px] text-slate-300 block">Deliver to</span>
                <span className="font-bold text-white">
                  {currentPincode.pincode} ({currentPincode.city.slice(0, 10)})
                </span>
              </div>
            </button>
          </div>

          {/* Search Autocomplete */}
          <SearchAutocomplete />

          {/* Actions: Plus, Wishlist, Account, Cart */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* DentalKart Plus link */}
            <Link
              href="/membership"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Plus Club</span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="relative p-2 text-slate-200 hover:text-white transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {user?.wishlist && user.wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {user.wishlist.length}
                </span>
              )}
            </Link>

            {/* Account Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-dk-teal-700 hover:bg-dk-teal-600 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-xs leading-none">
                      <span className="text-[10px] text-slate-300 block">Hello,</span>
                      <span className="font-bold max-w-[100px] truncate block">
                        {user.name.split(" ")[0]}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                  </button>

                  {accountMenuOpen && (
                    <div
                      onMouseLeave={() => setAccountMenuOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in text-xs"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        {user.clinicName && (
                          <p className="text-[11px] text-dk-teal-700 font-medium truncate mt-0.5">
                            {user.clinicName}
                          </p>
                        )}
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          href="/account/orders"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 font-medium"
                        >
                          <Package className="w-4 h-4 text-dk-teal-700" /> My Orders &amp; Tracking
                        </Link>
                        <Link
                          href="/account"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 font-medium"
                        >
                          <Stethoscope className="w-4 h-4 text-emerald-600" /> Clinic Profile
                        </Link>
                        <Link
                          href="/account/rewards"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-amber-500" /> Dentacoins
                          </span>
                          <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {user.dentacoins}
                          </span>
                        </Link>

                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-dk-teal-50 text-dk-teal-900 font-bold hover:bg-dk-teal-100"
                          >
                            <Shield className="w-4 h-4 text-dk-teal-700" /> Admin Dashboard
                          </Link>
                        )}

                        <button
                          onClick={async () => {
                            setAccountMenuOpen(false);
                            await logout();
                          }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-dk-teal-700 hover:bg-dk-teal-600 rounded-lg text-white transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={openDrawer}
              className="flex items-center gap-2 px-3.5 py-2 bg-dk-orange-500 hover:bg-dk-orange-600 text-white rounded-lg transition-colors font-bold shadow-md"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-dk-orange-600 rounded-full w-4 h-4 text-[10px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar />

      {/* Pincode Modal */}
      <PincodeModal />

      {/* Cart Drawer */}
      <CartDrawer />
    </header>
  );
}
