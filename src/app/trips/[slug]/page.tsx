"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { destinations, itineraryFor } from "@/lib/trips";
import { useLanguage } from "@/lib/language-context";

export default function TripDetail({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t } = useLanguage();
  const tripsCopy = t.tripsPage;
  const localizedDestinations = t.destinations ?? {};
  const dest = destinations.find((d) => d.slug === params.slug);

  if (!dest) {
    const notFoundTitle = tripsCopy.notFoundTitle ?? "Destination not found";
    const notFoundLink = tripsCopy.notFoundLink ?? "Back to all destinations";
    return (
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold text-sky-900">{notFoundTitle}</h1>
        <Link href="/trips" className="text-sky-700 underline mt-2 inline-block">
          {notFoundLink}
        </Link>
      </main>
    );
  }

  const availableLengths = Array.isArray(dest.lengths) && dest.lengths.length ? dest.lengths : [14];
  const requested = Number(searchParams.get("days"));
  const selectedLength = availableLengths.includes(requested)
    ? requested
    : availableLengths.includes(14)
    ? 14
    : availableLengths[availableLengths.length - 1];

  const localized = localizedDestinations[dest.slug];
  const displayName = localized?.name ?? dest.name;
  const displayRegion = localized?.region ?? dest.region;
  const highlightList = localized?.highlights ?? dest.highlights ?? [];
  const blurbText = localized?.blurb ?? dest.blurb;
  const itinerary = itineraryFor(dest, selectedLength, localized?.customItinerary);
  const daySuffix = tripsCopy.daySuffix ?? "days";
  const formatDays = (len: number) => `${len} ${daySuffix}`;
  const replaceTokens = (template?: string) =>
    (template ?? "")
      .replace(/\{days\}/g, String(selectedLength))
      .replace(/\{destination\}/g, displayName);
  const detailIntro = replaceTokens(tripsCopy.detailIntro) ||
    `Sample ${selectedLength}-day program combining daily English coaching (2–3 hours) with curated cultural activities. Custom dates also available.`;
  const detailCta = replaceTokens(tripsCopy.detailCta) || `Inquire about ${selectedLength}-day ${displayName}`;
  const sampleHeading = replaceTokens(tripsCopy.sampleHeading);
  const sampleSubheading = tripsCopy.sampleSubheading ?? "";
  const includes = tripsCopy.includes ?? [];
  const extras = tripsCopy.extras ?? [];
  const lessonLabel = tripsCopy.lessonLabel ?? "Lesson";
  const activityLabel = tripsCopy.activityLabel ?? "Activity";
  const aboutTripText =
    blurbText ||
    tripsCopy.aboutTripFallback ||
    "Join a cultural and language immersion experience blending English learning with curated travel and local exploration.";
  const bildungsurlaubBadgeTitle = tripsCopy.bildungsurlaubBadgeTitle ?? "Bildungsurlaub documentation";
  const bildungsurlaubBadgeText =
    tripsCopy.bildungsurlaubBadgeText ??
    "German citizens receive full JB Linguistics paperwork (Antrag, curriculum outline, signed participation letter, and split invoices) within two business days of securing a cohort.";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <section className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <Link href="/trips" className="text-teal-200 underline text-sm">
          ← {tripsCopy.notFoundLink ?? "Back to all destinations"}
        </Link>

        <div className="mt-3 grid md:grid-cols-[1.2fr,1fr] gap-8 items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">{displayName}</h1>
            {displayRegion && <p className="text-teal-200 mt-1 text-sm">{displayRegion}</p>}
            <p className="mt-4 text-slate-100">{detailIntro}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-300">{tripsCopy.packageLengthLabel ?? "Package length:"}</span>
              {availableLengths.map((len) => {
                const active = len === selectedLength;
                const href = `${pathname}?days=${len}`;
                return (
                  <Link
                    key={len}
                    href={href}
                    className={[
                      "px-3 py-1.5 rounded-full text-sm border transition",
                      active ? "bg-teal-600 text-white border-teal-600" : "bg-white text-sky-900 border-slate-300 hover:bg-slate-50",
                    ].join(" ")}
                    prefetch={false}
                  >
                    {formatDays(len)}
                  </Link>
                );
              })}
            </div>

            {highlightList.length ? (
              <ul className="mt-6 space-y-3 text-sm list-disc list-inside text-slate-200">
                {highlightList.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            ) : null}

            <div className="mt-4 rounded-2xl border border-teal-500/40 bg-slate-900/60 p-4 text-sm text-slate-100">
              <p className="text-xs uppercase tracking-[0.2em] text-teal-300 font-semibold">
                {bildungsurlaubBadgeTitle}
              </p>
              <p className="mt-1">{bildungsurlaubBadgeText}</p>
            </div>

            <Link
              href="/#contact"
              className="mt-6 inline-block bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-full font-semibold shadow"
            >
              {detailCta}
            </Link>
          </div>

          <div className="relative h-56 md:h-72 rounded-3xl overflow-hidden shadow">
            {dest.heroSplit ? (
              <>
                <div className="grid grid-cols-2 h-full w-full">
                  {[
                    { src: dest.heroSplit.left, alt: dest.heroSplit.altLeft ?? `${displayName} Florida` },
                    { src: dest.heroSplit.right, alt: dest.heroSplit.altRight ?? `${displayName} Grand Cayman` },
                  ].map((item) => (
                    <div key={item.src} className="relative">
                      <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="50vw" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              </>
            ) : (
              <>
                <Image
                  src={
                    dest.hero ||
                    "https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&dpr=2&w=1200"
                  }
                  alt={displayName}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </>
            )}
            <div className="absolute bottom-3 left-4 text-white drop-shadow-lg">
              <h2 className="text-xl font-bold">{displayName}</h2>
              <p className="text-sm">{displayRegion}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur rounded-3xl shadow-inner border border-teal-500/30 p-6">
          <h2 className="text-2xl font-semibold text-teal-200 mb-3">{tripsCopy.aboutTripTitle ?? "About this trip"}</h2>
          <p className="text-slate-100 leading-relaxed">{aboutTripText}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white/5 border border-teal-500/20 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-teal-200 uppercase tracking-wide">
              {tripsCopy.includesTitle ?? "What every 2026 trip includes"}
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-100">
              {includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white/5 border border-teal-500/20 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-teal-200 uppercase tracking-wide">
              {tripsCopy.extrasTitle ?? "Exams, compliance & extras"}
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-100">
              {extras.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-white/5 border border-teal-500/30 shadow">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-teal-200">
              {sampleHeading || `Sample ${selectedLength}-Day Itinerary`}
            </h2>
            {sampleSubheading ? (
              <p className="text-sm text-slate-200">{sampleSubheading}</p>
            ) : (
              <p className="text-sm text-slate-200">
                Daily English sessions (2–3h) + afternoon experiences. Travel, lodging, breakfast, local transport, and select excursions
                included.
              </p>
            )}
          </div>

          <ol className="divide-y divide-slate-100">
            {itinerary.days.map((day, index) => (
              <li key={`${day.title}-${index}`} className="px-5 py-4">
                <div className="font-semibold text-white">{day.title}</div>
                <div className="text-sm text-slate-200 mt-1">
                  <span className="font-medium">{lessonLabel}:</span> {day.lesson}
                </div>
                <div className="text-sm text-slate-200">
                  <span className="font-medium">{activityLabel}:</span> {day.activity}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-6 text-xs text-slate-300">{tripsCopy.note}</p>
      </section>
    </main>
  );
}
