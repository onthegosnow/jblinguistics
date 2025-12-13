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

  const bucketProfiles = (list: Profile[]) => {
    const teacherOnly = list.filter((p) => p.roles?.includes("teacher") && !p.roles?.includes("translator"));
    const translatorOnly = list.filter((p) => p.roles?.includes("translator") && !p.roles?.includes("teacher"));
    const dual = list.filter((p) => p.roles?.includes("teacher") && p.roles?.includes("translator"));
    const other = list.filter((p) => !p.roles || p.roles.length === 0);
    return { teacherOnly, translatorOnly, dual, other };
  };

  const renderBucket = (title: string, list: Profile[]) => {
    if (!list.length) return null;
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <div className="grid gap-3 md:grid-cols-2">{list.map(renderCard)}</div>
      </div>
    );
  };

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
            {(() => {
              const buckets = bucketProfiles(pending);
              return (
                <div className="space-y-3">
                  {renderBucket("Teacher", buckets.teacherOnly)}
                  {renderBucket("Translator", buckets.translatorOnly)}
                  {renderBucket("Dual role", buckets.dual)}
                  {renderBucket("Unspecified", buckets.other)}
                </div>
              );
            })()}
          </div>
        ) : null}
        <div className="space-y-2">
          <p className="text-sm text-slate-200 font-semibold">Visible profiles</p>
          {(() => {
            const buckets = bucketProfiles(visible);
            return (
              <div className="space-y-3">
                {renderBucket("Teacher", buckets.teacherOnly)}
                {renderBucket("Translator", buckets.translatorOnly)}
                {renderBucket("Dual role", buckets.dual)}
                {renderBucket("Unspecified", buckets.other)}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
