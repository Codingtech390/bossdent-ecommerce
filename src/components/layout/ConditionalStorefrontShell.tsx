"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ConditionalStorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  // Admin pages should not inherit the public storefront UI.
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Normal public storefront layout.
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
