"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { hasRole } from "@/lib/staff";
import { getPublicStaffByRole, getPublicStaffStatus, type PublicStaff } from "@/lib/public-staff";

const ADMIN_LANGS = [
  { id: "english", label: "English" },
  { id: "german", label: "German" },
  { id: "french", label: "French" },
  { id: "dutch", label: "Dutch" },
  { id: "danish", label: "Danish" },
  { id: "swedish", label: "Swedish" },
  { id: "norwegian", label: "Norwegian" },
  { id: "russian", label: "Russian" },
  { id: "italian", label: "Italian" },
  { id: "spanish", label: "Spanish" },
  { id: "portuguese", label: "Portuguese" },
  { id: "mandarin", label: "Mandarin" },
  { id: "japanese", label: "Japanese" },
  { id: "korean", label: "Korean" },
  { id: "farsi", label: "Farsi" },
  { id: "arabic", label: "Arabic" },
  { id: "polish", label: "Polish" },
  { id: "hindi", label: "Hindi" },
  { id: "swahili", label: "Swahili" },
  { id: "latin", label: "Latin" },
  { id: "classical greek", label: "Classical Greek" },
  { id: "old english", label: "Old English" },
  { id: "other", label: "Other" },
];

const normalizeLangId = (val: string) => String(val || "").trim().toLowerCase();
const langLabel = (id: string) => {
  const match = ADMIN_LANGS.find((l) => l.id === id);
  if (match) return match.label;
  return id
    .split(/[\s/]+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
};

const toDisplayString = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(", ");
  }
  if (typeof value === "string") return value;
  return "";
};

