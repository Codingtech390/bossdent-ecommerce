import React from "react";
import Link from "next/link";
import Image from "next/image";
import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/models/Brand";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { SiteBanner } from "@/models/SiteBanner";
import { ProductCard } from "@/components/product/ProductCard";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Flame,
  Gift,
  Building2,
  Percent,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getHomepageData() {
  await connectToDatabase();

  const [banners, categories, brands, bestSellers, hotDeals, newArrivals, freebies] =
    await Promise.all([
      SiteBanner.find({ active: true }).sort({ order: 1 }).lean(),
      Category.find({ level: 0 }).sort({ order: 1 }).lean(),
      Brand.find({ isFeatured: true }).sort({ productCount: -1 }).limit(10).lean(),
      Product.find({ active: true, badges: "Best Seller" })
        .populate("brand", "name slug")
        .limit(8)
        .lean(),
      Product.find({ active: true, discountPercent: { $gt: 20 } })
        .populate("brand", "name slug")
        .limit(8)
        .lean(),
      Product.find({ active: true })
        .populate("brand", "name slug")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Product.find({ active: true, isFreebieEligible: true })
        .populate("brand", "name slug")
        .limit(4)
        .lean(),
    ]);

  return {
    banners: JSON.parse(JSON.stringify(banners)),
    categories: JSON.parse(JSON.stringify(categories)),
    brands: JSON.parse(JSON.stringify(brands)),
    bestSellers: JSON.parse(JSON.stringify(bestSellers)),
    hotDeals: JSON.parse(JSON.stringify(hotDeals)),
    newArrivals: JSON.parse(JSON.stringify(newArrivals)),
    freebies: JSON.parse(JSON.stringify(freebies)),
  };
}

