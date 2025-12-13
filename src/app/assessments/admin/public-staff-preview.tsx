"use client";

import { useEffect, useState } from "react";

type Profile = {
  id?: string;
  user_id?: string;
  slug?: string;
  name?: string;
  photo_url?: string;
  roles?: string[];
  teaching_languages?: string[];
  translating_languages?: string[];
  languages_display?: string;
  tagline?: string;
  overview?: string[];
  specialties?: string[];
  location?: string;
  region?: string;
  visibility?: string;
  updated_at?: string;
};

export function PublicStaffPreview({ token }: { token: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/public-staff", { headers: { "x-admin-token": token } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load staff profiles.");
      }
      const data = await res.json();
      setProfiles(data.profiles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load staff profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfiles();
  }, [token]);

  const updateVisibility = async (profile: Profile, action: "approve" | "hide") => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch("/api/admin/public-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ action, slug: profile.slug, userId: profile.user_id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to update visibility.");
      }
      await loadProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update visibility.");
    }
  };

  const pending = profiles.filter((p) => (p.visibility ?? "pending") !== "visible");
  const visible = profiles.filter((p) => (p.visibility ?? "pending") === "visible");

  const renderCard = (profile: Profile) => {
    const overviews = profile.overview?.length ? profile.overview : [];
    const specialties = profile.specialties ?? [];
    return (
      <div
        key={profile.slug || profile.user_id || profile.id}
        className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 space-y-3"
      >
        <div className="flex items-center gap-3">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={profile.name ?? ""} className="h-16 w-16 rounded-full object-cover border border-slate-600" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-slate-700" />
          )}
          <div>
            <p className="text-base font-semibold text-white">{profile.name}</p>
            <p className="text-xs text-slate-400">{profile.slug}</p>
            <p className="text-xs text-slate-400">{profile.roles?.join(", ")}</p>
            <p className="text-xs text-slate-400">Visibility: {profile.visibility ?? "pending"}</p>
          </div>
        </div>
        {profile.tagline ? <p className="text-sm text-slate-100">{profile.tagline}</p> : null}
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Overview</p>
          {overviews.length ? (
            overviews.map((para, idx) => (
              <p key={idx} className="text-sm text-slate-200">
                {para}
              </p>
            ))
          ) : (
            <p className="text-xs text-slate-400">No overview yet.</p>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Teaching: {(profile.teaching_languages ?? []).join(", ") || "—"} · Translating: {(profile.translating_languages ?? []).join(", ") || "—"}
        </p>
        <p className="text-xs text-slate-400">Location: {profile.location || profile.region || "—"}</p>
        {specialties.length ? (
          <p className="text-xs text-slate-300">Specialties: {specialties.join(", ")}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-2">
          {profile.visibility !== "visible" ? (
            <button
              type="button"
              onClick={() => updateVisibility(profile, "approve")}
              className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Approve & publish
            </button>
          ) : (
            <button
              type="button"
              onClick={() => updateVisibility(profile, "hide")}
              className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600"
            >
              Hide
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Published profiles</h3>
        <button
          type="button"
          onClick={loadProfiles}
          className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {loading ? <p className="text-sm text-slate-300">Loading…</p> : null}
      <div className="space-y-3">
        {pending.length ? (
          <div className="space-y-2">
            <p className="text-sm text-amber-300 font-semibold">Pending profiles</p>
            <div className="grid gap-3 md:grid-cols-2">
              {pending.map(renderCard)}
            </div>
          </div>
        ) : null}
        <div className="space-y-2">
          <p className="text-sm text-slate-200 font-semibold">Visible profiles</p>
          <div className="grid gap-3 md:grid-cols-2">
            {visible.map(renderCard)}
          </div>
        </div>
      </div>
    </div>
  );
}
