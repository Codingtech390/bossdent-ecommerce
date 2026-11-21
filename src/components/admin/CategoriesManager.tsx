"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Layers,
  Package,
  Image as ImageIcon,
  Star,
  ChevronDown,
  ChevronRight,
  X,
  Save,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  level: number;
  order: number;
  icon: string;
  image: string;
  banner: string;
  isFeatured: boolean;
  productCount: number;
  createdAt: string;
}

interface Props {
  initialCategories: Category[];
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  order: 0,
  icon: "",
  image: "",
  banner: "",
  isFeatured: false,
};

export default function CategoriesManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const rootCategories = useMemo(
    () => categories.filter((category) => category.level === 0),
    [categories],
  );

  const categoryTree = useMemo(() => {
    const roots = categories
      .filter((category) => !category.parentId)
      .sort((a, b) => a.order - b.order);

    return roots.map((root) => ({
      ...root,
      children: categories
        .filter((category) => category.parentId === root._id)
        .sort((a, b) => a.order - b.order),
    }));
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return categoryTree;

    return categoryTree
      .map((root) => {
        const rootMatches =
          root.name.toLowerCase().includes(term) || root.slug.toLowerCase().includes(term);

        const matchingChildren = root.children.filter(
          (child) =>
            child.name.toLowerCase().includes(term) || child.slug.toLowerCase().includes(term),
        );

        if (rootMatches) return root;

        if (matchingChildren.length > 0) {
          return {
            ...root,
            children: matchingChildren,
          };
        }

        return null;
      })
      .filter(Boolean) as typeof categoryTree;
  }, [categoryTree, search]);

  const totalProducts = categories.reduce((total, category) => total + category.productCount, 0);

  const featuredCount = categories.filter((category) => category.isFeatured).length;

  function resetForm() {
    setForm(emptyForm);
    setEditingCategory(null);
    setShowForm(false);
    setError("");
  }

  function openCreate(parentId = "") {
    resetForm();

    setForm({
      ...emptyForm,
      parentId,
    });

    setShowForm(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId || "",
      order: category.order,
      icon: category.icon,
      image: category.image,
      banner: category.banner,
      isFeatured: category.isFeatured,
    });

    setShowForm(true);
    setError("");
  }

  function toggleExpanded(id: string) {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editingCategory
        ? current.slug
        : value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
    }));
  }

  async function refreshCategories() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/categories", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load categories.");
      }

      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || "Failed to refresh categories.");
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
        order: Number(form.order),
        parentId: form.parentId || null,
      };

      const response = await fetch("/api/admin/categories", {
        method: editingCategory ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          ...(editingCategory ? { id: editingCategory._id } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save category.");
      }

      setSuccess(
        editingCategory ? "Category updated successfully." : "Category created successfully.",
      );

      resetForm();

      await refreshCategories();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const hasChildren = categories.some((item) => item.parentId === category._id);

    if (hasChildren) {
      alert("This category has subcategories. Remove or reassign the subcategories first.");
      return;
    }

    if (category.productCount > 0) {
      alert(
        `This category has ${category.productCount} products associated with it. It cannot be deleted until those products are reassigned.`,
      );
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(category._id);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: category._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete category.");
      }

      setSuccess("Category deleted successfully.");

      await refreshCategories();
    } catch (err: any) {
      setError(err.message || "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  function CategoryRow({ category, child = false }: { category: Category; child?: boolean }) {
    const hasChildren = categories.some((item) => item.parentId === category._id);

    const expanded = expandedIds.includes(category._id);

    return (
      <>
        <div
          className={`group flex items-center gap-3 border-b border-slate-100 px-4 py-4 transition-colors hover:bg-slate-50 ${
            child ? "bg-slate-50/50" : ""
          }`}
        >
          <div className="flex w-8 shrink-0 justify-center">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpanded(category._id)}
                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="text-slate-300">—</span>
            )}
          </div>

          {child && <div className="h-8 w-px shrink-0 bg-slate-200" />}

          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-slate-800">{category.name}</h3>

              {category.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </span>
              )}

              <span className="rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                Level {category.level}
              </span>
            </div>

            <p className="mt-1 truncate text-xs text-slate-400">/{category.slug}</p>

            {category.description && (
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{category.description}</p>
            )}
          </div>

          <div className="hidden min-w-[90px] text-right sm:block">
            <p className="text-sm font-semibold text-slate-700">{category.productCount}</p>
            <p className="text-[10px] text-slate-400">Products</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {!child && (
              <button
                type="button"
                title="Add subcategory"
                onClick={() => openCreate(category._id)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              title="Edit category"
              onClick={() => openEdit(category)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              title="Delete category"
              disabled={deletingId === category._id}
              onClick={() => handleDelete(category)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {deletingId === category._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {expanded && hasChildren && (
          <div className="border-b border-slate-100 bg-slate-50/60">
            {categories
              .filter((item) => item.parentId === category._id)
              .sort((a, b) => a.order - b.order)
              .map((subcategory) => (
                <CategoryRow key={subcategory._id} category={subcategory} child />
              ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>

            <p className="mt-1 text-sm text-slate-500">
              Organize your product catalogue into categories and subcategories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshCategories}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => openCreate()}
              className="inline-flex items-center gap-2 bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Alerts */}
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

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Categories</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{categories.length}</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center bg-blue-50 text-blue-700">
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Products Categorized</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalProducts.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center bg-emerald-50 text-emerald-700">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Featured Categories</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{featuredCount}</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center bg-amber-50 text-amber-700">
                <Star className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Category Table */}
        <div className="overflow-hidden border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Category Directory</h2>
              <p className="mt-1 text-xs text-slate-500">
                Manage category hierarchy, images, visibility and ordering.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                className="w-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-[32px_minmax(0,1fr)_90px_100px] items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:grid-cols-[32px_60px_minmax(0,1fr)_100px_120px]">
            <span></span>
            <span className="hidden sm:block">Image</span>
            <span>Category</span>
            <span className="text-right">Products</span>
            <span className="text-right">Actions</span>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Layers className="h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-sm font-semibold text-slate-700">No categories found</h3>

              <p className="mt-1 text-xs text-slate-400">
                {search ? "Try another search term." : "Create your first category to get started."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() => openCreate()}
                  className="mt-5 inline-flex items-center gap-2 bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  Create Category
                </button>
              )}
            </div>
          ) : (
            filteredCategories.map((category) => (
              <CategoryRow key={category._id} category={category} />
            ))
          )}
        </div>
      </div>

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCategory ? "Edit Category" : "Create Category"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Configure category information and hierarchy.
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

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Name */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Category Name *
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="e.g. Dental Instruments"
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
                  placeholder="dental-instruments"
                  className="w-full border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-[10px] text-slate-400">Used in category URLs.</p>
              </div>

              {/* Parent */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Parent Category
                </label>

                <select
                  value={form.parentId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      parentId: event.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">None — Main Category</option>

                  {rootCategories
                    .filter((category) => category._id !== editingCategory?._id)
                    .map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe this category..."
                  className="w-full resize-y border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Image */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Category Image URL
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
                  <div className="mt-3 h-36 w-36 overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={form.image}
                      alt="Category preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Banner */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Banner Image URL
                </label>

                <input
                  value={form.banner}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      banner: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">Icon</label>

                <input
                  value={form.icon}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      icon: event.target.value,
                    }))
                  }
                  placeholder="Optional icon name"
                  className="w-full border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Order */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Display Order
                </label>

                <input
                  type="number"
                  value={form.order}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      order: Number(event.target.value),
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
                  checked={form.isFeatured}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isFeatured: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-blue-700"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-800">Featured Category</p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Show this category in featured areas of the storefront.
                  </p>
                </div>
              </label>

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

                  {saving ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
