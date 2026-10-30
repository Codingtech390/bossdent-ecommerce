"use client";

import React, { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Truck, CheckCircle2, Loader2, Save } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrder = async (
    orderId: string,
    orderStatus: string,
    trackingNumber: string,
    carrier: string
  ) => {
    setUpdatingId(orderId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus,
          trackingNumber,
          carrier,
        }),
      });
      if (res.ok) {
        setMessage("Order & shipment updated!");
        setTimeout(() => setMessage(null), 3000);
        fetchOrders();
      }
    } catch {
      setMessage("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-dk-teal-800" /> Orders &amp; Shipment Tracking
          </h1>
          <p className="text-slate-500">Manage dispatch, tracking numbers, and fulfillment status</p>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading orders...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2">Order #</th>
                <th className="pb-2">Destination / Clinic</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Tracking #</th>
                <th className="pb-2">Carrier</th>
                <th className="pb-2 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => {
                let localStatus = o.orderStatus;
                let localTracking = o.shipment?.trackingNumber || "";
                let localCarrier = o.shipment?.carrier || "Delhivery Express";

                return (
                  <tr key={o._id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-dk-teal-900">{o.orderNumber}</td>
                    <td className="py-3">
                      <span className="font-bold text-slate-800 block">
                        {o.shippingAddress?.fullName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {o.shippingAddress?.clinicName || o.shippingAddress?.city}
                      </span>
                    </td>
                    <td className="py-3 font-black text-slate-900">
                      {formatPrice(o.pricing?.total || 0)}
                    </td>
                    <td className="py-3">
                      <select
                        defaultValue={o.orderStatus}
                        onChange={(e) => (localStatus = e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        defaultValue={localTracking}
                        onChange={(e) => (localTracking = e.target.value)}
                        placeholder="Tracking No."
                        className="w-32 px-2 py-1 border border-slate-300 rounded font-mono text-xs"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        defaultValue={localCarrier}
                        onChange={(e) => (localCarrier = e.target.value)}
                        className="w-28 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() =>
                          handleUpdateOrder(o._id, localStatus, localTracking, localCarrier)
                        }
                        disabled={updatingId === o._id}
                        className="px-3 py-1.5 bg-dk-teal-800 hover:bg-dk-teal-900 text-white rounded font-bold text-xs flex items-center gap-1 ml-auto shadow-sm"
                      >
                        {updatingId === o._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Save</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
