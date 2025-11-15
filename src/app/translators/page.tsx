"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { hasRole, staff, type StaffMember } from "@/lib/staff";

const splitDisplayLanguages = (value: string): string[] =>
  String(value || "")
    .split(/[,/|·•–-]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const getStructuredLanguages = (person: StaffMember): string[] =>
  Array.isArray(person.langs) && person.langs.length ? person.langs : splitDisplayLanguages(person.languages);

const getRegionLabel = (person: StaffMember): string => (person.region || person.location || "").trim();

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

const getSpecialties = (person: StaffMember): string[] => {
  if (Array.isArray(person.specialties) && person.specialties.length) return person.specialties;
  if (Array.isArray(person.expertise) && person.expertise.length) return person.expertise;
  return inferSpecialtiesFromTagline(person.tagline);
};

const getSpecList = (person: StaffMember): string[] => {
  const specs = getSpecialties(person);
  return Array.isArray(specs) ? specs.filter(Boolean) : [];
};

export default function TranslatorsPage() {
  const translators = staff.filter((p) => hasRole(p, "translator"));

  // Options for filters
  const allLangs = useMemo(() => {
    const set = new Set<string>();
    translators.forEach((t) => {
      const arr = getStructuredLanguages(t);
      arr.forEach((l) => set.add(l));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
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

  // Pagination
  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);

  const hasActive = useMemo(
    () => Boolean(q.trim() || lang || region || spec),
    [q, lang, region, spec]
  );

  // Filtered list
  const filteredTranslators = useMemo(() => {
    const term = q.trim().toLowerCase();
    return translators.filter((t) => {
      const name = (t.name || "").toLowerCase();
      const langsText = (t.languages || "").toLowerCase();
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

  const totalPages = Math.max(1, Math.ceil(filteredTranslators.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(filteredTranslators.length, start + PAGE_SIZE);
  const pageItems = filteredTranslators.slice(start, start + PAGE_SIZE);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-100 text-slate-900 pb-16">
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-900">
          Our Translators & Interpreters
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-700 max-w-3xl">
          JB Linguistics provides written translations, localization, and simultaneous/consecutive interpretation in 20+ languages. Meet some of our translators and conference interpreters.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="#contact"
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition shadow-md shadow-teal-600/30"
          >
            Request an interpreter
          </Link>
          <Link
            href="/teachers/jonathan-brooks"
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
                <option key={l} value={l}>
                  {l}
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
              <div className="relative h-52">
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  className="object-cover"
                  style={{ objectPosition: t.imageFocus ?? "center" }}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="text-lg font-semibold text-sky-900">
                  {t.name}
                </h2>
                <p className="text-xs text-teal-700 mt-1">{t.languages}</p>
                <p className="mt-2 text-xs text-slate-700 line-clamp-3">
                  {t.tagline}
                </p>
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
        {/* Pagination */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            Showing <span className="font-semibold">{filteredTranslators.length ? start + 1 : 0}</span>–<span className="font-semibold">{end}</span> of <span className="font-semibold">{filteredTranslators.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-full border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              const active = n === page;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-3 py-1.5 text-xs rounded-full border ${active ? "bg-sky-900 text-white border-sky-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}
                >
                  {n}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-full border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
