import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { RewardTransaction } from "@/models/Membership";
import { getSessionUser } from "@/lib/auth";
import { Coins, Sparkles, ChevronRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RewardsLedgerPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();
  const [user, transactions] = await Promise.all([
    User.findById(session.userId).lean(),
    RewardTransaction.find({ user: session.userId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/account" className="hover:text-dk-teal-800">Account</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Dentacoins Ledger</span>
      </div>

      {/* Rewards Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            <Coins className="w-3.5 h-3.5" /> Bossdent Rewards Balance
          </span>
          <h1 className="text-3xl md:text-4xl font-black">{user.dentacoins} Dentacoins</h1>
          <p className="text-xs text-amber-100">
            Equivalent to <strong>₹{user.dentacoins}</strong> discount redeemable directly in your cart!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-300" /> Earning Rate:
          </p>
          <p>• Regular Accounts: 1 Coin per ₹50 spent</p>
          <p>• Plus Club: 2 Coins per ₹50 spent (Double!)</p>
          <p>• 1 Coin = ₹1 Flat Savings</p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Transaction History ({transactions.length})
        </h2>

        {transactions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No transactions yet. Complete your first dental order to earn Dentacoins!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((t: any) => (
              <div key={t._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      t.amount > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {t.amount > 0 ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{t.description}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-sm block ${
                      t.amount > 0 ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {t.amount > 0 ? `+${t.amount}` : t.amount} Coins
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Balance: {t.balanceAfter}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}