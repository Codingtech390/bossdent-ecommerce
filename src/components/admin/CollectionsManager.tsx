"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Layers,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface CollectionItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
}

interface Props {
  initialCollections: CollectionItem[];
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  isActive: true,
  featured: false,
  sortOrder: 0,
};

export default function CollectionsManager({ initialCollections }: Props) {
  const [collections, setCollections] = useState(initialCollections);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeCount = collections.filter((collection) => collection.isActive).length;

  const inactiveCount = collections.filter((collection) => !collection.isActive).length;

  const featuredCount = collections.filter((collection) => collection.featured).length;

  const filteredCollections = useMemo(() => {
    const term = search.trim().toLowerCase();

    return collections.filter((collection) => {
      const matchesSearch =
        !term ||
        collection.name.toLowerCase().includes(term) ||
        collection.slug.toLowerCase().includes(term) ||
        collection.description.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && collection.isActive) ||
        (statusFilter === "inactive" && !collection.isActive);

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && collection.featured) ||
        (featuredFilter === "regular" && !collection.featured);

      return matchesSearch && matchesStatus && matchesFeatured;
    });
  }, [collections, search, statusFilter, featuredFilter]);

  function resetForm() {
    setForm(emptyForm);
    setEditingCollection(null);
    setShowForm(false);
    setError("");
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(collection: CollectionItem) {
    setEditingCollection(collection);

    setForm({
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
      isActive: collection.isActive,
      featured: collection.featured,
      sortOrder: collection.sortOrder,
    });

    setShowForm(true);
    setError("");
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editingCollection
        ? current.slug
        : value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
    }));
  }

  async function refreshCollections() {
    setRefreshing(true);
    setError("");

    try {
      const response = await fetch("/api/admin/collections", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch collections.");
      }

      setCollections(data.collections || []);
    } catch (err: any) {
      setError(err.message || "Failed to refresh collections.");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/collections", {
        method: editingCollection ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          ...(editingCollection ? { id: editingCollection._id } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save collection.");
      }

      setSuccess(
        editingCollection ? "Collection updated successfully." : "Collection created successfully.",
      );

      resetForm();
      await refreshCollections();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(collection: CollectionItem) {
    const confirmed = confirm(`Are you sure you want to delete "${collection.name}"?`);

    if (!confirmed) return;

    setDeletingId(collection._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/collections", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: collection._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete collection.");
      }

      setSuccess("Collection deleted successfully.");
      await refreshCollections();
    } catch (err: any) {
      setError(err.message || "Failed to delete collection.");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(collection: CollectionItem) {
    setUpdatingId(collection._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/collections", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: collection._id,
          isActive: !collection.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update collection.");
      }

      setSuccess(collection.isActive ? "Collection deactivated." : "Collection activated.");

      await refreshCollections();
    } catch (err: any) {
      setError(err.message || "Failed to update collection.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleFeatured(collection: CollectionItem) {
    setUpdatingId(collection._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/collections", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: collection._id,
          featured: !collection.featured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update collection.");
      }

      setSuccess(
        collection.featured
          ? "Collection removed from featured."
          : "Collection marked as featured.",
      );

      await refreshCollections();
    } catch (err: any) {
      setError(err.message || "Failed to update collection.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function changeSortOrder(collection: CollectionItem, direction: "up" | "down") {
    const newOrder = collection.sortOrder + (direction === "up" ? -1 : 1);

    setUpdatingId(collection._id);

    try {
      const response = await fetch("/api/admin/collections", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: collection._id,
          sortOrder: newOrder,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change sort order.");
      }

      await refreshCollections();
    } catch (err: any) {
      setError(err.message || "Failed to change sort order.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Collections</h1>

            <p className="mt-1 text-sm text-slate-500">
              Organize products into curated shopping collections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshCollections}
              disabled={refreshing}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              Add Collection
            </button>
          </div>
        </div>

        {/* ALERTS */}

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

        {/* STATISTICS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Collections"
            value={collections.length}
            icon={<Layers className="h-5 w-5" />}
            color="blue"
          />

          <StatCard
            title="Active Collections"
            value={activeCount}
            icon={<Eye className="h-5 w-5" />}
            color="green"
          />

          <StatCard
            title="Inactive Collections"
            value={inactiveCount}
            icon={<EyeOff className="h-5 w-5" />}
            color="amber"
          />

          <StatCard
            title="Featured Collections"
            value={featuredCount}
            icon={<Star className="h-5 w-5" />}
            color="purple"
          />
        </div>

        {/* TABLE */}

        <div className="overflow-hidden border border-slate-200 bg-white">
          {/* Filters */}

          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Collection Directory</h2>

              <p className="mt-1 text-xs text-slate-500">
                Manage collection images, visibility and ordering.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search collections..."
                  className="w-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={featuredFilter}
                onChange={(event) => setFeaturedFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Collections</option>
                <option value="featured">Featured</option>
                <option value="regular">Regular</option>
              </select>
            </div>
          </div>

          {/* Table heading */}

          <div className="grid grid-cols-[minmax(0,1fr)_90px_120px] items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:grid-cols-[70px_minmax(0,1fr)_90px_110px_120px_130px]">
            <span className="hidden sm:block">Image</span>
            <span>Collection</span>
            <span className="text-center">Order</span>
            <span className="hidden text-center sm:block">Featured</span>
            <span className="hidden text-center sm:block">Status</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}

          {filteredCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Layers className="h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-sm font-semibold text-slate-700">No collections found</h3>

              <p className="mt-1 text-xs text-slate-400">
                {search ? "Try another search." : "Create your first collection."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-5 inline-flex items-center gap-2 bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  Create Collection
                </button>
              )}
            </div>
          ) : (
            filteredCollections.map((collection) => (
              <CollectionRow
                key={collection._id}
                collection={collection}
                updating={updatingId === collection._id}
                deleting={deletingId === collection._id}
                onEdit={() => openEdit(collection)}
                onDelete={() => handleDelete(collection)}
                onToggleActive={() => toggleActive(collection)}
                onToggleFeatured={() => toggleFeatured(collection)}
                onMoveUp={() => changeSortOrder(collection, "up")}
                onMoveDown={() => changeSortOrder(collection, "down")}
              />
            ))
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-slate-200 bg-white shadow-2xl">
            {/* Modal header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCollection ? "Edit Collection" : "Create Collection"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Configure collection details and storefront visibility.
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
              {/* Name */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Collection Name *
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="e.g. Best Sellers"
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
                  placeholder="best-sellers"
                  className="w-full border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-[10px] text-slate-400">Used in collection URLs.</p>
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
                  placeholder="Describe this collection..."
                  className="w-full resize-y border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Image URL */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Collection Image URL
                </label>

                <input
                  value={form.image}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      image: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />

                {form.image && (
                  <div className="mt-4 flex h-40 w-full items-center justify-center overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={form.image}
                      alt="Collection preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Sort order */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Sort Order
                </label>

                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: Number(event.target.value) || 0,
                    }))
                  }
                  className="w-full border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-[10px] text-slate-400">Lower numbers appear first.</p>
              </div>

              {/* Featured */}

              <label className="flex cursor-pointer items-center gap-3 border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      featured: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-blue-700"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-800">Featured Collection</p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Highlight this collection on the storefront.
                  </p>
                </div>
              </label>

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
                  <p className="text-xs font-semibold text-slate-800">Active Collection</p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Active collections are eligible to appear on the storefront.
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

                  {saving
                    ? "Saving..."
                    : editingCollection
                      ? "Update Collection"
                      : "Create Collection"}
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
  const colors = {
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

        <div className={`flex h-11 w-11 items-center justify-center ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

/* =========================================================
   COLLECTION ROW
========================================================= */

function CollectionRow({
  collection,
  updating,
  deleting,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  onMoveUp,
  onMoveDown,
}: {
  collection: CollectionItem;
  updating: boolean;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_90px_120px] items-center gap-3 border-b border-slate-100 px-4 py-4 transition-colors hover:bg-slate-50 sm:grid-cols-[70px_minmax(0,1fr)_90px_110px_120px_130px]">
      {/* Image */}

      <div className="hidden sm:block">
        <div className="flex h-12 w-16 items-center justify-center overflow-hidden border border-slate-200 bg-white">
          {collection.image ? (
            <img
              src={collection.image}
              alt={collection.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-300" />
          )}
        </div>
      </div>

      {/* Collection */}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-slate-800">{collection.name}</h3>

          {collection.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}

          <span
            className={`rounded-full px-2 py-1 text-[10px] font-medium ${
              collection.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {collection.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="mt-1 truncate text-xs text-slate-400">/{collection.slug}</p>

        {collection.description && (
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{collection.description}</p>
        )}
      </div>

      {/* Sort */}

      <div className="flex items-center justify-center gap-1">
        <span className="text-xs font-semibold text-slate-700">{collection.sortOrder}</span>

        <div className="flex flex-col">
          <button
            type="button"
            title="Move up"
            onClick={onMoveUp}
            disabled={updating}
            className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-40"
          >
            <ArrowUp className="h-3 w-3" />
          </button>

          <button
            type="button"
            title="Move down"
            onClick={onMoveDown}
            disabled={updating}
            className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-40"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Featured */}

      <div className="hidden text-center sm:block">
        <button
          type="button"
          onClick={onToggleFeatured}
          disabled={updating}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium disabled:opacity-50 ${
            collection.featured
              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {updating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Star className={`h-3 w-3 ${collection.featured ? "fill-current" : ""}`} />
          )}

          {collection.featured ? "Featured" : "No"}
        </button>
      </div>

      {/* Status */}

      <div className="hidden text-center sm:block">
        <button
          type="button"
          onClick={onToggleActive}
          disabled={updating}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium disabled:opacity-50 ${
            collection.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {updating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : collection.isActive ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}

          {collection.isActive ? "Active" : "Inactive"}
        </button>
      </div>

      {/* Actions */}

      <div className="flex justify-end gap-1">
        <button
          type="button"
          title="Edit collection"
          onClick={onEdit}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Delete collection"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
