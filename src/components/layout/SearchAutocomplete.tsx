"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Loader2, ArrowRight, Tag, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface SuggestionProduct {
  _id: string;
  title: string;
  slug: string;
  basePrice: number;
  baseComparePrice?: number;
  images: string[];
  defaultSku: string;
  brand?: { name: string; slug: string };
}

interface SuggestionBrand {
  name: string;
  slug: string;
  logo?: string;
}

interface SuggestionCategory {
  name: string;
  slug: string;
  level: number;
}

export function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SuggestionProduct[]>([]);
  const [brands, setBrands] = useState<SuggestionBrand[]>([]);
  const [categories, setCategories] = useState<SuggestionCategory[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setProducts([]);
      setBrands([]);
      setCategories([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setBrands(data.brands || []);
          setCategories(data.categories || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-2xl">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Search 20,000+ Dental Products, Instruments, Brands, SKUs..."
          className="w-full pl-11 pr-24 py-2.5 bg-white text-slate-900 placeholder-slate-400 text-sm rounded-full border-2 border-slate-200 focus:border-dk-orange-500 focus:outline-none shadow-sm transition-all"
        />
        <div className="absolute left-3.5 text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-20 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-1 top-1 bottom-1 px-4 bg-dk-orange-500 hover:bg-dk-orange-600 text-white rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
        </button>
      </form>

      {/* Dropdown Suggestions */}
      {isOpen && (products.length > 0 || brands.length > 0 || categories.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in divide-y divide-slate-100 max-h-[80vh] overflow-y-auto">
          {/* Categories & Brands quick chips */}
          {(categories.length > 0 || brands.length > 0) && (
            <div className="p-3 bg-slate-50 flex flex-wrap gap-2 text-xs">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-dk-teal-800 hover:border-dk-teal-600 font-medium"
                >
                  <Tag className="w-3 h-3 text-slate-400" />
                  in <span className="font-semibold">{c.name}</span>
                </Link>
              ))}
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-dk-orange-600 hover:border-dk-orange-500 font-medium"
                >
                  Brand: <span className="font-semibold">{b.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Product Items */}
          {products.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Matching Dental Supplies ({products.length})
              </div>
              {products.map((p) => (
                <Link
                  key={p._id}
                  href={`/products/${p.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-12 h-12 relative rounded-md border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                    <Image
                      src={p.images[0] || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=100&q=80"}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {p.brand && (
                      <span className="text-[10px] font-bold text-dk-teal-700 uppercase tracking-wider block">
                        {p.brand.name}
                      </span>
                    )}
                    <h4 className="text-xs font-medium text-slate-800 group-hover:text-dk-teal-800 truncate">
                      {p.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      SKU: {p.defaultSku}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-slate-900 block">
                      {formatPrice(p.basePrice)}
                    </span>
                    {p.baseComparePrice && p.baseComparePrice > p.basePrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {formatPrice(p.baseComparePrice)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View All Footer */}
          <div className="p-2.5 bg-slate-50 text-center">
            <button
              onClick={handleSubmit}
              className="text-xs font-semibold text-dk-teal-800 hover:text-dk-teal-950 flex items-center justify-center gap-1 mx-auto"
            >
              See all results for &ldquo;{query}&rdquo; <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
