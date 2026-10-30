import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Users, Award, ChevronRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-xs leading-relaxed text-slate-700">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">About Us</span>
      </div>

      <div className="bg-gradient-to-r from-dk-teal-900 to-slate-900 text-white p-8 rounded-2xl shadow-md space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-dk-orange-400">
          DentalKart E-Commerce
        </span>
        <h1 className="text-3xl font-black">Empowering Indian Dentistry Since 2016</h1>
        <p className="text-slate-300 text-xs md:text-sm">
          Bridging international manufacturers directly with dental practitioners across 19,000+ pincodes.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Our Mission</h2>
        <p>
          DentalKart is one of India&apos;s pioneering online dental supply and medical equipment platforms. Founded with the conviction that no dentist should face artificial supply shortages, counterfeit materials, or inflated dealer markups, we deliver genuine clinical batches directly to your clinic operatory.
        </p>
        <p>
          Today, DentalKart hosts more than 450+ global and Indian brands, 20,000+ catalogued products, and maintains climate-controlled logistics hubs across New Delhi, Mumbai, and Bengaluru ensuring composite freshness and cold-chain compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 text-center">
          <div className="w-10 h-10 rounded-full bg-dk-teal-50 text-dk-teal-800 flex items-center justify-center mx-auto font-black">
            20K+
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Products</h3>
          <p className="text-slate-500 text-[11px]">Restoratives, rotary files, handpieces, and heavy chairs.</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto font-black">
            450+
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Brand Partners</h3>
          <p className="text-slate-500 text-[11px]">Authorized 3M, Dentsply, NSK, Woodpecker, and GC distributor.</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto font-black">
            19K+
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Pincodes Served</h3>
          <p className="text-slate-500 text-[11px]">Pan-India express logistics network with COD support.</p>
        </div>
      </div>
    </div>
  );
}
