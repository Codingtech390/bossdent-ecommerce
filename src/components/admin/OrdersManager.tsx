"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  Save,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface OrderItem {
  _id?: string;
  product: string;
  name: string;
  slug?: string;
  sku?: string;
  image?: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

interface Customer {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Shipment {
  courier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status?: "pending" | "shipped" | "in_transit" | "delivered";
  shippedAt?: string;
  deliveredAt?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user?: Customer | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider?: string;
  shipment?: Shipment;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  initialOrders: Order[];
}

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-violet-50 text-violet-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

const paymentStyles: Record<PaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-violet-50 text-violet-700",
};

function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function OrdersManager({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(initialOrders.length);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const limit = 20;

  const [editStatus, setEditStatus] = useState<OrderStatus>("pending");

  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>("pending");

  const [editCourier, setEditCourier] = useState("");
  const [editTrackingNumber, setEditTrackingNumber] = useState("");
  const [editTrackingUrl, setEditTrackingUrl] = useState("");

  /* =========================================================
     INITIAL SELECTED ORDER
  ========================================================= */

  useEffect(() => {
    if (!selectedOrder) return;

    setEditStatus(selectedOrder.status);
    setEditPaymentStatus(selectedOrder.paymentStatus);

    setEditCourier(selectedOrder.shipment?.courier || "");

    setEditTrackingNumber(selectedOrder.shipment?.trackingNumber || "");

    setEditTrackingUrl(selectedOrder.shipment?.trackingUrl || "");
  }, [selectedOrder]);

  /* =========================================================
     FETCH ORDERS FROM BACKEND
  ========================================================= */

  async function fetchOrders(currentPage = page, showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
      });

      const response = await fetch(`/api/admin/orders?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders.");
      }

      setOrders(data.orders || []);
      setTotalOrders(data.total || 0);
      setPage(data.page || currentPage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     FILTER CHANGES
  ========================================================= */

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchOrders(1);
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, paymentFilter]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const stats = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter((order) => order.status === "pending").length;

    const processing = orders.filter(
      (order) => order.status === "processing" || order.status === "confirmed",
    ).length;

    const delivered = orders.filter((order) => order.status === "delivered").length;

    const revenue = orders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((sum, order) => sum + order.total, 0);

    return {
      total,
      pending,
      processing,
      delivered,
      revenue,
    };
  }, [orders]);

  const totalPages = Math.max(1, Math.ceil(totalOrders / limit));

  /* =========================================================
     UPDATE ORDER
  ========================================================= */

  async function handleSaveOrder() {
    if (!selectedOrder) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          status: editStatus,
          paymentStatus: editPaymentStatus,
          shipment: {
            courier: editCourier,
            trackingNumber: editTrackingNumber,
            trackingUrl: editTrackingUrl,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order.");
      }

      setSuccess("Order updated successfully.");

      setSelectedOrder(null);

      await fetchOrders(page, false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update order.");
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     OPEN ORDER DETAILS
  ========================================================= */

  function openOrder(order: Order) {
    setSelectedOrder(order);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage customer orders, payments and shipments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(page)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Orders
          </button>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Orders Loaded"
            value={stats.total}
            icon={<ShoppingBag className="h-5 w-5" />}
            color="blue"
          />

          <StatCard
            title="Pending Orders"
            value={stats.pending}
            icon={<Clock className="h-5 w-5" />}
            color="amber"
          />

          <StatCard
            title="Processing"
            value={stats.processing}
            icon={<Package className="h-5 w-5" />}
            color="purple"
          />

          <StatCard
            title="Delivered"
            value={stats.delivered}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="green"
          />
        </div>

        {/* ORDER TABLE */}

        <div className="overflow-hidden border border-slate-200 bg-white">
          {/* FILTERS */}

          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Order Directory</h2>

              <p className="mt-1 text-xs text-slate-500">{totalOrders} total orders</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Search */}

              <div className="relative min-w-0 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search orders..."
                  className="w-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Status */}

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Order Status</option>

                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>

              {/* Payment */}

              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Payment Status</option>

                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE HEADER */}

          <div className="hidden grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_80px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 lg:grid">
            <span>Order</span>
            <span>Customer</span>
            <span>Order Status</span>
            <span>Payment</span>
            <span>Total</span>
            <span className="text-right">Action</span>
          </div>

          {/* TABLE BODY */}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-sm font-semibold text-slate-700">No orders found</h3>

              <p className="mt-1 text-xs text-slate-400">Try changing your search or filters.</p>
            </div>
          ) : (
            orders.map((order) => (
              <OrderRow key={order._id} order={order} onView={() => openOrder(order)} />
            ))
          )}

          {/* PAGINATION */}

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {totalOrders === 0 ? 0 : (page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, totalOrders)} of {totalOrders} orders
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => fetchOrders(page - 1)}
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
                onClick={() => fetchOrders(page + 1)}
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
          ORDER DETAILS MODAL
      ===================================================== */}

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-6">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Order {selectedOrder.orderNumber}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Placed {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* LEFT */}

                <div className="space-y-6 lg:col-span-2">
                  {/* ITEMS */}

                  <section className="border border-slate-200">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-semibold text-slate-800">Order Items</h3>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {selectedOrder.items.map((item, index) => (
                        <div key={item._id || index} className="flex gap-4 p-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-50">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-slate-300" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800">{item.name}</p>

                            {item.sku && (
                              <p className="mt-1 text-xs text-slate-400">SKU: {item.sku}</p>
                            )}

                            <p className="mt-2 text-xs text-slate-500">
                              {formatCurrency(item.price, selectedOrder.currency)} × {item.quantity}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatCurrency(item.lineTotal, selectedOrder.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* SHIPPING ADDRESS */}

                  <section className="border border-slate-200">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Shipping Address
                      </h3>
                    </div>

                    <div className="space-y-2 p-4 text-sm text-slate-600">
                      <p className="font-semibold text-slate-900">
                        {selectedOrder.shippingAddress?.fullName}
                      </p>

                      <p>{selectedOrder.shippingAddress?.addressLine1}</p>

                      {selectedOrder.shippingAddress?.addressLine2 && (
                        <p>{selectedOrder.shippingAddress.addressLine2}</p>
                      )}

                      <p>
                        {selectedOrder.shippingAddress?.city},{" "}
                        {selectedOrder.shippingAddress?.state}{" "}
                        {selectedOrder.shippingAddress?.postalCode}
                      </p>

                      <p>{selectedOrder.shippingAddress?.country}</p>

                      <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-100 pt-3">
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {selectedOrder.shippingAddress?.phone}
                        </p>

                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {selectedOrder.shippingAddress?.email}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* PAYMENT DETAILS */}

                  <section className="border border-slate-200">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        Payment Information
                      </h3>
                    </div>

                    <div className="space-y-3 p-4 text-xs text-slate-600">
                      <InfoRow
                        label="Payment Provider"
                        value={
                          selectedOrder.paymentProvider
                            ? titleCase(selectedOrder.paymentProvider)
                            : "Not specified"
                        }
                      />

                      {selectedOrder.razorpayOrderId && (
                        <InfoRow label="Razorpay Order ID" value={selectedOrder.razorpayOrderId} />
                      )}

                      {selectedOrder.razorpayPaymentId && (
                        <InfoRow
                          label="Razorpay Payment ID"
                          value={selectedOrder.razorpayPaymentId}
                        />
                      )}

                      {selectedOrder.cashfreeOrderId && (
                        <InfoRow label="Cashfree Order ID" value={selectedOrder.cashfreeOrderId} />
                      )}

                      {selectedOrder.cashfreePaymentId && (
                        <InfoRow
                          label="Cashfree Payment ID"
                          value={selectedOrder.cashfreePaymentId}
                        />
                      )}
                    </div>
                  </section>
                </div>

                {/* RIGHT */}

                <div className="space-y-6">
                  {/* CUSTOMER */}

                  <section className="border border-slate-200">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <User className="h-4 w-4 text-blue-600" />
                        Customer
                      </h3>
                    </div>

                    <div className="space-y-2 p-4 text-sm">
                      <p className="font-semibold text-slate-900">
                        {selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {selectedOrder.user?.email || selectedOrder.shippingAddress?.email}
                      </p>

                      <p className="text-xs text-slate-500">
                        {selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone}
                      </p>
                    </div>
                  </section>

                  {/* TOTALS */}

                  <section className="border border-slate-200">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-semibold text-slate-800">Order Summary</h3>
                    </div>

                    <div className="space-y-3 p-4 text-sm">
                      <InfoRow
                        label="Subtotal"
                        value={formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}
                      />

                      <InfoRow
                        label="Shipping"
                        value={formatCurrency(selectedOrder.shipping, selectedOrder.currency)}
                      />

                      <InfoRow
                        label="Discount"
                        value={`-${formatCurrency(selectedOrder.discount, selectedOrder.currency)}`}
                      />

                      <div className="border-t border-slate-200 pt-3">
                        <InfoRow
                          label="Total"
                          value={formatCurrency(selectedOrder.total, selectedOrder.currency)}
                          strong
                        />
                      </div>
                    </div>
                  </section>

                  {/* UPDATE STATUS */}

                  <section className="border border-slate-200">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-semibold text-slate-800">Update Order</h3>
                    </div>

                    <div className="space-y-4 p-4">
                      {/* Order status */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-700">
                          Order Status
                        </label>

                        <select
                          value={editStatus}
                          onChange={(event) => setEditStatus(event.target.value as OrderStatus)}
                          className="w-full border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {titleCase(status)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Payment status */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-700">
                          Payment Status
                        </label>

                        <select
                          value={editPaymentStatus}
                          onChange={(event) =>
                            setEditPaymentStatus(event.target.value as PaymentStatus)
                          }
                          className="w-full border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                        >
                          {PAYMENT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {titleCase(status)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Courier */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-700">
                          Courier
                        </label>

                        <input
                          value={editCourier}
                          onChange={(event) => setEditCourier(event.target.value)}
                          placeholder="e.g. Delhivery, Blue Dart"
                          className="w-full border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Tracking */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-700">
                          Tracking Number / AWB
                        </label>

                        <input
                          value={editTrackingNumber}
                          onChange={(event) => setEditTrackingNumber(event.target.value)}
                          placeholder="Enter AWB number"
                          className="w-full border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Tracking URL */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-700">
                          Tracking URL
                        </label>

                        <input
                          type="url"
                          value={editTrackingUrl}
                          onChange={(event) => setEditTrackingUrl(event.target.value)}
                          placeholder="https://..."
                          className="w-full border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Save */}

                      <button
                        type="button"
                        onClick={handleSaveOrder}
                        disabled={saving}
                        className="flex w-full items-center justify-center gap-2 bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}

                        {saving ? "Saving..." : "Save Order Changes"}
                      </button>

                      {editTrackingUrl && (
                        <a
                          href={editTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Open Tracking Page
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
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
  color: "blue" | "green" | "amber" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-violet-50 text-violet-700",
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
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "font-semibold text-slate-900" : "text-slate-500"}>{label}</span>

      <span className={strong ? "text-base font-bold text-slate-900" : "text-slate-700"}>
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   ORDER ROW
========================================================= */

function OrderRow({ order, onView }: { order: Order; onView: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 border-b border-slate-100 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-5 lg:grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_80px] lg:items-center lg:gap-4">
      {/* ORDER */}

      <div>
        <p className="text-sm font-semibold text-blue-700">{order.orderNumber}</p>

        <p className="mt-1 text-xs text-slate-400">{formatDate(order.createdAt)}</p>
      </div>

      {/* CUSTOMER */}

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">
          {order.user?.name || order.shippingAddress?.fullName || "Customer"}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {order.user?.email || order.shippingAddress?.email}
        </p>

        <p className="mt-1 text-xs text-slate-400">{order.items?.length || 0} item(s)</p>
      </div>

      {/* ORDER STATUS */}

      <div>
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${statusStyles[order.status]}`}
        >
          {titleCase(order.status)}
        </span>
      </div>

      {/* PAYMENT */}

      <div>
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${paymentStyles[order.paymentStatus]}`}
        >
          {titleCase(order.paymentStatus)}
        </span>
      </div>

      {/* TOTAL */}

      <div>
        <p className="text-sm font-semibold text-slate-900">
          {formatCurrency(order.total, order.currency)}
        </p>

        {order.shipment?.trackingNumber && (
          <p className="mt-1 truncate text-xs text-slate-400">
            AWB: {order.shipment.trackingNumber}
          </p>
        )}
      </div>

      {/* ACTION */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Eye className="h-4 w-4" />
          View
        </button>
      </div>
    </div>
  );
}