export default async function HomePage() {
  const {
    banners,
    categories,
    brands,
    bestSellers,
    hotDeals,
    newArrivals,
    freebies,
  } = await getHomepageData();

  const heroBanner = banners[0] || {
    title: "Mega Dental Savings Festival",
    subtitle: "Up to 55% Off on World-Class Composites, Handpieces & Rotary Files",
    badge: "LIMITED TIME OFFER",
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80",
    linkUrl: "/offers",
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero Promotional Banner */}
      <section className="relative bg-gradient-to-r from-dk-teal-900 via-dk-teal-800 to-dk-teal-950 text-white overflow-hidden py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-dk-orange-500 text-white uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> {heroBanner.badge || "SPECIAL CLINICAL OFFER"}
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              {heroBanner.title}
            </h1>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed">
              {heroBanner.subtitle}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href={heroBanner.linkUrl || "/offers"}
                className="px-6 py-3 bg-dk-orange-500 hover:bg-dk-orange-600 text-white font-bold rounded-lg text-sm transition-colors shadow-lg flex items-center gap-2"
              >
                Shop Festive Deals <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/membership"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                Join DentalKart Plus
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-md h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
            <Image
              src={heroBanner.imageUrl}
              alt="DentalKart Hero Promotion"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. Top Dental Specialties Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Top Dental Categories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore specialized consumables, rotary tools, and instruments
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-bold text-dk-teal-800 hover:text-dk-teal-950 flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat: { _id: string; slug: string; name: string }) => (
            <Link
              key={cat._id}
              href={`/categories/${cat.slug}`}
              className="group p-3 rounded-xl bg-white border border-slate-200 hover:border-dk-teal-600 hover:shadow-md transition-all flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-dk-teal-50 group-hover:bg-dk-teal-100 flex items-center justify-center text-dk-teal-800 mb-2 transition-colors">
                <span className="font-black text-base">{cat.name.charAt(0)}</span>
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-dk-teal-900 leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Brands Strip */}
      <section className="bg-white py-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Authorised Brand Partners
            </h3>
            <Link href="/brands" className="text-xs font-bold text-dk-orange-600 hover:underline">
              View All 450+ Brands →
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {brands.map((brand: { _id: string; slug: string; name: string }) => (
              <Link
                key={brand._id}
                href={`/brands/${brand.slug}`}
                className="px-4 py-2 rounded-lg border border-slate-100 hover:border-dk-teal-300 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 hover:text-dk-teal-900 shadow-sm transition-all"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Hot &amp; Best Sellers
              </h2>
              <p className="text-xs text-slate-500">Most re-ordered dental products by Indian clinics</p>
            </div>
          </div>
          <Link
            href="/best-sellers"
            className="text-xs font-bold text-dk-teal-800 hover:text-dk-teal-950 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {bestSellers.map((product: { _id: string; [key: string]: unknown }) => (
            <ProductCard key={product._id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 5. Freebies Highlight: Gifts at ₹1 */}
      {freebies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl text-white p-6 md:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900">
                  <Gift className="w-3.5 h-3.5" /> DENTALKART FREEBIES ZONE
                </span>
                <h3 className="text-2xl md:text-3xl font-black">
                  Claim Clinical Gifts &amp; Instruments at ₹1
                </h3>
                <p className="text-xs md:text-sm text-emerald-100">
                  Every month, DentalKart adds premium diagnostic instruments, burs, and consumables that doctors can add to their order for just ₹1!
                </p>
                <div className="pt-2">
                  <Link
                    href="/freebies"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-900 font-bold rounded-lg text-xs hover:bg-emerald-50 transition-colors"
                  >
                    Explore Freebies <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                {freebies.slice(0, 2).map((item: any) => (
                  <div
                    key={item._id}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex items-center gap-3"
                  >
                    <div className="w-14 h-14 relative rounded-lg bg-white overflow-hidden flex-shrink-0">
                      <Image
                        src={item.images[0] || ""}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-amber-300 font-bold uppercase block">
                        Gift at ₹1
                      </span>
                      <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                      <span className="text-xs font-bold text-emerald-300">₹1 Only</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. High-Discount Offer Zone */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
              <Percent className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Offer Zone Specials
              </h2>
              <p className="text-xs text-slate-500">Heavily discounted bulk and bundle pricing</p>
            </div>
          </div>
          <Link
            href="/offers"
            className="text-xs font-bold text-dk-teal-800 hover:text-dk-teal-950 flex items-center gap-1"
          >
            All Offers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {hotDeals.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. New Clinic Setup Services Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl text-white grid grid-cols-1 md:grid-cols-2 border border-slate-800">
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-dk-orange-400 uppercase tracking-widest">
              <Building2 className="w-4 h-4" /> Dental Practice Turnkey Solutions
            </span>
            <h2 className="text-2xl md:text-4xl font-black leading-tight">
              Setting Up a New Dental Clinic?
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              DentalKart provides turnkey equipment sourcing, custom dental chairs, silent compressors, digital autoclaves, and complete instrument packages with nationwide engineer installation and warranty support.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Free clinic layout &amp; plumbing consultation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Exclusive package savings up to ₹1,50,000
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Comprehensive 1-year doorstep engineer warranty
              </li>
            </ul>
            <div className="pt-3">
              <Link
                href="/clinic-setup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-dk-orange-500 hover:bg-dk-orange-600 text-white font-bold rounded-lg text-xs md:text-sm shadow-md transition-colors"
              >
                Book Free Consultation <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative min-h-[250px] md:min-h-full bg-slate-800">
            <Image
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
              alt="New Dental Clinic Setup"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 8. DentalKart Plus Membership Strip */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white text-amber-800">
              <Sparkles className="w-3.5 h-3.5 fill-amber-500" /> DENTALKART PLUS
            </span>
            <h3 className="text-2xl md:text-3xl font-black">
              Double Your Savings with DentalKart Plus
            </h3>
            <p className="text-xs md:text-sm text-amber-100">
              Enjoy 2x Dentacoins on all consumables, FREE delivery above ₹499, and up to 20% coin redemption at checkout. Only ₹999/year.
            </p>
          </div>
          <Link
            href="/membership"
            className="px-6 py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs md:text-sm shadow-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            Upgrade to Plus Club <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
