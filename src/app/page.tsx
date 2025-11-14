// ✅ Connection test from ChatGPT — editing verified
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { copy, type Lang } from "@/lib/copy";
import TealNav from "@/components/teal-nav";
import { destinations } from "@/lib/trips";


export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const t = copy[lang];

  const featuredTrips = destinations.map((d) => d.name).slice(0, 11);
  const remainingTrips = Math.max(0, destinations.length - featuredTrips.length);


  return (
    <>
      <style jsx global>{`
        [data-layout-nav] {
          display: none;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-teal-50 to-slate-100 text-slate-900">
      {/* Top bar / Nav */}
      <TealNav
        lang={lang}
        t={t}
        ctaLabel={lang === "en" ? "Get a quote" : "Angebot anfragen"}
        onChangeLang={setLang}
        usePageAnchors
      />


      {/* Hero */}
      <main>
        <section className="pt-10 pb-14 md:pt-16 md:pb-20">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div>
              {/* Large logo replacing the text title */}
              <div className="mb-4">
                <Image
                  src="/Brand/IMG_0364.PNG"
                  alt="JB Linguistics LLC logo"
                  width={320}
                  height={320}
                  priority
                  className="w-56 md:w-64 lg:w-72 h-auto object-contain drop-shadow-md"
                />
              </div>
              <h1 className="sr-only">{t.hero.title}</h1>
              <p className="mt-4 text-sm md:text-base text-slate-700 leading-relaxed">
                {t.hero.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/40 transition"
                >
                  {t.hero.ctaPrimary}
                </a>
                <a
                  href="#services-overview"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold border border-sky-900/20 bg-white/70 text-sky-900 hover:bg-sky-50 transition"
                >
                  {t.hero.ctaSecondary}
                </a>
              </div>
              <div className="mt-3">
                <Link
                  href="/teachers/jonathan-brooks"
                  className="inline-flex items-center gap-1 text-sm text-sky-800 hover:text-sky-900 underline underline-offset-4"
                >
                  {lang === "en" ? "Meet Jonathan Brooks" : "Lernen Sie Jonathan Brooks kennen"} →
                </Link>
              </div>

              <div className="mt-6 text-[11px] text-slate-600 space-y-1">
                <p>
                  • Linguistic provisions in 20+ languages: training, translation, and interpretation
                </p>
                <p>
                  • Remote and in-person, project-based collaboration with companies, NGOs, and governments
                </p>
                <p>
                  • Based on the experience of Jonathan Brooks – international affairs, aviation, and global volunteer work across 86 countries
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-xl shadow-sky-900/15 border border-teal-100 bg-white">
                <div className="relative h-56 md:h-72">
                  <Image
                    src="/images/home/hero-collab.jpg"
                    alt="Language consultant working with professionals"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 md:p-5 text-xs text-slate-700 space-y-2">
                  <p className="font-semibold text-sky-900 text-sm">
                    Practical language learning, translation & interpretation
                  </p>
                  <p>
                    Sessions can be fully virtual or arranged in person – from
                    one-to-one coaching to high-level diplomatic settings.
                  </p>
                </div>
              </div>
              {/* Security-aware badge below the image card */}
              <div className="mt-4 rounded-2xl bg-sky-900 text-sky-50 text-[11px] p-3 shadow-lg shadow-sky-900/40">
                <p className="font-semibold">Security-aware language support</p>
                <p className="mt-1">
                  Experience with German government work and security clearance (Level Ü1) for sensitive contexts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section id="mission" className="py-10 md:py-14 bg-white/80">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-sky-900">
              {t.mission.heading}
            </h2>
            <p className="mt-4 text-sm md:text-base text-slate-700 leading-relaxed">
              {t.mission.text}
            </p>
          </div>
        </section>

        {/* Services overview tiles */}
        <section
          id="services-overview"
          className="py-10 md:py-14 bg-gradient-to-r from-teal-50 to-sky-50"
        >
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-teal-100 p-5 text-sm">
              <h3 className="font-semibold text-sky-900">
                {lang === "en" ? "Linguistic Learning" : "Sprachtraining"}
              </h3>
              <p className="mt-2 text-slate-700 text-xs leading-relaxed">
                {lang === "en"
                  ? "Structured yet flexible language programs for individuals and teams – online and on-site, aligned with your real communication needs."
                  : "Strukturierte und flexible Sprachprogramme für Einzelpersonen und Teams – online und vor Ort, abgestimmt auf Ihre reale Kommunikation."}
              </p>
            </div>
            <div className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-teal-100 p-5 text-sm">
              <h3 className="font-semibold text-sky-900">
                {lang === "en"
                  ? "Translation & Localization"
                  : "Übersetzung & Lokalisierung"}
              </h3>
              <p className="mt-2 text-slate-700 text-xs leading-relaxed">
                {lang === "en"
                  ? "Precise written translations and localized content for contracts, reports, websites, and internal documents."
                  : "Präzise schriftliche Übersetzungen und lokalisierte Inhalte für Verträge, Berichte, Websites und interne Unterlagen."}
              </p>
            </div>
            <div className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-teal-100 p-5 text-sm">
              <h3 className="font-semibold text-sky-900">
                {lang === "en"
                  ? "Simultaneous Interpretation"
                  : "Simultan-Dolmetschen"}
              </h3>
              <p className="mt-2 text-slate-700 text-xs leading-relaxed">
                {lang === "en"
                  ? "Virtual and in-person simultaneous interpretation for diplomatic visits, negotiations, and high-stakes meetings."
                  : "Virtuelles und persönliches Simultan-Dolmetschen für politische Besuche, Verhandlungen und wichtige Meetings."}
              </p>
            </div>
          </div>
        </section>

        {/* Teacher / learning section */}
        <section id="teacher" className="py-10 md:py-14 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-sky-900">
                  {t.teacher.heading}
                </h2>
                <p className="mt-4 text-sm md:text-base text-slate-700 leading-relaxed">
                  {t.teacher.intro}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  {t.teacher.bullets.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/teachers"
                    className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition shadow-md shadow-teal-600/30"
                  >
                    {lang === "en" ? "View all teachers" : "Alle Lehrkräfte anzeigen"}
                  </Link>
                  <Link
                    href="/teachers/jonathan-brooks"
                    className="inline-flex items-center rounded-full border border-sky-900/20 bg-white/80 text-sky-900 px-4 py-2 text-sm font-semibold hover:bg-sky-50 transition"
                  >
                    {lang === "en" ? "Meet Jonathan Brooks" : "Jonathan Brooks kennenlernen"}
                  </Link>
                  <Link
                    href="#contact"
                    className="inline-flex items-center rounded-full bg-sky-900 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-800 transition shadow-md shadow-sky-900/30"
                  >
                    {lang === "en" ? "Request a consultation" : "Beratung anfragen"}
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative h-52 md:h-64 rounded-3xl overflow-hidden shadow-lg shadow-sky-900/15">
                  <Image
                    src="/images/home/teachers-collab.jpg"
                    alt="Team workshop during a language session"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-sky-700 text-sky-50 p-4 text-xs md:text-[13px] shadow-lg shadow-teal-700/30">
                  <p className="font-semibold">
                    {lang === "en"
                      ? "Streamlined learning for busy professionals"
                      : "Effizientes Lernen für vielbeschäftigte Fachkräfte"}
                  </p>
                  <p className="mt-1">
                    {lang === "en"
                      ? "Sessions are built around real documents, calls, and situations you actually face – so every hour moves you forward."
                      : "Die Trainings basieren auf echten Dokumenten, Gesprächen und Situationen aus Ihrem Alltag – jede Stunde bringt Sie spürbar voran."}
                  </p>
                </div>
              </div>
            </div>

            {/* Teacher cards */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-sky-900 text-center mb-6">
                {lang === "en" ? "Meet Our Teachers" : "Unser Lehrteam"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Anna Müller",
                    lang: "German",
                    img: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&dpr=2&w=400",
                  },
                  {
                    name: "James Carter",
                    lang: "English",
                    img: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&dpr=2&w=400",
                  },
                  {
                    name: "Claire Dubois",
                    lang: "French",
                    img: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&dpr=2&w=400",
                  },
                ].map((tch) => (
                  <div
                    key={tch.name}
                    className="rounded-xl shadow-md overflow-hidden bg-slate-50"
                  >
                    <img
                      src={tch.img}
                      alt={tch.name}
                      className="w-full h-60 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-teal-700">
                        {tch.name}
                      </h3>
                      <p className="text-slate-600">
                        {tch.lang}{" "}
                        {lang === "en" ? "Instructor" : "Sprachtrainer*in"}
                      </p>
                      <a
                        href="#contact"
                        className="text-sm text-sky-600 hover:underline"
                      >
                        {lang === "en"
                          ? "Ask about this teacher"
                          : "Anfrage zu dieser Lehrkraft"}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Translator / interpretation section */}
        <section
          id="translator"
          className="py-10 md:py-14 bg-gradient-to-b from-sky-900 to-slate-900 text-sky-50"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  {t.translator.heading}
                </h2>
                <p className="mt-4 text-sm md:text-base text-sky-100 leading-relaxed">
                  {t.translator.intro}
                </p>
                <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-teal-200">
                  {t.translator.servicesTitle}
                </h3>
                <ul className="mt-3 space-y-2 text-xs md:text-sm">
                  {t.translator.services.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-teal-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Link
                    href="/teachers/jonathan-brooks"
                    className="inline-flex items-center rounded-full bg-teal-500 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-400 transition shadow-md shadow-teal-500/30"
                  >
                    {lang === "en" ? "Work with Jonathan Brooks" : "Mit Jonathan Brooks arbeiten"}
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-800/70 border border-sky-600/40 p-4 text-xs md:text-[13px]">
                  <p className="font-semibold text-teal-300">
                    {lang === "en"
                      ? "Virtual & in-person, project-based"
                      : "Virtuell & vor Ort, projektbasiert"}
                  </p>
                  <p className="mt-1 text-sky-100">
                    {lang === "en"
                      ? "All interpretation work is scoped as a negotiated project – tailored to your terminology, confidentiality requirements, and schedule."
                      : "Alle Dolmetscheinsätze erfolgen im Rahmen projektbezogener Vereinbarungen – abgestimmt auf Terminologie, Vertraulichkeit und Ihren Zeitplan."}
                  </p>
                </div>

                <div className="rounded-3xl overflow-hidden shadow-lg shadow-sky-900/40">
                  <div className="relative h-48">
                    <Image
                      src="https://images.pexels.com/photos/1181615/pexels-photo-1181615.jpeg?auto=compress&dpr=2&w=900"
                      alt="Conference interpretation setting"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Translator cards */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-sky-50 text-center mb-6">
                {lang === "en"
                  ? "Our Translators & Interpreters"
                  : "Unsere Übersetzer*innen & Dolmetscher*innen"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Lukas Schmidt",
                    lang: "German–English",
                    img: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&dpr=2&w=400",
                  },
                  {
                    name: "Elena Rossi",
                    lang: "Italian–English",
                    img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&dpr=2&w=400",
                  },
                  {
                    name: "Sofia Hernandez",
                    lang: "Spanish–English",
                    img: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&dpr=2&w=400",
                  },
                ].map((tr) => (
                  <div
                    key={tr.name}
                    className="rounded-xl shadow-md overflow-hidden bg-slate-900/60 border border-slate-700"
                  >
                    <img
                      src={tr.img}
                      alt={tr.name}
                      className="w-full h-60 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-teal-300">
                        {tr.name}
                      </h3>
                      <p className="text-sky-100">{tr.lang} Translator</p>
                      <a
                        href="#contact"
                        className="text-sm text-teal-200 hover:underline"
                      >
                        {lang === "en"
                          ? "Ask about availability"
                          : "Verfügbarkeit anfragen"}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Link
                  href="#contact"
                  className="inline-flex items-center rounded-full bg-teal-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-teal-400 transition shadow-md shadow-teal-500/30"
                >
                  {lang === "en" ? "Request an interpreter" : "Dolmetscher*in anfragen"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Join our network */}
        <section
          id="join-our-team"
          className="py-10 md:py-14 bg-gradient-to-b from-white to-slate-100"
        >
          <div className="max-w-6xl mx-auto px-4 rounded-3xl bg-white shadow-lg shadow-sky-900/10 border border-slate-200 p-5 md:p-7">
            <div className="md:flex md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-sky-900">
                  {lang === "en"
                    ? "Teach or translate with JB Linguistics"
                    : "Werden Sie Teil des JB Linguistics Netzwerks"}
                </h3>
                <p className="mt-2 text-sm text-slate-700">
                  {lang === "en"
                    ? "We welcome experienced teachers, translators, and interpreters who thrive in mission-driven and government-grade environments."
                    : "Wir freuen uns über erfahrene Lehrkräfte, Übersetzer*innen und Dolmetscher*innen, die gerne in anspruchsvollen Projekten und Behördenumfeldern arbeiten."}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  href="/apply"
                  className="inline-flex items-center rounded-full bg-sky-900 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-800 transition shadow-md shadow-sky-900/30"
                >
                  {lang === "en" ? "Go to application page" : "Zur Bewerbungsseite"}
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: lang === "en" ? "Teachers" : "Lehrkräfte",
                  bullets:
                    lang === "en"
                      ? [
                          "Corporate, NGO, or government training experience",
                          "Confident online + on-site delivery",
                          "Precise documentation & assessment habits",
                        ]
                      : [
                          "Erfahrung in Unternehmens-, NGO- oder Behördenprojekten",
                          "Sicher im Online- und Präsenzunterricht",
                          "Sorgfältige Dokumentation & Assessments",
                        ],
                },
                {
                  title:
                    lang === "en"
                      ? "Translators & Interpreters"
                      : "Übersetzer*innen & Dolmetscher*innen",
                  bullets:
                    lang === "en"
                      ? [
                          "Terminology depth for legal, aviation, and diplomatic work",
                          "Availability for short-notice missions",
                          "Security-minded, discreet communication",
                        ]
                      : [
                          "Fachsprache für Recht, Luftfahrt und Diplomatie",
                          "Flexibel für kurzfristige Einsätze",
                          "Diskrete und sicherheitsbewusste Kommunikation",
                        ],
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                >
                  <h4 className="text-base font-semibold text-sky-900">{card.title}</h4>
                  <ul className="mt-3 space-y-1.5">
                    {card.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Government & security section */}
        <section id="gov" className="py-10 md:py-14 bg-white">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-[1.4fr,1fr] gap-10 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-sky-900">
                {t.gov.heading}
              </h2>
              <div className="mt-4 space-y-3 text-sm md:text-base text-slate-700 leading-relaxed">
                {t.gov.text.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href="/teachers/jonathan-brooks"
                  className="inline-flex items-center rounded-full bg-sky-900 text-sky-50 px-4 py-2 text-sm font-semibold hover:bg-sky-800 transition"
                >
                  Read Jonathan Brooks’s full bio →
                </Link>
              </div>
            </div>
            {/* Intentionally left blank: highlight box removed */}
          </div>
        </section>

        {/* Linguistic learning trips */}
        <section
          id="trips"
          className="py-10 md:py-14 bg-gradient-to-r from-teal-700 to-sky-700 text-sky-50"
        >
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {t.trips.heading}
              </h2>
              <p className="mt-4 text-sm md:text-base leading-relaxed">
                {t.trips.intro}
              </p>
              <ul className="mt-4 space-y-2 text-xs md:text-sm">
                {t.trips.bullets.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-teal-200" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs md:text-sm text-teal-100">
                {t.trips.note}
              </p>
              {/* Featured trips list */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold">
                  {lang === "en"
                    ? "Featured 2026 itineraries"
                    : "Vorgestellte 2026-Reisen"}
                </h3>
                <ul className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {featuredTrips.map((d) => (
                    <li
                      key={d}
                      className="rounded-full bg-sky-800/40 border border-sky-200/20 px-3 py-1"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] text-teal-100">
                  {lang === "en"
                    ? `Need something different? We build additional custom itineraries to match your goals, calendar, and compliance requirements.${remainingTrips > 0 ? ` We already have ${remainingTrips} more departures reserved for bespoke cohorts.` : ""}`
                    : `Sie wünschen ein anderes Ziel? Wir gestalten zusätzliche Wunschreisen – abgestimmt auf Ihre Ziele, Termine und Compliance-Anforderungen.${remainingTrips > 0 ? ` Zusätzlich stehen ${remainingTrips} weitere Abfahrten für maßgeschneiderte Gruppen bereit.` : ""}`}
                </p>
                <p className="mt-1 text-[11px] text-teal-100">
                  {lang === "en"
                    ? "German citizens can leverage Bildungsurlaub through JB Linguistics — more details shared after you inquire."
                    : "Für deutsche Staatsbürger ist Bildungsurlaub über JB Linguistics möglich – Details erhalten Sie nach Ihrer Anfrage."}
                </p>
                <p className="mt-1 text-[11px] text-teal-100">
                  <Link href="/trips" className="underline">
                    {lang === "en"
                      ? "Browse the full Linguistic Learning Trips page for every 2026 departure."
                      : "Alle 2026-Reisen finden Sie auf der Linguistic-Learning-Trips-Seite."}
                  </Link>
                </p>
              </div>
            </div>
            <div className="relative h-56 md:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-sky-900/40">
              <Image
                src="/images/home/travel-showcase.jpg"
                alt="Cityscape representing language learning travel"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Contact / Inquiry form */}
        <section id="contact" className="py-10 md:py-14 bg-slate-950 text-sky-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              {t.contact.heading}
            </h2>
            <p className="mt-3 text-sm md:text-base text-sky-200">
              {t.contact.subtitle}
            </p>

            <form
              action="mailto:info@jblinguistics.com"
              method="post"
              encType="text/plain"
              className="mt-6 grid gap-4 text-xs md:text-sm bg-slate-900/70 border border-slate-700 rounded-3xl p-5 md:p-6"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sky-100">
                    {t.contact.name}
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sky-100">
                    {t.contact.email}
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sky-100">
                  {t.contact.organization}
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sky-100">
                    {t.contact.servicesLabel}
                  </label>
                  <select className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400">
                    <option value="">
                      {lang === "en" ? "Select…" : "Bitte wählen…"}
                    </option>
                    {t.contact.servicesOptions.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sky-100">
                    {t.contact.languagesNeeded}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      lang === "en"
                        ? "e.g. English ↔ German, French, Swedish…"
                        : "z. B. Deutsch ↔ Englisch, Französisch, Schwedisch…"
                    }
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sky-100">
                  {t.contact.details}
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder={
                    lang === "en"
                      ? "What are you working on? Please include context (industry, audience, volume, dates)…"
                      : "Worum geht es genau? Bitte nennen Sie kurz den Kontext (Branche, Zielgruppe, Umfang, Zeitraum)…"
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sky-100">
                    {t.contact.budget}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sky-100">
                    {t.contact.timeline}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-md shadow-teal-500/40 transition"
                >
                  {t.contact.submit}
                </button>
                <p className="text-[10px] text-slate-400 max-w-xs">
                  {lang === "en"
                    ? "By submitting, you agree that JB Linguistics LLC may contact you about this inquiry. No information is shared with third parties without your consent."
                    : "Mit dem Absenden erklären Sie sich einverstanden, dass JB Linguistics LLC Sie zu dieser Anfrage kontaktiert. Es werden keine Daten ohne Ihre Zustimmung an Dritte weitergegeben."}
                </p>
              </div>
            </form>

            <p className="mt-4 text-[11px] text-slate-400">
              {lang === "en"
                ? "Technical note: connect this form to your preferred email, CRM, or form handler (e.g. API route, Formspree, Make/Zapier)."
                : "Technischer Hinweis: Verbinden Sie dieses Formular mit Ihrem bevorzugten E-Mail-Postfach, CRM oder Form-Service (z. B. API-Route, Formspree, Make/Zapier)."}
            </p>
          </div>
        </section>
      </main>

      {/* Global CTA strip */}
      <section className="bg-gradient-to-r from-teal-600 to-sky-700 text-sky-50">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm md:text-base font-medium text-center md:text-left">
            {lang === "en"
              ? "Ready to move forward? Tell us about your project and get a tailored proposal."
              : "Bereit für den nächsten Schritt? Beschreiben Sie Ihr Vorhaben und erhalten Sie ein individuelles Angebot."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="#contact"
              className="inline-flex items-center rounded-full bg-white text-sky-900 px-4 py-2 text-sm font-semibold hover:bg-sky-50 transition shadow-sm"
            >
              {lang === "en" ? "Get a quote" : "Angebot anfragen"}
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center rounded-full border border-white/70 text-white px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              {lang === "en" ? "Request a consultation" : "Beratung anfragen"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} JB Linguistics LLC. All rights
            reserved.
          </p>
          <p className="opacity-80">
            {lang === "en"
              ? "Remote-first, available globally for negotiated projects."
              : "Remote-first, weltweit für projektbasierte Zusammenarbeit verfügbar."}
          </p>
          <div className="flex items-center gap-3">
            <Link href="/teachers" className="hover:text-sky-200">
              {lang === "en" ? "Teachers" : "Lehrkräfte"}
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/teachers/jonathan-brooks" className="hover:text-sky-200">
              {lang === "en" ? "JB’s Bio" : "JBs Profil"}
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
