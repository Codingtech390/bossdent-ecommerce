"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Sparkles,
  PhoneCall,
  Send,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";

export default function ClinicSetupPage() {
  const [formData, setFormData] = useState({
    doctorName: "",
    clinicName: "",
    email: "",
    phone: "",
    city: "",
    state: "Delhi",
    pincode: "110001",
    budgetRange: "₹5 Lakh - ₹10 Lakh",
    packageType: "Full 1-Chair Operatory Package",
    dentalChairsCount: 1,
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/clinic-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit enquiry.");
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      setIsSubmitting(false);
    } catch {
      setError("Network error while submitting enquiry.");
      setIsSubmitting(false);
    }
  };

  const packages = [
    {
      name: "Starter Dental Operatory Package",
      price: 245000,
      idealFor: "Fresh BDS/MDS Graduates & Satellite Clinics",
      includes: [
        "Fully Motorized Dental Chair with LED Sensor Light",
        "1.0 HP Oil-Free Silent Dental Air Compressor (35L)",
        "18L Digital Autoclave Sterilizer",
        "Ultrasonic Piezo Scaler with 5 Scaling Tips",
        "2x High-Speed LED Ceramic Push-Button Airotors",
        "Starter Diagnostic & Extraction Instruments Kit",
      ],
      warranty: "1 Year On-site Engineer Warranty",
    },
    {
      name: "Premium Multichair Implant Centre Suite",
      price: 580000,
      idealFor: "Advanced General & Implantology Practices",
      includes: [
        "2x Luxury Hydraulic Dental Chairs with Intraoral Cameras",
        "2.0 HP Twin Cylinder Silent Compressor (70L)",
        "Class B Triple Vacuum 23L Medical Autoclave",
        "Eighteeth Cordless Endomotor + Built-in Apex Locator",
        "Woodpecker LED.F Light Curing Radiometer System",
        "Complete Surgical Luxating Elevator & Suture Kit",
      ],
      warranty: "2 Years Doorstep Comprehensive Warranty",
    },
    {
      name: "Digital Dentistry & CAD/CAM Package",
      price: 1450000,
      idealFor: "Corporate Clinics & Same-Day Prosthodontics",
      includes: [
        "Ultra-Fast High Precision Intraoral 3D Scanner",
        "High Performance CAD/CAM Chairside Milling Unit",
        "Ceramic Sintering Oven with Pre-programmed Profiles",
        "High Definition Patient Education Display Station",
        "On-Site Software & Biomaterial Training Support",
      ],
      warranty: "3 Years Comprehensive AMC Support",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-dk-teal-950 via-dk-teal-900 to-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-dk-orange-500 text-white uppercase tracking-wider shadow-sm">
              <Building2 className="w-3.5 h-3.5" /> TURNKEY CLINIC INFRASTRUCTURE
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Design, Setup &amp; Equip Your Dream Dental Clinic
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Bossdent acts as your turnkey setup partner: architectural layout planning, dental operatory chairs, digital sterilization, and nationwide engineer installation.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1,200+ Clinics Inaugurated
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Plumbing &amp; Layout Plan
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Doorstep Installation
              </span>
            </div>
          </div>

          <div className="relative w-full max-w-md h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
              alt="Dental Clinic Suite"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4 Step Setup Journey */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-dk-orange-600 uppercase tracking-widest">
            Hassle-Free Experience
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">
            How The Bossdent Clinic Setup Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="w-8 h-8 rounded-full bg-dk-teal-800 text-white font-black text-sm flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Consultation &amp; 2D Layout</h3>
            <p className="text-slate-500 leading-relaxed">
              Our architects review your floor plan, operatory orientation, suction pipelines, and patient reception flow.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="w-8 h-8 rounded-full bg-dk-teal-800 text-white font-black text-sm flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Custom Package Sourcing</h3>
            <p className="text-slate-500 leading-relaxed">
              Select chair upholstery, lighting options, autoclaves, and handpiece combinations customized to your clinical budget.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="w-8 h-8 rounded-full bg-dk-teal-800 text-white font-black text-sm flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Biomedical Installation</h3>
            <p className="text-slate-500 leading-relaxed">
              Trained biomedical technicians deliver, unpack, install, calibrate, and pressure-test every unit in your operatory.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="w-8 h-8 rounded-full bg-dk-teal-800 text-white font-black text-sm flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Doorstep AMC &amp; Warranty</h3>
            <p className="text-slate-500 leading-relaxed">
              Enjoy 12 months comprehensive warranty support, spare parts availability, and free preventive maintenance visits.
            </p>
          </div>
        </div>
      </section>

      {/* Curated Turnkey Packages */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-dk-teal-800 uppercase tracking-widest">
            Ready-to-Deploy Operatory Bundles
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">
            Featured Clinic Packages
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-6 md:p-8 flex flex-col justify-between transition-all ${
                idx === 0
                  ? "bg-white border-dk-teal-600 shadow-lg ring-2 ring-dk-teal-600"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <div className="space-y-4">
                {idx === 0 && (
                  <span className="bg-dk-teal-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    MOST POPULAR STARTER SETUP
                  </span>
                )}
                <h3 className="text-xl font-black text-slate-900">{pkg.name}</h3>
                <p className="text-xs text-slate-500">{pkg.idealFor}</p>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-2xl font-black text-slate-900 block">
                    {formatPrice(pkg.price)}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Includes GST &amp; On-Site Installation
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">Package Inclusions:</span>
                  <ul className="space-y-2 text-slate-600">
                    {pkg.includes.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <a
                  href="#consultation-form"
                  className="w-full py-3 bg-dk-teal-800 hover:bg-dk-teal-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  Request Detailed Proposal
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consultation & Quotation Form */}
      <section id="consultation-form" className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-xl space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-dk-teal-50 text-dk-teal-900">
              <PhoneCall className="w-3.5 h-3.5 text-dk-teal-700" /> Free Doctor Consultation
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Schedule Your Clinic Setup Consultation
            </h2>
            <p className="text-xs text-slate-500">
              Fill in your practice details below. A specialized Bossdent Biomedical Project Manager will prepare a customized quotation within 24 hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-950">Thank you, Doctor!</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Your clinic enquiry has been registered with Bossdent Project Operations. Our engineer will reach out to you via phone and email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    placeholder="Dr. Rajesh Sharma"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Clinic Name</label>
                  <input
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    placeholder="Sharma Dental Clinic"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doctor@clinic.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9811223344"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. New Delhi"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Budget Range</label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                  >
                    <option>Under ₹3 Lakh</option>
                    <option>₹3 Lakh - ₹6 Lakh</option>
                    <option>₹6 Lakh - ₹12 Lakh</option>
                    <option>₹12 Lakh - ₹25 Lakh</option>
                    <option>₹25 Lakh+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Requirements / Remarks</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your clinic area (sq. ft.), preferred dental chair brands, or compressor requirements..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-dk-orange-500 hover:bg-dk-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs md:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Request Free Clinic Consultation
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}