import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Phone } from "lucide-react";

export function TopTrustBar() {
  return (
    <div className="hidden bg-[#252526] px-6 py-2 text-[10px] text-white/75 md:block">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#c9bdca]"/> Genuine dental products</span>
          <span className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-[#c9bdca]"/> Delivery across India</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/clinic-setup" className="hover:text-white">Clinic setup</Link>
          <Link href="/offers" className="hover:text-white">Offers</Link>
          <a href="tel:18001033321" className="flex items-center gap-2 hover:text-white"><Phone className="h-3 w-3"/> 1800-103-3321</a>
        </div>
      </div>
    </div>
  );
}
