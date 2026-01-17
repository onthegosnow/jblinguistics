import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Certified Document Translation | JB Linguistics",
  description: "Sworn translations with dual review for vital records, corporate documents, immigration files, and regulatory filings. Court-ready translations with statements of accuracy.",
  openGraph: {
    title: "Certified Document Translation | JB Linguistics",
    description: "Court-ready sworn translations for immigration, corporate governance, aviation, and banking documents.",
    url: "https://www.jblinguistics.com/services/certified-document-translation",
  },
};

const documentTypes = [
  "Vital records (birth, marriage, divorce, adoption, and notarized statements)",
  "Corporate governance: articles, shareholder resolutions, procurement packets, and ESG reports",
  "Aviation & transport: safety manuals, OPS notices, irregular operations playbooks, maintenance releases",
  "Banking & treasury: KYC packages, onboarding decks, compliance attestations, and loan/lease files",
  "Immigration & HR: visas, work permits, contracts, policy handbooks, and training certifications",
];

const industriesServed = [
  {
    title: "Government & immigration",
    description: "Certified translations for ministries, embassies, consulates, and municipal offices with full affidavit packets.",
  },
  {
    title: "Airlines & MRO",
    description: "Safety bulletins, manuals, rosters, and contracts aligned with Lufthansa, EASA, FAA, and Star Alliance expectations.",
  },
  {
    title: "Banks & compliance",
    description: "KYC, treasury, risk, and regulatory disclosures prepared with dual review and terminology management.",
  },
  {
    title: "Education & HR",
    description: "Diplomas, transcripts, employee handbooks, and onboarding kits translated with formatting fidelity.",
  },
];

export default function CertifiedDocumentTranslationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-teal-50 text-slate-900">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold">
          Services / Certified Document Translation
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-sky-900">
          Sworn translations with dual review and digital certificates
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          JB Linguistics LLC coordinates sworn translators, senior reviewers, and project managers to deliver court-, ministry-, and
          regulator-ready translations. Every file stays inside our encrypted workspace, and delivery packages include statements of
          accuracy, translator credentials, and optional notarial certificates when required.
        </p>
        <div className="mt-6 rounded-3xl border border-emerald-100 bg-white shadow-sm p-5">
          <h2 className="text-xl font-semibold text-sky-900">Core document categories</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
            {documentTypes.map((doc) => (
              <li key={doc} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-5 py-2 text-sm font-semibold hover:bg-teal-500 transition"
          >
            Submit documents securely
          </Link>
          <Link
            href="/services/translation-localization"
            className="inline-flex items-center rounded-full border border-sky-900/20 bg-white px-5 py-2 text-sm font-semibold text-sky-900 hover:bg-slate-50 transition"
          >
            See website translation support
          </Link>
        </div>
      </section>

      <section className="py-12 bg-slate-900 text-sky-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold">Industries we serve</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {industriesServed.map((industry) => (
              <div key={industry.title} className="rounded-3xl border border-white/20 bg-white/5 p-5 text-sm">
                <h3 className="text-lg font-semibold text-white">{industry.title}</h3>
                <p className="mt-2 text-sky-100">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid gap-8 md:grid-cols-[1.2fr,0.8fr] text-sm text-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-sky-900">Deliverables</h2>
            <ul className="mt-4 space-y-1.5">
              {[
                "Sworn translator statement (PDF + optional hard copy)",
                "Digital signature with tamper seal and audit trail",
                "Formatting faithful to the source, including tables, stamps, and seals",
                "Terminology log and bilingual change log for your records",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-base font-semibold text-sky-900">Turnaround tiers</h3>
            <ul className="mt-3 space-y-1.5">
              {[
                "Standard (3–5 business days)",
                "Accelerated (48 hours) for up to 25 pages",
                "Same-day rush for critical filings (subject to availability)",
              ].map((tier) => (
                <li key={tier} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{tier}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link
                href="/#contact"
                className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition"
              >
                Tell us your deadline
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
