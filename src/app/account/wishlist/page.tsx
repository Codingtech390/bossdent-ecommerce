import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/auth";
import { ProductCard } from "@/components/product/ProductCard";
import { Heart, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerWishlistPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findById(session.userId)
    .populate({
      path: "wishlist",
      populate: { path: "brand", select: "name slug" },
    })
    .lean();

  const wishlistItems = (user?.wishlist || []).filter((item: any) => Boolean(item && item._id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/account" className="hover:text-dk-teal-800">Account</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-slate-900">Wishlist</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> My Saved Products
        </h1>
        <span className="text-xs font-semibold text-slate-500">
          {wishlistItems.length} Saved
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500">
            Click the heart icon on any dental product to save it here for quick re-ordering.
          </p>
          <Link
            href="/categories"
            className="inline-block mt-2 px-5 py-2.5 bg-dk-teal-800 text-white rounded-lg text-xs font-semibold"
          >
            Browse Dental Supplies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistItems.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
