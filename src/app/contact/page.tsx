import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Headphones, Clock, ChevronRight } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-xs leading-relaxed text-slate-700">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Contact &amp; Support</span>
      </div>

      <div className="bg-gradient-to-r from-dk-teal-900 to-slate-900 text-white p-8 rounded-2xl shadow-md space-y-2">
        <h1 className="text-3xl font-black">DentalKart Doctor Helpline</h1>
        <p className="text-slate-300 text-xs md:text-sm">
          Dedicated clinical support, bulk institutional quotes, and doorstep engineer assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <Phone className="w-6 h-6 text-dk-teal-800" />
          <h3 className="font-bold text-slate-900 text-sm">Toll-Free Phone</h3>
          <p className="font-mono text-slate-900 font-bold">1800-103-3321</p>
          <p className="text-slate-500">Monday - Saturday (9:30 AM to 6:30 PM)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <Mail className="w-6 h-6 text-dk-orange-500" />
          <h3 className="font-bold text-slate-900 text-sm">Email Support</h3>
          <p className="font-medium text-slate-900">support@dentalkart.com</p>
          <p className="text-slate-500">Average response time: under 2 hours</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <MapPin className="w-6 h-6 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm">Headquarters</h3>
          <p className="text-slate-900">Plot 14, Okhla Industrial Area Phase III, New Delhi 110020</p>
        </div>
      </div>
    </div>
  );
}
