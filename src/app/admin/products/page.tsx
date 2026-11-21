"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Pencil,
  ExternalLink,
  Boxes,
  IndianRupee,
  Warehouse,
  Filter,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Product = {
  _id: string;
  title: string;
  slug?: string;
  images?: string[];
  brand?:
    | {
        name?: string;
      }
    | string;
  category?:
    | {
        name?: string;
      }
    | string;
  defaultSku?: string;
  basePrice?: number;
  totalStock?: number;
  isActive?: boolean;
  status?: string;
};

type ProductDraft = {
  basePrice: string;
  totalStock: string;
};

type Notice = {
  type: "success" | "error";
  text: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setRequestError(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Unable to load products from the server.");
      }

      const fetchedProducts: Product[] = Array.isArray(data?.products) ? data.products : [];

      setProducts(fetchedProducts);

      const initialDrafts: Record<string, ProductDraft> = {};

      fetchedProducts.forEach((product) => {
        initialDrafts[product._id] = {
          basePrice: String(product.basePrice ?? 0),
          totalStock: String(product.totalStock ?? 0),
        };
      });

      setDrafts(initialDrafts);
    } catch (error) {
      console.error("Admin products fetch error:", error);

      setRequestError(
        error instanceof Error ? error.message : "Something went wrong while loading products.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateDraft = (productId: string, field: keyof ProductDraft, value: string) => {
    setDrafts((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value,
      },
    }));
  };

  const handleUpdateProduct = async (productId: string) => {
    const draft = drafts[productId];

    if (!draft) return;

    const price = Number(draft.basePrice);
    const stock = Number(draft.totalStock);

    if (!Number.isFinite(price) || price < 0) {
      setNotice({
        type: "error",
        text: "Please enter a valid product price.",
      });
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setNotice({
        type: "error",
        text: "Stock must be a valid non-negative whole number.",
      });
      return;
    }

    setUpdatingId(productId);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          totalStock: stock,
          basePrice: price,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Product update failed. Please try again.");
      }

      setProducts((current) =>
        current.map((product) =>
          product._id === productId
            ? {
                ...product,
                basePrice: price,
                totalStock: stock,
              }
            : product,
        ),
      );

      setNotice({
        type: "success",
        text: "Product price and inventory updated successfully.",
      });
    } catch (error) {
      console.error("Product update error:", error);

      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update product.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const brandName =
        typeof product.brand === "string" ? product.brand : product.brand?.name || "";

      const categoryName =
        typeof product.category === "string" ? product.category : product.category?.name || "";

      const matchesSearch =
        !normalizedSearch ||
        product.title?.toLowerCase().includes(normalizedSearch) ||
        product.defaultSku?.toLowerCase().includes(normalizedSearch) ||
        brandName.toLowerCase().includes(normalizedSearch) ||
        categoryName.toLowerCase().includes(normalizedSearch);

      const stock = Number(product.totalStock || 0);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && stock > 0) ||
        (stockFilter === "low-stock" && stock > 0 && stock <= 10) ||
        (stockFilter === "out-of-stock" && stock <= 0);

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.totalStock || 0),
    0,
  );

  const outOfStockProducts = products.filter(
    (product) => Number(product.totalStock || 0) <= 0,
  ).length;

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.totalStock || 0);
    return stock > 0 && stock <= 10;
  }).length;

  const getBrandName = (product: Product) => {
    if (typeof product.brand === "string") return product.brand;
    return product.brand?.name || "Unassigned";
  };

  const getCategoryName = (product: Product) => {
    if (typeof product.category === "string") return product.category;
    return product.category?.name || "Uncategorized";
  };

  const getProductImage = (product: Product) => {
    return product.images?.find((image) => typeof image === "string" && image.trim());
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return {
        label: "Out of stock",
        className: "bg-red-50 text-red-700 ring-red-200",
      };
    }

    if (stock <= 10) {
      return {
        label: "Low stock",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    }

    return {
      label: "In stock",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">
            <Package className="h-4 w-4" />
            Catalog Management
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your dental catalog, pricing and stock inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fetchProducts(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/10 transition hover:bg-blue-900"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}

          <p className="flex-1 text-sm font-medium">{notice.text}</p>

          <button
            type="button"
            onClick={() => setNotice(null)}
            className="opacity-60 transition hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error State */}
      {requestError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div className="flex-1">
              <h3 className="font-bold text-red-900">Unable to load products</h3>

              <p className="mt-1 text-sm text-red-700">{requestError}</p>

              <button
                type="button"
                onClick={() => fetchProducts(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Products
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                {loading ? "—" : totalProducts}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-900">
              <Package className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">Products in your catalog</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Stock Units
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                {loading ? "—" : totalStock.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-800">
              <Warehouse className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">Combined available inventory</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Low Stock
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight text-amber-600">
                {loading ? "—" : lowStockProducts}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <Boxes className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">Products with 10 or fewer units</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Out of Stock
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight text-red-600">
                {loading ? "—" : outOfStockProducts}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">Products requiring replenishment</p>
        </div>
      </div>

      {/* Product Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Product Catalog</h2>

            <p className="mt-1 text-xs text-slate-500">
              {loading
                ? "Loading catalog..."
                : `${filteredProducts.length} of ${products.length} products`}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Search */}
            <div className="relative min-w-0 sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, SKU, brand..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Stock Filter */}
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 sm:w-auto"
              >
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />

            <p className="mt-3 text-sm font-medium text-slate-500">
              Loading products from database...
            </p>
          </div>
        ) : requestError ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Products could not be displayed.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="rounded-2xl bg-slate-100 p-4">
              <Package className="h-8 w-8 text-slate-400" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {products.length === 0 ? "Your catalog is empty" : "No matching products"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {products.length === 0
                ? "Start building your product catalog by adding your first dental product."
                : "Try adjusting your search or stock filter."}
            </p>

            {products.length === 0 && (
              <Link
                href="/admin/products/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900"
              >
                <Plus className="h-4 w-4" />
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Product
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Brand / Category
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      SKU
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Price
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Inventory
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const stock = Number(product.totalStock || 0);
                    const stockStatus = getStockStatus(stock);
                    const image = getProductImage(product);
                    const draft = drafts[product._id];

                    return (
                      <tr key={product._id} className="transition hover:bg-slate-50/70">
                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex min-w-[260px] items-center gap-3">
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                              {image ? (
                                <img
                                  src={image}
                                  alt={product.title}
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-slate-300" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-bold text-slate-900">
                                {product.title || "Untitled Product"}
                              </p>

                              <span
                                className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                                  stockStatus.className
                                }`}
                              >
                                {stockStatus.label}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Brand / Category */}
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              {getBrandName(product)}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {getCategoryName(product)}
                            </p>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                            {product.defaultSku || "—"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4">
                          <div className="relative w-32">
                            <IndianRupee className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={draft?.basePrice ?? ""}
                              onChange={(e) =>
                                updateDraft(product._id, "basePrice", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-7 pr-2 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
                            />
                          </div>

                          <p className="mt-1 text-[10px] text-slate-400">
                            Current: {formatPrice(product.basePrice || 0)}
                          </p>
                        </td>

                        {/* Inventory */}
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={draft?.totalStock ?? ""}
                            onChange={(e) => updateDraft(product._id, "totalStock", e.target.value)}
                            className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
                          />

                          <p className="mt-1 text-[10px] text-slate-400">Current: {stock} units</p>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              title="Edit product"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>

                            {product.slug && (
                              <Link
                                href={`/products/${product.slug}`}
                                target="_blank"
                                title="View product on storefront"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() => handleUpdateProduct(product._id)}
                              disabled={updatingId === product._id}
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingId === product._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                              Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Product Cards */}
            <div className="grid gap-4 p-4 xl:hidden">
              {filteredProducts.map((product) => {
                const stock = Number(product.totalStock || 0);
                const stockStatus = getStockStatus(stock);
                const image = getProductImage(product);
                const draft = drafts[product._id];

                return (
                  <div
                    key={product._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    {/* Product Header */}
                    <div className="flex gap-3">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {image ? (
                          <img
                            src={image}
                            alt={product.title}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
                          {product.title}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">{getBrandName(product)}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${stockStatus.className}`}
                          >
                            {stockStatus.label}
                          </span>

                          <span className="font-mono text-[10px] text-slate-400">
                            {product.defaultSku || "No SKU"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                          Price
                        </label>

                        <div className="relative">
                          <IndianRupee className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={draft?.basePrice ?? ""}
                            onChange={(e) => updateDraft(product._id, "basePrice", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 pl-7 text-sm font-bold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                          Stock Units
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={draft?.totalStock ?? ""}
                          onChange={(e) => updateDraft(product._id, "totalStock", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
                        />
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/admin/products/${product._id}/edit`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Product
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleUpdateProduct(product._id)}
                        disabled={updatingId === product._id}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-950 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-900 disabled:opacity-60"
                      >
                        {updatingId === product._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Table Footer */}
        {!loading && !requestError && filteredProducts.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">{filteredProducts.length}</span>{" "}
              products
            </p>

            <p className="text-xs text-slate-400">Changes must be saved individually.</p>
          </div>
        )}
      </div>
    </div>
  );
}
