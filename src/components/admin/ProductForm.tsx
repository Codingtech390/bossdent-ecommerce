"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  ImagePlus,
  Package,
  IndianRupee,
  Layers,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
} from "lucide-react";

type Option = {
  _id: string;
  name: string;
  slug?: string;
  level?: number;
  parentId?: string | null;
};
type Specification = { key: string; value: string };
type ProductData = {
  _id?: string;
  title: string;
  slug: string;
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  specifications: Specification[];
  images: string[];
  defaultSku: string;
  basePrice: string | number;
  baseComparePrice: string | number;
  badges: string[];
  isQuotationOnly: boolean;
  totalStock: string | number;
  warrantyMonths: string | number;
  packageContents: string;
  expiryNotice: string;
  returnPolicyDays: string | number;
  active: boolean;
  provenance: string;
  // Retained for compatibility with the existing API/model, not displayed in this form.
  isFreebieEligible?: boolean;
  freebieTitle?: string;
  rewardCoins?: string | number;
  variantAttributeNames?: string[];
  variants?: unknown[];
};
const emptyProduct: ProductData = {
  title: "",
  slug: "",
  brandId: "",
  categoryId: "",
  subcategoryId: "",
  shortDescription: "",
  fullDescription: "",
  features: [],
  specifications: [],
  images: [],
  defaultSku: "",
  basePrice: "",
  baseComparePrice: "",
  badges: [],
  isQuotationOnly: false,
  totalStock: "0",
  warrantyMonths: "0",
  packageContents: "",
  expiryNotice: "",
  returnPolicyDays: "7",
  active: true,
  provenance: "Bossdent Catalogue",
  isFreebieEligible: false,
  freebieTitle: "",
  rewardCoins: 0,
  variantAttributeNames: [],
  variants: [],
};
const badgeOptions = [
  "Best Seller",
  "Hot Seller",
  "New Arrival",
  "Offer",
  "DentalKart Verified",
  "Premium",
  "Featured",
];
type Props = { mode: "create" | "edit"; initialData?: Partial<ProductData>; productId?: string };
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
const inputClass = () =>
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const labelClass = () => "mb-1.5 block text-sm font-semibold text-slate-700";
const sectionClass = () => "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";
function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon size={19} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
    </div>
  );
}

