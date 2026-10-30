import React from "react";
import Link from "next/link";
import { RotateCcw, ChevronRight, ShieldCheck } from "lucide-react";

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-xs leading-relaxed text-slate-700">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Returns &amp; Replacement Policy</span>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-dk-teal-800" /> 7-Day Hassle-Free Replacement Guarantee
        </h1>

        <div className="space-y-4">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">1. Eligibility Criteria</h2>
            <p>
              We want dental practitioners to have complete peace of mind when trying new rotary files or clinical handpieces. You can request a replacement or return within <strong>7 days</strong> of delivery if:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The item received is damaged during transit or defective out of box.</li>
              <li>Incorrect variant, shade, or connector specification received.</li>
              <li>Batch expiry date is shorter than verified manufacturer standards.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">2. Non-Returnable Items</h2>
            <p>
              In compliance with Dental Council hygiene regulations, opened sterilization pouches, unpackaged rotary files, and breached composite seal tubes cannot be accepted once used on patients.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">3. Refund Processing</h2>
            <p>
              Approved refunds are credited to the original payment source or clinic Dentacoins wallet within 24 to 48 hours of return inspection.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
