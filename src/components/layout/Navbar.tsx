"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  ChevronDown,
  Sparkles,
  Flame,
  Gift,
  Building2,
  GraduationCap,
  Percent,
  Layers,
  ArrowRight,
} from "lucide-react";

export function Navbar() {
  const [isMegaOpen, setIsMegaOpen] = useState(false);

  const categories = [
    {
      name: "Restorative & Esthetics",
      slug: "restorative-and-esthetics",
      subs: ["Dental Composites", "Bonding Agents & Etchants", "Glass Ionomer Cements"],
    },
    {
      name: "Endodontics",
      slug: "endodontics",
      subs: ["Rotary & Hand Files", "Endomotors & Apex Locators", "Obturation & Sealers"],
    },
    {
      name: "Handpieces & Rotary",
      slug: "handpieces-and-rotary",
      subs: ["High Speed Airotors", "Micromotors & Attachments"],
    },
    {
      name: "Instruments & Surgery",
      slug: "instruments-and-surgery",
      subs: ["Extraction Forceps & Elevators", "Diagnostic & Scaler Instruments"],
    },
    {
      name: "Orthodontics",
      slug: "orthodontics",
      subs: ["Brackets & Buccal Tubes", "Archwires & Elastics"],
    },
    {
      name: "Equipment & Digital",
      slug: "equipment-and-digital-dentistry",
      subs: ["Sterilization & Autoclaves", "Operatory Hardware", "Dental Chairs & Units"],
    },
    {
      name: "Impression Materials",
      slug: "impression-materials",
      subs: ["Silicone Putty & Light Body", "Alginates & Trays"],
    },
    {
      name: "New Clinic Setup",
      slug: "new-clinic-setup",
      subs: ["Turnkey Packages", "Operatory Suites"],
    },
  ];

  return (
    <nav className="bg-dk-teal-900 text-white relative z-40 border-t border-dk-teal-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs font-semibold overflow-x-auto no-scrollbar">
        {/* All Categories Button */}
        <div
          className="relative"
          onMouseEnter={() => setIsMegaOpen(true)}
          onMouseLeave={() => setIsMegaOpen(false)}
        >
          <button className="flex items-center gap-2 py-3 px-4 bg-dk-teal-800 hover:bg-dk-teal-700 transition-colors uppercase tracking-wider text-[11px] font-bold">
            <Menu className="w-4 h-4 text-dk-orange-400" />
            <span>All Categories</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>

          {/* Mega Menu Dropdown */}
          {isMegaOpen && (
            <div className="absolute top-full left-0 w-80 sm:w-96 bg-white text-slate-800 shadow-2xl rounded-b-xl border border-slate-200 py-3 z-50 animate-fade-in divide-y divide-slate-100">
              {categories.map((cat) => (
                <div key={cat.slug} className="p-3 hover:bg-slate-50 transition-colors group">
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="flex items-center justify-between font-bold text-dk-teal-950 group-hover:text-dk-orange-600 text-xs"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {cat.subs.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] text-slate-500 hover:text-dk-teal-800 transition-colors"
                      >
                        {s} •
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Primary Navbar Links */}
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Link
            href="/best-sellers"
            className="flex items-center gap-1 px-3 py-3 text-slate-200 hover:text-white hover:bg-dk-teal-800 rounded transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Best Sellers
          </Link>
          <Link
            href="/brands"
            className="flex items-center gap-1 px-3 py-3 text-slate-200 hover:text-white hover:bg-dk-teal-800 rounded transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" /> Brands Directory
          </Link>
          <Link
            href="/offers"
            className="flex items-center gap-1 px-3 py-3 text-amber-300 hover:text-amber-200 hover:bg-dk-teal-800 rounded transition-colors"
          >
            <Percent className="w-3.5 h-3.5" /> Offer Zone
          </Link>
          <Link
            href="/freebies"
            className="flex items-center gap-1 px-3 py-3 text-emerald-300 hover:text-emerald-200 hover:bg-dk-teal-800 rounded transition-colors"
          >
            <Gift className="w-3.5 h-3.5 text-emerald-400" /> Freebies (Gifts @ ₹1)
          </Link>
          <Link
            href="/membership"
            className="flex items-center gap-1 px-3 py-3 text-amber-400 hover:text-amber-300 hover:bg-dk-teal-800 rounded transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> DentalKart Plus
          </Link>
          <Link
            href="/clinic-setup"
            className="flex items-center gap-1 px-3 py-3 text-slate-200 hover:text-white hover:bg-dk-teal-800 rounded transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-dk-orange-400" /> New Clinic Setup
          </Link>
          <Link
            href="/student-section"
            className="flex items-center gap-1 px-3 py-3 text-slate-200 hover:text-white hover:bg-dk-teal-800 rounded transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-300" /> Student Section
          </Link>
        </div>
      </div>
    </nav>
  );
}
