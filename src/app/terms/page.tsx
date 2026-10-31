import React from "react";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-xs leading-relaxed text-slate-700">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Terms of Service</span>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-dk-teal-800" /> Terms and Conditions
        </h1>

        <p>
          Welcome to Bossdent. By accessing our platform or purchasing dental supplies, you agree to comply with our clinical terms and professional guidelines.
        </p>

        <h3 className="font-bold text-slate-900 text-sm">1. Professional Qualification</h3>
        <p>
          Products listed under Dental Supplies, Surgical Forceps, Rotary Files, and Prescription Pharmaceuticals are intended for licensed dental surgeons, registered dental clinics, and affiliated dental institutions.
        </p>

        <h3 className="font-bold text-slate-900 text-sm">2. Pricing &amp; GST</h3>
        <p>
          All product prices listed are in Indian Rupees (INR) and inclusive of Goods and Services Tax (GST). Computerized tax invoices suitable for input tax credit are issued upon dispatch.
        </p>
      </div>
    </div>
  );
}