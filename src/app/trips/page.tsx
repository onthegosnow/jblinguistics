"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { destinations } from "@/lib/trips";


type Len = 7 | 10 | 14 | 21;
const ALL = "all" as const;
type FilterKey = typeof ALL | Len;

export default function TripsIndex() {
  const [filter, setFilter] = useState<FilterKey>(() => {
    if (typeof window === "undefined") return ALL;
    const saved = window.localStorage.getItem("trip_len_filter");
    if (!saved) return ALL;
    if (saved === "all") return ALL;
    const n = Number(saved);
    return [7, 10, 14, 21].includes(n) ? (n as FilterKey) : ALL;
  });
  const [q, setQ] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("trip_len_filter", String(filter));
  }, [filter]);

  const items = useMemo(
    () => [...destinations].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const availableLengths: Len[] = useMemo(() => {
    const set = new Set<number>();
    for (const d of destinations as any[]) {
      (d.lengths ?? []).forEach((n: number) => set.add(n));
    }
    return [7, 10, 14, 21].filter((n) => set.has(n)) as Len[];
  }, []);

  const filtered = useMemo(() => {
    const byLen = filter === ALL ? items : items.filter((d: any) => (d.lengths ?? []).includes(filter));
    const term = q.trim().toLowerCase();
    if (!term) return byLen;
    return byLen.filter((d: any) => {
      const name = (d.name || "").toLowerCase();
      const region = (d.region || "").toLowerCase();
      return name.includes(term) || region.includes(term);
    });
  }, [items, filter, q]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold text-sky-900">Linguistic Learning Trips</h1>
        <p className="mt-2 text-slate-700">
          Combine tourism with daily English coaching. Choose a destination to see a sample itinerary
          (7, 10, 14, or 21 days) and request custom dates for 2026.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          <strong>Capacity:</strong> Max 10 participants per departure. Once a trip is full, alternative dates will be offered.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-4 text-sm text-slate-700">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-900">
              What every 2026 trip includes
            </h2>
            <ul className="mt-2 space-y-1.5 text-[13px]">
              <li>Round-trip flights, 4★ accommodations, breakfasts, and all local transportation.</li>
              <li>Certified ESL lead with the cohort 8–10 hours per day plus 2–3 hour workshops woven into the itinerary.</li>
              <li>Select excursions and admissions tied to each destination’s learning goals.</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-4 text-sm text-slate-700">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-900">
              Exams, compliance & extras
            </h2>
            <ul className="mt-2 space-y-1.5 text-[13px]">
              <li>Online placement before departure plus a government-certified exam after the trip.</li>
              <li>Eligible for Bildungsurlaub (DE) — documentation supplied after you inquire.</li>
              <li>Travel health & liability insurance is purchased separately; we guide you through approved providers.</li>
              <li>Price breakdowns for each 2026 cohort are delivered with your proposal.</li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition shadow-sm"
          >
            Request an itinerary & pricing packet
          </Link>
        </div>

        {/* Length filter */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600 mr-1">Filter by length:</span>
          <button
            onClick={() => setFilter(ALL)}
            className={[
              "px-3 py-1.5 rounded-full text-xs border transition",
              filter === ALL
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-sky-900 border-slate-300 hover:bg-slate-50",
            ].join(" ")}
          >
            All
          </button>
          {availableLengths.map((len) => (
            <button
              key={len}
              onClick={() => setFilter(len)}
              className={[
                "px-3 py-1.5 rounded-full text-xs border transition",
                filter === len
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-sky-900 border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              {len} days
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center">
          <label htmlFor="trip-search" className="mr-2 text-sm text-slate-600">Search:</label>
          <input
            id="trip-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Search destination or region…"
            className="w-full max-w-xs rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </header>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((d) => {
          const defaultLen = (d as any).lengths?.includes(14)
            ? 14
            : Math.min(...(((d as any).lengths && (d as any).lengths.length ? (d as any).lengths : [14]) as number[]));

          return (
            <article
              key={d.slug}
              className="group rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-teal-200 transition"
            >
              {/* Optional hero image if provided on the destination */}
              {"hero" in d && d.hero ? (
                <div className="relative h-40">
                  <Image
                    src={d.hero as string}
                    alt={d.name}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white drop-shadow">
                    <div className="text-sm font-semibold">{d.name}</div>
                    {d.region ? (
                      <div className="text-[11px] opacity-90">{(d as any).region}</div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="p-4 flex flex-col gap-3 grow">
                {/* Title for no-image cards */}
                {!("hero" in d && d.hero) ? (
                  <div>
                    <h2 className="text-lg font-semibold text-sky-900">{d.name}</h2>
                    {d.region ? (
                      <p className="text-xs text-slate-500">{(d as any).region}</p>
                    ) : null}
                  </div>
                ) : null}

                {/* Highlights preview */}
                {"highlights" in d && Array.isArray((d as any).highlights) ? (
                  <ul className="text-sm text-slate-700 space-y-1">
                    {(d as any).highlights.slice(0, 3).map((h: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {/* Length chips */}
                <div className="mt-1 flex flex-wrap gap-2">
                  {((d as any).lengths ?? [14]).map((len: number) => {
                    const active = len === defaultLen;
                    return (
                      <Link
                        key={len}
                        href={`/trips/${d.slug}?days=${len}`}
                        className={[
                          "px-2.5 py-1 rounded-full text-xs border transition",
                          active
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white text-sky-900 border-slate-300 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {len} days
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-1">
                  <Link
                    href={`/trips/${d.slug}?days=${defaultLen}`}
                    className="inline-flex items-center justify-center rounded-full px-3.5 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
                  >
                    View itinerary
                  </Link>
                </div>

                <p className="mt-auto text-[11px] text-slate-500">
                  Max 10 participants; additional dates released when full.
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
