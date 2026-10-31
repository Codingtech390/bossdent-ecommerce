"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowUpRight } from "lucide-react";

const categories = [
  {
    name: "Restorative & Esthetics",
    slug: "restorative-and-esthetics",
    subs: ["Dental Composites", "Bonding Agents & Etchants", "Glass Ionomer Cements"],
  },
  {
    name: "Endodontics",
    slug: "endodontics",
    subs: ["Rotary & Hand Files", "Endomotors & Apex Locators", "Obturation & Sealers"],
  },
  {
    name: "Handpieces & Rotary",
    slug: "handpieces-and-rotary",
    subs: ["High Speed Airotors", "Micromotors & Attachments"],
  },
  {
    name: "Instruments & Surgery",
    slug: "instruments-and-surgery",
    subs: ["Extraction Forceps & Elevators", "Diagnostic & Scaler Instruments"],
  },
  {
    name: "Orthodontics",
    slug: "orthodontics",
    subs: ["Brackets & Buccal Tubes", "Archwires & Elastics"],
  },
  {
    name: "Equipment & Digital",
    slug: "equipment-and-digital-dentistry",
    subs: ["Sterilization & Autoclaves", "Operatory Hardware", "Dental Chairs & Units"],
  },
  {
    name: "Impression Materials",
    slug: "impression-materials",
    subs: ["Silicone Putty & Light Body", "Alginates & Trays"],
  },
  {
    name: "New Clinic Setup",
    slug: "new-clinic-setup",
    subs: ["Turnkey Packages", "Operatory Suites"],
  },
];

const navItems = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/categories", hasMenu: true },
  { label: "Products", href: "/best-sellers" },
  { label: "Referring Doctors", href: "/brands" },
  { label: "New Patients", href: "/student-section" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setServicesOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="bossdent-vivid-nav-wrap">
      <nav ref={navRef} className="bossdent-vivid-nav" aria-label="Main navigation">
        {navItems.map((item) =>
          item.hasMenu ? (
            <div
              key={item.label}
              className="bossdent-vivid-nav-item bossdent-vivid-services"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                className="bossdent-vivid-nav-link"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                onClick={() => setServicesOpen((value) => !value)}
                onFocus={() => setServicesOpen(true)}
              >
                {item.label}
                <ChevronDown className={servicesOpen ? "is-open" : ""} aria-hidden="true" />
              </button>

              {servicesOpen && (
                <div className="bossdent-vivid-mega-menu">
                  <div className="bossdent-vivid-mega-heading">
                    <div>
                      <span>Explore the catalogue</span>
                      <h3>Shop by speciality</h3>
                    </div>
                    <Link href="/categories" onClick={() => setServicesOpen(false)}>
                      View all categories <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="bossdent-vivid-category-grid">
                    {categories.map((category) => (
                      <section key={category.slug} className="bossdent-vivid-category">
                        <Link
                          href={`/categories/${category.slug}`}
                          onClick={() => setServicesOpen(false)}
                          className="bossdent-vivid-category-title"
                        >
                          {category.name}
                          <ArrowUpRight aria-hidden="true" />
                        </Link>
                        <ul>
                          {category.subs.map((sub) => (
                            <li key={sub}>{sub}</li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link key={item.label} href={item.href} className="bossdent-vivid-nav-link">
              {item.label}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
