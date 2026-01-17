import type { Metadata } from "next";
import Link from "next/link";
import { TranslationStructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Translation & Localization Services | JB Linguistics",
  description: "Certified document and website translation for regulated industries. Sworn translations, localization, and terminology management in Dutch, English, French, German, Mandarin, Spanish, and Swedish.",
  openGraph: {
    title: "Translation & Localization Services | JB Linguistics",
    description: "Certified document and website translation for regulated industries including aviation, banking, and government.",
    url: "https://www.jblinguistics.com/services/translation-localization",
  },
};

const servicePillars = [
  {
    title: "Certified document translation",
    text: "Contracts, regulatory filings, immigration packets, HR policies, aviation safety notices, and sworn affidavits reviewed by two linguists.",
  },
  {
    title: "Certified website translation",
    text: "Marketing sites, passenger portals, investor hubs, and LMS platforms localized with accessibility, privacy, and SEO baked in.",
  },
  {
    title: "Terminology & QA",
    text: "Glossaries, translation memories, and bilingual style guides aligned with UN, airline, and banking terminology sets.",
  },
];

const industries = [
  {
    name: "Multilateral & UN",
    bullets: ["Sitrep & MoU turnaround", "Procurement packets", "Security-cleared linguists"],
  },
  {
    name: "Airlines & mobility",
    bullets: ["OPS bulletins", "Crew & passenger comms", "Irregular operations messaging"],
  },
  {
    name: "Banks & fintech",
    bullets: ["KYC & onboarding", "Treasury playbooks", "Vendor due diligence"],
  },
];

export default function TranslationLocalizationPage() {
  return (
    <>
      <TranslationStructuredData />
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-slate-900">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold">Services / Translation & Localization</p>
        <h1 className="mt-3 text-4xl font-extrabold text-sky-900">
          Certified document & website translation for regulated teams
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          JB Linguistics LLC delivers sworn translations, localization for multilingual platforms, and terminology stewardship for
          organizations that answer to safety regulators, procurement offices, boardrooms, and donors. We operate virtually,
          maintain German government-grade security practices, and can mobilize linguists across Dutch, English, French, German,
          Mandarin, Spanish, and Swedish.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {servicePillars.map((pillar) => (
            <div key={pillar.title} className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 text-sm text-slate-700">
              <h3 className="text-base font-semibold text-sky-900">{pillar.title}</h3>
              <p className="mt-2">{pillar.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-5 py-2 text-sm font-semibold hover:bg-teal-500 transition"
          >
            Book certified translation support
          </Link>
          <Link
            href="/services/certified-document-translation"
            className="inline-flex items-center rounded-full border border-sky-900/20 bg-white px-5 py-2 text-sm font-semibold text-sky-900 hover:bg-slate-50 transition"
          >
            View document translation scope
          </Link>
        </div>
      </section>

      <section className="py-12 bg-slate-900 text-sky-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold">Industries we serve most</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {industries.map((industry) => (
              <div key={industry.name} className="rounded-3xl border border-white/20 bg-white/5 p-4 text-sm">
                <h3 className="text-lg font-semibold text-white">{industry.name}</h3>
                <ul className="mt-3 space-y-1.5 text-sky-100">
                  {industry.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-teal-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid gap-8 md:grid-cols-[1.2fr,0.8fr] text-sm text-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-sky-900">Website & platform localization</h2>
            <p className="mt-3">
              We combine UX copy, structured data, accessibility tags, analytics events, and privacy notices so your localized website
              or LMS complies with WCAG, GDPR, and regional cookie regimes. Content reviews happen inside secure, virtual-first
              workflows so nothing leaves your repository without approval.
            </p>
            <ul className="mt-4 space-y-1.5">
              {[
                "SEO keyword research and metadata rewrites for each target market",
                "Alt text, ARIA labels, and translation of PDF/embedded assets",
                "Glossary + translation memory handoffs for internal or vendor teams",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-base font-semibold text-sky-900">Delivery timeline</h3>
            <ol className="mt-3 space-y-2">
              {[
                "Day 0–2: secure intake, NDA confirmation, asset audit",
                "Day 3–10: parallel translation + in-context QA",
                "Day 11+: final read-through, glossary update, and on-call support",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="text-sky-700 font-semibold">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <Link
                href="/#contact"
                className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition"
              >
                Share your source files
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
