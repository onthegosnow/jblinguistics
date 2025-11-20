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
};

export default function PortalInquiriesPage() {
  const [adminToken, setAdminToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

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
                  <th className="px-3 py-2 text-left">Submitted</th>
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
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : "—"}
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
