"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function getId(value: any): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return String(value._id || value.id || "");
}

function normalizeProduct(product: any, variants: any[]) {
  return {
    _id: product._id,

    title: product.title || "",
    slug: product.slug || "",

    brandId: getId(product.brand),
    categoryId: getId(product.category),
    subcategoryId: getId(product.subcategory),

    shortDescription: product.shortDescription || "",

    fullDescription: product.fullDescription || "",

    features: product.features || [],

    specifications: product.specifications || [],

    images: product.images || [],

    defaultSku: product.defaultSku || "",

    basePrice: String(product.basePrice ?? ""),

    baseComparePrice:
      product.baseComparePrice === undefined || product.baseComparePrice === null
        ? ""
        : String(product.baseComparePrice),

    badges: product.badges || [],

    isQuotationOnly: Boolean(product.isQuotationOnly),

    isFreebieEligible: Boolean(product.isFreebieEligible),

    freebieTitle: product.freebieTitle || "",

    rewardCoins: String(product.rewardCoins ?? 20),

    totalStock: String(product.totalStock ?? 0),

    warrantyMonths: String(product.warrantyMonths ?? 0),

    packageContents: product.packageContents || "",

    expiryNotice: product.expiryNotice || "",

    returnPolicyDays: String(product.returnPolicyDays ?? 7),

    active: product.active !== false,

    provenance: product.provenance || "Bossdent Catalogue",

    variantAttributeNames: product.variantAttributeNames || [],

    variants: (variants || []).map((variant: any) => ({
      _id: variant._id,

      sku: variant.sku || "",
      title: variant.title || "Default",

      attributes:
        variant.attributes instanceof Map
          ? Object.fromEntries(variant.attributes)
          : variant.attributes || {},

      price: String(variant.price ?? 0),

      comparePrice:
        variant.comparePrice === undefined || variant.comparePrice === null
          ? ""
          : String(variant.comparePrice),

      stock: String(variant.stock ?? 0),

      image: variant.image || "",
      barcode: variant.barcode || "",

      active: variant.active !== false,
    })),
  };
}

export default function EditProductPage() {
  const params = useParams();

  const id = String(params.id || "");

  const [product, setProduct] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadProduct() {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load product.");
        }

        setProduct(normalizeProduct(data.product, data.variants));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load product.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin" />
          Loading product...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8">
        <div className="flex items-start gap-3 text-red-600">
          <AlertCircle size={22} />

          <div>
            <h2 className="font-bold">Unable to load product</h2>

            <p className="mt-2 text-sm text-slate-600">{error || "Product not found."}</p>
          </div>
        </div>

        <Link
          href="/admin/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>
    );
  }

  return <ProductForm mode="edit" productId={id} initialData={product} />;
}
