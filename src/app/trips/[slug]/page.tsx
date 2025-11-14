// src/app/trips/[slug]/page.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { destinations, itineraryFor } from "@/lib/trips";
import { useSearchParams, usePathname } from "next/navigation";

export default function TripDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const dest = destinations.find((d) => d.slug === slug);
  if (!dest) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold text-sky-900">Destination not found</h1>
        <Link href="/trips" className="text-sky-700 underline mt-2 inline-block">
          Back to all destinations
        </Link>
      </main>
    );
  }

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const available = (dest as any).lengths && (dest as any).lengths.length ? (dest as any).lengths : [14];
  const requested = Number(searchParams.get("days"));
  const selectedLength = available.includes(requested) ? requested : (available.includes(14) ? 14 : available[available.length - 1]);

  const itin = itineraryFor(dest, selectedLength);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-teal-50 text-slate-900">
      <section className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <Link href="/trips" className="text-sky-700 underline text-sm">
          ← All destinations
        </Link>

        <div className="mt-3 grid md:grid-cols-[1.2fr,1fr] gap-8 items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-sky-900">
              {dest.name}
            </h1>
            {dest.region && (
              <p className="text-slate-600 mt-1 text-sm">{dest.region}</p>
            )}
            <p className="mt-4 text-slate-700">
              Sample {selectedLength}-day program combining daily English coaching (2–3 hours) with curated
              cultural activities. Custom dates also available.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">Package length:</span>
              {available.map((len) => {
                const active = len === selectedLength;
                const href = `${pathname}?days=${len}`;
                return (
                  <Link
                    key={len}
                    href={href}
                    className={[
                      "px-3 py-1.5 rounded-full text-sm border transition",
                      active
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-sky-900 border-slate-300 hover:bg-slate-50"
                    ].join(" ")}
                    prefetch={false}
                  >
                    {len} days
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
              {dest.highlights?.length ? (
                <ul className="text-sm list-disc list-inside text-slate-700">
                  {dest.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <Link
              href="/#contact"
              className="mt-6 inline-block bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-full font-semibold shadow"
            >
              Inquire about {selectedLength}-day {dest.name}
            </Link>
          </div>

          <div className="relative h-56 md:h-72 rounded-3xl overflow-hidden shadow">
            <Image
              src={
                dest.hero ||
                "https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&dpr=2&w=1200"
              }
              alt={dest.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-3 left-4 text-white drop-shadow-lg">
              <h2 className="text-xl font-bold">{dest.name}</h2>
              <p className="text-sm">{dest.region}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-inner border border-teal-100 p-6">
          <h2 className="text-2xl font-semibold text-sky-900 mb-3">About this trip</h2>
          <p className="text-slate-700 leading-relaxed">
            {dest.blurb || "Join a cultural and language immersion experience blending English learning with curated travel and local exploration."}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white/90 border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">
              Included in every 2026 departure
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Round-trip flights, 4★ accommodations, daily breakfast, and all ground transportation.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Select excursions and admissions curated for each destination.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Certified ESL instructor on-site 8–10 hours per day, escorting events and facilitating coaching.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>2–3 hours of structured language learning daily, integrated with real-world practice.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white/90 border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">
              Exams, compliance & extras
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Pre-trip online placement plus post-trip government-certified exam with official results.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Eligible for Bildungsurlaub for German citizens — detailed guidance provided after inquiry.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Max 10 participants; alternative 2026 dates released when a cohort fills. Pricing breakdowns shared during proposal stage.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Travel health and liability insurance is purchased separately — we point students to vetted providers.</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-600">
          More operational details (meeting points, educator bios, pre/post exam logistics) are included in the proposal you receive after submitting an inquiry.
        </p>

        <div className="mt-10 rounded-3xl bg-white border border-teal-100 shadow">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-sky-900">
              Sample {selectedLength}-Day Itinerary
            </h2>
            <p className="text-sm text-slate-600">
              Daily English sessions (2–3h) + afternoon experiences. Travel, lodging, breakfast,
              local transport, and select excursions included.
            </p>
          </div>

          <ol className="divide-y divide-slate-100">
            {itin.days.map((d, i) => (
              <li key={i} className="px-5 py-4">
                <div className="font-semibold text-sky-900">{d.title}</div>
                <div className="text-sm text-slate-700 mt-1">
                  <span className="font-medium">Lesson:</span> {d.lesson}
                </div>
                <div className="text-sm text-slate-700">
                  <span className="font-medium">Activity:</span> {d.activity}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Note: Programs are tailored to group size (max 10), proficiency, and dates. We’ll confirm
          the exact plan and alternatives when groups fill, and will direct each traveler to purchase
          the required travel health/liability coverage before departure.
        </p>
      </section>
    </main>
  );
}
