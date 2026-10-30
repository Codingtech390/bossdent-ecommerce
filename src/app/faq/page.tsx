import React from "react";
import Link from "next/link";
import { HelpCircle, ChevronRight } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Are all products on DentalKart 100% genuine and authorized?",
      a: "Yes. DentalKart sources exclusively from official manufacturer channels and direct Indian brand representatives (3M ESPE, Dentsply Sirona, NSK, GC, Waldent, Woodpecker). Every product carries genuine manufacturer warranty and batch certification.",
    },
    {
      q: "How do Dentacoins work?",
      a: "For every ₹50 spent, regular practitioners earn 1 Dentacoin, while DentalKart Plus members earn 2 Dentacoins. 1 Dentacoin equals ₹1 discount redeemable at checkout on your subsequent orders.",
    },
    {
      q: "Can I receive a GST Tax invoice with my Clinic and DCI registration?",
      a: "Yes. During checkout or in your Clinic Profile, enter your GSTIN and Dental Council Registration Number. A computer-generated B2B tax invoice will be generated automatically for input tax credit.",
    },
    {
      q: "What is the Freebies Zone?",
      a: "DentalKart features monthly promotional freebies where dentists can claim complimentary instruments, burs, and materials for just ₹1 upon reaching qualifying cart amounts.",
    },
    {
      q: "How does the New Clinic Setup consultation work?",
      a: "Our specialized biomedical engineering department offers free operatory layout consultation, customized equipment sourcing, doorstep installation, and AMC packages across India.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-xs leading-relaxed text-slate-700">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Frequently Asked Questions</span>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-dk-teal-800" /> Frequently Asked Questions (FAQ)
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm">{faq.q}</h3>
              <p className="text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
