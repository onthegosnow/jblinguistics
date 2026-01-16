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

const languageOptions = [
  "english",
  "german",
  "french",
  "dutch",
  "danish",
  "swedish",
  "norwegian",
  "russian",
  "italian",
  "spanish",
  "portuguese",
  "mandarin",
  "japanese",
  "korean",
  "farsi",
  "arabic",
  "polish",
  "hindi",
  "swahili",
  "other",
];
const labelForLang: Record<string, string> = {
  english: "English",
  german: "German",
  french: "French",
  dutch: "Dutch",
  danish: "Danish",
  swedish: "Swedish",
  norwegian: "Norwegian",
  russian: "Russian",
  italian: "Italian",
  spanish: "Spanish",
  portuguese: "Portuguese",
  mandarin: "Mandarin",
  japanese: "Japanese",
  korean: "Korean",
  farsi: "Farsi",
  arabic: "Arabic",
  polish: "Polish",
  hindi: "Hindi",
  swahili: "Swahili",
  other: "Other",
};

export function PublicStaffPreview({ token }: { token: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        tagline?: string;
        overview?: string;
        teaching_languages: string[];
        translating_languages: string[];
        specialties: string[];
      }
    >
  >({});

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

  const updateVisibility = async (profile: Profile, action: "approve" | "hide" | "delete") => {
    if (!token) return;
    setError(null);
    setActioning(`${profile.slug || profile.user_id || ""}:${action}`);
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
      setLastAction(`${action === "approve" ? "Published" : action === "hide" ? "Hidden" : "Deleted"} ${profile.name || profile.slug || ""}`);
      await loadProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update visibility.");
    } finally {
      setActioning(null);
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
    const key = profile.slug || profile.user_id || "";
    const editing = editMode[key] ?? false;
    const draft = drafts[key] ?? {
      tagline: profile.tagline ?? "",
      overview: profile.overview?.join("\n") ?? "",
      teaching_languages: profile.teaching_languages ?? [],
      translating_languages: profile.translating_languages ?? [],
      specialties: profile.specialties ?? [],
    };
    const parseProfile = () => {
      try {
        const normalize = (txt: string) =>
          txt
            .replace(/\*\*/g, "")
            .replace(/^[*•-]\s*/, "")
            .trim();

        // Clean tagline - remove "Tagline:" prefix and any section headers
        const cleanTagline = (txt?: string | null) => {
          if (!txt) return "";
          return txt
            .replace(/^\s*tagline:\s*/i, "")
            .replace(/overview:/i, "")
            .split("\n")[0]
            .trim();
        };

        // Get the raw overview content
        const raw = Array.isArray(profile.overview) ? profile.overview.join("\n") : String(profile.overview || "");

        // Extract OVERVIEW section if it exists
        const overviewMatch = raw.match(/overview\s*:?\s*([\s\S]*?)(?=\n\s*(?:EDUCATIONAL|LINGUISTIC|BACKGROUND|FOCUS|$))/i);
        let overviewText = overviewMatch ? overviewMatch[1].trim() : "";

        // If no explicit OVERVIEW section, use the first paragraph that's not a header
        if (!overviewText) {
          const lines = raw.split("\n").filter((l) => l.trim() && !l.match(/^(tagline|overview|educational|linguistic|background|focus)/i));
          overviewText = lines.slice(0, 3).join(" ").trim();
        }

        // Clean up the overview - remove tagline prefix if it leaked in
        overviewText = overviewText.replace(/^\s*tagline:\s*/i, "").trim();

        // Don't repeat the tagline in the overview
        let tagline = cleanTagline(profile.tagline);
        if (overviewText.toLowerCase().startsWith(tagline.toLowerCase()) && tagline.length > 20) {
          // If overview starts with tagline, extract just the additional content
          const remainder = overviewText.slice(tagline.length).replace(/^[.,\s]+/, "").trim();
          if (remainder) {
            overviewText = remainder;
          }
        }

        // If tagline looks like raw data (e.g., "Name | Lang | Lang"), try to generate a better one
        if (tagline.match(/\|/) && !tagline.match(/[a-z]{10,}/i)) {
          // This looks like metadata, not a tagline - try first sentence of overview instead
          const firstSentence = overviewText.split(/[.!?]/)[0]?.trim();
          if (firstSentence && firstSentence.length > 20 && firstSentence.length < 150) {
            tagline = firstSentence;
          } else {
            tagline = ""; // Clear the bad tagline
          }
        }

        const overviewParas = overviewText
          .split(/\n+/)
          .map((p) => normalize(p))
          .filter((p) => p && p.length > 5 && !p.match(/^(tagline|overview):/i));

        return { tagline, overview: overviewParas };
      } catch (err) {
        return { tagline: profile.tagline || "", overview: Array.isArray(profile.overview) ? profile.overview : [] };
      }
    };

    const display = parseProfile();
    const overviews = display.overview;
    const specialties = profile.specialties ?? [];
    const primaryRole =
      profile.roles?.includes("teacher") && !profile.roles?.includes("translator")
        ? "teacher"
        : profile.roles?.includes("translator") && !profile.roles?.includes("teacher")
        ? "translator"
        : "teacher";
    const publicUrl =
      profile.visibility === "visible" && profile.slug
        ? primaryRole === "translator"
          ? `/translators/${profile.slug}`
          : `/teachers/${profile.slug}`
        : undefined;

    const toggleLang = (list: "teaching_languages" | "translating_languages", lang: string) => {
      setDrafts((prev) => {
        const currentDraft = prev[key] ?? draft;
        const current = currentDraft[list] ?? [];
        const nextList = current.includes(lang) ? current.filter((l) => l !== lang) : [...current, lang];
        return { ...prev, [key]: { ...currentDraft, [list]: nextList } };
      });
    };

    const updateDraft = (partial: Partial<typeof draft>) => {
      setDrafts((prev) => ({ ...prev, [key]: { ...draft, ...partial } }));
    };

    const saveProfileEdits = async () => {
      setError(null);
      try {
        await fetch("/api/portal/admin/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-token": token },
          body: JSON.stringify({
            action: "profile",
            userId: profile.user_id,
            tagline: draft.tagline,
            overview: draft.overview,
            teachingLanguages: draft.teaching_languages,
            translatingLanguages: draft.translating_languages,
            certifications: draft.specialties,
            teacherRole: profile.roles?.includes("teacher") ?? false,
            translatorRole: profile.roles?.includes("translator") ?? false,
            name: profile.name,
          }),
        });
        await loadProfiles();
        setEditMode((m) => ({ ...m, [key]: false }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to save profile.");
      }
    };

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
            <p className="text-xs text-slate-400">{profile.roles?.join(", ")}</p>
          </div>
        </div>
        {editing ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Tagline</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                value={draft.tagline ?? ""}
                onChange={(e) => updateDraft({ tagline: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Overview</label>
              <textarea
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                rows={5}
                value={draft.overview ?? ""}
                onChange={(e) => updateDraft({ overview: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Teaching languages</p>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLang("teaching_languages", lang)}
                    className={`rounded-full px-2 py-1 text-[11px] ${
                      draft.teaching_languages.includes(lang) ? "bg-teal-500 text-slate-900" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {labelForLang[lang] ?? lang}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Translating languages</p>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLang("translating_languages", lang)}
                    className={`rounded-full px-2 py-1 text-[11px] ${
                      draft.translating_languages.includes(lang) ? "bg-teal-500 text-slate-900" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {labelForLang[lang] ?? lang}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Specialties (comma separated)</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                value={(draft.specialties ?? []).join(", ")}
                onChange={(e) =>
                  updateDraft({ specialties: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                }
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveProfileEdits}
                className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
              >
                Save profile
              </button>
              <button
                type="button"
                onClick={() => setEditMode((m) => ({ ...m, [key]: false }))}
                className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {display.tagline ? <p className="text-sm text-slate-100">{display.tagline}</p> : null}
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
              Teaching: {(profile.teaching_languages ?? []).map((l) => labelForLang[l] ?? l).join(", ") || "—"} ·
              Translating: {(profile.translating_languages ?? []).map((l) => labelForLang[l] ?? l).join(", ") || "—"}
            </p>
            {specialties.length ? <p className="text-xs text-slate-300">Specialties: {specialties.join(", ")}</p> : null}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-700/50">
          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setDrafts((prev) => ({ ...prev, [key]: draft }));
                setEditMode((m) => ({ ...m, [key]: true }));
              }}
              className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Edit
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => updateVisibility(profile, "approve")}
            className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
            disabled={actioning === `${profile.slug || profile.user_id || ""}:approve`}
          >
            {actioning === `${profile.slug || profile.user_id || ""}:approve` ? "Publishing…" : "Approve & publish"}
          </button>
          <button
            type="button"
            onClick={() => updateVisibility(profile, "hide")}
            className="rounded-full bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 disabled:opacity-60"
            disabled={actioning === `${profile.slug || profile.user_id || ""}:hide`}
          >
            {actioning === `${profile.slug || profile.user_id || ""}:hide` ? "Hiding…" : "Hide"}
          </button>
          <button
            type="button"
            onClick={() => {
              const qs = new URLSearchParams();
              if (profile.slug) qs.set("slug", profile.slug);
              if (profile.user_id) qs.set("userId", profile.user_id);
              qs.set("token", token);
              window.open(`/api/admin/public-staff/preview?${qs.toString()}`, "_blank");
            }}
            className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            disabled={!profile.slug && !profile.user_id}
          >
            Preview
          </button>
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-teal-600 px-3 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-900/30"
            >
              View live
            </a>
          )}
          <button
            type="button"
            onClick={() => updateVisibility(profile, "delete")}
            className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
            disabled={actioning === `${profile.slug || profile.user_id || ""}:delete`}
          >
            {actioning === `${profile.slug || profile.user_id || ""}:delete` ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Profile Management</h3>
          <p className="text-xs text-slate-400 mt-1">
            {pending.length} pending · {visible.length} live
          </p>
        </div>
        <button
          type="button"
          onClick={loadProfiles}
          disabled={loading}
          className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {lastAction ? <p className="text-xs text-emerald-300">{lastAction}</p> : null}

      {/* Pending profiles - highlighted */}
      {pending.length > 0 && (
        <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-sm text-amber-300 font-semibold">Pending approval ({pending.length})</p>
          </div>
          {(() => {
            const buckets = bucketProfiles(pending);
            return (
              <div className="space-y-4">
                {renderBucket("Teacher", buckets.teacherOnly)}
                {renderBucket("Translator", buckets.translatorOnly)}
                {renderBucket("Dual role", buckets.dual)}
                {renderBucket("Unspecified", buckets.other)}
              </div>
            );
          })()}
        </div>
      )}

      {/* Visible profiles */}
      <div className="space-y-3">
        <p className="text-sm text-slate-200 font-semibold">Live profiles ({visible.length})</p>
        {visible.length === 0 ? (
          <p className="text-xs text-slate-400">No published profiles yet.</p>
        ) : (
          (() => {
            const buckets = bucketProfiles(visible);
            return (
              <div className="space-y-4">
                {renderBucket("Teacher", buckets.teacherOnly)}
                {renderBucket("Translator", buckets.translatorOnly)}
                {renderBucket("Dual role", buckets.dual)}
                {renderBucket("Unspecified", buckets.other)}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
