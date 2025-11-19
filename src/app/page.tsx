// ✅ Connection test from ChatGPT — editing verified
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { TealNav } from "@/components/teal-nav";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t } = useLanguage();
  const [inquiryStatus, setInquiryStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [inquiryMessage, setInquiryMessage] = useState<string | null>(null);

  const handleInquirySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("source", "home_contact");
    setInquiryStatus("loading");
    setInquiryMessage(null);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to send your message.");
      }
      form.reset();
      setInquiryStatus("success");
      setInquiryMessage("Thank you — our team will reach out shortly.");
    } catch (err) {
      setInquiryStatus("error");
      setInquiryMessage(err instanceof Error ? err.message : "Unable to send your message.");
    }
  };
  const tripCollageImages = [
    {
      src: "https://images.unsplash.com/photo-1636937400111-f08d1fe8af2b?auto=format&fit=crop&w=1600&q=80",
      alt: "Clearwater Beach shoreline in Florida",
      label: "Clearwater Beach, FL",
    },
    {
      src: "https://images.unsplash.com/photo-1508168143669-3033ab15b23b?auto=format&fit=crop&w=1600&q=80",
      alt: "Aerial view of Seven Mile Beach in the Cayman Islands",
      label: "Cayman Islands",
    },
    {
      src: "https://images.unsplash.com/photo-1667978754074-0be1bba96981?auto=format&fit=crop&w=1600&q=80",
      alt: "Pink sand cove in Bermuda",
      label: "Bermuda pink sands",
    },
    {
      src: "https://images.unsplash.com/photo-1588384153148-ebd739ac430c?auto=format&fit=crop&w=1600&q=80",
      alt: "Statue of Liberty and Manhattan skyline",
      label: "New York City",
    },
    {
      src: "https://images.unsplash.com/photo-1719510193787-fd393a9b4856?auto=format&fit=crop&w=1600&q=80",
      alt: "Turquoise waves along a Hawaii coastline",
      label: "Hawaii coastline",
    },
    {
      src: "https://images.unsplash.com/photo-1680724431830-8b9433e61e7d?auto=format&fit=crop&w=1600&q=80",
      alt: "Performer spinning a fire-lit hula hoop in Hawaii",
      label: "Hula & fire performance",
    },
    {
      src: "https://images.unsplash.com/photo-1506184106046-1e6e90c0222d?auto=format&fit=crop&w=1600&q=80",
      alt: "Hollywood sign view in Los Angeles",
      label: "Hollywood sign",
    },
    {
      src: "https://images.unsplash.com/photo-1621534893852-355409fccaee?auto=format&fit=crop&w=1600&q=80",
      alt: "Hollywood Walk of Fame crowds",
      label: "Walk of Fame",
    },
    {
      src: "https://images.unsplash.com/photo-1568430328012-21ed450453ea?auto=format&fit=crop&w=1600&q=80",
      alt: "Whale breaching during Pacific tour",
      label: "Whale watching",
    },
  ];

  const serviceLinks = {
    learning: "/services/linguistic-learning",
    translation: "/services/translation-localization",
    interpretation: "/services/simultaneous-interpretation",
    documents: "/services/certified-document-translation",
  } as const;

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
        <section className="pt-10 pb-14 md:pt-12 md:pb-20">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 md:gap-14 items-start">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex flex-col items-center">
                <Image
                  src="/Brand/JB LOGO no TEXT.png"
                  alt="JB Linguistics LLC logo"
                  width={320}
                  height={320}
                  priority
                  className="w-52 md:w-60 lg:w-72 h-auto object-contain drop-shadow-md"
                />
                <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-sky-900">{t.hero.title}</h1>
              </div>
              <p className="mt-4 text-sm md:text-base text-slate-700 leading-relaxed max-w-xl">
                {t.hero.subtitle}
              </p>
              <div className="mt-6 w-full rounded-3xl bg-white/80 p-5 text-left shadow-md shadow-sky-900/5 border border-slate-100">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t.mission.heading}</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700 leading-relaxed">
                  {[t.mission.text, "text2" in t.mission ? (t.mission as { text2?: string }).text2 : undefined]
                    .filter((paragraph): paragraph is string => Boolean(paragraph))
                    .map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/40 transition"
                >
                  {t.hero.ctaPrimary}
                </Link>
                <a
                  href="#services-overview"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold border border-sky-900/20 bg-white/70 text-sky-900 hover:bg-sky-50 transition"
                >
                  {t.hero.ctaSecondary}
                </a>
              </div>
              <div className="mt-6 w-full rounded-3xl bg-[#f2fbfb] border border-teal-100 p-5 text-left shadow-inner shadow-teal-900/5">
                <p className="text-xs uppercase tracking-[0.35em] text-teal-500">{t.virtual.heading}</p>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                  {t.virtual.text}
                </p>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  {t.virtual.bullets.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 text-[11px] text-slate-600 space-y-1 text-left">
                {t.hero.highlights.map((item) => (
                  <p key={item}>• {item}</p>
                ))}
              </div>
            </div>

            <div className="relative flex flex-col gap-5">
              <div className="rounded-3xl overflow-hidden shadow-xl shadow-sky-900/15 border border-teal-100 bg-white">
                <div className="relative h-56 md:h-60">
                  <Image
                    src="https://images.unsplash.com/photo-1612832164313-ac0d7e07b5ce?auto=format&fit=crop&w=1000&q=80"
                    alt="Language coaching conducted over a secure video call"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="p-4 md:p-5 text-xs text-slate-700 space-y-2">
                  <p className="font-semibold text-sky-900 text-sm">
                    Secure video-based instruction
                  </p>
                  <p>
                    One-to-one and cohort lessons stream through encrypted meeting rooms with collaborative boards, lesson recordings, and chat transcripts.
                  </p>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-lg shadow-slate-900/10 border border-slate-100 bg-white/90 translate-x-4">
                <div className="relative h-48 md:h-52">
                  <Image
                    src="https://images.unsplash.com/photo-1702825328124-dab63d85490e?auto=format&fit=crop&w=1000&q=80"
                    alt="Certified translation packet with an embossed seal"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 text-xs text-slate-700 space-y-2">
                  <p className="font-semibold text-sky-900 text-sm">Certified documents with seals</p>
                  <p>
                    Sworn linguists deliver notarized translations, apostille support, and multi-step QA tailored to immigration and regulatory filings.
                  </p>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-lg shadow-slate-900/10 border border-slate-100 bg-white/90 translate-x-8">
                <div className="relative h-48 md:h-52">
                  <Image
                    src="https://images.unsplash.com/photo-1596339502177-8de71f7cacfd?auto=format&fit=crop&w=1100&q=80"
                    alt="Interpreter supporting delegates at a government conference"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 text-xs text-slate-700 space-y-2">
                  <p className="font-semibold text-sky-900 text-sm">Diplomacy-grade interpretation</p>
                  <p>
                    Conference interpreters familiar with UN, EU, and NATO protocols keep official negotiations on-script with simultaneous and consecutive coverage.
                  </p>
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

        <section
          id="services-overview"
          className="py-10 md:py-14 bg-[#0e4e4b] text-teal-50"
        >
          <div className="max-w-6xl mx-auto px-4 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-teal-200">Our services</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-white">Choose the mix you need</h2>
              <p className="mt-2 text-sm md:text-base text-teal-100/90">
                Mix and match language training, certified translations, and interpretation support to match each program or contract.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {t.services.cards.map((card) => {
                const href = serviceLinks[card.key as keyof typeof serviceLinks] ?? "#services-overview";
                return (
                  <Link
                    key={card.key}
                    href={href}
                    className="rounded-3xl bg-white/10 border border-white/25 p-5 text-sm flex flex-col gap-3 hover:bg-white/15 transition"
                  >
                    <h3 className="font-semibold text-white">{card.title}</h3>
                    <p className="text-teal-50/90">{card.description}</p>
                    <span className="text-teal-200 font-semibold text-xs">
                      {t.hero.ctaSecondary} →
                    </span>
                  </Link>
                );
              })}
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
                  href="/#contact"
                  className="mt-4 inline-flex items-center rounded-full bg-sky-900 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-800 transition shadow-md shadow-sky-900/30 whitespace-nowrap"
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
            <div className="hidden md:block rounded-3xl overflow-hidden shadow-2xl shadow-sky-900/40 border border-white/20 bg-white/10 p-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {tripCollageImages.map((image) => (
                  <div key={image.alt} className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
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
            <p className="mt-1 text-xs md:text-sm text-slate-300">
              {t.contact.phoneLine}
            </p>

            <form
              onSubmit={handleInquirySubmit}
              className="mt-6 grid gap-4 text-xs md:text-sm bg-slate-900/70 border border-slate-700 rounded-3xl p-5 md:p-6"
            >
              <input type="hidden" name="source" value="home_contact" />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sky-100">
                    {t.contact.name}
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
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
                    name="email"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sky-100">
                  {t.contact.organization}
                </label>
                <input
                  name="organization"
                  type="text"
                  className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sky-100">
                    {t.contact.servicesLabel}
                  </label>
                  <select
                    name="serviceType"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
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
                    name="languages"
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
                  name="details"
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
                    name="budget"
                    type="text"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sky-100">
                    {t.contact.timeline}
                  </label>
                  <input
                    name="timeline"
                    type="text"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center gap-3">
                <button
                  type="submit"
                  disabled={inquiryStatus === "loading"}
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-md shadow-teal-500/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {inquiryStatus === "loading" ? "Sending…" : t.contact.submit}
                </button>
                <p className="text-[10px] text-slate-400 max-w-xs">
                  {t.contact.disclaimer}
                </p>
              </div>
              {inquiryMessage && (
                <p
                  className={`text-xs ${inquiryStatus === "error" ? "text-rose-300" : "text-teal-200"}`}
                >
                  {inquiryMessage}
                </p>
              )}
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
                  href="/#contact"
              className="inline-flex items-center rounded-full bg-white text-sky-900 px-4 py-2 text-sm font-semibold hover:bg-sky-50 transition shadow-sm whitespace-nowrap"
            >
              {t.globalCta.primary}
            </Link>
            <Link
              href="/#contact"
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
