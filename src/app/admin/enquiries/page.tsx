"use client";

import React, { useState, useEffect } from "react";
import { Building2, Phone, Mail, CheckCircle2, Loader2, Save } from "lucide-react";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/admin/enquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdate = async (enquiryId: string, status: string, adminNotes: string) => {
    setUpdatingId(enquiryId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiryId, status, adminNotes }),
      });
      if (res.ok) {
        setMessage("Consultation lead updated!");
        setTimeout(() => setMessage(null), 3000);
        fetchEnquiries();
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
            <Building2 className="w-5 h-5 text-amber-500" /> Clinic Setup Consultation Leads
          </h1>
          <p className="text-slate-500">Inbound doctor requests for operatory packages &amp; chairs</p>
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
          <Loader2 className="w-5 h-5 animate-spin" /> Loading consultation requests...
        </div>
      ) : enquiries.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No clinic setup requests received yet.</p>
      ) : (
        <div className="space-y-4">
          {enquiries.map((e) => {
            let localStatus = e.status;
            let localNotes = e.adminNotes || "";

            return (
              <div
                key={e._id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{e.doctorName}</h3>
                    <span className="text-[11px] text-dk-teal-800 font-semibold">
                      {e.clinicName} • {e.city}, {e.state}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold uppercase text-[10px]">
                      Budget: {e.budgetRange}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-sky-100 text-sky-900 font-bold text-[10px]">
                      Chairs: {e.dentalChairsCount}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {e.phone}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {e.email}
                    </p>
                    <p className="text-slate-700 italic mt-1">
                      &ldquo;{e.message || "Consultation requested"}&rdquo;
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Status:</span>
                      <select
                        defaultValue={e.status}
                        onChange={(ev) => (localStatus = ev.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded font-semibold text-xs bg-white"
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Contacted Doctor</option>
                        <option value="quotation_sent">Quotation Sent</option>
                        <option value="closed">Deal Closed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        defaultValue={localNotes}
                        onChange={(ev) => (localNotes = ev.target.value)}
                        placeholder="Admin notes (e.g. Sent brochure & quote)"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>

                    <button
                      onClick={() => handleUpdate(e._id, localStatus, localNotes)}
                      disabled={updatingId === e._id}
                      className="px-3 py-1.5 bg-dk-teal-800 hover:bg-dk-teal-900 text-white rounded font-bold text-xs flex items-center gap-1 ml-auto shadow-sm"
                    >
                      {updatingId === e._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
