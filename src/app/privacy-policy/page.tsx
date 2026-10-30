import React from "react";
import Link from "next/link";
import { Shield, ChevronRight } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-xs leading-relaxed text-slate-700">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Privacy Policy</span>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-dk-teal-800" /> Privacy &amp; Data Protection Policy
        </h1>

        <p>
          At DentalKart, we uphold the highest standards of data security and confidentiality for our registered dental professionals and hospital clinics.
        </p>

        <h3 className="font-bold text-slate-900 text-sm">1. Information Collection</h3>
        <p>
          We collect clinic address details, DCI registration numbers, GST credentials, and order transaction history to ensure verified delivery, legal invoicing, and warranty fulfillment.
        </p>

        <h3 className="font-bold text-slate-900 text-sm">2. Security &amp; Encryption</h3>
        <p>
          All electronic payment transactions are encrypted using industry-standard 256-bit SSL protocols. We never store credit or debit card numbers on our local databases.
        </p>
      </div>
    </div>
  );
}
