
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";

const articles = [
  {
    category: "Implant Dentistry",
    title: "Understanding Dental Implants: A Complete Guide",
    description:
      "Explore the fundamentals of dental implants, their applications and the role they play in modern restorative dentistry.",
    image: "/images/bestsellers/dental-implants.png",
  },
  {
    category: "Restorative Dentistry",
    title: "The Science Behind Reconstructive Dentistry",
    description:
      "Discover modern approaches, techniques and innovations transforming restorative and reconstructive dental treatments.",
    image: "/images/bestsellers/reconstructive-dentistry.png",
  },
  {
    category: "Cosmetic Dentistry",
    title: "Modern Cosmetic Dentistry: Treatments and Techniques",
    description:
      "Learn about contemporary cosmetic dental procedures and the technologies supporting aesthetic dental care.",
    image: "/images/bestsellers/cosmetic-dentistry.png",
  },
  {
    category: "Preventive Dentistry",
    title: "Why Preventive Dentistry Matters",
    description:
      "Understand the importance of preventive dental care, early intervention and maintaining long-term oral health.",
    image: "/images/bestsellers/preventative-dentistry.png",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Blog Hero */}
      <section className="relative isolate flex min-h-[420px] w-full items-end overflow-hidden bg-[#0b1f3a] sm:min-h-[480px] lg:h-[50svh] lg:min-h-[500px] lg:max-h-[650px]">
        <Image
          src="/images/bossdent-hero-poster.jpg"
          alt="Bossdent dental insights"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
        />

        <div className="absolute inset-0 -z-10 bg-[#0b1f3a]/70" />

        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1f3a] via-[#0b1f3a]/35 to-transparent" />

        <div className="mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8 sm:pb-20 lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
              The Bossdent Journal
            </p>

            <h1 className="text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Insights &
              <span className="block text-sky-300">Articles</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              Explore dental knowledge, treatment insights and the latest
              developments shaping modern dentistry.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="transition hover:text-blue-900">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Blog</span>
        </div>
      </div>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 lg:px-12 lg:pt-20">
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-blue-900" />
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-900">
              Knowledge. Innovation. Dentistry.
            </p>
          </div>

          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Read the Latest
            <span className="block text-blue-900">Articles</span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            From treatment approaches to dental technologies, discover
            informative resources covering the topics that matter to dental
            professionals.
          </p>
        </div>
      </section>

      {/* Article Cards */}
      <section
        id="latest-articles"
        className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28"
      >
        <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Explore Our Topics
          </h2>

          <span className="text-xs font-medium text-slate-400">
            {articles.length} Topics
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <article key={article.title} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#dbeafe]">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f3a]/30 to-transparent opacity-70" />
              </div>

              <div className="pt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-900">
                  {article.category}
                </p>

                <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-blue-900">
                  {article.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {article.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
                  Coming Soon
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#0b1f3a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12 lg:py-16">
          <div>
            <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Stay curious. Keep discovering.
            </p>

            <p className="mt-2 text-sm leading-6 text-white/70">
              More dental insights and informative articles are coming soon.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center gap-3 bg-blue-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Explore Bossdent
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
