"use client";

import Link from "next/link";
import { use } from "react";
import { destinations } from "@/lib/trips";
import { getTripPricingSheets } from "@/lib/trip-pricing";
import { useLanguage } from "@/lib/language-context";

type PricingRow = {
  label: string;
  amount: number;
  description: string;
};

const FLIGHT_ESTIMATE = 1200;
const OPERATIONS_FEE = 800;
const INSURANCE_BUFFER = 250;
const PACKAGE_INCLUDES = [
  "Round-trip flights in main cabin with one checked bag from Frankfurt",
  "4★ accommodations in either a private room or a shared room (pricing reflects the selection)",
  "Daily language learning hours plus certification upon completion",
  "Breakfast every morning",
  "Group-selected excursions chosen from a curated list shared post-booking",
  "Transportation: airport transfers and local transit support",
];

const PACKAGE_EXCLUDES = [
  "Supplemental excursions or upgrades beyond the group-selected options",
  "Lunches, dinners, snacks, and beverages",
  "Souvenirs and personal shopping",
  "Travel and health insurance (must be purchased prior to travel)",
  "Meals on travel days to and from the learning destination",
];
const PRICING_UPDATED = "November 2025";

export default function TripPricingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
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
  const destination = destinations.find((d) => d.slug === resolvedParams.slug);

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

  const customSheets = getTripPricingSheets(destination.slug);
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

        <p className="text-xs text-slate-600">
          Pricing subject to change; last updated {PRICING_UPDATED}. Estimates assume cohorts of up to eight travelers
          departing Frankfurt together—airfare and lodging may fluctuate when bookings are finalized.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 space-y-2 text-sm text-slate-700">
            <h2 className="text-xs uppercase tracking-[0.3em] text-sky-900 font-semibold">Included</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              {PACKAGE_INCLUDES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 space-y-2 text-sm text-slate-700">
            <h2 className="text-xs uppercase tracking-[0.3em] text-sky-900 font-semibold">Not included</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              {PACKAGE_EXCLUDES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {customSheets.length ? (
          customSheets.map((sheet) => (
            <div
              key={sheet.title}
              className="rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4 p-4 md:p-6"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">
                  {sheet.dates} · {sheet.duration}
                </p>
                <h2 className="text-xl font-semibold text-sky-900 mt-2">{sheet.title}</h2>
              </div>
              <table className="w-full text-sm text-slate-700">
                <thead>
                  <tr className="text-left bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                    <th className="px-3 py-2">Cost component</th>
                    <th className="px-3 py-2">Estimate</th>
                    <th className="px-3 py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold text-sky-900">What’s included</td>
                    <td className="px-3 py-2 font-semibold">
                      {sheet.singleRoom} single{sheet.sharedRoom ? ` / ${sheet.sharedRoom} shared` : ""}
                    </td>
                    <td className="px-3 py-2">
                      Round-trip flights, 4★ lodging, language hours + certification, breakfasts, curated excursions, and
                      transportation.
                    </td>
                  </tr>
                  <tr className="bg-slate-50 border-t border-slate-200 text-sky-900 text-base font-bold">
                    <td className="px-3 py-3">Single occupancy total</td>
                    <td className="px-3 py-3">{sheet.singleRoom}</td>
                    <td className="px-3 py-3">Includes flights, lodging, instruction, excursions, and logistics.</td>
                  </tr>
                  {sheet.sharedRoom ? (
                    <tr className="bg-slate-50 border-t border-slate-200 text-sky-900 text-base font-bold">
                      <td className="px-3 py-3">Shared room total</td>
                      <td className="px-3 py-3">{sheet.sharedRoom}</td>
                      <td className="px-3 py-3">Per traveler when sharing with one roommate.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
              {sheet.note ? <p className="text-xs text-slate-500">{sheet.note}</p> : null}
            </div>
          ))
        ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 text-sm text-slate-700">
          <h2 className="text-xl font-semibold text-sky-900">Illustrative package estimate</h2>
          <p className="mt-2">
            Based on recent cohorts, a single-occupancy package lands near{" "}
            <strong>€{estimatedTotal.toLocaleString()}</strong>. Shared rooms typically reduce the total by roughly 10%.
          </p>
          <p className="mt-2 text-slate-600">
            Actual airfare and lodging quotes may shift depending on booking windows and cohort capacity. Reach out for a
            formal quote tailored to your travel dates.
          </p>
        </div>
        )}

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
          <p className="font-semibold text-sky-900">Booking & payment terms</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside">
            <li>
              A non-refundable 40% commitment is due upfront. You’ll receive a contract detailing inclusions before the
              deposit is invoiced.
            </li>
            <li>The remaining balance is due two months before departure.</li>
            <li>Invoices can be split for company reimbursement, stipends, or Bildungsurlaub documentation.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
