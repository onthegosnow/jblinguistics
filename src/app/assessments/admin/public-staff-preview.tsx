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
        const stripTagline = (txt?: string | null) => {
          if (!txt) return "";
          const cleaned = txt.replace(/^\s*tagline:\s*/i, "").trim();
          const parts = cleaned.split(/overview:/i);
          return (parts[0] || cleaned).trim();
        };
        const normalize = (txt: string) =>
          txt
            .replace(/\*\*/g, "")
            .replace(/^[*•-]\s*/, "")
            .trim();
        const raw = Array.isArray(profile.overview) ? profile.overview.join("\n") : String(profile.overview || "");
        const block = (label: string) => {
          const regex = new RegExp(`${label}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Z ]+:?|$)`, "i");
          const m = raw.match(regex);
          return m ? normalize(m[1]) : "";
        };
        const splitParas = (txt: string) =>
          txt
            .split(/\n+/)
            .map((p) => normalize(p))
            .filter(Boolean);
        const cleanList = (items: string[]) =>
          Array.from(
            new Set(
              (items || [])
                .map((i) => i.trim())
                .filter((i) => i && !/^tagline\b/i.test(i) && !/background/i.test(i) && !/focus/i.test(i))
            )
          );
        const overviewBlock = block("overview") || "";
        const tagline = stripTagline(profile.tagline || (overviewBlock ? overviewBlock.split(".")[0]?.trim() : ""));
        const overviewParas = cleanList(overviewBlock ? splitParas(overviewBlock) : splitParas(raw));
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
        <div className="flex flex-wrap gap-2 pt-2">
          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setDrafts((prev) => ({ ...prev, [key]: draft }));
                setEditMode((m) => ({ ...m, [key]: true }));
              }}
              className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Edit
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => updateVisibility(profile, "approve")}
            className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
            disabled={actioning === `${profile.slug || profile.user_id || ""}:approve`}
          >
            {actioning === `${profile.slug || profile.user_id || ""}:approve` ? "Publishing…" : "Approve & publish"}
          </button>
          <button
            type="button"
            onClick={() => updateVisibility(profile, "hide")}
            className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600 disabled:opacity-60"
            disabled={actioning === `${profile.slug || profile.user_id || ""}:hide`}
          >
            {actioning === `${profile.slug || profile.user_id || ""}:hide` ? "Hiding…" : "Hide"}
          </button>
          {publicUrl ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              View public
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => {
              const qs = new URLSearchParams();
              if (profile.slug) qs.set("slug", profile.slug);
              if (profile.user_id) qs.set("userId", profile.user_id);
              qs.set("token", token);
              window.open(`/api/admin/public-staff/preview?${qs.toString()}`, "_blank");
            }}
            className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            disabled={!profile.slug && !profile.user_id}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => updateVisibility(profile, "delete")}
            className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
            disabled={actioning === `${profile.slug || profile.user_id || ""}:delete`}
          >
            {actioning === `${profile.slug || profile.user_id || ""}:delete` ? "Deleting…" : "Delete"}
          </button>
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
        {lastAction ? <p className="text-xs text-emerald-300">{lastAction}</p> : null}
        <div className="space-y-2">
          <p className="text-sm text-amber-300 font-semibold">Pending profiles</p>
          {pending.length ? (
            (() => {
              const buckets = bucketProfiles(pending);
              return (
                <div className="space-y-3">
                  {renderBucket("Teacher", buckets.teacherOnly)}
                  {renderBucket("Translator", buckets.translatorOnly)}
                  {renderBucket("Dual role", buckets.dual)}
                  {renderBucket("Unspecified", buckets.other)}
                </div>
              );
            })()
          ) : (
            <p className="text-xs text-slate-400">No pending profiles.</p>
          )}
        </div>
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
