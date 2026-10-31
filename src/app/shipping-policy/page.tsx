import React from "react";
import Link from "next/link";
import { Truck, ChevronRight, ShieldCheck, Clock } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-xs leading-relaxed text-slate-700">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Shipping &amp; Delivery Policy</span>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Truck className="w-6 h-6 text-dk-teal-800" /> Clinic Shipping &amp; Logistics Standards
        </h1>

        <div className="space-y-4">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">1. Pan-India Delivery Coverage</h2>
            <p>
              Bossdent operates direct warehouse logistics across all major Indian cities. We deliver to over 19,000+ PIN codes through specialized courier partners including Delhivery Express, BlueDart Medical, and DTDC.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">2. Free Shipping Thresholds</h2>
            <p>
              • <strong>Bossdent Plus Members:</strong> Free clinical delivery on all consumable orders above ₹499.
            </p>
            <p>
              • <strong>Regular Accounts:</strong> Free delivery on orders above ₹999. A nominal fee of ₹99 is applicable for orders below this value.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">3. Temperature-Sensitive &amp; Expiry Control</h2>
            <p>
              Dental bonding agents, composites, and impression materials are packed in insulated protective thermal pouches. Every batch dispatched carries a minimum shelf-life of 18 months unless explicitly advertised as clearance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">4. Delivery Timelines</h2>
            <p>
              • Metro hubs (Delhi-NCR, Mumbai, Bengaluru, Chennai): 1 to 2 business days.
            </p>
            <p>
              • Tier 2 / Tier 3 dental locations: 2 to 4 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}