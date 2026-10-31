"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, ShoppingBag, UserRound, MapPin, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { usePincode } from "@/context/PincodeContext";
import { Navbar } from "./Navbar";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { PincodeModal } from "./PincodeModal";
import { CartDrawer } from "../cart/CartDrawer";

const HEADER_SCROLL_THRESHOLD = 60;

export function Header() {
  const { user, logout } = useAuth();
  const { cartCount, openDrawer } = useCart();
  const { currentPincode, openPincodeModal } = usePincode();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHeroPage = pathname === "/" || pathname === "/contact";

 useEffect(() => {
   const updateScrollState = () => {
     setIsScrolled(window.scrollY > HEADER_SCROLL_THRESHOLD);
   };

   updateScrollState();

   window.addEventListener("scroll", updateScrollState, {
     passive: true,
   });

   return () => {
     window.removeEventListener("scroll", updateScrollState);
   };
 }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const closeMobile = () => setMobileOpen(false);
const headerStateClass =
  isHeroPage && !isScrolled ? "bossdent-header-hero" : "bossdent-header-scrolled";

  return (
    <header className={`bossdent-site-header bossdent-vivid-header ${headerStateClass}`}>
      <div className="bossdent-vivid-top">
        <Link href="/" className="bossdent-vivid-logo" aria-label="Bossdent home">
          <img
            src="/videos/bossdent-logo-1.jpeg"
            alt="Bossdent"
            width={230}
            height={82}
            fetchPriority="high"
          />
        </Link>

        <div className="bossdent-vivid-tools">
          <div className="bossdent-vivid-account-wrap">
            {user ? (
              <>
                <button
                  type="button"
                  className="bossdent-vivid-icon bossdent-vivid-account"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountOpen((value) => !value)}
                >
                  <UserRound aria-hidden="true" />
                  <span>{user.name.split(" ")[0]}</span>
                </button>

                {accountOpen && (
                  <div className="bossdent-vivid-account-menu" role="menu">
                    <div className="bossdent-vivid-account-intro">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                    <Link href="/account" role="menuitem" onClick={() => setAccountOpen(false)}>
                      My account
                    </Link>
                    <Link
                      href="/account/orders"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                    >
                      Orders &amp; tracking
                    </Link>
                    <Link
                      href="/account/rewards"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                    >
                      Rewards
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" role="menuitem" onClick={() => setAccountOpen(false)}>
                        Admin dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        setAccountOpen(false);
                        await logout();
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/login" className="bossdent-vivid-icon bossdent-vivid-account">
                <UserRound aria-hidden="true" />
                <span>Sign in</span>
              </Link>
            )}
          </div>

          <button
            type="button"
            className="bossdent-vivid-icon bossdent-vivid-cart-icon"
            onClick={openDrawer}
            aria-label={`Open cart, ${cartCount} items`}
          >
            <ShoppingBag aria-hidden="true" />
            <span className="bossdent-vivid-cart-label">
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </span>
            {cartCount > 0 && <span className="bossdent-vivid-count">{cartCount}</span>}
          </button>

          <Link href="/categories" className="bossdent-vivid-cta">
            Book a Consult
          </Link>

          <button
            type="button"
            className="bossdent-vivid-mobile-search"
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((value) => !value)}
          >
            <Search aria-hidden="true" />
          </button>

          <button
            type="button"
            className="bossdent-vivid-mobile-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="bossdent-vivid-mobile-search-panel">
          <SearchAutocomplete />
        </div>
      )}

      <Navbar />

      {mobileOpen && (
        <nav className="bossdent-vivid-mobile-panel" aria-label="Mobile navigation">
          <Link href="/about" onClick={closeMobile}>
            About
          </Link>
          <Link href="/categories" onClick={closeMobile}>
            Services / Categories
          </Link>
          <Link href="/best-sellers" onClick={closeMobile}>
            Problems We Treat
          </Link>
          <Link href="/brands" onClick={closeMobile}>
            Referring Doctors
          </Link>
          <Link href="/student-section" onClick={closeMobile}>
            New Patients
          </Link>
          <Link href="/contact" onClick={closeMobile}>
            Contact
          </Link>
          <button
            type="button"
            onClick={() => {
              closeMobile();
              openPincodeModal();
            }}
          >
            <MapPin aria-hidden="true" />
            Deliver to {currentPincode.pincode} · {currentPincode.city}
          </button>
        </nav>
      )}

      <PincodeModal />
      <CartDrawer />
    </header>
  );
}
