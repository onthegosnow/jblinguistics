"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { destinations, type Destination } from "@/lib/trips";
import { copy } from "@/lib/copy";
import { useLanguage } from "@/lib/language-context";


type Len = 7 | 10 | 14 | 21;
const ALL = "all" as const;
type FilterKey = typeof ALL | Len;

export default function TripsIndex() {
  const { t } = useLanguage();
  const tripsCopy = t.tripsPage;
  const daySuffix = tripsCopy.daySuffix ?? "days";
  const formatDays = (len: number) => `${len} ${daySuffix}`;
  const localizedDestinations = useMemo(() => t.destinations ?? {}, [t]);
  const benefitCopy = t.tripBenefits ?? copy.en.tripBenefits;
  const [filter, setFilter] = useState<FilterKey>(ALL);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("trip_len_filter");
    if (saved === "all" || !saved) return;
    const n = Number(saved);
    if ([7, 10, 14, 21].includes(n)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilter(n as FilterKey);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("trip_len_filter", String(filter));
  }, [filter]);

  const items = useMemo<Destination[]>(
    () =>
      [...destinations].sort((a, b) => {
        const nameA = localizedDestinations[a.slug]?.name ?? a.name;
        const nameB = localizedDestinations[b.slug]?.name ?? b.name;
        return nameA.localeCompare(nameB);
      }),
    [localizedDestinations]
  );

  const availableLengths: Len[] = useMemo(() => {
    const set = new Set<number>();
    for (const d of destinations) {
      (d.lengths ?? []).forEach((n) => set.add(n));
    }
    return [7, 10, 14, 21].filter((n) => set.has(n)) as Len[];
  }, []);

  const filtered = useMemo(() => {
    const byLen =
      filter === ALL ? items : items.filter((d) => (d.lengths ?? []).includes(filter));
    const term = q.trim().toLowerCase();
    if (!term) return byLen;
    return byLen.filter((d) => {
      const localized = localizedDestinations[d.slug];
      const nameCandidates = [
        localized?.name,
        d.name,
        localized?.region,
        d.region,
      ].filter(Boolean) as string[];
      return nameCandidates.some((value) => value.toLowerCase().includes(term));
    });
  }, [items, filter, q, localizedDestinations]);
  const bildungsurlaubSteps = t.trips.bildungsurlaubSteps ?? [];
  const BILD_APPLICATION_LINK = "https://www.bildungsurlaub.de/info/antragstellung";
  const BILD_INFO_LINK = "https://www.bildungsurlaub.de/info/arbeitnehmer";

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold text-sky-900">{tripsCopy.title}</h1>
        <p className="mt-2 text-slate-700">{tripsCopy.description}</p>
        <p className="mt-1 text-xs text-slate-500">{tripsCopy.capacity}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-4 text-sm text-slate-700">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-900">
              {tripsCopy.includesTitle}
            </h2>
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {tripsCopy.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-4 text-sm text-slate-700">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-900">
              {tripsCopy.extrasTitle}
            </h2>
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {tripsCopy.extras.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition shadow-sm"
          >
            {tripsCopy.ctaButton}
          </Link>
        </div>

        {/* Length filter */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600 mr-1">{tripsCopy.filterLabel}</span>
          <button
            onClick={() => setFilter(ALL)}
            className={[
              "px-3 py-1.5 rounded-full text-xs border transition",
              filter === ALL
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-sky-900 border-slate-300 hover:bg-slate-50",
            ].join(" ")}
          >
            {tripsCopy.filterAllLabel ?? "All"}
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
              {formatDays(len)}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center">
          <label htmlFor="trip-search" className="mr-2 text-sm text-slate-600">{tripsCopy.searchLabel}</label>
          <input
            id="trip-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder={tripsCopy.searchPlaceholder}
            className="w-full max-w-xs rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </header>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((d) => {
          const localized = localizedDestinations[d.slug];
          const displayName = localized?.name ?? d.name;
          const displayRegion = localized?.region ?? d.region;
          const highlights = localized?.highlights ?? d.highlights ?? [];
          const lengths = Array.isArray(d.lengths) && d.lengths.length ? d.lengths : [14];
          const defaultLen = lengths.includes(14) ? 14 : Math.min(...lengths);

          return (
            <article
              key={d.slug}
              className="group rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-teal-200 transition"
            >
              {/* Optional hero image if provided on the destination */}
              {d.heroSplit ? (
                <div className="relative h-40 overflow-hidden">
                  <div className="grid grid-cols-2 h-full w-full">
                    {[
                      { src: d.heroSplit.left, alt: d.heroSplit.altLeft ?? `${displayName} Florida` },
                      { src: d.heroSplit.right, alt: d.heroSplit.altRight ?? `${displayName} Grand Cayman` },
                    ].map((item) => (
                      <div key={item.src} className="relative">
                        <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="50vw" />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white drop-shadow">
                    <div className="text-sm font-semibold">{displayName}</div>
                    {displayRegion ? <div className="text-[11px] opacity-90">{displayRegion}</div> : null}
                  </div>
                </div>
              ) : d.hero ? (
                <div className="relative h-40">
                  <Image
                    src={d.hero as string}
                    alt={displayName}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white drop-shadow">
                    <div className="text-sm font-semibold">{displayName}</div>
                    {displayRegion ? <div className="text-[11px] opacity-90">{displayRegion}</div> : null}
                  </div>
                </div>
              ) : null}

              <div className="p-4 flex flex-col gap-3 grow">
                {/* Title for no-image cards */}
                {!("hero" in d && d.hero) ? (
                  <div>
                    <h2 className="text-lg font-semibold text-sky-900">{displayName}</h2>
                    {displayRegion ? (
                      <p className="text-xs text-slate-500">{displayRegion}</p>
                    ) : null}
                  </div>
                ) : null}

                {/* Highlights preview */}
                {highlights.length ? (
                  <ul className="text-sm text-slate-700 space-y-1">
                    {highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {/* Length chips */}
                <div className="mt-1 flex flex-wrap gap-2">
                  {lengths.map((len) => {
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
                    {formatDays(len)}
                  </Link>
                );
              })}
                </div>

                <div className="pt-1 flex flex-wrap gap-2">
                  <Link
                    href={`/trips/${d.slug}?days=${defaultLen}`}
                    className="inline-flex items-center justify-center rounded-full px-3.5 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
                  >
                    {tripsCopy.cardButton}
                  </Link>
                  <Link
                    href={`/trips/${d.slug}/pricing`}
                    className="inline-flex items-center justify-center rounded-full px-3.5 py-2 text-sm font-semibold border border-slate-300 text-sky-900 hover:bg-slate-50 transition"
                  >
                    {tripsCopy.cardPricingLink ?? "View sample pricing"}
                  </Link>
                </div>

                <p className="mt-auto text-[11px] text-slate-500">{tripsCopy.cardNote}</p>
              </div>
            </article>
          );
        })}
      </div>

      <section
        id="bildungsurlaub-guide"
        className="mt-12 rounded-3xl border border-slate-200 bg-white shadow-sm p-6"
      >
        <div className="md:flex md:items-start md:justify-between gap-6">
          <div className="md:w-1/2 space-y-3 text-sm text-slate-700">
            <h2 className="text-2xl font-bold text-sky-900">{tripsCopy.bildungsurlaubSectionTitle}</h2>
            <p>{t.trips.bildungsurlaub}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={BILD_INFO_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-sky-900 text-white px-4 py-2 text-xs font-semibold hover:bg-sky-800 transition"
              >
                {t.trips.bildungsurlaubGuide}
              </a>
              <a
                href={BILD_APPLICATION_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-sky-900/40 px-4 py-2 text-xs font-semibold text-sky-900 hover:bg-slate-100 transition"
              >
                {t.trips.bildungsurlaubApplication}
              </a>
            </div>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0">
            <ol className="space-y-2 list-decimal list-inside text-sm text-slate-700">
              {bildungsurlaubSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {benefitCopy ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-2xl font-bold text-sky-900">{benefitCopy.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{benefitCopy.description}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {benefitCopy.items.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-sky-900 font-semibold">{item.label}</p>
                <p className="mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-2xl font-bold text-sky-900">{tripsCopy.agreementTitle}</h2>
        <p className="mt-3 text-sm text-slate-700">{tripsCopy.agreementIntro}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm text-slate-700">
          {(tripsCopy.agreementClauses ?? copy.en.tripsPage.agreementClauses ?? []).map((clause) => (
            <div key={clause.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-semibold text-sky-900">{clause.title}</h3>
              <p className="mt-2">{clause.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-5 py-2 text-sm font-semibold hover:bg-teal-500 transition"
          >
            {tripsCopy.agreementCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
