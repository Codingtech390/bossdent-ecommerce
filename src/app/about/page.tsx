import React from "react";

import Link from "next/link";

import {

  ArrowUpRight,

  ShieldCheck,

  PackageCheck,

  Headphones,

  Microscope,

  Truck,


} from "lucide-react";



const principles = [

  {

    number: "01",

    icon: Microscope,

    title: "Thoughtful product selection",

    description:

      "A considered catalogue of dental materials, instruments, equipment and everyday essentials for modern dental practices.",

  },

  {

    number: "02",

    icon: ShieldCheck,

    title: "Quality-led sourcing",

    description:

      "We believe dental professionals should be able to make informed purchasing decisions with clear product information.",

  },

  {

    number: "03",

    icon: Headphones,

    title: "Support that matters",

    description:

      "From product enquiries to order assistance, our aim is to make the purchasing experience straightforward and dependable.",

  },

];



const commitments = [

  {

    icon: PackageCheck,

    title: "A considered catalogue",

    description:

      "Dental materials, instruments and equipment brought together in one convenient destination.",

  },

  {

    icon: ShieldCheck,

    title: "Informed decisions",

    description:

      "Clear product information to help professionals evaluate their requirements before purchasing.",

  },

  {

    icon: Truck,

    title: "Convenient ordering",

    description:

      "A streamlined online shopping experience designed around the needs of dental practices.",

  },

];



