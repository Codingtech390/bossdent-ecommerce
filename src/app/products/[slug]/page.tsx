import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronRight, CircleDot } from "lucide-react";
import "@/models";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import { Review } from "@/models/Review";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
export const dynamic = "force-dynamic";
interface ProductPageProps {
  params: {
    slug: string;
  };
}
export default async function ProductPage({ params }: ProductPageProps) {
  await connectToDatabase();
  const product = await Product.findOne({
    slug: params.slug,
    active: true,
  })
    .populate("brand", "name slug")
    .populate("category", "name slug")
    .populate("subcategory", "name slug")
    .lean();
  if (!product) {
    notFound();
  }
  const productId = product._id;
  // Read the ID from the populated category document.*
  const populatedCategory = product.category as any;
  const categoryId = populatedCategory?._id || product.category;
  const [variants, reviews, relatedProducts] = await Promise.all([
    ProductVariant.find({
      product: productId,
      active: true,
    }).lean(),
    Review.find({
      product: productId,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .lean(),
    Product.find({
      category: categoryId,
      _id: { $ne: productId },
      active: true,
    })
      .populate("brand", "name slug")
      .limit(4)
      .lean(),
  ]);
  // Serialize MongoDB documents before passing them to the client component.*
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedVariants = JSON.parse(JSON.stringify(variants));
  const serializedReviews = JSON.parse(JSON.stringify(reviews));
  const serializedRelatedProducts = JSON.parse(JSON.stringify(relatedProducts));
  const productTitle = product.title || "Product details";
  const category = product.category as {
    name?: string;
    slug?: string;
  } | null;
  const brand = product.brand as {
    name?: string;
    slug?: string;
  } | null;
  const sku = (product as any).sku || (product as any).defaultSku || "COLLECTION";
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1ed] text-[#252522]">
      {/* =========================================*
*&#xA0;   EDITORIAL HERO / BREADCRUMB HEADER*
*========================================= */}
      <section
        className="relative isolate flex h-[50svh] min-h-[380px] max-h-[560px] items-center overflow-hidden border-b border-blue-900/20 bg-blue-950 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/bossdent-productDetails-hero-1.png')",
          backgroundPosition: "center 55%",
        }}
      >
        {/* Subtle text readability gradient — keeps the photograph visible */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-blue-900/60" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-blue-950/85 via-blue-900/55 to-blue-900/20" />
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-[300px] w-[300px] rounded-full border border-white/20 sm:h-[440px] sm:w-[440px]" />
        <div className="pointer-events-none absolute -right-10 -top-20 -z-10 h-[210px] w-[210px] rounded-full border border-white/20 sm:h-[320px] sm:w-[320px]" />
        <div className="relative mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-9 lg:px-14 lg:py-10">

          {/* Main hero content */}
          <div className="mt-8 flex flex-col justify-between gap-6 sm:mt-9 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
              <h1 className="font-serif text-[clamp(2.6rem,5vw,3.5rem)] leading-[0.98] tracking-[-0.035em] text-white">
                Thoughtfully selected.

              </h1>

            </div>

          </div>

        </div>
      </section>


      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-14 lg:pb-28">
        {/* Section label */}
        <div className="mb-7 flex items-center justify-between gap-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue-900">
            Product overview
          </p>

        </div>
        <div className="border-t border-[#ded8d3] pt-8">
          <ProductDetailClient
            product={serializedProduct}
            variants={serializedVariants}
            reviews={serializedReviews}
            relatedProducts={serializedRelatedProducts}
          />
        </div>
      </section>
      {/* =========================================*
         CLOSING BRAND STRIP*
   ========================================= */}
      <section className="relative isolate overflow-hidden mb-12" style={{
  background:
    "radial-gradient(ellipse at 20% 20%, rgba(15, 23, 42, 0.65), transparent 95%), linear-gradient(135deg, #172554, #0f172a 50%, #020617)",
}}>
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-blue-900/15" />
        <div className="relative mx-auto flex max-w-[1440px] flex-col justify-between gap-7 px-5 py-12 sm:px-8 md:flex-row md:items-center lg:px-14 lg:py-16">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white">
              Personalised assistance
            </p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight text-white sm:text-4xl">
              The right choice starts with a conversation.
            </h2>
            <p className="mt-3 max-w-lg text-xs leading-6 text-white">
              Our team can help you explore product information and find suitable solutions for your
              practice.
            </p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex w-fit shrink-0 items-center gap-4 bg-blue-900 px-7 py-4 text-[9px] font-semibold uppercase tracking-[0.19em] text-white transition-all duration-300 hover:bg-blue-950"
          >
            Speak with our team
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}
