"use client";

import Link from "next/link";
import { destinations } from "@/lib/trips";
import { useLanguage } from "@/lib/language-context";

type PricingRow = {
  label: string;
  amount: number;
  description: string;
};

const FLIGHT_ESTIMATE = 1200;
const OPERATIONS_FEE = 800;
const INSURANCE_BUFFER = 250;

export default function TripPricingPage({ params }: { params: { slug: string } }) {
  const { t } = useLanguage();
  const tripsCopy = t.tripsPage;
  const cardPricingLabel =
    "cardPricingLink" in tripsCopy && typeof tripsCopy.cardPricingLink === "string"
      ? tripsCopy.cardPricingLink
      : "Sample pricing";
  const pricingDisclaimer =
    "pricingDisclaimer" in tripsCopy && typeof tripsCopy.pricingDisclaimer === "string"
      ? tripsCopy.pricingDisclaimer
      : "Pricing varies by cohort size, travel dates, and the time between booking and departure. Use this estimate for planning; confirmed totals are provided once flights, hotels, and excursions are reserved.";
  const destination = destinations.find((d) => d.slug === params.slug);

  if (!destination) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-sky-900">{tripsCopy.notFoundTitle ?? "Destination not found"}</h1>
        <Link href="/trips" className="mt-3 inline-block text-sky-700 underline">
          {tripsCopy.notFoundLink ?? "Back to all destinations"}
        </Link>
      </main>
    );
  }

  const availableLengths = destination.lengths?.length ? destination.lengths : [14];
  const referenceLength = availableLengths.includes(14) ? 14 : availableLengths[0];
  const nights = Math.max(referenceLength - 1, referenceLength);

  const lodging = nights * 260;
  const coaching = referenceLength * 320;
  const excursions = referenceLength * 150;
  const transit = referenceLength * 80;
  const pricingRows: PricingRow[] = [
    { label: "Round-trip airfare", amount: FLIGHT_ESTIMATE, description: "Frankfurt ↔ destination, economy class estimate." },
    {
      label: "4★ accommodations & breakfasts",
      amount: lodging,
      description: `${nights} nights in business-class hotels or villas.`,
    },
    {
      label: "Daily coaching & facilitation",
      amount: coaching,
      description: `${referenceLength} days · 2–3 hours of instructor-led coaching, assessments, and materials.`,
    },
    {
      label: "Excursions & admissions",
      amount: excursions,
      description: "Cultural visits, workshops, and curated networking experiences.",
    },
    {
      label: "Ground transport & logistics",
      amount: transit,
      description: "Airport transfers, ground coach, and city transit passes.",
    },
    {
      label: "Program operations & compliance",
      amount: OPERATIONS_FEE,
      description: "Staffing, documentation, Bildungsurlaub paperwork, and on-call support.",
    },
    {
      label: "Insurance buffer",
      amount: INSURANCE_BUFFER,
      description: "Recommended reserve for supplemental travel medical policies.",
    },
  ];

  const estimatedTotal = pricingRows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-slate-900">
      <section className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold">Linguistic Learning Trips</p>
          <h1 className="text-3xl font-extrabold text-sky-900">{destination.name}</h1>
        <p className="text-sm text-slate-600">
          {cardPricingLabel} · {referenceLength}-day cohort (max 10 travelers)
        </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm text-slate-700">
            <thead>
              <tr className="text-left bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                <th className="px-4 py-3">Cost component</th>
                <th className="px-4 py-3">Estimate</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {pricingRows.map((row) => (
                <tr key={row.label} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-sky-900">{row.label}</td>
                  <td className="px-4 py-3 font-semibold">${row.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.description}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 border-t border-slate-200 text-sky-900 text-base font-bold">
                <td className="px-4 py-4">Estimated total (per traveler)</td>
                <td className="px-4 py-4">${estimatedTotal.toLocaleString()}</td>
                <td className="px-4 py-4">Subject to vendor availability and booking window.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-600">{pricingDisclaimer}</p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/trips/${destination.slug}`}
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-5 py-2 text-sm font-semibold hover:bg-teal-500 transition"
          >
            Return to itinerary
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-sky-900 hover:bg-slate-50 transition"
          >
            Request formal quote
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-sky-900">Payment cadence</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside">
            <li>40% deposit at signature (locks travel hold and instructor assignments).</li>
            <li>Remaining balance due 14 days prior to departure unless otherwise negotiated.</li>
            <li>Split invoicing available for education stipends, Bildungsurlaub, or departmental budgets.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
