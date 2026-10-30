import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import { Review } from "@/models/Review";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  await connectToDatabase();

  const product = await Product.findOne({ slug: params.slug, active: true })
    .populate("brand", "name slug")
    .populate("category", "name slug")
    .populate("subcategory", "name slug")
    .lean();

  if (!product) {
    notFound();
  }

  const [variants, reviews, relatedProducts] = await Promise.all([
    ProductVariant.find({ product: product._id, active: true }).lean(),
    Review.find({ product: product._id, status: "approved" }).sort({ createdAt: -1 }).lean(),
    Product.find({
      category: product.category,
      _id: { $ne: product._id },
      active: true,
    })
      .populate("brand", "name slug")
      .limit(4)
      .lean(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-dk-teal-800">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        {product.category && (
          <>
            <Link href={`/categories/${(product.category as any).slug}`} className="hover:text-dk-teal-800">
              {(product.category as any).name}
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </>
        )}
        <span className="font-bold text-slate-900 truncate max-w-xs">{product.title}</span>
      </div>

      <ProductDetailClient
        product={JSON.parse(JSON.stringify(product))}
        variants={JSON.parse(JSON.stringify(variants))}
        reviews={JSON.parse(JSON.stringify(reviews))}
        relatedProducts={JSON.parse(JSON.stringify(relatedProducts))}
      />
    </div>
  );
}
