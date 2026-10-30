import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-xs">
      {/* Trust Badges Strip */}
      <div className="max-w-7xl mx-auto px-4 pb-12 border-b border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-dk-teal-900 flex items-center justify-center text-dk-teal-200">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">100% Genuine Supplies</h4>
            <p className="text-slate-400 text-[11px]">Direct from authorized manufacturers</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-dk-teal-900 flex items-center justify-center text-dk-teal-200">
            <Truck className="w-5 h-5 text-dk-orange-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">19,000+ PIN Codes</h4>
            <p className="text-slate-400 text-[11px]">Expedited cold-chain & clinic delivery</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-dk-teal-900 flex items-center justify-center text-dk-teal-200">
            <RotateCcw className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">7-Day Easy Returns</h4>
            <p className="text-slate-400 text-[11px]">Hassle-free replacement guarantee</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-dk-teal-900 flex items-center justify-center text-dk-teal-200">
            <Headphones className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Doctor Dedicated Help</h4>
            <p className="text-slate-400 text-[11px]">Expert dental clinical support</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Col 1: About DentalKart */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded bg-dk-teal-700 flex items-center justify-center text-white font-bold text-sm">
              DK
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Dental<span className="text-dk-orange-400">Kart</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
            India&apos;s leading specialized e-commerce platform for dental professionals, clinics, and hospitals. Supplying 20,000+ verified consumables, rotary equipment, surgical instruments, and turnkey clinic setups.
          </p>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Plot 14, Okhla Industrial Area Phase III, New Delhi 110020</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>1800-103-3321 / +91-11-40844782</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>support@dentalkart.com</span>
            </div>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
            Dental Categories
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/categories/restorative-and-esthetics" className="hover:text-white transition-colors">
                Restorative &amp; Composites
              </Link>
            </li>
            <li>
              <Link href="/categories/endodontics" className="hover:text-white transition-colors">
                Endodontics &amp; Rotary Files
              </Link>
            </li>
            <li>
              <Link href="/categories/handpieces-and-rotary" className="hover:text-white transition-colors">
                Airotors &amp; Handpieces
              </Link>
            </li>
            <li>
              <Link href="/categories/instruments-and-surgery" className="hover:text-white transition-colors">
                Surgical Forceps &amp; Kits
              </Link>
            </li>
            <li>
              <Link href="/categories/orthodontics" className="hover:text-white transition-colors">
                Orthodontic Brackets
              </Link>
            </li>
            <li>
              <Link href="/categories/equipment-and-digital-dentistry" className="hover:text-white transition-colors">
                Autoclaves &amp; Chairs
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Quick Services */}
        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
            Services &amp; Programs
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/membership" className="text-amber-300 hover:text-amber-200 transition-colors">
                DentalKart Plus Club
              </Link>
            </li>
            <li>
              <Link href="/clinic-setup" className="hover:text-white transition-colors">
                New Clinic Setup Consultation
              </Link>
            </li>
            <li>
              <Link href="/freebies" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Freebies &amp; Gifts @ ₹1
              </Link>
            </li>
            <li>
              <Link href="/offers" className="hover:text-white transition-colors">
                Offer Zone Promotions
              </Link>
            </li>
            <li>
              <Link href="/brands" className="hover:text-white transition-colors">
                Brands Directory (450+ Brands)
              </Link>
            </li>
            <li>
              <Link href="/student-section" className="hover:text-white transition-colors">
                BDS Student Starter Kits
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Policy & Support */}
        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
            Support &amp; Policies
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                About DentalKart
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact &amp; Clinic Support
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-white transition-colors">
                Shipping &amp; Delivery Policy
              </Link>
            </li>
            <li>
              <Link href="/returns-policy" className="hover:text-white transition-colors">
                Returns &amp; Refund Guarantee
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy &amp; DCI Code
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-white transition-colors">
                Frequently Asked Questions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Payment Icons */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          © {new Date().getFullYear()} DentalKart E-Commerce Clone. Built for dental professionals across India.
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> 100% Safe Payments
          </span>
          <span className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-sky-400" /> UPI / Cards / NetBanking / COD
          </span>
        </div>
      </div>
    </footer>
  );
}
