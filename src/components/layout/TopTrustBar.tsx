import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, PhoneCall, Sparkles } from "lucide-react";

export function TopTrustBar() {
  return (
    <div className="bg-dk-teal-950 text-slate-200 text-xs py-1.5 px-4 border-b border-dk-teal-900">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-[11px] sm:text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Dental Products
          </span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Truck className="w-3.5 h-3.5 text-dk-orange-400" /> Fast Delivery across 19,000+ Pincodes
          </span>
          <span className="hidden lg:flex items-center gap-1 text-amber-300">
            <Sparkles className="w-3.5 h-3.5" /> Earn 2x Dentacoins with DentalKart Plus
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] sm:text-xs text-slate-300">
          <Link href="/clinic-setup" className="hover:text-white transition-colors">
            New Clinic Setup
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/offers" className="text-dk-orange-400 font-medium hover:text-dk-orange-300 transition-colors">
            Offer Zone
          </Link>
          <span className="text-slate-600">|</span>
          <a href="tel:18001033321" className="flex items-center gap-1 hover:text-white transition-colors">
            <PhoneCall className="w-3 h-3 text-emerald-400" /> 1800-103-3321 (Toll-Free)
          </a>
        </div>
      </div>
    </div>
  );
}
