"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Coins,
  Package,
  Heart,
  Sparkles,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function AccountProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Please Sign In</h2>
        <p className="text-xs text-slate-500">You need an active session to view your clinic account.</p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 bg-dk-teal-800 text-white font-bold rounded-lg text-xs"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Account Header */}
      <div className="bg-gradient-to-r from-dk-teal-900 to-dk-teal-800 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl border border-white/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{user.name}</h1>
              {user.membershipTier === "plus" && (
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 fill-slate-900" /> PLUS MEMBER
                </span>
              )}
            </div>
            <p className="text-xs text-dk-teal-200 mt-0.5">{user.clinicName || "Dental Practitioner"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 min-w-[120px]">
            <span className="text-xl font-black text-amber-300 block">{user.dentacoins}</span>
            <span className="text-[10px] uppercase font-bold text-slate-300">Dentacoins</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 min-w-[120px]">
            <span className="text-xl font-black text-emerald-300 block">
              {user.addresses?.length || 1}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-300">Saved Addresses</span>
          </div>
        </div>
      </div>

      {/* Account Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/account/orders"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-dk-teal-600 hover:shadow-md transition-all flex items-center gap-3 text-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-dk-teal-50 flex items-center justify-center text-dk-teal-800 flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Orders &amp; Tracking</h3>
            <span className="text-slate-400 text-[11px]">View past orders</span>
          </div>
        </Link>

        <Link
          href="/account/rewards"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-dk-teal-600 hover:shadow-md transition-all flex items-center gap-3 text-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Dentacoins Ledger</h3>
            <span className="text-slate-400 text-[11px]">{user.dentacoins} available</span>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-dk-teal-600 hover:shadow-md transition-all flex items-center gap-3 text-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Saved Wishlist</h3>
            <span className="text-slate-400 text-[11px]">Favorite supplies</span>
          </div>
        </Link>

        <Link
          href="/membership"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-dk-teal-600 hover:shadow-md transition-all flex items-center gap-3 text-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">DentalKart Plus</h3>
            <span className="text-slate-400 text-[11px]">Perks &amp; 2x rewards</span>
          </div>
        </Link>
      </div>

      {/* Practitioner Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-dk-teal-800" /> Practitioner Information
          </h2>

          <div className="space-y-3 text-slate-700">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Doctor Name</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{user.name}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Email Address</span>
              <p className="font-medium text-slate-900 mt-0.5">{user.email}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone Number</span>
              <p className="font-medium text-slate-900 font-mono mt-0.5">{user.phone || "Not set"}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Dental Clinic</span>
              <p className="font-medium text-slate-900 mt-0.5">{user.clinicName || "Private Practice"}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">DCI Registration Number</span>
              <p className="font-mono font-medium text-slate-900 mt-0.5">{user.dciNumber || "DCI-DL-2015-8941 (Verified)"}</p>
            </div>
          </div>
        </div>

        {/* Addresses Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-dk-teal-800" /> Primary Clinic Address
          </h2>

          {user.addresses && user.addresses.length > 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-700">
              <span className="font-bold text-slate-900 block">{user.addresses[0].fullName}</span>
              {user.addresses[0].clinicName && (
                <p className="text-dk-teal-800 font-semibold">{user.addresses[0].clinicName}</p>
              )}
              <p>{user.addresses[0].addressLine1}</p>
              {user.addresses[0].addressLine2 && <p>{user.addresses[0].addressLine2}</p>}
              <p className="font-semibold text-slate-900">
                {user.addresses[0].city}, {user.addresses[0].state} - {user.addresses[0].pincode}
              </p>
              <p className="font-mono text-slate-500 mt-1">Phone: {user.addresses[0].phone}</p>
            </div>
          ) : (
            <p className="text-slate-500">No saved addresses yet. Address will be saved upon checkout.</p>
          )}
        </div>
      </div>
    </div>
  );
}
