import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Building2,
  ArrowLeft,
  Shield,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-xs">
      {/* Admin Top Navigation */}
      <header className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-dk-orange-500 text-white font-black text-sm flex items-center justify-center">
            DK
          </div>
          <div>
            <span className="font-bold text-sm block">Bossdent Admin Portal</span>
            <span className="text-[10px] text-slate-400">Inventory &amp; Operations Control</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-300">
            Admin: <strong>{session.name}</strong>
          </span>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>
        </div>
      </header>

      {/* Admin Body: Sidebar + Main */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-slate-700 hover:text-dk-teal-900 hover:bg-slate-50 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-dk-teal-700" /> Dashboard Overview
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-slate-700 hover:text-dk-teal-900 hover:bg-slate-50 transition-colors"
            >
              <Package className="w-4 h-4 text-sky-600" /> Products &amp; Inventory
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-slate-700 hover:text-dk-teal-900 hover:bg-slate-50 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> Orders &amp; Fulfillment
            </Link>

            <Link
              href="/admin/enquiries"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-slate-700 hover:text-dk-teal-900 hover:bg-slate-50 transition-colors"
            >
              <Building2 className="w-4 h-4 text-amber-500" /> Clinic Setup Leads
            </Link>
          </div>

          <div className="bg-dk-teal-900 text-white rounded-2xl p-4 space-y-2">
            <span className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-400">
              <Shield className="w-3.5 h-3.5" /> Security Enforced
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              All product mutations, price overrides, and stock updates require cryptographic server verification.
            </p>
          </div>
        </aside>

        {/* Content */}
        <main className="md:col-span-9">{children}</main>
      </div>
    </div>
  );
}