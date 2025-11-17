export type TranslationService = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  infoHref: string;
  requestHref: string;
  highlights: string[];
  deliverables: string[];
  requestCta?: string;
};

export const translationServices: TranslationService[] = [
  {
    slug: "documents",
    name: "Certified document translation",
    summary: "Sworn linguists, dual review, and notarized packets for courts, ministries, airlines, and banks.",
    description:
      "Upload immigration packets, procurement files, HR policies, or regulatory submissions for sworn translators and senior reviewers. Every engagement includes statements of accuracy, credentials, and tamper-proof delivery within our encrypted workspace.",
    infoHref: "/services/certified-document-translation",
    requestHref: "/services/translation-requests/documents",
    highlights: [
      "Court-, ministry-, and regulator-ready formatting",
      "Digital signatures and audit trails on every file",
      "Aviation, immigration, banking, and ESG specialization",
    ],
    deliverables: [
      "Sworn translator statement + reviewer attestation",
      "Digitally signed PDF package with tamper seal",
      "Terminology log, bilingual change log, and rush tiers",
    ],
  },
  {
    slug: "websites",
    name: "Website & platform localization",
    summary: "Localized UX copy + structured data that keeps your LMS, passenger portal, or investor hub compliant.",
    description:
      "Bridge marketing, product, and compliance teams with localization that covers UX writing, accessibility tags, analytics events, and privacy notices. We ship glossaries, translation memories, and on-call QA so your launch stays consistent across every locale.",
    infoHref: "/services/translation-localization",
    requestHref: "/services/translation-requests/websites",
    highlights: [
      "WCAG, GDPR, and airline accessibility expertise",
      "SEO metadata, schema, and analytics localization",
      "Secure virtual production with bilingual reviewers",
    ],
    deliverables: [
      "UX copy decks, voice guides, and alt/ARIA text",
      "TM + glossary handoff for internal or vendor teams",
      "On-call QA and release support after go-live",
    ],
  },
  {
    slug: "terminology",
    name: "Terminology & QA pods",
    summary: "Dedicated linguists maintain glossaries, translation memories, and bilingual QA for regulated content.",
    description:
      "Request an on-demand linguist pod that manages terminology, translation memories, and bilingual QA sweeps. We surface risky phrasing before it reaches regulators and give your internal teams clean references for every future request.",
    infoHref: "/services/translation-localization",
    requestHref: "/services/translation-requests/terminology",
    highlights: [
      "Continuous QA for safety notices, MoUs, tenders",
      "Neural + human checks with bilingual issue tracking",
      "Secure glossary + style guide maintenance",
    ],
    deliverables: [
      "Living terminology bank with version history",
      "QA findings with remediation suggestions",
      "Executive-ready updates on velocity and quality",
    ],
  },
];

export function getTranslationService(slug: string) {
  return translationServices.find((service) => service.slug === slug);
}

