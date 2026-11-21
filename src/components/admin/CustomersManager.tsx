"use client";

import { useEffect, useState } from "react";

import {
  Search,
  RefreshCw,
  Users,
  Crown,
  Coins,
  UserRound,
  Eye,
  Pencil,
  X,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface Address {
  _id?: string;
  fullName: string;
  clinicName?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  clinicName: string;
  gstNumber: string;
  dciNumber: string;
  dentacoins: number;
  membershipTier: "none" | "plus";
  membershipExpiresAt: string | null;
  addresses: Address[];
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  initialCustomers: Customer[];
}

interface CustomerStats {
  totalCustomers: number;
  plusMembers: number;
  regularCustomers: number;
  totalDentacoins: number;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "C"
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CustomersManager({ initialCustomers }: Props) {
  const [customers, setCustomers] = useState(initialCustomers);

  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: initialCustomers.length,
    plusMembers: 0,
    regularCustomers: initialCustomers.length,
    totalDentacoins: 0,
  });

  const [search, setSearch] = useState("");

  const [membershipFilter, setMembershipFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(initialCustomers.length);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [editing, setEditing] = useState(false);

  const limit = 20;

  /* =========================================================
     EDIT FORM
  ========================================================= */

  const [form, setForm] = useState({
    name: "",
    phone: "",
    clinicName: "",
    gstNumber: "",
    dciNumber: "",
    dentacoins: 0,
    membershipTier: "none" as "none" | "plus",
    membershipExpiresAt: "",
  });

  function openCustomer(customer: Customer, edit = false) {
    setSelectedCustomer(customer);

    setEditing(edit);

    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      clinicName: customer.clinicName || "",
      gstNumber: customer.gstNumber || "",
      dciNumber: customer.dciNumber || "",
      dentacoins: customer.dentacoins || 0,
      membershipTier: customer.membershipTier || "none",
      membershipExpiresAt: customer.membershipExpiresAt
        ? customer.membershipExpiresAt.slice(0, 10)
        : "",
    });
  }

  function closeModal() {
    setSelectedCustomer(null);
    setEditing(false);
  }

  /* =========================================================
     FETCH BACKEND DATA
  ========================================================= */

  async function fetchCustomers(currentPage = page, showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        search,
        membership: membershipFilter,
      });

      const response = await fetch(`/api/admin/customers?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load customers.");
      }

      setCustomers(data.customers || []);

      setTotal(data.total || 0);

      setPage(data.page || currentPage);

      setTotalPages(data.totalPages || 1);

      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     SEARCH / FILTER
  ========================================================= */

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCustomers(1);
    }, 350);

    return () => clearTimeout(timeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, membershipFilter]);

  /* =========================================================
     SAVE CUSTOMER
  ========================================================= */

  async function saveCustomer() {
    if (!selectedCustomer) return;

    if (!form.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          name: form.name,
          phone: form.phone,
          clinicName: form.clinicName,
          gstNumber: form.gstNumber,
          dciNumber: form.dciNumber,
          dentacoins: Number(form.dentacoins),
          membershipTier: form.membershipTier,
          membershipExpiresAt: form.membershipExpiresAt || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update customer.");
      }

      setSuccess("Customer updated successfully.");

      closeModal();

      await fetchCustomers(page, false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update customer.");
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f5f3f0] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage customer accounts, profiles and membership.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchCustomers(page)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={formatNumber(stats.totalCustomers)}
            icon={<Users className="h-5 w-5" />}
            color="blue"
          />

          <StatCard
            title="Bossdent Plus"
            value={formatNumber(stats.plusMembers)}
            icon={<Crown className="h-5 w-5" />}
            color="purple"
          />

          <StatCard
            title="Regular Customers"
            value={formatNumber(stats.regularCustomers)}
            icon={<UserRound className="h-5 w-5" />}
            color="green"
          />

          <StatCard
            title="Total Dentacoins"
            value={formatNumber(stats.totalDentacoins)}
            icon={<Coins className="h-5 w-5" />}
            color="amber"
          />
        </div>

        {/* CUSTOMER DIRECTORY */}

        <div className="overflow-hidden border border-slate-200 bg-white">
          {/* TOOLBAR */}

          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Customer Directory</h2>

              <p className="mt-1 text-xs text-slate-500">Search and manage registered customers.</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* SEARCH */}

              <div className="relative min-w-0 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customers..."
                  className="w-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* MEMBERSHIP FILTER */}

              <select
                value={membershipFilter}
                onChange={(event) => setMembershipFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Memberships</option>

                <option value="none">Regular Customers</option>

                <option value="plus">Bossdent Plus</option>
              </select>
            </div>
          </div>

          {/* TABLE HEADER */}

          <div className="hidden grid-cols-[1.6fr_1.4fr_1fr_0.8fr_0.8fr_80px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 xl:grid">
            <span>Customer</span>
            <span>Contact</span>
            <span>Membership</span>
            <span>Orders</span>
            <span>Dentacoins</span>
            <span className="text-right">Action</span>
          </div>

          {/* TABLE BODY */}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-sm font-semibold text-slate-700">No customers found</h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or membership filter.
              </p>
            </div>
          ) : (
            customers.map((customer) => (
              <CustomerRow
                key={customer._id}
                customer={customer}
                onView={() => openCustomer(customer)}
                onEdit={() => openCustomer(customer, true)}
              />
            ))
          )}

          {/* PAGINATION */}

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
              of {total} customers
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => fetchCustomers(page - 1)}
                className="inline-flex items-center gap-1 border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="px-2 text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => fetchCustomers(page + 1)}
                className="inline-flex items-center gap-1 border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CUSTOMER DETAILS MODAL
      ===================================================== */}

      {selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          editing={editing}
          form={form}
          saving={saving}
          onChange={setForm}
          onEdit={() => setEditing(true)}
          onSave={saveCustomer}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "purple" | "green" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-violet-50 text-violet-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOMER ROW
========================================================= */

function CustomerRow({
  customer,
  onView,
  onEdit,
}: {
  customer: Customer;
  onView: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 border-b border-slate-100 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-5 xl:grid-cols-[1.6fr_1.4fr_1fr_0.8fr_0.8fr_80px] xl:items-center xl:gap-4">
      {/* CUSTOMER */}

      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
          {initials(customer.name)}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {customer.name || "Unnamed Customer"}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            Joined {formatDate(customer.createdAt)}
          </p>
        </div>
      </div>

      {/* CONTACT */}

      <div className="min-w-0 space-y-1">
        <p className="flex items-center gap-2 truncate text-xs text-slate-600">
          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

          {customer.email || "No email"}
        </p>

        <p className="flex items-center gap-2 truncate text-xs text-slate-500">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />

          {customer.phone || "No phone"}
        </p>

        {customer.clinicName && (
          <p className="flex items-center gap-2 truncate text-xs text-slate-400">
            <Building2 className="h-3.5 w-3.5 shrink-0" />

            {customer.clinicName}
          </p>
        )}
      </div>

      {/* MEMBERSHIP */}

      <div>
        {customer.membershipTier === "plus" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
            <Crown className="h-3.5 w-3.5" />
            Bossdent Plus
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            Regular
          </span>
        )}
      </div>

      {/* ORDERS */}

      <div>
        <p className="text-sm font-semibold text-slate-800">{customer.orderCount || 0}</p>

        <p className="mt-1 text-xs text-slate-400">Orders</p>
      </div>

      {/* DENTACOINS */}

      <div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-700">
          <Coins className="h-4 w-4" />

          {formatNumber(customer.dentacoins)}
        </p>

        <p className="mt-1 text-xs text-slate-400">Balance</p>
      </div>

      {/* ACTION */}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onView}
          title="View customer"
          className="border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Eye className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onEdit}
          title="Edit customer"
          className="border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOMER MODAL
========================================================= */

function CustomerModal({
  customer,
  editing,
  form,
  saving,
  onChange,
  onEdit,
  onSave,
  onClose,
}: {
  customer: Customer;
  editing: boolean;
  form: {
    name: string;
    phone: string;
    clinicName: string;
    gstNumber: string;
    dciNumber: string;
    dentacoins: number;
    membershipTier: "none" | "plus";
    membershipExpiresAt: string;
  };
  saving: boolean;
  onChange: React.Dispatch<
    React.SetStateAction<{
      name: string;
      phone: string;
      clinicName: string;
      gstNumber: string;
      dciNumber: string;
      dentacoins: number;
      membershipTier: "none" | "plus";
      membershipExpiresAt: string;
    }>
  >;
  onEdit: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Details</h2>

            <p className="mt-1 text-xs text-slate-500">{customer.email}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}

        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* CUSTOMER PROFILE */}

            <section className="border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-800">Customer Profile</h3>
              </div>

              <div className="space-y-4 p-4">
                {/* NAME */}

                <Field
                  label="Full Name"
                  value={form.name}
                  editing={editing}
                  onChange={(value) =>
                    onChange((previous) => ({
                      ...previous,
                      name: value,
                    }))
                  }
                />

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>

                  <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                    <Mail className="h-4 w-4" />

                    {customer.email}
                  </div>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Email cannot be changed from this page.
                  </p>
                </div>

                {/* PHONE */}

                <Field
                  label="Phone"
                  value={form.phone}
                  editing={editing}
                  onChange={(value) =>
                    onChange((previous) => ({
                      ...previous,
                      phone: value,
                    }))
                  }
                />

                {/* CLINIC */}

                <Field
                  label="Clinic / Organization"
                  value={form.clinicName}
                  editing={editing}
                  onChange={(value) =>
                    onChange((previous) => ({
                      ...previous,
                      clinicName: value,
                    }))
                  }
                />

                {/* GST */}

                <Field
                  label="GST Number"
                  value={form.gstNumber}
                  editing={editing}
                  onChange={(value) =>
                    onChange((previous) => ({
                      ...previous,
                      gstNumber: value,
                    }))
                  }
                />

                {/* DCI */}

                <Field
                  label="DCI Registration Number"
                  value={form.dciNumber}
                  editing={editing}
                  onChange={(value) =>
                    onChange((previous) => ({
                      ...previous,
                      dciNumber: value,
                    }))
                  }
                />
              </div>
            </section>

            {/* MEMBERSHIP */}

            <section className="border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-800">Membership & Rewards</h3>
              </div>

              <div className="space-y-4 p-4">
                {/* MEMBERSHIP */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Membership Tier
                  </label>

                  {editing ? (
                    <select
                      value={form.membershipTier}
                      onChange={(event) =>
                        onChange((previous) => ({
                          ...previous,
                          membershipTier: event.target.value as "none" | "plus",
                        }))
                      }
                      className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="none">Regular Customer</option>

                      <option value="plus">Bossdent Plus</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                      {customer.membershipTier === "plus" ? (
                        <>
                          <Crown className="h-4 w-4 text-violet-600" />
                          Bossdent Plus
                        </>
                      ) : (
                        "Regular Customer"
                      )}
                    </div>
                  )}
                </div>

                {/* EXPIRY */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Membership Expiry
                  </label>

                  {editing ? (
                    <input
                      type="date"
                      value={form.membershipExpiresAt}
                      onChange={(event) =>
                        onChange((previous) => ({
                          ...previous,
                          membershipExpiresAt: event.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />

                      {formatDate(customer.membershipExpiresAt)}
                    </div>
                  )}
                </div>

                {/* DENTACOINS */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Dentacoins Balance
                  </label>

                  {editing ? (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.dentacoins}
                      onChange={(event) =>
                        onChange((previous) => ({
                          ...previous,
                          dentacoins: Number(event.target.value),
                        }))
                      }
                      className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700">
                      <Coins className="h-4 w-4" />

                      {formatNumber(customer.dentacoins)}
                    </div>
                  )}
                </div>

                {/* ORDER COUNT */}

                <div className="border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Total Orders</p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {customer.orderCount || 0}
                      </p>
                    </div>

                    <ShoppingBag className="h-6 w-6 text-slate-400" />
                  </div>
                </div>

                {/* CREATED */}

                <div>
                  <p className="text-xs text-slate-500">Customer Since</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatDate(customer.createdAt)}
                  </p>
                </div>
              </div>
            </section>

            {/* ADDRESSES */}

            <section className="border border-slate-200 lg:col-span-2">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Saved Addresses ({customer.addresses.length})
                </h3>
              </div>

              {customer.addresses.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  This customer has no saved addresses.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                  {customer.addresses.map((address, index) => (
                    <div key={address._id || index} className="border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800">{address.fullName}</p>

                        {address.isDefault && (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                            Default
                          </span>
                        )}
                      </div>

                      {address.clinicName && (
                        <p className="mt-1 text-xs text-slate-500">{address.clinicName}</p>
                      )}

                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                        {address.landmark ? `, ${address.landmark}` : ""}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {address.city}, {address.state} {address.pincode}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="h-3.5 w-3.5" />

                        {address.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>

          {!editing ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Pencil className="h-4 w-4" />
              Edit Customer
            </button>
          ) : (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}

              {saving ? "Saving..." : "Save Customer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD COMPONENT
========================================================= */

function Field({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-700">{label}</label>

      {editing ? (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
      ) : (
        <div className="border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          {value || "—"}
        </div>
      )}
    </div>
  );
}
