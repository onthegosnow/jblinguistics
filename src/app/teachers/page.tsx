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
  if (/(diplom|government|ministry|embassy)/i.test(tl)) guessed.push("Diplomacy & Government");
  if (/(aviation|airbus|boeing|pilot|icao)/i.test(tl)) guessed.push("Aviation English");
  if (/(legal|contract|compliance)/i.test(tl)) guessed.push("Legal/Compliance");
  if (/(medical|healthcare)/i.test(tl)) guessed.push("Medical");
  return guessed;
};

const getSpecialties = (person: StaffMember): string[] => {
  if (Array.isArray(person.specialties) && person.specialties.length) return person.specialties;
  if (Array.isArray(person.expertise) && person.expertise.length) return person.expertise;
  return inferSpecialtiesFromTagline(person.tagline);
};

export default function TeachersPage() {
  const teachers = staff.filter((p) => hasRole(p, "teacher"));

  // Derive unique language options from staff; fall back to splitting the display string if needed
  const allLangs = useMemo(() => {
    const set = new Set<string>();
    for (const t of teachers) {
      // Prefer a structured array if present (t.langs), else parse the display string t.languages
      const arr = getStructuredLanguages(t);
      arr.forEach((l) => set.add(l));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [teachers]);

  // Derive unique regions
  const allRegions = useMemo(() => {
    const set = new Set<string>();
    for (const t of teachers) {
      const reg = getRegionLabel(t);
      if (reg && typeof reg === "string") set.add(reg.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [teachers]);

  // Derive unique specialties (prefer structured arrays; otherwise parse comma/pipe-separated strings)
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    const addFrom = (val: unknown) => {
      if (Array.isArray(val)) {
        val.forEach((v) => {
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
    for (const t of teachers) {
      addFrom(getSpecialties(t));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [teachers]);

  const [q, setQ] = useState("");
  const [lang, setLang] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [spec, setSpec] = useState<string>("");

  const filteredTeachers = useMemo(() => {
    const term = q.trim().toLowerCase();
    return teachers.filter((t) => {
      const name = (t.name || "").toLowerCase();
      const langsText = (t.languages || "").toLowerCase();
      const reg = getRegionLabel(t).toLowerCase();

      // specialty normalization (array or delimited string)
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
  }, [teachers, q, lang, region, spec]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-teal-50 text-slate-900 pb-16">
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-900">
          Our Teachers
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-700 max-w-3xl">
          Meet the educators behind JB Linguistics LLC. Each teacher brings
          international experience, strong pedagogical training, and a passion
          for practical language use.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="#contact"
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition shadow-md shadow-teal-600/30"
          >
            Request a consultation
          </Link>
          <Link
            href="/teachers/jonathan-brooks"
            className="inline-flex items-center rounded-full border border-sky-900/20 bg-white/80 text-sky-900 px-4 py-2 text-sm font-semibold hover:bg-sky-50 transition"
          >
            Meet Jonathan Brooks
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1">
            <label htmlFor="teacher-search" className="sr-only">Search teachers</label>
            <input
              id="teacher-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, language, or region…"
              className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="teacher-lang" className="sr-only">Filter by language</label>
            <select
              id="teacher-lang"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
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
            <label htmlFor="teacher-region" className="sr-only">Filter by region</label>
            <select
              id="teacher-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
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
            <label htmlFor="teacher-spec" className="sr-only">Filter by specialty</label>
            <select
              id="teacher-spec"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
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

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {filteredTeachers.map((t) => (
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
                <div className="mt-3">
                  <Link
                    href={`/teachers/${t.slug}`}
                    className="inline-flex text-xs font-semibold text-sky-700 hover:text-sky-900"
                  >
                    View profile →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="#contact"
            className="inline-flex items-center rounded-full bg-sky-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-sky-800 transition shadow-md shadow-sky-900/30"
          >
            Get a quote
          </Link>
        </div>
      </section>
    </main>
  );
}
