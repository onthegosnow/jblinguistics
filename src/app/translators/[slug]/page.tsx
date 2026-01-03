import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicStaffMap } from "@/lib/public-staff";

type Props = { params: { slug: string } };

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function TranslatorProfilePage({ params }: Props) {
  const { slug } = await params;
  const map = await getPublicStaffMap();
  const person = map.get(slug);

  if (!person || !(person.roles?.includes("translator") || person.role === "translator")) {
    return notFound();
  }

  const languagesDisplayRaw = person.languages || (Array.isArray(person.langs) ? person.langs.join(", ") : "");
  const languagesDisplay = languagesDisplayRaw
    .split(/[,/|·•–-]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(", ");
  const teachingLangs = Array.isArray((person as any).teaching_languages) ? (person as any).teaching_languages : [];
  const translatingLangs = Array.isArray((person as any).translating_languages) ? (person as any).translating_languages : [];

  const parseSections = () => {
    try {
      const headings = [
        "tagline",
        "overview",
        "educational & professional background",
        "educational and professional background",
        "project focus",
        "linguistic focus",
        "specialties",
        "specializations",
      ];
      const escape = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const headingPattern = headings.map(escape).join("|");
      const normalizeLine = (txt: string) => txt.replace(/\*\*/g, "").replace(/^\s*[•*-]\s*/, "").trim();
      const dedupe = (items: string[]) => Array.from(new Set(items.map(normalizeLine).filter(Boolean)));

      const rawStr = Array.isArray(person.overview) ? person.overview.join("\n") : String(person.overview || "");
      const normalized = headings.reduce(
        (acc, h) => acc.replace(new RegExp(`\\s*${escape(h)}\\s*:`, "gi"), `\n${h.toUpperCase()}:`),
        rawStr.replace(/\r\n/g, "\n")
      );

      const sectionText = (label: string) => {
        const regex = new RegExp(`${label}\\s*:\\s*([\\s\\S]*?)(?=\\n(?:${headingPattern})\\s*:|$)`, "i");
        const match = normalized.match(regex);
        return match ? match[1].trim() : "";
      };

      const taglineRaw = (person.tagline || sectionText("tagline") || "").replace(/^\s*tagline:\s*/i, "").trim();
      const overviewText = sectionText("overview");
      const overviewSource = overviewText || normalized;
      const overviewLines = overviewSource
        .split(/\n+/)
        .filter((line) => !new RegExp(`^(${headingPattern})\\s*:?$`, "i").test(line));
      const overview = dedupe(
        overviewLines.filter((line) => {
          const lower = line.toLowerCase();
          return (
            lower &&
            lower !== taglineRaw.toLowerCase() &&
            lower !== (person.name || "").toLowerCase() &&
            lower !== languagesDisplay.toLowerCase()
          );
        })
      );

      const backgroundText =
        sectionText("educational & professional background") || sectionText("educational and professional background");
      const focusText = sectionText("linguistic focus") || sectionText("project focus");

      const background = dedupe(
        Array.isArray(person.background) && person.background.length ? person.background : backgroundText.split(/\n+/)
      );
      const focus = dedupe(
        Array.isArray(person.linguistics) && person.linguistics.length ? person.linguistics : focusText.split(/\n+/)
      );
      const tagline = taglineRaw || overview[0] || "";

      return { tagline, overview, background, focus };
    } catch (err) {
      return { tagline: person.tagline || "", overview: [], background: [], focus: [] };
    }
  };

  const sections = parseSections();
  const specialties =
    (Array.isArray(person.specialties) && person.specialties.length ? person.specialties : person.expertise) ?? [];
  const photo = person.image || person.photo_url || "/Brand/JB LOGO no TEXT.png";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50 text-slate-900 pb-16">
      <section className="max-w-4xl mx-auto px-4 pt-10">
        <Link href="/translators" className="text-xs text-sky-700 hover:text-sky-900">
          ← Back to all translators
        </Link>

        <div className="mt-4 grid md:grid-cols-[1.1fr,1.4fr] gap-6 items-start">
          <div className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-teal-100 overflow-hidden">
            <div className="relative h-[30rem] bg-slate-900">
              <Image
                src={photo}
                alt={person.name}
                fill
                unoptimized
                className="object-contain"
                style={{
                  objectPosition: person.imageFocus ?? "center",
                  objectFit: person.imageFit ?? "contain",
                }}
              />
            </div>
            <div className="p-4">
              <h1 className="text-2xl font-bold text-sky-900">{person.name}</h1>
              {languagesDisplay ? <p className="mt-1 text-xs text-teal-700">{languagesDisplay}</p> : null}
              {sections.tagline ? <p className="mt-2 text-sm text-slate-700">{sections.tagline}</p> : null}
            </div>
          </div>

          <div className="space-y-5">
            {teachingLangs.length ? (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">Teaching Languages</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {teachingLangs.map((l) => (
                    <span key={l} className="rounded-full bg-slate-100 text-slate-800 px-3 py-1 text-xs font-semibold border border-slate-200">
                      {String(l).charAt(0).toUpperCase() + String(l).slice(1)}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {translatingLangs.length ? (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">Translating Languages</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {translatingLangs.map((l) => (
                    <span key={l} className="rounded-full bg-slate-100 text-slate-800 px-3 py-1 text-xs font-semibold border border-slate-200">
                      {String(l).charAt(0).toUpperCase() + String(l).slice(1)}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {sections.overview.length ? (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">Overview</h2>
                <div className="mt-2 space-y-2 text-sm text-slate-700 leading-relaxed">
                  {sections.overview.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </section>
            ) : null}

            {sections.background.length ? (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">Educational &amp; Professional Background</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  {sections.background.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {sections.focus.length ? (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">Linguistic Focus</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  {sections.focus.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {specialties && specialties.length ? (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">Specialties</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  {specialties.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white/90 p-5">
          <h2 className="text-base font-semibold text-sky-900">Ready to work with {person.name}?</h2>
          <p className="mt-2 text-sm text-slate-700">
            Tell us about your document, meeting, or interpretation need and we’ll confirm availability.
          </p>
          <div className="mt-4">
            <Link
              href={`/#contact?preferredStaff=${encodeURIComponent(person.name)}`}
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
            >
              Contact {person.name}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
