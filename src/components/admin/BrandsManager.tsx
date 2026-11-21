"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tag,
  Package,
  Globe,
  Image as ImageIcon,
  X,
  Save,
  Loader2,
  RefreshCw,
  ExternalLink,
  Power,
  PowerOff,
} from "lucide-react";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  website: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

interface Props {
  initialBrands: Brand[];
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  logo: "",
  website: "",
  isActive: true,
};

export default function BrandsManager({ initialBrands }: Props) {
  const [brands, setBrands] = useState(initialBrands);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalProducts = brands.reduce((total, brand) => total + brand.productCount, 0);

  const activeBrands = brands.filter((brand) => brand.isActive).length;

  const inactiveBrands = brands.filter((brand) => !brand.isActive).length;

  const filteredBrands = useMemo(() => {
    const term = search.trim().toLowerCase();

    return brands.filter((brand) => {
      const matchesSearch =
        !term ||
        brand.name.toLowerCase().includes(term) ||
        brand.slug.toLowerCase().includes(term) ||
        brand.description.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && brand.isActive) ||
        (statusFilter === "inactive" && !brand.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [brands, search, statusFilter]);

  function resetForm() {
    setForm(emptyForm);
    setEditingBrand(null);
    setShowForm(false);
    setError("");
  }

  function openCreate() {
    resetForm();
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(brand: Brand) {
    setEditingBrand(brand);

    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logo: brand.logo,
      website: brand.website,
      isActive: brand.isActive,
    });

    setShowForm(true);
    setError("");
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editingBrand
        ? current.slug
        : value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
    }));
  }

  async function refreshBrands() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/brands", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load brands.");
      }

      setBrands(data.brands || []);
    } catch (err: any) {
      setError(err.message || "Failed to refresh brands.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
      };

      const response = await fetch("/api/admin/brands", {
        method: editingBrand ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          ...(editingBrand ? { id: editingBrand._id } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save brand.");
      }

      setSuccess(editingBrand ? "Brand updated successfully." : "Brand created successfully.");

      resetForm();

      await refreshBrands();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(brand: Brand) {
    if (brand.productCount > 0) {
      alert(
        `This brand is associated with ${brand.productCount} products. You must reassign those products before deleting the brand.`,
      );

      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${brand.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(brand._id);

    try {
      const response = await fetch("/api/admin/brands", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: brand._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete brand.");
      }

      setSuccess("Brand deleted successfully.");

      await refreshBrands();
    } catch (err: any) {
      setError(err.message || "Failed to delete brand.");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleStatus(brand: Brand) {
    setUpdatingId(brand._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/brands", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: brand._id,
          isActive: !brand.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update brand.");
      }

      setSuccess(brand.isActive ? "Brand deactivated." : "Brand activated.");

      await refreshBrands();
    } catch (err: any) {
      setError(err.message || "Failed to update brand.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brands</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage manufacturers and brands across your product catalogue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshBrands}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              Add Brand
            </button>
          </div>
        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Brands"
            value={brands.length}
            icon={<Tag className="h-5 w-5" />}
            color="blue"
          />

          <StatCard
            title="Active Brands"
            value={activeBrands}
            icon={<Power className="h-5 w-5" />}
            color="green"
          />

          <StatCard
            title="Inactive Brands"
            value={inactiveBrands}
            icon={<PowerOff className="h-5 w-5" />}
            color="amber"
          />

          <StatCard
            title="Products Across Brands"
            value={totalProducts.toLocaleString("en-IN")}
            icon={<Package className="h-5 w-5" />}
            color="purple"
          />
        </div>

        {/* ==================================================
            BRAND TABLE
        ================================================== */}

        <div className="overflow-hidden border border-slate-200 bg-white">
          {/* Filters */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Brand Directory</h2>

              <p className="mt-1 text-xs text-slate-500">
                Manage brand information, logos and availability.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search brands..."
                  className="w-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="all">All Brands</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[minmax(0,1fr)_90px_100px] items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:grid-cols-[60px_minmax(0,1fr)_100px_120px_130px]">
            <span className="hidden sm:block">Logo</span>
            <span>Brand</span>
            <span className="text-right">Products</span>
            <span className="hidden text-center sm:block">Status</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          {filteredBrands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Tag className="h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-sm font-semibold text-slate-700">No brands found</h3>

              <p className="mt-1 text-xs text-slate-400">
                {search ? "Try another search term." : "Create your first brand to get started."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-5 inline-flex items-center gap-2 bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  Create Brand
                </button>
              )}
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <BrandRow
                key={brand._id}
                brand={brand}
                deleting={deletingId === brand._id}
                updating={updatingId === brand._id}
                onEdit={() => openEdit(brand)}
                onDelete={() => handleDelete(brand)}
                onToggle={() => toggleStatus(brand)}
              />
            ))
          )}
        </div>
      </div>

      {/* ==================================================
          CREATE / EDIT MODAL
      ================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-slate-200 bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingBrand ? "Edit Brand" : "Create Brand"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Configure brand information and storefront visibility.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Brand name */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Brand Name *
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="e.g. Dentsply Sirona"
                  className="w-full border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">Slug *</label>

                <input
                  required
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                  placeholder="dentsply-sirona"
                  className="w-full border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-[10px] text-slate-400">Used in brand URLs.</p>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Write a short description about this brand..."
                  className="w-full resize-y border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Logo URL */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Brand Logo URL
                </label>

                <input
                  value={form.logo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      logo: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />

                {form.logo && (
                  <div className="mt-4 flex h-32 w-48 items-center justify-center border border-slate-200 bg-slate-50 p-4">
                    <img
                      src={form.logo}
                      alt="Brand logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Brand Website
                </label>

                <input
                  type="url"
                  value={form.website}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      website: event.target.value,
                    }))
                  }
                  placeholder="https://www.brand.com"
                  className="w-full border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Active */}
              <label className="flex cursor-pointer items-center gap-3 border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-blue-700"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-800">Active Brand</p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Active brands can appear in the storefront and product catalogue.
                  </p>
                </div>
              </label>

              {/* Error */}
              {error && (
                <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {saving ? "Saving..." : editingBrand ? "Update Brand" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BRAND ROW
========================================================= */

function BrandRow({
  brand,
  deleting,
  updating,
  onEdit,
  onDelete,
  onToggle,
}: {
  brand: Brand;
  deleting: boolean;
  updating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_90px_100px] items-center gap-3 border-b border-slate-100 px-4 py-4 transition-colors hover:bg-slate-50 sm:grid-cols-[60px_minmax(0,1fr)_100px_120px_130px]">
      {/* Logo */}
      <div className="hidden sm:block">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5">
          {brand.logo ? (
            <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-300" />
          )}
        </div>
      </div>

      {/* Brand */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-slate-800">{brand.name}</h3>

          <span
            className={`rounded-full px-2 py-1 text-[10px] font-medium ${
              brand.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {brand.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="mt-1 truncate text-xs text-slate-400">/{brand.slug}</p>

        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800"
          >
            <Globe className="h-3 w-3" />
            Website
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}

        {brand.description && (
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{brand.description}</p>
        )}
      </div>

      {/* Product count */}
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-700">{brand.productCount}</p>

        <p className="text-[10px] text-slate-400">Products</p>
      </div>

      {/* Status */}
      <div className="hidden text-center sm:block">
        <button
          type="button"
          onClick={onToggle}
          disabled={updating}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors disabled:opacity-50 ${
            brand.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {updating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : brand.isActive ? (
            <Power className="h-3 w-3" />
          ) : (
            <PowerOff className="h-3 w-3" />
          )}

          {brand.isActive ? "Active" : "Inactive"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-1">
        <button
          type="button"
          title="Edit brand"
          onClick={onEdit}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          title={brand.isActive ? "Deactivate brand" : "Activate brand"}
          onClick={onToggle}
          disabled={updating}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50 sm:hidden"
        >
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : brand.isActive ? (
            <PowerOff className="h-4 w-4" />
          ) : (
            <Power className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          title="Delete brand"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
