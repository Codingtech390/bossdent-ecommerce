import Link from "next/link";
import Image from "next/image";
import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/models/Brand";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { SiteBanner } from "@/models/SiteBanner";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Gift, MoveUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

type ProductRecord = {
  _id: string;
  [key: string]: unknown;
};

async function getHomepageData() {
  await connectToDatabase();

  const [banners, categories, brands, bestSellers, hotDeals, newArrivals, freebies] =
    await Promise.all([
      SiteBanner.find({ active: true }).sort({ order: 1 }).lean(),
      Category.find({ level: 0 }).sort({ order: 1 }).lean(),
      Brand.find({ isFeatured: true }).sort({ productCount: -1 }).limit(8).lean(),
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

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Explore collection",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-9 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">
          {eyebrow}
        </p>
        <h2 className="font-serif text-3xl font-normal leading-[1.12] tracking-[-0.035em] text-[#252522] sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600 md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex w-fit items-center gap-3 border-b border-stone-400 pb-2 text-xs font-semibold text-[#292925] transition-colors hover:border-[#9b8d7d] hover:text-stone-500"
        >
          {linkLabel}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

export default async function HomePage() {
  const { banners, categories, brands, bestSellers, hotDeals, newArrivals, freebies } =
    await getHomepageData();

  const heroBanner = banners[0] || {
    title: "The right tools for better dentistry.",
    subtitle:
      "Discover thoughtfully selected dental materials, instruments and technology for every stage of your practice.",
    badge: "A MORE CONSIDERED WAY TO SHOP DENTAL",
    imageUrl:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1800&q=85",
    linkUrl: "/categories",
  };

  return (
    <main className="overflow-hidden bg-[#f7f6f2] text-[#292925]">
      {/* Editorial hero */}
      <section className="bossdent-hero relative isolate min-h-[660px] md:min-h-[720px]">
        <div className="bossdent-hero-media" aria-hidden="true">
          <Image
            src={heroBanner.imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroBanner.imageUrl}
            aria-hidden="true"
          >
            <source src="/videos/bossdent-banner-video.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative mx-auto flex min-h-[660px] max-w-[1440px] items-center px-6 py-24 sm:px-10 md:min-h-[720px] md:px-16 lg:px-24">
          <div className="max-w-[680px]">
            <p className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-600">
              <span className="h-px w-9 bg-stone-500" />
              {heroBanner.badge || "DENTAL SUPPLIES, RECONSIDERED"}
            </p>
            <h1 className="max-w-[660px] font-serif text-5xl font-normal leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl md:text-7xl lg:text-[82px]">
              {heroBanner.title}
            </h1>
            <p className="mt-7 max-w-[490px] text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
              {heroBanner.subtitle}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link
                href={heroBanner.linkUrl || "/categories"}
                className="group inline-flex min-h-12 items-center gap-8 bg-[#918594] px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#786b7b]"
              >
                Explore collection
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              <Link
                href="/brands"
                className="group inline-flex items-center gap-2 border-b border-white/70 pb-1.5 text-xs font-semibold text-white hover:border-white"
              >
                Discover our brands
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-16 grid max-w-[490px] grid-cols-3 border-t border-white/40 pt-6">
              <div>
                <p className="font-serif text-3xl tracking-tight text-white">450+</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/70">Brands</p>
              </div>
              <div className="border-l border-white/40 pl-5">
                <p className="font-serif text-3xl tracking-tight text-white">20K+</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/70">
                  Products
                </p>
              </div>
              <div className="border-l border-white/40 pl-5">
                <p className="font-serif text-3xl tracking-tight text-white">Pro</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/70">
                  Dental solutions
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-white/75 md:flex">
          Scroll to discover <ArrowDownRight className="h-4 w-4" />
        </div>
      </section>

      {/* Intro / brand positioning */}
      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-24 sm:px-10 md:grid-cols-[0.8fr_1.2fr] md:px-16 md:py-32 lg:px-24">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">
            A partner in your practice
          </p>
          <div className="mt-7 h-px w-16 bg-stone-400" />
        </div>
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl font-normal leading-[1.18] tracking-[-0.035em] text-[#292925] sm:text-4xl md:text-5xl">
            Everything you need to deliver exceptional care, thoughtfully brought together.
          </h2>
          <p className="mt-7 max-w-2xl text-sm leading-8 text-stone-600 md:text-base">
            From everyday essentials to advanced clinical technology, discover a considered range of
            products from established dental manufacturers — selected to support the people and
            practices behind every smile.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-3 border-b border-stone-400 pb-2 text-xs font-semibold hover:border-[#292925]"
          >
            Get to know Bossdent <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#eeece6] py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24">
          <SectionHeading
            eyebrow="Explore our collections"
            title="The essentials of modern dentistry."
            description="Browse carefully organised collections across clinical materials, instruments, equipment and specialist dental technologies."
            href="/categories"
            linkLabel="View all categories"
          />
          <div className="grid grid-cols-2 gap-px bg-stone-300 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat: { _id: string; slug: string; name: string }, index: number) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="group flex min-h-[170px] flex-col justify-between bg-[#eeece6] p-5 transition-colors duration-300 hover:bg-[#e3e0d8] sm:min-h-[205px] sm:p-7"
              >
                <span className="font-serif text-sm text-stone-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex items-end justify-between gap-3">
                  <span className="max-w-[190px] font-serif text-xl leading-tight tracking-[-0.02em] text-[#292925] sm:text-2xl">
                    {cat.name}
                  </span>
                  <ArrowUpRight className="mb-1 h-4 w-4 shrink-0 text-stone-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured brands */}
      <section className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 md:px-16 md:py-28 lg:px-24">
        <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr] md:items-start">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              The names behind the work
            </p>
            <h2 className="mt-5 max-w-sm font-serif text-3xl font-normal leading-tight tracking-[-0.035em] sm:text-4xl">
              Brands trusted by dental professionals.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-stone-600">
              Explore an extensive selection of established manufacturers and specialist brands
              across the dental industry.
            </p>
            <Link
              href="/brands"
              className="mt-7 inline-flex items-center gap-3 border-b border-stone-400 pb-2 text-xs font-semibold"
            >
              Explore all brands <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 border-l border-t border-stone-300 sm:grid-cols-3">
            {brands.map((brand: { _id: string; slug: string; name: string }) => (
              <Link
                key={brand._id}
                href={`/brands/${brand.slug}`}
                className="group flex min-h-28 items-center justify-between border-b border-r border-stone-300 px-5 py-6 transition-colors hover:bg-[#eeece6] sm:min-h-32 sm:px-7"
              >
                <span className="font-serif text-lg text-[#393832] sm:text-xl">{brand.name}</span>
                <MoveUpRight className="h-4 w-4 text-stone-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="bg-[#eeece6] py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24">
          <SectionHeading
            eyebrow="Selected by professionals"
            title="A closer look at our best sellers."
            description="Discover frequently chosen products from across our professional dental range."
            href="/best-sellers"
            linkLabel="View best sellers"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {bestSellers.map((product: ProductRecord) => (
              <ProductCard key={product._id} product={product as any} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial technology feature */}
      <section className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 md:px-16 md:py-32 lg:px-24">
        <div className="grid overflow-hidden bg-[#e7e4dc] md:grid-cols-2">
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 md:px-16 md:py-20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Tools for what comes next
            </p>
            <h2 className="mt-6 font-serif text-4xl font-normal leading-[1.1] tracking-[-0.04em] sm:text-5xl">
              Technology that moves dentistry forward.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-8 text-stone-600">
              Explore equipment and digital solutions designed to support precision, efficiency and
              evolving clinical workflows.
            </p>
            <Link
              href="/categories"
              className="mt-8 inline-flex w-fit items-center gap-4 border-b border-stone-500 pb-2 text-xs font-semibold"
            >
              Discover dental technology <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-[340px] md:min-h-[560px]">
            <Image
              src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1400&q=85"
              alt="Modern dental technology and clinical equipment"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 ? (
        <section className="mx-auto max-w-[1440px] px-6 pb-20 sm:px-10 md:px-16 md:pb-28 lg:px-24">
          <SectionHeading
            eyebrow="Recently added"
            title="New to the collection."
            description="Take a look at the latest additions to our dental product range."
            href="/new-arrivals"
            linkLabel="Discover new arrivals"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {newArrivals.map((product: ProductRecord) => (
              <ProductCard key={product._id} product={product as any} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Offers / editorial promo */}
      <section className="bg-[#292925] text-[#f7f6f2]">
        <div className="mx-auto grid max-w-[1440px] md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 md:px-16 md:py-24 lg:px-24">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-400">
              Thoughtful value
            </p>
            <h2 className="mt-6 max-w-lg font-serif text-4xl font-normal leading-[1.1] tracking-[-0.035em] sm:text-5xl">
              Exceptional essentials. Considered offers.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-8 text-stone-300">
              Explore selected offers, bundles and promotions across our dental range. Find the
              right products for your practice at compelling value.
            </p>
            <Link
              href="/offers"
              className="mt-8 inline-flex w-fit items-center gap-4 border-b border-stone-500 pb-2 text-xs font-semibold text-white"
            >
              Explore current offers <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2">
            {hotDeals.slice(0, 2).map((product: ProductRecord) => (
              <div key={product._id} className="border-l border-stone-700 p-3 sm:p-5">
                <ProductCard product={product as any} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Freebies */}
      {freebies.length > 0 ? (
        <section className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 md:px-16 md:py-28 lg:px-24">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                <Gift className="h-4 w-4" /> A little extra
              </p>
              <h2 className="mt-5 font-serif text-4xl font-normal leading-tight tracking-[-0.035em] sm:text-5xl">
                Something thoughtful with your order.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-8 text-stone-600">
                Discover eligible gifts and special additions available through our Freebies
                collection.
              </p>
              <Link
                href="/freebies"
                className="mt-8 inline-flex items-center gap-3 border-b border-stone-400 pb-2 text-xs font-semibold"
              >
                Explore freebies <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {freebies.slice(0, 2).map((item: any) => (
                <Link key={item._id} href={`/product/${item.slug}`} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#eeece6]">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title || "Dental product"}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain p-5 transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Eligible gift
                  </p>
                  <h3 className="mt-1 font-serif text-lg text-[#292925]">{item.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Clinic setup */}
      <section className="bg-[#e9e6df]">
        <div className="mx-auto grid max-w-[1440px] md:grid-cols-2">
          <div className="relative min-h-[360px] md:min-h-[620px]">
            <Image
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=85"
              alt="Modern dental practice"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 md:px-16 md:py-24 lg:px-24">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Beyond the product
            </p>
            <h2 className="mt-6 font-serif text-4xl font-normal leading-[1.1] tracking-[-0.035em] sm:text-5xl">
              Bringing your new practice to life.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-8 text-stone-600">
              Planning a new clinic? Explore equipment sourcing, practice essentials and
              consultation support for your setup journey.
            </p>
            <ul className="mt-7 space-y-3 text-xs text-stone-700">
              {[
                "Equipment and instrument planning",
                "Solutions tailored to your practice",
                "Guidance for your clinic setup",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-stone-500" />
                  {benefit}
                </li>
              ))}
            </ul>
            <Link
              href="/clinic-setup"
              className="mt-9 inline-flex w-fit items-center gap-4 border-b border-stone-500 pb-2 text-xs font-semibold"
            >
              Explore clinic setup <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Membership */}
      <section className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 md:px-16 md:py-28 lg:px-24">
        <div className="flex flex-col justify-between gap-8 border-y border-stone-300 py-10 md:flex-row md:items-center md:py-14">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Membership
            </p>
            <h2 className="mt-4 font-serif text-3xl font-normal leading-tight tracking-[-0.035em] sm:text-4xl">
              More value for the practices that grow with us.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">
              Discover Bossdent Plus benefits, rewards and membership privileges. See the current
              plan details and eligibility.
            </p>
          </div>
          <Link
            href="/membership"
            className="group inline-flex min-h-12 shrink-0 items-center justify-between gap-10 bg-[#292925] px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#555047]"
          >
            Discover membership
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-20 sm:px-10 md:px-16 md:pb-28 lg:px-24">
        <div className="mx-auto max-w-[1440px] bg-[#dedbd2] px-6 py-16 text-center sm:px-12 md:py-24">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">
            Your practice, thoughtfully equipped
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl font-normal leading-[1.1] tracking-[-0.04em] sm:text-5xl md:text-6xl">
            Find what your practice needs next.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-stone-600">
            Explore our collections and discover products, brands and solutions for every stage of
            your dental practice.
          </p>
          <Link
            href="/categories"
            className="mt-9 inline-flex min-h-12 items-center gap-8 bg-[#292925] px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#555047]"
          >
            Explore the catalogue <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