const splitDisplayLanguages = (value: unknown): string[] =>
  toDisplayString(value)
    .split(/[,/|·•–-]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const getStructuredLanguages = (person: PublicStaff): string[] =>
  Array.isArray(person.langs) && person.langs.length ? person.langs : splitDisplayLanguages(person.languages);

const getRegionLabel = (person: PublicStaff): string => (person.region || person.location || "").trim();

const inferSpecialtiesFromTagline = (tagline?: string): string[] => {
  if (!tagline) return [];
  const tl = tagline.toLowerCase();
  const guessed: string[] = [];
  if (/(ielts|toefl|telc|goethe|exam|prüfung)/i.test(tl)) guessed.push("Exam Prep");
  if (/(business|corporate|executive|leadership)/i.test(tl)) guessed.push("Business English");
  if (/(academic|university|research)/i.test(tl)) guessed.push("Academic English");
  if (/(conversation|speaking|fluency)/i.test(tl)) guessed.push("Conversation");
  if (/(diplom|government|embassy|ministry)/i.test(tl)) guessed.push("Diplomacy & Government");
  if (/(aviation|airbus|boeing|icao|pilot)/i.test(tl)) guessed.push("Aviation English");
  if (/(medical|healthcare)/i.test(tl)) guessed.push("Medical English");
  if (/(legal|contract|compliance)/i.test(tl)) guessed.push("Legal/Compliance");
  if (/(kids|teens|young learners|schule)/i.test(tl)) guessed.push("Kids & Teens");
  return guessed;
};

const getSpecialties = (person: PublicStaff): string[] => {
  if (Array.isArray(person.specialties) && person.specialties.length) return person.specialties;
  if (Array.isArray(person.expertise) && person.expertise.length) return person.expertise;
  return inferSpecialtiesFromTagline(person.tagline);
};

const getSpecList = (person: PublicStaff): string[] => {
  const specs = getSpecialties(person);
  return Array.isArray(specs) ? specs.filter(Boolean) : [];
};

const titleCaseLangs = (value: unknown) =>
  toDisplayString(value)
    .split(/[,/|·•–-]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(", ");

const stripTaglineLabel = (value?: string) => {
  if (!value) return "";
  const cleaned = value.replace(/^\s*tagline:\s*/i, "").trim();
  const parts = cleaned.split(/overview:/i);
  return (parts[0] || cleaned).trim();
};

const normalizeTagline = (t: PublicStaff) => {
  const stripped = stripTaglineLabel(t.tagline);
  const langs = titleCaseLangs(t.languages || getStructuredLanguages(t).join(", "));
  if (!stripped) return "";
  if (stripped.toLowerCase() === (t.name || "").toLowerCase()) return "";
  if (stripped.toLowerCase() === langs.toLowerCase()) return "";
  if (stripped.toLowerCase().startsWith((t.name || "").toLowerCase())) return "";
  if (langs && stripped.toLowerCase().includes(langs.toLowerCase())) return "";
  if ((t.name || "") && stripped.toLowerCase().includes((t.name || "").toLowerCase())) return "";
  return stripped;
};

const cardSummary = (t: PublicStaff) => {
  const tagline = normalizeTagline(t);
  if (tagline) return tagline;
  const overview =
    Array.isArray(t.overview) && t.overview.length
      ? t.overview
      : [];
  if (overview.length) {
    const first = String(overview[0] || "").replace(/^Tagline:\s*/i, "").trim();
    if (first) return first;
  }
  return "";
};

export default function TranslatorsPage() {
  const [translators, setTranslators] = useState<PublicStaff[]>([]);
  const [dataWarning, setDataWarning] = useState<string | null>(null);

  useEffect(() => {
    getPublicStaffByRole("translator").then((list) => {
      setTranslators(list);
      const status = getPublicStaffStatus();
      if (status.source === "unavailable") {
        setDataWarning(status.reason || "No published translator profiles yet.");
      } else {
        setDataWarning(null);
      }
    });
  }, []);

  // Options for filters
  const allLangs = useMemo(() => {
    const map = new Map<string, string>();
    ADMIN_LANGS.forEach((l) => map.set(l.id, l.label));
    translators.forEach((t) => {
      const arr = getStructuredLanguages(t);
      arr.forEach((l) => {
        const id = normalizeLangId(l);
        if (!id) return;
        if (!map.has(id)) {
          map.set(id, langLabel(id));
        }
      });
    });
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [translators]);

  const allRegions = useMemo(() => {
    const set = new Set<string>();
    translators.forEach((t) => {
      const reg = getRegionLabel(t);
      if (reg) set.add(reg);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [translators]);

  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    const addFrom = (val: unknown) => {
      if (Array.isArray(val)) {
        (val as string[]).forEach((v) => {
          const s = String(v || "").trim();
          if (s) set.add(s);
        });
      } else if (typeof val === "string") {
        val
          .split(/[,/|·•;]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => set.add(s));
      }
    };
    translators.forEach((t) => {
      addFrom(getSpecialties(t));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [translators]);

  // State
  const [q, setQ] = useState("");
  const [lang, setLang] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [spec, setSpec] = useState<string>("");
  // pagination removed; keep a no-op setter for filters reset safety
  const setPage = (_n: number) => {};

  const hasActive = useMemo(
    () => Boolean(q.trim() || lang || region || spec),
    [q, lang, region, spec]
  );

  // Filtered list
  const filteredTranslators = useMemo(() => {
    const term = q.trim().toLowerCase();
    return translators.filter((t) => {
      const name = (t.name || "").toLowerCase();
      const langsText = toDisplayString(t.languages).toLowerCase();
      const reg = getRegionLabel(t).toLowerCase();

      const specs = getSpecialties(t);

      const matchesTerm =
        !term || name.includes(term) || langsText.includes(term) || reg.includes(term);

      const matchesLang =
        !lang ||
        getStructuredLanguages(t)
          .map((l) => l.toLowerCase())
          .includes(lang.toLowerCase());

      const matchesRegion = !region || reg === region.toLowerCase();

      const matchesSpec =
        !spec ||
        specs.some((s) => s.toLowerCase() === spec.toLowerCase());

      return matchesTerm && matchesLang && matchesRegion && matchesSpec;
    });
  }, [translators, q, lang, region, spec]);

  const pageItems = filteredTranslators;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-100 text-slate-900 pb-16">
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-900">
          Our Translators & Interpreters
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-700 max-w-3xl">
          JB Linguistics provides written translations, localization, and simultaneous/consecutive interpretation in 20+ languages. Meet some of our translators and conference interpreters.
        </p>
        {dataWarning ? (
          <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Public translator profiles are not available yet: {dataWarning}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition shadow-md shadow-teal-600/30"
          >
            Request an interpreter
          </Link>
          <Link
            href="/translators/jonathan-brooks"
            className="inline-flex items-center rounded-full border border-sky-900/20 bg-white/80 text-sky-900 px-4 py-2 text-sm font-semibold hover:bg-sky-50 transition"
          >
            Work with Jonathan Brooks
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1">
            <label htmlFor="translator-search" className="sr-only">Search translators</label>
            <input
              id="translator-search"
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, language, or region…"
              className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="translator-lang" className="sr-only">Filter by language</label>
            <select
              id="translator-lang"
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                setPage(1);
              }}
              className="min-w-[14rem] rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All languages</option>
              {allLangs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="translator-region" className="sr-only">Filter by region</label>
            <select
              id="translator-region"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setPage(1);
              }}
              className="min-w-[14rem] rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All regions</option>
              {allRegions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="translator-spec" className="sr-only">Filter by specialty</label>
            <select
              id="translator-spec"
              value={spec}
              onChange={(e) => {
                setSpec(e.target.value);
                setPage(1);
              }}
              className="min-w-[16rem] rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All specialties</option>
              {allSpecialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        {hasActive && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {q.trim() && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-200"
                aria-label="Clear search"
                title="Clear search"
              >
                <span>Search:</span>
                <span className="font-medium">“{q.trim()}”</span>
                <span aria-hidden>×</span>
              </button>
            )}
            {lang && (
              <button
                type="button"
                onClick={() => setLang("")}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-200"
                aria-label="Clear language filter"
                title="Clear language filter"
              >
                <span>Language:</span>
                <span className="font-medium">{lang}</span>
                <span aria-hidden>×</span>
              </button>
            )}
            {region && (
              <button
                type="button"
                onClick={() => setRegion("")}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-200"
                aria-label="Clear region filter"
                title="Clear region filter"
              >
                <span>Region:</span>
                <span className="font-medium">{region}</span>
                <span aria-hidden>×</span>
              </button>
            )}
            {spec && (
              <button
                type="button"
                onClick={() => setSpec("")}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-200"
                aria-label="Clear specialty filter"
                title="Clear specialty filter"
              >
                <span>Specialty:</span>
                <span className="font-medium">{spec}</span>
                <span aria-hidden>×</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setQ("");
                setLang("");
                setRegion("");
                setSpec("");
              }}
              className="ml-1 inline-flex items-center rounded-full bg-sky-900 text-white px-3 py-1 font-semibold hover:bg-sky-800"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {pageItems.map((t) => (
            <article
              key={t.slug}
              className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-teal-100 overflow-hidden flex flex-col"
            >
              {(() => {
                const imageSrc = t.image || t.photo_url || "/Brand/JB LOGO no TEXT.png";
                return (
              <div
                className={`relative h-64 overflow-hidden flex items-start ${
                  t.imageFit === "contain" ? "bg-slate-200" : "bg-slate-100"
                }`}
              >
                <Image
                  src={imageSrc}
                  alt={t.name}
                  fill
                  unoptimized
                  className={t.imageFit === "contain" ? "object-contain" : "object-cover"}
                  style={{
                    objectPosition: t.imageFocus ?? "50% 50%",
                    objectFit: t.imageFit ?? "contain",
                  }}
                />
              </div>
                );
              })()}
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="text-lg font-semibold text-sky-900">
                  {t.name}
                </h2>
                <p className="text-xs text-teal-700 mt-1">
                  {t.translating_languages && t.translating_languages.length
                    ? `Translating: ${titleCaseLangs(t.translating_languages.join(", "))}`
                    : t.languages
                      ? titleCaseLangs(t.languages)
                      : titleCaseLangs(getStructuredLanguages(t).join(", "))}
                </p>
                {cardSummary(t) ? (
                  <p className="mt-2 text-xs text-slate-700 line-clamp-3">
                    {cardSummary(t)}
                  </p>
                ) : null}
                {/* Specialty chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(() => {
                    const specs = getSpecList(t);
                    const shown = specs.slice(0, 3);
                    const remaining = Math.max(0, specs.length - shown.length);
                    return (
                      <>
                        {shown.map((s: string) => (
                          <button
                            type="button"
                            onClick={() => setSpec(s)}
                            key={s}
                            className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-200"
                            aria-label={`Filter by ${s}`}
                            title={`Filter by ${s}`}
                          >
                            {s}
                          </button>
                        ))}
                        {remaining > 0 && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                            +{remaining} more
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="mt-3">
                  <Link
                    href={
                      hasRole(t, "translator")
                        ? `/translators/${t.slug}`
                        : `/teachers/${t.slug}`
                    }
                    className="inline-flex text-xs font-semibold text-sky-700 hover:text-sky-900"
                  >
                    View profile →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
