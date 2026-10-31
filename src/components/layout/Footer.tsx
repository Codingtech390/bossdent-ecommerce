import React from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, Mail } from "lucide-react";

const columns = [
  { title: "Explore", links: [
    ["All categories", "/categories"], ["Best sellers", "/best-sellers"],
    ["Brands", "/brands"], ["Offers", "/offers"], ["Gifts", "/freebies"],
  ]},
  { title: "For professionals", links: [
    ["Clinic setup", "/clinic-setup"], ["Student section", "/student-section"],
    ["Membership", "/membership"], ["My account", "/account"],
    ["Order tracking", "/account/orders"],
  ]},
  { title: "Information", links: [
    ["About Bossdent", "/about"], ["Contact", "/contact"], ["FAQs", "/faq"],
    ["Shipping policy", "/shipping-policy"], ["Returns policy", "/returns-policy"],
    ["Privacy policy", "/privacy-policy"], ["Terms of service", "/terms"],
  ]},
];

export function Footer() {
  return (
    <footer className="bossdent-footer mt-auto">
      <div className="mx-auto grid max-w-[1480px] gap-12 px-6 py-16 sm:px-10 md:grid-cols-[1.3fr_2fr] md:px-16 lg:px-20 lg:py-20">
        <div>
          <Link href="/" className="inline-flex flex-col text-white no-underline">
            <strong className="text-2xl font-extrabold tracking-[.14em]">BOSSDENT</strong>
            <span className="mt-2 text-[8px] font-semibold tracking-[.25em] text-white/60">GLOBAL INDIA PVT LTD</span>
          </Link>
          <p className="mt-7 max-w-sm text-sm leading-7 text-white/65">
            Thoughtfully selected dental materials, instruments, equipment and technology for the people and practices behind every smile.
          </p>
          <div className="mt-7 space-y-3 text-xs text-white/65">
            <Link href="/contact" className="flex items-center gap-3 hover:text-white"><MapPin className="h-4 w-4 text-[#c9bdca]"/> Contact our team</Link>
            <a href="tel:18001033321" className="flex items-center gap-3 hover:text-white"><Phone className="h-4 w-4 text-[#c9bdca]"/> 1800-103-3321</a>
            <Link href="/contact" className="flex items-center gap-3 hover:text-white"><Mail className="h-4 w-4 text-[#c9bdca]"/> Send an enquiry</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[.2em] text-white">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={href}><Link href={href} className="text-xs text-white/60 transition-colors hover:text-white">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-3 px-6 py-6 text-[10px] text-white/45 sm:px-10 md:flex-row md:items-center md:justify-between md:px-16 lg:px-20">
          <p>© {new Date().getFullYear()} Bossdent Global India Pvt Ltd. All rights reserved.</p>
          <p className="flex items-center gap-2">Professional dental supplies & solutions <ArrowUpRight className="h-3 w-3"/></p>
        </div>
      </div>
    </footer>
  );
}
