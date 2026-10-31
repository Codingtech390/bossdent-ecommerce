"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, AlertCircle, Loader2, ShieldCheck, Stethoscope } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "Login failed");
    }
  };

  const handleDemoDoctor = () => {
    setEmail("dr.sharma@dentalcare.com");
    setPassword("Doctor@123");
  };

  const handleDemoAdmin = () => {
    setEmail("admin@bossdent.com");
    setPassword("Admin@123");
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6 text-xs">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-dk-teal-800 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
            DK
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Sign In to Dental<span className="text-dk-orange-500">Kart</span>
          </h1>
          <p className="text-slate-500 text-xs">
            Access your clinic orders, Dentacoins rewards, and specialized member discounts
          </p>
        </div>

        {/* Quick Demo Credentials Buttons */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Instant Demo Logins:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDemoDoctor}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-dk-teal-900 flex items-center justify-center gap-1 shadow-sm"
            >
              <Stethoscope className="w-3.5 h-3.5 text-dk-teal-700" /> Dr. Sharma (Dentist)
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-800 flex items-center justify-center gap-1 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SuperAdmin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Clinic Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@clinic.com"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-dk-teal-700"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-dk-orange-500 hover:bg-dk-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Account"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-slate-500">
          New to Bossdent?{" "}
          <Link href="/register" className="text-dk-teal-800 font-bold hover:underline">
            Register as a Dentist / Clinic
          </Link>
        </div>
      </div>
    </div>
  );
}