export default function AboutPage() {

  return (

    <main className="overflow-hidden bg-[#f4f1ed] text-[#292522]">

      {/* 01 — Full-bleed video hero */}

      {/* 01 — Half-screen video hero */}
      <section className="relative isolate flex h-[50svh] min-h-[390px] max-h-[560px] items-end overflow-hidden bg-[#0b1f3a]">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/bossdent-hero-poster.jpg"
            aria-hidden="true"
          >
            <source src="/videos/bossdent-banner-video.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 bg-[#0b1f3a]/65" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#0b1f3a]/80 via-[#0b1f3a]/35 to-transparent" aria-hidden="true" />

        <div className="relative z-20 mx-auto flex h-full w-full max-w-[1440px] items-end px-6 pb-10 pt-20 sm:px-10 sm:pb-12 md:px-16 lg:px-24 mb-2">
          <div className="max-w-[900px]">
            <h1 className="font-serif text-4xl font-normal leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl lg:text-6xl">
              A better way
              <br />
              to source dentistry

            </h1>



            <Link
              href="/categories"
              className="group mt-6 inline-flex items-center gap-4 border-b border-white/60 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-sky-300 hover:text-sky-300"
            >
              Explore our catalogue
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 02 — Introduction */}

      <section className="bg-[#f4f1ed] px-6 py-24 sm:px-10 md:py-32 lg:px-20">

        <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">

          <div className="relative min-h-[390px] overflow-hidden bg-[#ded8d4] sm:min-h-[540px]">

            <video

              autoPlay

              muted

              loop

              playsInline

              preload="none"

              poster="/images/bossdent-hero-poster.jpg"

              className="absolute inset-0 h-full w-full object-cover"

              aria-label="Bossdent dental technology showcase"

            >

              <source src="/videos/bossdent-banner-video.mp4" type="video/mp4" />

            </video>



            <div className="absolute inset-0 bg-black/10" />



            <div className="absolute bottom-6 left-6 border-l border-white/70 pl-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">

              Bossdent

              <span className="mt-1 block font-normal tracking-wider text-white/75">

                Dental supplies & technology

              </span>

            </div>

          </div>



          <div className="max-w-[620px]">

            <p className="bossdent-eyebrow">Who we are</p>



            <h2 className="mt-7 font-serif text-4xl font-medium leading-[1.08] tracking-[-0.04em] text-[#292522] sm:text-5xl lg:text-6xl">

              The right tools

              <span className="block italic text-[#1e3a8a]">make a difference.</span>

            </h2>



            <div className="mt-8 space-y-5 text-sm leading-8 text-[#77716c]">

              <p>

                Bossdent Global India Pvt Ltd is focused on making dental products, instruments and

                technology accessible through a considered online shopping experience.

              </p>



              <p>

                We bring together products across different areas of dentistry, helping dental

                professionals explore their options and find supplies suited to their everyday

                requirements.

              </p>



              <p>

                Our focus is simple: a thoughtfully organised catalogue, useful product information

                and a dependable experience from browsing to ordering.

              </p>

            </div>



            <div className="mt-10 border-t border-[#dcd5cf] pt-7">

              <p className="font-serif text-xl italic text-[#1e3a8a]">

                Bossdent Global India Pvt Ltd

              </p>

              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8c8580]">

                Dental supplies, instruments & technology

              </p>

            </div>

          </div>

        </div>

      </section>



      {/* 03 — Our approach */}

      <section className="bg-white px-6 py-24 sm:px-10 md:py-32 lg:px-20">

        <div className="mx-auto max-w-[1320px]">

          <div className="max-w-3xl">

            <p className="bossdent-eyebrow">What guides us</p>



            <h2 className="mt-7 font-serif text-4xl font-medium leading-[1.08] tracking-[-0.04em] text-[#292522] sm:text-5xl md:text-6xl">

              Built around the needs

              <span className="block italic text-[#1e3a8a]">of modern dentistry.</span>

            </h2>



            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#77716c]">

              Every part of the Bossdent experience is guided by the needs of dental professionals

              and the practical realities of running a practice.

            </p>

          </div>



          <div className="mt-16 grid grid-cols-1 gap-0 border-t border-[#e6e0da] md:grid-cols-3">

            {principles.map((item) => {

              const Icon = item.icon;



              return (

                <article

                  key={item.number}

                  className="group border-b border-[#e6e0da] py-9 md:border-b-0 md:border-r md:px-9 md:first:pl-0 md:last:border-r-0 md:last:pr-0"

                >

                  <div className="flex items-center justify-between">

                    <span className="font-serif text-3xl text-blue-900">{item.number}</span>



                    <Icon className="h-6 w-6 text-[#1e3a8a] transition-transform duration-300 group-hover:-translate-y-1" />

                  </div>



                  <h3 className="mt-9 font-serif text-2xl font-medium text-[#292522]">

                    {item.title}

                  </h3>



                  <p className="mt-4 text-sm leading-7 text-[#77716c]">{item.description}</p>

                </article>

              );

            })}

          </div>

        </div>

      </section>



      {/* 04 — Brand commitment */}

      <section className="bg-[#0b1f3a] px-6 py-24 text-white sm:px-10 md:py-32 lg:px-20">

        <div className="mx-auto max-w-[1320px]">

          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">

            <div>

              <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7dd3fc]">

                <span className="h-px w-8 bg-[#7dd3fc]" />

                The Bossdent commitment

              </p>



              <h2 className="mt-7 font-serif text-4xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl">

                More than a<span className="block italic text-[#7dd3fc]">product catalogue.</span>

              </h2>



              <p className="mt-7 max-w-md text-sm leading-8 text-white/65">

                A useful dental supply platform should do more than display products. It should make

                discovery, evaluation and purchasing feel straightforward.

              </p>

            </div>



            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">

              {commitments.map((item) => {

                const Icon = item.icon;



                return (

                  <div key={item.title} className="border-t border-white/20 pt-6">

                    <Icon className="h-6 w-6 text-[#7dd3fc]" />



                    <h3 className="mt-6 font-serif text-2xl font-medium">{item.title}</h3>



                    <p className="mt-3 text-sm leading-7 text-white/60">{item.description}</p>

                  </div>

                );

              })}

            </div>

          </div>

        </div>

      </section>



      {/* 05 — Closing CTA */}

      <section className="px-6 py-24 sm:px-10 md:py-32 lg:px-20 mb-12 mt-12" style={{
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(15, 23, 42, 0.65), transparent 95%), linear-gradient(135deg, #172554, #0f172a 50%, #020617)",
      }}
>

        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-10 md:flex-row md:items-end">

          <div className="max-w-3xl">

            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white">
              Discover Bossdent
            </p>



            <h2 className="mt-6 font-serif text-4xl font-medium leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
              Better tools.
              <span className="block italic text-white">Better possibilities.</span>
            </h2>


          </div>



          <div className="flex flex-wrap gap-4">

            <Link

              href="/categories"

              className="inline-flex min-h-[52px] items-center gap-5 bg-[#1e3a8a] px-7 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#172554]"

            >

              Explore products

              <ArrowUpRight className="h-4 w-4" />

            </Link>



            <Link

              href="/contact"

              className="inline-flex min-h-[52px] items-center gap-5 border border-[#1e40af] px-7 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-blue-900"

            >

              Contact us

              <ArrowUpRight className="h-4 w-4" />

            </Link>

          </div>

        </div>

      </section>

    </main>

  );

}
