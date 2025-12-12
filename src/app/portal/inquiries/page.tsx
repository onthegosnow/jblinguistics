"use client";

import { useState } from "react";

type Inquiry = {
  id: string;
  createdAt: string | null;
  name: string;
  email: string;
  organization: string | null;
  serviceType: string | null;
  languages: string | null;
  details: string | null;
  source: string;
  metadata?: Record<string, string> | null;
};

export default function PortalInquiriesPage() {
  const [adminToken, setAdminToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [working, setWorking] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const load = async () => {
    if (!adminToken.trim()) {
      setError("Enter the admin token to load inquiries.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/admin/inquiries", { headers: { "x-admin-token": adminToken.trim() } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load inquiries.");
      }
      const data = (await res.json()) as { inquiries: Inquiry[] };
      setInquiries(data.inquiries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load inquiries.");
    } finally {
      setLoading(false);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!adminToken.trim()) return;
    const confirmed = typeof window === "undefined" ? true : window.confirm("Delete this inquiry?");
    if (!confirmed) return;
    setWorking(id);
    try {
      const res = await fetch(`/api/portal/admin/inquiries/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": adminToken.trim() },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to delete inquiry.");
      }
      setInquiries((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete inquiry.");
    } finally {
      setWorking(null);
    }
  };

  const markProspect = async (inq: Inquiry) => {
    if (!adminToken.trim()) return;
    setWorking(inq.id);
    setPromoMessage(null);
    const newMetadata = { ...(inq.metadata ?? {}), marketingStatus: "prospect" };
    try {
      const res = await fetch(`/api/portal/admin/inquiries/${inq.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-admin-token": adminToken.trim() },
        body: JSON.stringify({ metadata: newMetadata }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to update inquiry.");
      }
      setInquiries((prev) =>
        prev.map((item) => (item.id === inq.id ? { ...item, metadata: newMetadata } : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update inquiry.");
    } finally {
      setWorking(null);
    }
  };

  const sendToCrm = async (inq: Inquiry, contactType: "student" | "client") => {
    if (!adminToken.trim()) return;
    setWorking(inq.id);
    setPromoMessage(null);
    try {
      const res = await fetch("/api/portal/admin/crm/contacts", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": adminToken.trim() },
        body: JSON.stringify({
          inquiryId: inq.id,
          contactType,
          serviceInterest: inq.serviceType ?? undefined,
          status: "lead",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to send to CRM.");
      }
      setPromoMessage(`Sent ${inq.name} to ${contactType === "student" ? "Student" : "Client"} CRM.`);
      // Optional: mark in metadata
      const updated = { ...(inq.metadata ?? {}), marketingStatus: "prospect" };
      setInquiries((prev) => prev.map((item) => (item.id === inq.id ? { ...item, metadata: updated } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send to CRM.");
    } finally {
      setWorking(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-10 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">JB Linguistics</p>
            <h1 className="text-2xl font-semibold text-slate-900">Admin · Inquiries</h1>
            <p className="text-sm text-slate-600">Review contact form submissions</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm min-w-[240px]"
              placeholder="Admin token"
            />
            <button
              type="button"
              onClick={load}
              className="rounded-xl bg-sky-900 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-800"
              disabled={loading}
            >
              {loading ? "Loading…" : "Load inquiries"}
            </button>
          </div>
        </header>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {promoMessage && <p className="text-sm text-emerald-700">{promoMessage}</p>}

        {inquiries.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm text-slate-800">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Service</th>
                  <th className="px-3 py-2 text-left">Languages</th>
                  <th className="px-3 py-2 text-left">Details</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-left">Marketing</th>
                  <th className="px-3 py-2 text-left">Submitted</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2 font-semibold text-sky-900">
                      <div>{inq.name}</div>
                      {inq.organization && <div className="text-xs text-slate-500">{inq.organization}</div>}
                    </td>
                    <td className="px-3 py-2">
                      <a href={`mailto:${inq.email}`} className="text-sky-700 hover:underline">
                        {inq.email}
                      </a>
                    </td>
                    <td className="px-3 py-2">{inq.serviceType ?? "—"}</td>
                    <td className="px-3 py-2">{inq.languages ?? "—"}</td>
                    <td className="px-3 py-2 max-w-xs whitespace-pre-wrap break-words">{inq.details ?? "—"}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{inq.source}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 space-y-1">
                      {inq.metadata?.marketingOptIn === "true" ? "Opted in" : "No opt-in"}
                      {inq.metadata?.marketingStatus ? <div>Status: {inq.metadata.marketingStatus}</div> : null}
                      {inq.metadata?.preferredStaff ? <div>Staff: {inq.metadata.preferredStaff}</div> : null}
                      {inq.metadata?.referral ? <div>Referral: {inq.metadata.referral}</div> : null}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 space-y-2">
                      <button
                        type="button"
                        onClick={() => markProspect(inq)}
                        disabled={working === inq.id}
                        className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
                      >
                        {working === inq.id ? "Saving…" : "Send to CRM"}
                      </button>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => sendToCrm(inq, "student")}
                          disabled={working === inq.id}
                          className="inline-flex items-center rounded-full bg-sky-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-sky-400 disabled:opacity-60"
                        >
                          {working === inq.id ? "Sending…" : "To Student CRM"}
                        </button>
                        <button
                          type="button"
                          onClick={() => sendToCrm(inq, "client")}
                          disabled={working === inq.id}
                          className="inline-flex items-center rounded-full bg-indigo-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
                        >
                          {working === inq.id ? "Sending…" : "To Client CRM"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteInquiry(inq.id)}
                        disabled={working === inq.id}
                        className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                      >
                        {working === inq.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-600">No inquiries loaded yet.</p>
        )}
      </div>
    </main>
  );
}
