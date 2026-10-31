import Link from "next/link";
import Image from "next/image";
import { Allura, DM_Sans } from "next/font/google";
import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/models/Brand";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { SiteBanner } from "@/models/SiteBanner";
import { ProductCard } from "@/components/product/ProductCard";
import { TechnologyShowcase } from "@/components/home/TechnologyShowcase";
import { FAQSection } from "@/components/home/FAQSection";
import { ArrowUpRight, Check, Gift, MoveUpRight } from "lucide-react";
import CountUp from "@/components/home/CountUp";

import mongoose from "mongoose";

const heroScriptFont = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bossdent-script",
});

const heroSansFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-bossdent-sans",
});

export const dynamic = "force-dynamic";

type ProductRecord = {
  _id: string;
  [key: string]: unknown;
};

async function getHomepageData() {
  await connectToDatabase();


console.log("\n========== BOSSDENT DATABASE DIAGNOSTICS ==========");

console.log("Connection state:", mongoose.connection.readyState);
console.log("Database name:", mongoose.connection.name);
console.log("Database host:", mongoose.connection.host);

const [
  rawCategories,
  rootCategories,
  rawBrands,
  featuredBrands,
  rawProducts,
  activeProducts,
  bestSellerProducts,
  rawBanners,
  activeBanners,
] = await Promise.all([
  Category.collection.countDocuments({}),
  Category.collection.countDocuments({ level: 0 }),
  Brand.collection.countDocuments({}),
  Brand.collection.countDocuments({ isFeatured: true }),
  Product.collection.countDocuments({}),
  Product.collection.countDocuments({ active: true }),
  Product.collection.countDocuments({
    active: true,
    badges: "Best Seller",
  }),
  SiteBanner.collection.countDocuments({}),
  SiteBanner.collection.countDocuments({ active: true }),
]);

console.table({
  "All categories": rawCategories,
  "Root categories (level 0)": rootCategories,
  "All brands": rawBrands,
  "Featured brands": featuredBrands,
  "All products": rawProducts,
  "Active products": activeProducts,
  "Best seller products": bestSellerProducts,
  "All banners": rawBanners,
  "Active banners": activeBanners,
});

console.log("Collections:", {
  categories: Category.collection.name,
  brands: Brand.collection.name,
  products: Product.collection.name,
  banners: SiteBanner.collection.name,
});

console.log("===================================================\n");


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
console.log("========== BOSSDENT HOMEPAGE DATA ==========");

console.log("Categories:", categories.length);
console.log("Brands:", brands.length);
console.log("Best Sellers:", bestSellers.length);
console.log("New Arrivals:", newArrivals.length);

console.log("============================================");


  const heroBanner = banners[0] || {
    title: "The right tools for better dentistry.",
    subtitle:
      "Discover thoughtfully selected dental materials, instruments and technology for every stage of your practice.",
    badge: "A MORE CONSIDERED WAY TO SHOP DENTAL",
    imageUrl:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1800&q=85",
    linkUrl: "/categories",
  };

  console.table({
    categories: categories.length,
    brands: brands.length,
    bestSellers: bestSellers.length,
    newArrivals: newArrivals.length,
  });
  return (
    <main className="overflow-hidden bg-[#f7f6f2] text-[#292925]">
      {/* Vivid-inspired editorial hero */}
      <section
        className={`bossdent-hero-vivid relative isolate min-h-[630px] overflow-hidden md:min-h-[700px] ${heroScriptFont.variable} ${heroSansFont.variable}`}
      >
        <div className="bossdent-hero-vivid__media" aria-hidden="true">
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

        <div className="bossdent-hero-vivid__inner">
          <p className="bossdent-hero-vivid__script" aria-label="Dentistry">
            Dentistry
          </p>

          <h1 className="bossdent-hero-vivid__headline">
            {heroBanner.title || "The right tools for better dentistry."}
          </h1>

          <div className="bossdent-hero-vivid__bottom">
            <Link
              href={heroBanner.linkUrl || "/categories"}
              className="bossdent-hero-vivid__button"
            >
              Explore the catalogue
              <ArrowUpRight aria-hidden="true" />
            </Link>

            <p className="bossdent-hero-vivid__description">{heroBanner.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Intro / brand positioning */}
      <section className="bg-[#fbfaf8]">
        {/* Statistics */}
        <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-8 sm:px-10 md:px-16 lg:px-24">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {[
              {
                value: categories.length,
                label: "Shop Categories",
              },
              {
                value: brands.length,
                label: "Featured Brands",
              },
              {
                value: bestSellers.length,
                label: "Best Sellers Featured",
              },
              {
                value: newArrivals.length,
                label: "New Arrivals Featured",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex min-h-[112px] flex-col justify-between rounded-[4px] bg-[#968a98] px-5 py-5 text-white sm:min-h-[132px] sm:px-6 sm:py-6"
              >
                <p className="text-[11px] font-medium tracking-wide text-white/90 sm:text-xs">
                  {stat.label}
                </p>

                <p className="font-serif text-[35px] font-normal leading-none tracking-wide sm:text-[43px]">
                  <CountUp value={stat.value} />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured brand strip */}
        {brands.length > 0 && (
          <div className="border-y border-[#e9e6e2] bg-[#f5f4f1]">
            <div className="mx-auto max-w-[1440px] px-6 py-9 sm:px-10 md:px-16 lg:px-24">
              <div className="grid grid-cols-2 items-center gap-x-8 gap-y-7 md:grid-cols-4">
                {brands.slice(0, 4).map((brand: { _id: string; slug: string; name: string }) => (
                  <Link
                    key={brand._id}
                    href={`/brands/${brand.slug}`}
                    className="group flex min-h-[55px] items-center justify-center text-center"
                  >
                    <span className="font-serif text-lg font-medium uppercase tracking-[0.08em] text-[#37332f] transition-colors duration-300 group-hover:text-[#968a98] sm:text-xl">
                      {brand.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Editorial specialty section */}
        <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 md:px-16 md:py-28 lg:px-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            {/* Left content */}
            <div className="max-w-[540px]">
              <div className="mb-5 h-px w-full bg-[#bdb7b0]" />

              <p className="font-serif text-[38px] font-normal uppercase leading-[1.12] tracking-[0.015em] text-[#342f2a] sm:text-[48px] md:text-[54px]">
                Your practice.
                <br />
                Our priority.
              </p>

              <h2 className="mt-4 text-base font-medium leading-relaxed text-[#292522] sm:text-lg">
                Advanced Dental Products, Thoughtfully Selected.
              </h2>

              <p className="mt-5 max-w-[470px] text-sm leading-7 text-[#77716b] sm:text-[15px] sm:leading-8">
                From everyday clinical essentials to advanced dental equipment, discover a carefully
                selected range of products and trusted brands designed to support every stage of
                your practice.
              </p>

              <div className="mt-7 h-px w-full bg-[#bdb7b0]" />

              <p className="mt-5 text-xs leading-6 text-[#918982]">
                Bringing together quality products, established manufacturers and considered
                solutions for dental professionals.
              </p>

              <Link
                href="/about"
                className="group mt-8 inline-flex min-h-[48px] items-center justify-center gap-6 rounded-[4px] bg-[#968a98] px-7 py-3 text-xs font-semibold text-white transition-colors duration-300 hover:bg-[#7f7182]"
              >
                Discover Bossdent
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>

            {/* Right image composition */}
            <div className="grid grid-cols-3 items-end gap-3 sm:gap-4">
              {/* Image one */}
              <div className="relative aspect-[0.72] overflow-hidden bg-[#e8e5e0]">
                <Image
                  src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=700&q=85"
                  alt="Dental clinical care"
                  fill
                  sizes="(max-width: 768px) 33vw, 18vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Image two */}
              <div className="relative aspect-[0.72] translate-y-[-18px] overflow-hidden bg-[#e8e5e0] sm:translate-y-[-28px]">
                <Image
                  src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=700&q=85"
                  alt="Modern dental instruments and technology"
                  fill
                  sizes="(max-width: 768px) 33vw, 18vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Image three */}
              <div className="relative aspect-[0.72] translate-y-[-36px] overflow-hidden bg-[#e8e5e0] sm:translate-y-[-56px]">
                <Image
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=700&q=85"
                  alt="Modern dental practice"
                  fill
                  sizes="(max-width: 768px) 33vw, 18vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team / Interactive Flip Cards */}
      <section className="w-full px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-0">
          {[
            {
              image: "/images/team/bossdent-team-1.png",
              name: "Dr. Arif Sumar",
              qualification: "[Qualifications / Degree]",
              designation: "Dental Specialist",
              description:
                "Add a short professional introduction highlighting experience, expertise and commitment to quality dental care.",
            },
            {
              image: "/images/team/bossdent-team-2.png",
              name: "Nazia Osborn",
              qualification: "[Qualifications / Degree]",
              designation: "Clinical Professional",
              description:
                "Add a short introduction describing their professional background, clinical expertise and role.",
            },
            {
              image: "/images/team/bossdent-team-3.png",
              name: "Tommy Gleccki",
              qualification: "[Qualifications / Degree]",
              designation: "Dental Professional",
              description:
                "Introduce this team member and explain their experience, specialist knowledge and contribution.",
            },
            {
              image: "/images/team/bossdent-team-4.png",
              name: "Nina Dobrev",
              qualification: "[Qualifications / Degree]",
              designation: "Team Member",
              description:
                "Add a brief biography covering their responsibilities, professional experience and dedication.",
            },
          ].map((member, index) => (
            <div
              key={member.image}
              className="bossdent-team-card group"
              tabIndex={0}
              role="group"
              aria-label={`${member.name}, ${member.designation}`}
            >
              <div className="bossdent-team-card-inner">
                {/* Front - Team photograph */}
                <div className="bossdent-team-card-front">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    priority={index < 2}
                    sizes="(max-width: 768px) 50vw, 720px"
                    className="object-cover object-center"
                  />

                  <div className="bossdent-team-card-image-overlay" />

                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white sm:p-6">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/80 sm:text-[10px]">
                      Meet our team
                    </span>

                    <h3 className="mt-2 font-serif text-lg sm:text-2xl md:text-3xl">
                      {member.name}
                    </h3>

                    <p className="mt-1 text-[10px] tracking-wide text-white/85 sm:text-xs">
                      {member.designation}
                    </p>
                  </div>
                </div>

                {/* Back - Team member details */}
                <div className="bossdent-team-card-back">
                  <div className="bossdent-team-card-content">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/70 sm:text-[10px]">
                      Bossdent Professionals
                    </span>

                    <div className="my-4 h-px w-10 bg-white/60 sm:my-6" />

                    <h3 className="font-serif text-xl font-normal leading-tight text-white sm:text-3xl md:text-4xl">
                      {member.name}
                    </h3>

                    <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.12em] text-white/85 sm:text-xs">
                      {member.qualification}
                    </p>

                    <p className="mt-2 text-xs font-medium text-white sm:text-sm">
                      {member.designation}
                    </p>

                    <div className="mx-auto my-4 h-px w-full max-w-[220px] bg-white/30 sm:my-6" />

                    <p className="mx-auto max-w-[360px] text-[11px] leading-6 text-white/90 sm:text-sm sm:leading-7">
                      {member.description}
                    </p>

                    <span className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/65 sm:mt-7 sm:text-[10px]">
                      The people behind Bossdent
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Explore All Treatments Button */}
        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            href="/best-sellers"
            className="inline-flex min-h-[48px] min-w-[260px] items-center justify-center rounded-[5px] bg-[#968a98] px-8 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-[#817482] hover:shadow-md sm:min-w-[277px]"
          >
            Meet all Members
          </Link>
        </div>
      </section>
      {/* Discover What's Possible */}
      <section className="w-full bg-white py-12 md:py-16">
        {/* Section heading */}
        <div
          className={`${heroScriptFont.variable} mx-auto flex flex-col items-center justify-center px-5 pb-10 text-center md:pb-14`}
        >
          <p className="font-[var(--font-bossdent-script)] text-6xl leading-none text-[#968a98] sm:text-7xl md:text-8xl">
            Discover
          </p>

          <h2 className="mt-1 font-sans text-3xl font-normal tracking-tight text-[#393832] sm:text-4xl md:text-5xl">
            What's Possible
          </h2>
        </div>
        {/* Four image cards */}
        <div className="grid w-full grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-4">
          {[
            {
              title: "Dental Implants",
              image: "/images/bestsellers/dental-implants.png",
              link: "/best-sellers",
              button: "Explore Dental Implants",
            },
            {
              title: "Reconstructive Dentistry",
              image: "/images/bestsellers/reconstructive-dentistry.png",
              link: "/best-sellers",
              button: "Explore Reconstructive Dentistry",
            },
            {
              title: "Cosmetic Dentistry",
              image: "/images/bestsellers/cosmetic-dentistry.png",
              link: "/best-sellers",
              button: "Explore Cosmetic Dentistry",
            },
            {
              title: "Preventative Dentistry",
              image: "/images/bestsellers/preventative-dentistry.png",
              link: "/best-sellers",
              button: "Explore Preventative Dentistry",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.link}
              className="group relative block aspect-[1/0.96] overflow-hidden bg-[#e8e5e0] sm:aspect-[1/1.05] lg:aspect-[1/0.96]"
            >
              {/* Background image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/5 transition-colors duration-500 group-hover:bg-black/45" />

              {/* Bottom title */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-3 text-center transition-all duration-500 group-hover:translate-y-3 group-hover:opacity-0 sm:p-5">
                <h3 className="font-serif text-xs font-normal uppercase tracking-wide text-white sm:text-sm md:text-base">
                  {item.title}
                </h3>
              </div>

              {/* Center hover button */}
              <div className="absolute inset-0 z-20 flex items-center justify-center px-3 opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="inline-flex min-h-10 items-center justify-center border border-white bg-white/10 px-4 py-2 text-center text-[10px] font-semibold text-white backdrop-blur-[2px] transition-all duration-300 group-hover:bg-white group-hover:text-[#554c55] sm:px-6 sm:text-xs">
                  {item.button}
                </span>
              </div>
            </Link>
          ))}
        </div>
        {/* Explore All Treatments Button */}
        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            href="/best-sellers"
            className="inline-flex min-h-[48px] min-w-[260px] items-center justify-center rounded-[5px] bg-[#968a98] px-8 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-[#817482] hover:shadow-md sm:min-w-[277px]"
          >
            Explore All Our Treatments
          </Link>
        </div>
      </section>
      {/* Interactive Dental Technology Showcase */}
      <TechnologyShowcase />
      {/* Frequently Asked Questions */}
      <FAQSection />
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

      {/* Visit Us / Contact Section */}
      <section className="w-full bg-[#191919] px-6 py-16 text-white sm:px-10 md:px-16 md:py-20 lg:px-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          {/* Left: Contact information */}
          <div className="flex flex-col">
            <h2
              className={`${heroScriptFont.className} text-5xl leading-none text-[#b9aab9] sm:text-6xl md:text-7xl`}
            >
              Visit Us
            </h2>

            <p className="mt-5 max-w-sm text-xs leading-6 text-white/90 sm:text-sm">
              Welcome to Bossdent Global India Pvt Ltd. Discover thoughtfully selected dental
              products, professional solutions and support for your practice.
            </p>

            {/* Address */}
            <div className="mt-7">
              <p className="text-[11px] font-medium text-[#a99aaa]">Address:</p>

              <p className="mt-3 text-xs leading-6 text-white">
                Add your registered business address here.
              </p>

              <Link
                href="https://www.google.com/maps/search/?api=1&query=Bossdent+Global+India+Pvt+Ltd"
                target="_blank"
                className="mt-1 inline-block text-[11px] text-white/65 underline underline-offset-4 transition-colors hover:text-white"
              >
                Get Directions
              </Link>
            </div>

            {/* Phone */}
            <div className="mt-6">
              <p className="text-[11px] font-medium text-[#a99aaa]">Phone number:</p>

              <Link
                href="/contact"
                className="mt-3 inline-block text-xs text-white hover:text-[#c5b5c5]"
              >
                Contact our team
              </Link>
            </div>

            {/* Email */}
            <div className="mt-6">
              <p className="text-[11px] font-medium text-[#a99aaa]">Email:</p>

              <Link
                href="/contact"
                className="mt-3 inline-block text-xs text-white hover:text-[#c5b5c5]"
              >
                Send us an enquiry
              </Link>
            </div>

            {/* Business hours */}
            <div className="mt-6">
              <p className="text-[11px] font-medium text-[#a99aaa]">Hours:</p>

              <p className="mt-3 text-xs leading-6 text-white/90">
                Please contact our team for business hours and availability.
              </p>
            </div>
          </div>

          {/* Right: Google Map */}
          <div className="relative min-h-[350px] overflow-hidden bg-[#e8e6e4] sm:min-h-[430px] lg:min-h-[500px]">
            <iframe
              title="Bossdent location map"
              src="https://www.google.com/maps?q=Bossdent%20Global%20India%20Pvt%20Ltd&output=embed"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
