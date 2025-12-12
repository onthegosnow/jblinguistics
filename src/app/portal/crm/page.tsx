"use client";

import { useEffect, useState } from "react";

type CRMContact = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  role_title?: string | null;
  contact_type?: string | null;
  service_interest?: string | null;
  status?: string | null;
  marketing_opt_in?: boolean | null;
  next_followup_at?: string | null;
  created_at?: string | null;
  notes?: string | null;
};

type Interaction = {
  id: string;
  contact_id: string;
  kind?: string | null;
  summary?: string | null;
  next_followup_at?: string | null;
  created_at?: string | null;
};

export default function CRMPage() {
  const [adminToken, setAdminToken] = useState("");
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [selected, setSelected] = useState<CRMContact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [note, setNote] = useState("");
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    contactType: "client",
    serviceInterest: "",
    status: "lead",
  });

  const loadContacts = async () => {
    if (!adminToken.trim()) {
      setError("Enter admin token.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/admin/crm/contacts", { headers: { "x-admin-token": adminToken.trim() } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load contacts.");
      }
      const data = await res.json();
      setContacts(data.contacts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  const selectContact = async (contact: CRMContact) => {
    setSelected(contact);
    setNote("");
    if (!adminToken.trim()) return;
    try {
      const res = await fetch(`/api/portal/admin/crm/contacts/${contact.id}/interactions`, {
        headers: { "x-admin-token": adminToken.trim() },
      });
      if (!res.ok) return;
      const data = await res.json();
      setInteractions(data.interactions ?? []);
    } catch {
      // ignore
    }
  };

  const addNote = async () => {
    if (!selected || !note.trim() || !adminToken.trim()) return;
    setWorking(true);
    try {
      const res = await fetch(`/api/portal/admin/crm/contacts/${selected.id}/interactions`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": adminToken.trim() },
        body: JSON.stringify({ summary: note.trim(), kind: "note" }),
      });
      if (!res.ok) throw new Error("Unable to add note.");
      const data = await res.json();
      setInteractions((prev) => [data.interaction, ...prev]);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add note.");
    } finally {
      setWorking(false);
    }
  };

  const addContact = async () => {
    if (!adminToken.trim()) return;
    if (!newContact.name || !newContact.email) {
      setError("Name and email required.");
      return;
    }
    setWorking(true);
    try {
      const res = await fetch("/api/portal/admin/crm/contacts", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": adminToken.trim() },
        body: JSON.stringify({
          name: newContact.name,
          email: newContact.email,
          contactType: newContact.contactType,
          serviceInterest: newContact.serviceInterest || undefined,
          status: newContact.status,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to create contact.");
      }
      const data = await res.json();
      setContacts((prev) => [data.contact, ...prev]);
      setNewContact({ name: "", email: "", contactType: "client", serviceInterest: "", status: "lead" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create contact.");
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => {
    if (!selected && contacts.length) {
      void selectContact(contacts[0]);
    }
  }, [contacts]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-10 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">JB Linguistics</p>
            <h1 className="text-2xl font-semibold text-slate-900">Admin · CRM</h1>
            <p className="text-sm text-slate-600">Manage contacts, notes, and follow-ups.</p>
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
              onClick={loadContacts}
              className="rounded-xl bg-sky-900 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-800"
              disabled={loading}
            >
              {loading ? "Loading…" : "Load contacts"}
            </button>
          </div>
        </header>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              Contacts
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              {contacts.map((c) => {
                const active = selected?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => selectContact(c)}
                    className={`w-full text-left px-3 py-3 border-b border-slate-100 ${
                      active ? "bg-sky-50" : "bg-white"
                    } hover:bg-slate-50 transition`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <span className="text-[11px] text-slate-500">{c.status ?? "lead"}</span>
                    </div>
                    <div className="text-xs text-slate-600">{c.email}</div>
                    <div className="text-xs text-slate-500">
                      {c.contact_type ?? "—"} · {c.service_interest ?? "—"}
                    </div>
                    {c.next_followup_at ? (
                      <div className="text-[11px] text-amber-700">
                        Follow-up: {new Date(c.next_followup_at).toLocaleString()}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Add contact</h2>
              <div className="grid gap-2 text-sm">
                <input
                  value={newContact.name}
                  onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  placeholder="Name"
                />
                <input
                  value={newContact.email}
                  onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  placeholder="Email"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newContact.contactType}
                    onChange={(e) => setNewContact((p) => ({ ...p, contactType: e.target.value }))}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  >
                    <option value="client">Client</option>
                    <option value="student">Student</option>
                    <option value="partner">Partner</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={newContact.status}
                    onChange={(e) => setNewContact((p) => ({ ...p, status: e.target.value }))}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <input
                  value={newContact.serviceInterest}
                  onChange={(e) => setNewContact((p) => ({ ...p, serviceInterest: e.target.value }))}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  placeholder="Service interest (optional)"
                />
                <button
                  type="button"
                  onClick={addContact}
                  disabled={working}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {working ? "Saving…" : "Save contact"}
                </button>
              </div>
            </div>

            {selected ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{selected.name}</h2>
                  <p className="text-xs text-slate-600">{selected.email}</p>
                  <p className="text-xs text-slate-500">
                    {selected.contact_type ?? "—"} · {selected.service_interest ?? "—"} · {selected.status ?? "lead"}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <h3 className="text-xs font-semibold text-slate-700 mb-1">Interactions / notes</h3>
                  <div className="flex gap-2 mb-2">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Add a note..."
                    />
                    <button
                      type="button"
                      onClick={addNote}
                      disabled={working}
                      className="h-fit mt-auto rounded-full bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
                    >
                      {working ? "Saving…" : "Add note"}
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {interactions.length === 0 ? (
                      <p className="text-xs text-slate-500">No notes yet.</p>
                    ) : (
                      interactions.map((item) => (
                        <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                          <div className="text-slate-900 font-semibold">{item.kind ?? "note"}</div>
                          <div className="text-slate-700 whitespace-pre-wrap break-words">{item.summary ?? ""}</div>
                          <div className="text-[10px] text-slate-500">
                            {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 text-sm text-slate-600">
                Select a contact to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
