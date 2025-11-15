// ✅ Connection test from ChatGPT — editing verified
"use client";

import Image from "next/image";
import Link from "next/link";
import { TealNav } from "@/components/teal-nav";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t } = useLanguage();

  const serviceLinks = {
    learning: "/services/linguistic-learning",
    translation: "/services/translation-localization",
    interpretation: "/services/simultaneous-interpretation",
    documents: "/services/certified-document-translation",
  } as const;
  const quickLinks = [
    { key: "mission", label: t.sectionsShort.mission, href: "#mission" },
    { key: "learning", label: t.sectionsShort.teacher, href: serviceLinks.learning },
    { key: "translation", label: t.sectionsShort.translator, href: serviceLinks.translation },
    { key: "trips", label: t.sectionsShort.trips, href: "/trips" },
    { key: "contact", label: t.sectionsShort.contact, href: "#contact" },
  ];


  return (
    <>
      <style jsx global>{`
        [data-layout-nav] {
          display: none;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-teal-50 to-slate-100 text-slate-900">
      {/* Top bar / Nav */}
      <TealNav usePageAnchors />


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
                  {t.hero.meetJB} →
                </Link>
              </div>

              <div className="mt-6 text-[11px] text-slate-600 space-y-1">
                {t.hero.highlights.map((item) => (
                  <p key={item}>• {item}</p>
                ))}
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
                    {t.hero.cardTitle}
                  </p>
                  <p>{t.hero.cardBody}</p>
                </div>
              </div>
              {/* Security-aware badge below the image card */}
              <div className="mt-4 rounded-2xl bg-sky-900 text-sky-50 text-[11px] p-3 shadow-lg shadow-sky-900/40">
                <p className="font-semibold">{t.hero.badgeTitle}</p>
                <p className="mt-1">{t.hero.badgeText}</p>
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
            <div className="mt-4 space-y-3 text-sm md:text-base text-slate-700 leading-relaxed">
              {[t.mission.text, "text2" in t.mission ? (t.mission as { text2?: string }).text2 : undefined]
                .filter((paragraph): paragraph is string => Boolean(paragraph))
                .map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
            </div>
          </div>
        </section>

        {/* Virtual-first highlight */}
        <section className="py-8 md:py-12 bg-teal-900/90 text-sky-50">
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-[1.3fr,1fr] gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold">{t.virtual.heading}</h2>
              <p className="mt-3 text-sm md:text-base text-teal-50/90 leading-relaxed">
                {t.virtual.text}
              </p>
            </div>
            <ul className="space-y-2 text-xs md:text-sm">
              {t.virtual.bullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-white/80" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Services overview tiles */}
        <section
          id="services-overview"
          className="py-10 md:py-14 bg-gradient-to-r from-teal-50 to-sky-50"
        >
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-6">
            {t.services.cards.map((card) => {
              const href = serviceLinks[card.key as keyof typeof serviceLinks] ?? "#services-overview";
              return (
                <Link
                  key={card.key}
                  href={href}
                  className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-teal-100 p-5 text-sm flex flex-col gap-3 hover:-translate-y-0.5 transition"
                >
                  <h3 className="font-semibold text-sky-900">{card.title}</h3>
                  <p className="text-slate-700 text-xs leading-relaxed">{card.description}</p>
                  <span className="text-[11px] text-sky-700 font-semibold">
                    {t.hero.ctaSecondary} →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* About JB highlights */}
        <section id="about" className="py-10 md:py-14 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold">{t.nav.aboutJb}</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-sky-900">{t.hero.title}</h2>
              <p className="mt-3 text-sm md:text-base text-slate-700 leading-relaxed">{t.sectionsShort.mission}</p>
              <p className="mt-3 text-sm text-slate-600">{t.hero.subtitle}</p>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickLinks.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 hover:bg-white hover:-translate-y-0.5 transition shadow-sm shadow-slate-900/5"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise section */}
        <section className="py-10 md:py-14 bg-gradient-to-b from-white to-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="rounded-3xl bg-white shadow-lg shadow-sky-900/10 border border-slate-200 p-6 md:p-8">
              <div className="md:flex md:items-start md:justify-between gap-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-sky-900">
                    {t.enterprise.heading}
                  </h2>
                  <p className="mt-3 text-sm md:text-base text-slate-700 leading-relaxed">
                    {t.enterprise.intro}
                  </p>
                </div>
                <Link
                  href="#contact"
                  className="mt-4 inline-flex items-center rounded-full bg-sky-900 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-800 transition shadow-md shadow-sky-900/30"
                >
                  {t.nav.ctaLabel}
                </Link>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {t.enterprise.cards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                  >
                    <h3 className="text-base font-semibold text-sky-900">{card.title}</h3>
                    <p className="mt-2 text-slate-600">{card.text}</p>
                    <ul className="mt-3 space-y-1.5">
                      {card.bullets.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
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
                  {t.gov.ctaBio} →
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
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-200 font-semibold">{t.nav.trips}</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold">{t.trips.heading}</h2>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-sky-50/90">{t.trips.intro}</p>
              <p className="mt-4 text-sm text-teal-100">{t.sectionsShort.trips}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <Link
                  href="/trips"
                  className="inline-flex items-center rounded-full bg-white text-sky-900 px-4 py-2 font-semibold hover:bg-slate-100 transition"
                >
                  {t.trips.browseLink}
                </Link>
                <Link
                  href={serviceLinks.learning}
                  className="inline-flex items-center rounded-full border border-white/40 px-4 py-2 font-semibold text-white hover:bg-white/10 transition"
                >
                  {t.nav.teacher}
                </Link>
              </div>
              <p className="mt-3 text-xs text-teal-100/90">{t.trips.note}</p>
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

        {/* Careers teaser */}
        <section id="careers" className="py-10 md:py-14 bg-white">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-[1.2fr,0.8fr] gap-8 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-500 font-semibold">Talent network</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-sky-900">{t.careers.heading}</h2>
              <p className="mt-3 text-sm md:text-base text-slate-700 leading-relaxed">{t.careers.text}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {t.careers.bullets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link
                  href="/careers"
                  className="inline-flex items-center rounded-full bg-teal-600 text-white px-5 py-2 font-semibold hover:bg-teal-500 transition shadow-md shadow-teal-600/30"
                >
                  {t.careers.ctaPrimary}
                </Link>
                <a
                  href="#contact"
                  className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2 font-semibold text-sky-900 hover:bg-slate-50"
                >
                  {t.careers.ctaSecondary}
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-sky-50 p-5 shadow-lg shadow-teal-900/10 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold">Why join</p>
              <p className="mt-2 text-base font-semibold text-sky-900">{t.careers.cardTitle}</p>
              <p className="mt-2 text-sm">{t.careers.cardText}</p>
              <p className="mt-3 text-xs text-slate-500">{t.careers.note}</p>
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
                    <option value="">{t.contact.servicesPlaceholder}</option>
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
                    placeholder={t.contact.languagesPlaceholder}
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
                  placeholder={t.contact.detailsPlaceholder}
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
                  {t.contact.disclaimer}
                </p>
              </div>
            </form>

            <p className="mt-4 text-[11px] text-slate-400">
              {t.contact.techNote}
            </p>
          </div>
        </section>
      </main>

      {/* Global CTA strip */}
      <section className="bg-gradient-to-r from-teal-600 to-sky-700 text-sky-50">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm md:text-base font-medium text-center md:text-left">
            {t.globalCta.text}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="#contact"
              className="inline-flex items-center rounded-full bg-white text-sky-900 px-4 py-2 text-sm font-semibold hover:bg-sky-50 transition shadow-sm"
            >
              {t.globalCta.primary}
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center rounded-full border border-white/70 text-white px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              {t.globalCta.secondary}
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
            {t.footer.tagline}
          </p>
          <div className="flex items-center gap-3">
            <Link href="/teachers" className="hover:text-sky-200">
              {t.footer.teachers}
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/teachers/jonathan-brooks" className="hover:text-sky-200">
              {t.footer.bio}
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
