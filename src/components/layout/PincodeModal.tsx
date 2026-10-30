"use client";

import React, { useState } from "react";
import { usePincode } from "@/context/PincodeContext";
import { MapPin, X, CheckCircle2, AlertCircle } from "lucide-react";

export function PincodeModal() {
  const { currentPincode, isModalOpen, closePincodeModal, setPincode } = usePincode();
  const [inputCode, setInputCode] = useState(currentPincode.pincode);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await setPincode(inputCode);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message || "Invalid pincode");
    }
  };

  const quickPincodes = [
    { code: "110001", city: "New Delhi" },
    { code: "400001", city: "Mumbai" },
    { code: "560001", city: "Bengaluru" },
    { code: "600001", city: "Chennai" },
    { code: "201301", city: "Noida" },
    { code: "700001", city: "Kolkata" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-dk-teal-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-dk-orange-400" />
            <h3 className="font-semibold text-base">Select Delivery Location</h3>
          </div>
          <button
            onClick={closePincodeModal}
            className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs text-slate-600 mb-4">
            Enter your dental clinic PIN code to view accurate delivery timelines, COD availability, and local warehouse dispatch options.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value.replace(/\D/g, ""));
                    setError(null);
                  }}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dk-teal-700 font-mono tracking-wider"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmitting || inputCode.length !== 6}
                  className="bg-dk-orange-500 hover:bg-dk-orange-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Apply
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Popular Dental Hubs
            </h4>
            <div className="flex flex-wrap gap-2">
              {quickPincodes.map((hub) => (
                <button
                  key={hub.code}
                  type="button"
                  onClick={() => {
                    setInputCode(hub.code);
                    setPincode(hub.code);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md border text-slate-700 transition-colors flex items-center gap-1 ${
                    currentPincode.pincode === hub.code
                      ? "border-dk-teal-600 bg-dk-teal-50 text-dk-teal-900 font-semibold"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  {currentPincode.pincode === hub.code && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-dk-teal-700" />
                  )}
                  {hub.city} ({hub.code})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
