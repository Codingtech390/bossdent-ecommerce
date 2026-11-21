import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Building2,
  ArrowLeft,
  ShieldCheck,
  Layers,
  Tags,
  Boxes,
  Users,
  Settings,
  BarChart3,
  Image,
  Star,
  ChevronRight,
  Plus,
  ClipboardList,
  Store,
  Truck,
} from "lucide-react";

export const dynamic = "force-dynamic";

const navigationGroups = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Catalog Management",
    items: [
      {
        label: "All Products",
        href: "/admin/products",
        icon: Package,
      },
      {
        label: "Add Product",
        href: "/admin/products/new",
        icon: Plus,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Layers,
      },
      {
        label: "Brands",
        href: "/admin/brands",
        icon: Tags,
      },
      {
        label: "Collections",
        href: "/admin/collections",
        icon: Boxes,
      },
    ],
  },
  {
    title: "Commerce",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingBag,
      },
      {
        label: "Customers",
        href: "/admin/customers",
        icon: Users,
      },
      {
        label: "Shipping",
        href: "/admin/shipping",
        icon: Truck,
      },
    ],
  },
  {
    title: "Engagement",
    items: [
      {
        label: "Clinic Enquiries",
        href: "/admin/enquiries",
        icon: Building2,
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: Star,
      },
    ],
  },
  {
    title: "Store Management",
    items: [
      {
        label: "Homepage",
        href: "/admin/homepage",
        icon: Store,
      },
      {
        label: "Banners & Media",
        href: "/admin/banners",
        icon: Image,
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

function SidebarLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-950"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-[18px] w-[18px] shrink-0 text-slate-400 transition-colors group-hover:text-blue-800" />

        <span>{label}</span>
      </span>

      <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const adminInitial = session.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 h-[72px] border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-white shadow-md shadow-blue-950/20">
              <span className="text-sm font-black tracking-tight">B</span>
            </div>

            <div>
              <h1 className="text-base font-extrabold tracking-tight text-blue-950">BOSSDENT</h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Admin Console
              </p>
            </div>
          </Link>

          {/* Header Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Storefront */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-950 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />

              <span>Storefront</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Shell */}
      <div className="flex min-h-[calc(100vh-72px)]">
        {/* Sidebar */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[260px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          {/* Navigation: independently scrollable */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
            <div className="space-y-6">
              {navigationGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {group.title}
                  </h3>

                  <nav className="space-y-1">
                    {group.items.map((item) => (
                      <SidebarLink
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                      />
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          {/* Pinned Sidebar Bottom */}
          <div className="shrink-0 border-t border-slate-200 bg-white p-4">
            {/* Admin Profile */}
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-950 ring-1 ring-blue-200">
                {adminInitial}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {session.name || "Administrator"}
                </p>

                <div className="mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />

                  <span className="text-[10px] font-medium text-slate-500">Administrator</span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <AdminLogoutButton />

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between px-1">
              <span className="text-[10px] font-medium tracking-wide text-slate-400">
                BOSSDENT ADMIN
              </span>

              <span className="text-[10px] font-semibold text-slate-400">v1.0</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
