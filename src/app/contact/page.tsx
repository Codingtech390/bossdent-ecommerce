import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  ArrowUpRight,
  Headphones,
  Building2,
} from "lucide-react";

const contactDetails = [
  {
    icon: Phone,
    label: "Call our team",
    value: "1800-103-3321",
    href: "tel:18001033321",
    description: "Speak with our customer support team.",
  },
  {
    icon: Mail,
    label: "Email us",
    value: "support@bossdent.com",
    href: "mailto:support@bossdent.com",
    description: "Send us your questions and enquiries.",
  },
];

const workingHours = [
  { day: "Monday – Saturday", time: "9:30 AM – 6:30 PM" },
  { day: "Sunday", time: "Closed" },
];

export default function ContactPage() {
  return (
    <main className="bg-white text-slate-800">
      {/* Contact Hero Banner */}
      <section className="relative isolate flex min-h-[420px] w-full items-end overflow-hidden bg-[#29232e] sm:min-h-[500px] lg:min-h-[620px]">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/bossdent-hero-poster.jpg"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        >
          <source src="/videos/bossdent-banner-video.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 -z-10 bg-black/50" />

        {/* Gradient for text readability */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/65 via-black/10 to-black/25" />

        {/* Hero Content */}
        <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#d5b9e3]">
              We're here to help
            </p>

            <h1 className="text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[76px]">
              Contact
              <span className="block">Bossdent</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              Connect with our team for product enquiries, order assistance and professional dental
              supply solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="transition hover:text-[#8d719f]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-700">Contact Us</span>
        </div>
      </div>

      {/* Page heading */}
      <section className="mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 lg:px-12 lg:pb-16 lg:pt-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#9478a5]">
            We are here to help
          </p>

          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
            Let's talk about
            <span className="block text-[#9478a5]">your dental needs.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            Whether you need product assistance, an institutional quotation or help with an order,
            our team is ready to assist you.
          </p>
        </div>
      </section>

      {/* Main contact layout */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12 lg:pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          {/* Contact information */}
          <div>
            <div className="border-b border-slate-200 pb-7">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Contact information
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Get in touch with Bossdent. We would be happy to hear from you.
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {contactDetails.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-start gap-5 py-7"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f5f0f7] text-[#9478a5] transition group-hover:bg-[#9478a5] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">
                        {item.label}
                      </p>

                      <p className="mt-2 break-words text-lg font-semibold text-slate-900 transition group-hover:text-[#9478a5] sm:text-xl">
                        {item.value}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                    </div>

                    <ArrowUpRight className="mt-1 h-4 w-4 text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#9478a5]" />
                  </a>
                );
              })}
            </div>

            {/* Location */}
            <div className="border-t border-slate-200 py-8">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f5f0f7] text-[#9478a5]">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">
                    Our headquarters
                  </p>

                  <p className="mt-2 max-w-sm text-base font-semibold leading-7 text-slate-900">
                    Plot 14, Okhla Industrial Area Phase III, New Delhi 110020
                  </p>

                  <p className="mt-2 text-sm text-slate-500">Bossdent Global India Pvt Ltd</p>
                </div>
              </div>
            </div>

            {/* Working hours */}
            <div className="border-t border-slate-200 py-8">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f5f0f7] text-[#9478a5]">
                  <Clock className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">
                    Support hours
                  </p>

                  <div className="mt-4 max-w-md space-y-3">
                    {workingHours.map((item) => (
                      <div
                        key={item.day}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="text-slate-600">{item.day}</span>
                        <span className="font-semibold text-slate-900">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Enquiry Form */}

          {/* Premium Contact Enquiry Form */}
          <aside className="relative h-fit overflow-hidden border border-[#e9e2e9] bg-[#faf8fa] p-6 sm:p-9 lg:p-10">
            {/* Decorative accent */}
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#80618f] via-[#b49cbd] to-[#e5d9e9]" />

            {/* Form heading */}
            <div className="mb-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9478a5]">
                Let's connect
              </p>

              <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[#24202b] sm:text-4xl">
                How can we help
                <span className="block italic text-[#9478a5]">your practice?</span>
              </h2>

              <p className="mt-4 max-w-md text-[13px] leading-6 text-[#77717b]">
                Tell us what you're looking for. Our team will get in touch to help you find the
                right dental products and solutions.
              </p>
            </div>

            <form className="space-y-6">
              {/* Personal details */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="contact-name"
                    className="block text-[11px] font-semibold tracking-wide text-[#514957]"
                  >
                    Full name <span className="text-[#9478a5]">*</span>
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                    className="h-12 w-full border border-[#e5dfe6] bg-white px-4 text-[13px] text-[#29232e] outline-none transition placeholder:text-[#aaa3ac] hover:border-[#c8b8ce] focus:border-[#9478a5] focus:ring-2 focus:ring-[#9478a5]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-phone"
                    className="block text-[11px] font-semibold tracking-wide text-[#514957]"
                  >
                    Phone number <span className="text-[#9478a5]">*</span>
                  </label>

                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+91  XXXXX XXXXX"
                    className="h-12 w-full border border-[#e5dfe6] bg-white px-4 text-[13px] text-[#29232e] outline-none transition placeholder:text-[#aaa3ac] hover:border-[#c8b8ce] focus:border-[#9478a5] focus:ring-2 focus:ring-[#9478a5]/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="contact-email"
                  className="block text-[11px] font-semibold tracking-wide text-[#514957]"
                >
                  Email address <span className="text-[#9478a5]">*</span>
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-12 w-full border border-[#e5dfe6] bg-white px-4 text-[13px] text-[#29232e] outline-none transition placeholder:text-[#aaa3ac] hover:border-[#c8b8ce] focus:border-[#9478a5] focus:ring-2 focus:ring-[#9478a5]/10"
                />
              </div>

              {/* Service selection */}
              <fieldset>
                <legend className="mb-3 text-[11px] font-semibold tracking-wide text-[#514957]">
                  What are you interested in?
                  <span className="ml-1 font-normal text-[#99919b]">(Select all that apply)</span>
                </legend>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    "Dental Instruments",
                    "Dental Equipment",
                    "Endodontics",
                    "Orthodontics",
                    "Restorative Dentistry",
                    "Implants",
                    "Prosthetics",
                    "Infection Control",
                    "Dental Consumables",
                    "Laboratory Products",
                    "Bulk / Institutional Orders",
                    "Other Enquiry",
                  ].map((service) => (
                    <label
                      key={service}
                      className="group flex min-h-[43px] cursor-pointer items-center gap-3 border border-[#e9e3e9] bg-white px-3 py-2.5 transition hover:border-[#b49cbd] hover:bg-[#f7f2f8] has-[:checked]:border-[#9478a5] has-[:checked]:bg-[#f2ebf4]"
                    >
                      <input
                        type="checkbox"
                        name="services"
                        value={service}
                        className="h-3.5 w-3.5 shrink-0 accent-[#9478a5]"
                      />

                      <span className="text-[11px] font-medium text-[#615968] transition group-hover:text-[#80618f]">
                        {service}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Message */}
              <div className="space-y-2">
                <label
                  htmlFor="contact-message"
                  className="block text-[11px] font-semibold tracking-wide text-[#514957]"
                >
                  Tell us more about your requirements
                  <span className="text-[#9478a5]"> *</span>
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  className="min-h-[135px] w-full resize-y border border-[#e5dfe6] bg-white px-4 py-3 text-[13px] leading-6 text-[#29232e] outline-none transition placeholder:text-[#aaa3ac] hover:border-[#c8b8ce] focus:border-[#9478a5] focus:ring-2 focus:ring-[#9478a5]/10"
                />
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-4 border-t border-[#e9e2e9] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-[220px] text-[10px] leading-5 text-[#89818c]">
                  Your information will only be used to respond to your enquiry.
                </p>

                <button
                  type="button"
                  className="group inline-flex min-h-[49px] items-center justify-center gap-5 bg-[#918594] px-7 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition duration-300 hover:bg-[#786b7b]"
                >
                  Send enquiry
                  <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </form>
          </aside>
        </div>
      </section>

      {/* Closing section */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <p className="text-xl font-semibold tracking-tight text-slate-950">
              Need help choosing the right product?
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Speak with our team before placing your order.
            </p>
          </div>

          <a
            href="tel:18001033321"
            className="inline-flex w-fit items-center gap-3 bg-[#9478a5] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#80618f]"
          >
            <Phone className="h-4 w-4" />
            Call Bossdent
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
