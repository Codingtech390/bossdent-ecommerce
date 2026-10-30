"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Package, Plus, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateStock = async (productId: string, newStock: number, newPrice: number) => {
    setUpdatingId(productId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          totalStock: Number(newStock),
          basePrice: Number(newPrice),
        }),
      });
      if (res.ok) {
        setMessage("Product updated successfully!");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-dk-teal-800" /> Dental Supplies Inventory
          </h1>
          <p className="text-slate-500">Manage catalogue items, stock counts, and prices</p>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading catalogue...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2">Product</th>
                <th className="pb-2">Brand</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">SKU</th>
                <th className="pb-2">Price (₹)</th>
                <th className="pb-2">Stock Units</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                let localStock = p.totalStock;
                let localPrice = p.basePrice;

                return (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 relative rounded-md border border-slate-100 bg-slate-50 overflow-hidden flex-shrink-0">
                          <Image
                            src={p.images?.[0] || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=100&q=80"}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-bold text-slate-800 line-clamp-1">{p.title}</span>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-dk-teal-800">{p.brand?.name}</td>
                    <td className="py-3 text-slate-500">{p.category?.name}</td>
                    <td className="py-3 font-mono font-bold text-slate-600">{p.defaultSku}</td>
                    <td className="py-3">
                      <input
                        type="number"
                        defaultValue={p.basePrice}
                        onChange={(e) => (localPrice = Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-slate-300 rounded font-bold font-mono"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        defaultValue={p.totalStock}
                        onChange={(e) => (localStock = Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold font-mono"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleUpdateStock(p._id, localStock, localPrice)}
                        disabled={updatingId === p._id}
                        className="px-3 py-1.5 bg-dk-teal-800 hover:bg-dk-teal-900 disabled:opacity-50 text-white rounded font-bold text-xs flex items-center gap-1 ml-auto shadow-sm"
                      >
                        {updatingId === p._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Save</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