export default function ProductForm({ mode, initialData, productId }: Props) {
  const [product, setProduct] = useState<ProductData>({
    ...emptyProduct,
    ...initialData,
    images: Array.isArray(initialData?.images) ? initialData.images : [],
    features: Array.isArray(initialData?.features) ? initialData.features : [],
    specifications: Array.isArray(initialData?.specifications) ? initialData.specifications : [],
    badges: Array.isArray(initialData?.badges) ? initialData.badges : [],
  });
  const [brands, setBrands] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/product-options", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load options");
        setBrands(data.brands || []);
        setCategories(data.categories || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load options");
      } finally {
        setLoadingOptions(false);
      }
    })();
  }, []);

  const subcategories = useMemo(
    () => categories.filter((c) => c.parentId && String(c.parentId) === product.categoryId),
    [categories, product.categoryId],
  );
  const discount = useMemo(() => {
    const p = Number(product.basePrice || 0),
      c = Number(product.baseComparePrice || 0);
    return c > p && c > 0 ? Math.round(((c - p) / c) * 100) : 0;
  }, [product.basePrice, product.baseComparePrice]);

  function update<K extends keyof ProductData>(key: K, value: ProductData[K]) {
    setProduct((prev) => ({ ...prev, [key]: value }));
  }
  function updateTitle(value: string) {
    setProduct((prev) => ({
      ...prev,
      title: value,
      slug: slugManuallyEdited ? prev.slug : slugify(value),
    }));
  }
  function removeImage(i: number) {
    update(
      "images",
      product.images.filter((_, n) => n !== i),
    );
  }
  function addFeature() {
    update("features", [...product.features, ""]);
  }
  function updateFeature(i: number, v: string) {
    update(
      "features",
      product.features.map((x, n) => (n === i ? v : x)),
    );
  }
  function removeFeature(i: number) {
    update(
      "features",
      product.features.filter((_, n) => n !== i),
    );
  }
  function addSpec() {
    update("specifications", [...product.specifications, { key: "", value: "" }]);
  }
  function updateSpec(i: number, k: keyof Specification, v: string) {
    update(
      "specifications",
      product.specifications.map((x, n) => (n === i ? { ...x, [k]: v } : x)),
    );
  }
  function removeSpec(i: number) {
    update(
      "specifications",
      product.specifications.filter((_, n) => n !== i),
    );
  }
  function toggleBadge(b: string) {
    update(
      "badges",
      product.badges.includes(b) ? product.badges.filter((x) => x !== b) : [...product.badges, b],
    );
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const valid = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        setError(`${f.name}: file is not an image.`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        setError(`${f.name}: maximum image size is 10 MB.`);
        return false;
      }
      return true;
    });
    if (!valid.length) return;
    setError("");
    for (const file of valid) {
      setUploading((prev) => [...prev, file.name]);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/products/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || data.message || `Upload failed: ${file.name}`);
        const url =
          data.url || data.secure_url || data.image?.url || data.data?.url || data.result?.url;
        if (typeof url !== "string" || !url.startsWith("http"))
          throw new Error(`Upload endpoint returned no valid URL for ${file.name}`);
        setProduct((prev) => ({ ...prev, images: [...prev.images, url] }));
      } catch (e) {
        setError((prev) =>
          [prev, e instanceof Error ? e.message : `Upload failed: ${file.name}`]
            .filter(Boolean)
            .join("\n"),
        );
      } finally {
        setUploading((prev) => prev.filter((n) => n !== file.name));
      }
    }
  }
  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) void uploadFiles(e.target.files);
    e.target.value = "";
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    void uploadFiles(e.dataTransfer.files);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!product.title.trim()) return setError("Product title is required.");
    if (!product.brandId) return setError("Please select a brand.");
    if (!product.categoryId) return setError("Please select a category.");
    if (!product.defaultSku.trim()) return setError("Product SKU is required.");
    if (
      product.basePrice === "" ||
      !Number.isFinite(Number(product.basePrice)) ||
      Number(product.basePrice) < 0
    )
      return setError("Please enter a valid product price.");
    if (uploading.length) return setError("Wait for image uploads to finish before saving.");

    const payload = {
      ...product,
      basePrice: Number(product.basePrice),
      baseComparePrice:
        product.baseComparePrice === "" ? undefined : Number(product.baseComparePrice),
      totalStock: Number(product.totalStock || 0),
      warrantyMonths: Number(product.warrantyMonths || 0),
      returnPolicyDays: Number(product.returnPolicyDays || 0),
      features: product.features.filter((x) => x.trim()),
      specifications: product.specifications.filter((x) => x.key.trim() && x.value.trim()),
      images: product.images.filter((x) => x.trim()),
      // Legacy fields are sent with safe values for compatibility.
      isFreebieEligible: false,
      freebieTitle: "",
      rewardCoins: 0,
      variantAttributeNames: product.variantAttributeNames || [],
      variants: product.variants || [],
    };
    setSaving(true);
    try {
      const endpoint =
        mode === "create" ? "/api/admin/products/create" : `/api/admin/products/${productId}`;
      const res = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Unable to save product.");
      setSuccess(
        mode === "create" ? "Product created successfully!" : "Product updated successfully!",
      );
      if (mode === "create" && data.product?._id)
        window.location.href = `/admin/products/${data.product._id}/edit`;
      else window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingOptions)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin" size={22} />
          <span>Loading product form...</span>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/products"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {mode === "create" ? "Add New Product" : "Edit Product"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage product information, pricing, inventory and catalogue details.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="product-form"
            disabled={saving || uploading.length > 0}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}{" "}
            {saving ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>
      {error && (
        <div className="flex items-start gap-3 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-6">
          <section className={sectionClass()}>
            <SectionHeader
              icon={Package}
              title="Basic Information"
              description="The primary information customers see about this product."
            />
            <div className="space-y-5">
              <div>
                <label className={labelClass()}>Product Title *</label>
                <input
                  className={inputClass()}
                  placeholder="Enter product name"
                  value={product.title}
                  onChange={(e) => updateTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass()}>Product Slug</label>
                  <input
                    className={inputClass()}
                    value={product.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      update("slug", slugify(e.target.value));
                    }}
                    placeholder="product-slug"
                  />
                  <p className="mt-1 text-xs text-slate-400">Used in the product URL.</p>
                </div>
                <div>
                  <label className={labelClass()}>SKU *</label>
                  <input
                    className={inputClass()}
                    placeholder="BD-PRODUCT-001"
                    value={product.defaultSku}
                    onChange={(e) => update("defaultSku", e.target.value.toUpperCase())}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass()}>Brand *</label>
                  <select
                    className={inputClass()}
                    value={product.brandId}
                    onChange={(e) => update("brandId", e.target.value)}
                  >
                    <option value="">Select brand</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass()}>Category *</label>
                  <select
                    className={inputClass()}
                    value={product.categoryId}
                    onChange={(e) => {
                      update("categoryId", e.target.value);
                      update("subcategoryId", "");
                    }}
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter((c) => !c.parentId || String(c.parentId) === "")
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    {categories
                      .filter((c) => c.parentId && String(c.parentId) !== product.categoryId)
                      .map((c) => (
                        <option key={`all-${c._id}`} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              {subcategories.length > 0 && (
                <div>
                  <label className={labelClass()}>Subcategory</label>
                  <select
                    className={inputClass()}
                    value={product.subcategoryId}
                    onChange={(e) => update("subcategoryId", e.target.value)}
                  >
                    <option value="">None</option>
                    {subcategories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className={labelClass()}>Short Description</label>
                <textarea
                  className={inputClass()}
                  rows={3}
                  placeholder="A short summary of the product..."
                  value={product.shortDescription}
                  onChange={(e) => update("shortDescription", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass()}>Full Description</label>
                <textarea
                  className={inputClass()}
                  rows={7}
                  placeholder="Detailed product description..."
                  value={product.fullDescription}
                  onChange={(e) => update("fullDescription", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={sectionClass()}>
            <SectionHeader
              icon={ImagePlus}
              title="Product Images"
              description="Browse or drag and drop images. First image is the primary image."
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFiles}
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragging(false);
              }}
              onDrop={onDrop}
              className={`rounded-2xl border-2 border-dashed p-8 text-center ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400"}`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Upload size={24} />
              </div>
              <p className="mt-4 font-semibold text-slate-800">Drag and drop images here</p>
              <p className="mt-1 text-sm text-slate-500">or browse files from your computer</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <ImagePlus size={16} />
                Browse Images
              </button>
              <p className="mt-3 text-xs text-slate-400">Image files · Max 10 MB each</p>
            </div>
            {uploading.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploading.map((name, i) => (
                  <div
                    key={`${name}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3"
                  >
                    <Loader2 size={18} className="animate-spin text-blue-700" />
                    <span className="flex-1 truncate text-sm text-blue-800">{name}</span>
                    <span className="text-xs text-blue-600">Uploading</span>
                  </div>
                ))}
              </div>
            )}
            {product.images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {product.images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="aspect-square bg-slate-100">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-blue-700 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Remove image ${index + 1}`}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow hover:bg-red-50"
                    >
                      <X size={16} />
                    </button>
                    <div className="flex items-center justify-between gap-2 p-2">
                      <span className="truncate text-xs text-slate-500">Image {index + 1}</span>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const arr = [...product.images];
                            const [im] = arr.splice(index, 1);
                            arr.unshift(im);
                            update("images", arr);
                          }}
                          className="text-xs font-semibold text-blue-700"
                        >
                          Make primary
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              <Plus size={17} />
              Add More Images
            </button>
          </section>

          <section className={sectionClass()}>
            <SectionHeader
              icon={Layers}
              title="Features"
              description="Add key selling points of this product."
            />
            <div className="space-y-3">
              {product.features.map((feature, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    className={inputClass()}
                    placeholder={`Feature ${i + 1}`}
                    value={feature}
                    onChange={(e) => updateFeature(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Plus size={17} />
                Add Feature
              </button>
            </div>
          </section>

          <section className={sectionClass()}>
            <SectionHeader
              icon={Settings2}
              title="Specifications"
              description="Technical specifications as key-value pairs."
            />
            <div className="space-y-3">
              {product.specifications.map((s, i) => (
                <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.5fr_44px]">
                  <input
                    className={inputClass()}
                    placeholder="Specification name"
                    value={s.key}
                    onChange={(e) => updateSpec(i, "key", e.target.value)}
                  />
                  <input
                    className={inputClass()}
                    placeholder="Specification value"
                    value={s.value}
                    onChange={(e) => updateSpec(i, "value", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="flex h-11 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpec}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Plus size={17} />
                Add Specification
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className={sectionClass()}>
            <SectionHeader icon={IndianRupee} title="Pricing" />
            <div className="space-y-4">
              <div>
                <label className={labelClass()}>Selling Price *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass()}
                  placeholder="0"
                  value={product.basePrice}
                  onChange={(e) => update("basePrice", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass()}>Compare-at Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass()}
                  placeholder="0"
                  value={product.baseComparePrice}
                  onChange={(e) => update("baseComparePrice", e.target.value)}
                />
              </div>
              {discount > 0 && (
                <div className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
                  {discount}% discount
                </div>
              )}
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={product.isQuotationOnly}
                  onChange={(e) => update("isQuotationOnly", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Quotation Only</p>
                  <p className="text-xs text-slate-500">
                    Contact required instead of direct purchase.
                  </p>
                </div>
              </label>
            </div>
          </section>

          <section className={sectionClass()}>
            <SectionHeader icon={Package} title="Inventory" />
            <div className="space-y-4">
              <div>
                <label className={labelClass()}>Total Stock</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass()}
                  value={product.totalStock}
                  onChange={(e) => update("totalStock", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass()}>Warranty (Months)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass()}
                  value={product.warrantyMonths}
                  onChange={(e) => update("warrantyMonths", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass()}>Package Contents</label>
                <textarea
                  rows={3}
                  className={inputClass()}
                  value={product.packageContents}
                  onChange={(e) => update("packageContents", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass()}>Expiry Notice</label>
                <textarea
                  rows={3}
                  className={inputClass()}
                  value={product.expiryNotice}
                  onChange={(e) => update("expiryNotice", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass()}>Return Policy (Days)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass()}
                  value={product.returnPolicyDays}
                  onChange={(e) => update("returnPolicyDays", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={sectionClass()}>
            <SectionHeader icon={CheckCircle2} title="Status" />
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
              <div>
                <p className="font-semibold text-slate-800">Active Product</p>
                <p className="text-xs text-slate-500">Visible on the storefront</p>
              </div>
              <input
                type="checkbox"
                checked={product.active}
                onChange={(e) => update("active", e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-700"
              />
            </label>
            <div className="mt-4">
              <label className={labelClass()}>Product Source</label>
              <input
                className={inputClass()}
                value={product.provenance}
                onChange={(e) => update("provenance", e.target.value)}
              />
            </div>
          </section>

          <section className={sectionClass()}>
            <SectionHeader icon={Layers} title="Product Badges" />
            <div className="flex flex-wrap gap-2">
              {badgeOptions.map((b) => {
                const selected = product.badges.includes(b);
                return (
                  <button
                    type="button"
                    key={b}
                    onClick={() => toggleBadge(b)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${selected ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"}`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
            <button
              type="submit"
              disabled={saving || uploading.length > 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}{" "}
              {saving ? "Saving..." : mode === "create" ? "Create Product" : "Save Product"}
            </button>
            <Link
              href="/admin/products"
              className="mt-3 block text-center text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Cancel
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
