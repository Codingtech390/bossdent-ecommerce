"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import {
  Sparkles,
  CheckCircle2,
  Truck,
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export default function MembershipPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAlreadyPlus = user?.membershipTier === "plus";

  const handleJoinPlus = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsJoining(true);
    try {
      const res = await fetch("/api/membership/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setSuccess(true);
        await refreshUser();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="space-y-4 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-white text-slate-900 shadow-sm uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> OFFICIAL DENTAL PRIVILEGE CLUB
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            DentalKart Plus Membership
          </h1>
          <p className="text-sm md:text-base text-amber-100 leading-relaxed">
            Maximize clinic efficiency and savings with 2x rewards on every purchase, lower free-shipping thresholds, and VIP warehouse dispatch.
          </p>

          <div className="pt-2">
            {isAlreadyPlus ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-900 font-bold rounded-xl text-sm shadow-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> You are an Active DentalKart Plus Member
              </div>
            ) : (
              <button
                onClick={handleJoinPlus}
                disabled={isJoining}
                className="px-8 py-4 bg-slate-900 hover:bg-black text-white font-extrabold rounded-xl text-sm md:text-base shadow-xl transition-colors flex items-center gap-2 mx-auto md:mx-0"
              >
                {isJoining ? "Activating Membership..." : "Join DentalKart Plus for ₹999 / Year"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="w-48 h-48 rounded-full bg-white/10 border-4 border-white/20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md shadow-inner flex-shrink-0">
          <span className="text-3xl font-black">2X</span>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-200">Dentacoins</span>
          <span className="text-[10px] text-amber-100 mt-1">On All 20,000+ Items</span>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
          🎉 Congratulations! Your DentalKart Plus membership is now active for 1 year!
        </div>
      )}

      {/* 4 Core Plus Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">2x Dentacoins Rate</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Earn double Dentacoins across all restorative, surgical, and rotary products. Every coin is ₹1 at checkout.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">₹499 Free Delivery Threshold</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Non-members require ₹999 for free shipping. Plus members enjoy free delivery on routine orders above ₹499.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Priority Warehouse Dispatch</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your orders are expedited in our automated fulfillment centers with priority cold-chain handling.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Exclusive CDE Webinars</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Free passes to hands-on endodontic and implant webinars hosted by leading international key opinion leaders.
          </p>
        </div>
      </div>
    </div>
  );
}
