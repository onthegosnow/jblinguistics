"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { TealNav } from "@/components/teal-nav";
import { useLanguage } from "@/lib/language-context";

type InquiryStatus = "idle" | "loading" | "success" | "error";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const preferredStaff = searchParams.get("preferredStaff") ?? searchParams.get("staff") ?? undefined;
  const [inquiryStatus, setInquiryStatus] = useState<InquiryStatus>("idle");
  const [inquiryMessage, setInquiryMessage] = useState<string | null>(null);

  const handleInquirySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("source", "home_contact");
    if (!formData.get("marketingOptIn")) {
      formData.set("marketingOptIn", "no");
    }
    if (preferredStaff) {
      formData.set("preferredStaff", preferredStaff);
    }
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
    alt: "Pink sand cove in the Bahamas",
    label: "Bahamas pink sands",
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

  const heroHighlights = Array.isArray(t.hero.highlights) ? t.hero.highlights : [];
  const getServiceCard = (key: "learning" | "translation" | "interpretation" | "documents") =>
    t.services.cards.find((card) => card.key === key);
  const spotlightCards = ("learning translation interpretation documents".split(" ") as (
    | "learning"
    | "translation"
    | "interpretation"
    | "documents"
  )[]).map((key) => ({
    key,
    href: serviceLinks[key],
    title: getServiceCard(key)?.title ?? key,
    description: getServiceCard(key)?.description ?? "",
  }));

  return (
    <>
      <style jsx global>{`
        [data-layout-nav] {
          display: none;
        }
      `}</style>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <TealNav usePageAnchors />

        <main className="space-y-14 md:space-y-16">
          <section className="relative isolate overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-slate-950 to-slate-900" />
            <div className="absolute -left-32 -top-28 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" />
            <div className="absolute right-[-120px] top-10 h-80 w-80 rounded-full bg-sky-500/20 blur-[120px]" />
            <div className="absolute left-10 bottom-6 h-32 w-32 rounded-full bg-amber-300/10 blur-2xl" />
            <div className="relative max-w-6xl mx-auto px-4 grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-start">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-teal-100">
                  <span className="rounded-full border border-white/25 bg-white/5 px-3 py-1 text-sky-50">
                    Certified translation · Interpretation · Learning
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
                  {t.hero.title}
                </h1>
                <p className="text-base md:text-lg text-sky-100/85 max-w-2xl">
                  {t.hero.subtitle}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/#contact"
                    className="inline-flex items-center rounded-full bg-teal-400 text-slate-950 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-teal-400/40 transition hover:bg-teal-300"
                  >
                    {t.hero.ctaPrimary}
                  </Link>
                  <a
                    href="#services-overview"
                    className="inline-flex items-center rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {t.hero.ctaSecondary}
                  </a>
                </div>
                <p className="text-sm text-sky-100/80">
                  <Link
                    href="/teachers/jonathan-brooks"
                    className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 font-semibold text-white transition hover:border-white/40"
                  >
                    {t.hero.meetJB ?? t.nav.aboutJb}
                  </Link>
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {heroHighlights.slice(0, 3).map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm leading-relaxed text-sky-50/90 shadow-sm shadow-white/10"
                    >
                      <div className="flex gap-2">
                        <span className="mt-[6px] h-2 w-2 rounded-full bg-teal-300" />
                        <span>{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] bg-white text-slate-900 shadow-2xl shadow-slate-950/25 border border-slate-200 p-5 md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-teal-600">{t.mission.heading}</p>
                      <p className="mt-2 text-sm text-slate-700 leading-relaxed">{t.mission.text}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-teal-800 text-xs font-semibold px-3 py-1">
                      Remote-first
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {t.virtual.bullets.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href="/#contact"
                      className="inline-flex items-center rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-slate-800 transition"
                    >
                      {t.nav.ctaLabel}
                    </Link>
                    <Link
                      href={serviceLinks.learning}
                      className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                      {t.nav.teacher}
                    </Link>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/15 bg-white/5 p-4 md:p-5 text-sky-50 backdrop-blur">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-teal-100">Core coverage</p>
                    <span className="text-[11px] text-sky-100/70">Fast responses · NDA-ready</span>
                  </div>
                  <div className="mt-3 grid gap-3">
                    {spotlightCards.map((card) => (
                      <Link
                        key={card.key}
                        href={card.href}
                        className="group rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition hover:-translate-y-0.5 hover:border-white/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-white">{card.title}</p>
                          <span className="text-xs text-teal-100 opacity-0 transition group-hover:opacity-100">
                            Learn more →
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-sky-100/80 leading-relaxed">{card.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id="services-overview"
            className="py-12 md:py-16 bg-slate-50 text-slate-900 border-t border-slate-100"
          >
            <div className="max-w-6xl mx-auto px-4 space-y-8">
              <div className="md:flex md:items-end md:justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-teal-700">Our services</p>
                  <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-slate-900">Choose the mix you need</h2>
                  <p className="mt-2 text-sm md:text-base text-slate-600 max-w-3xl">
                    Mix and match language training, certified translations, and interpretation support to match each program or contract.
                  </p>
                </div>
                <Link
                  href="/#contact"
                  className="inline-flex items-center rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-slate-800 transition"
                >
                  {t.nav.ctaLabel}
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {t.services.cards.map((card) => {
                  const href = serviceLinks[card.key as keyof typeof serviceLinks] ?? "#services-overview";
                  return (
                    <Link
                      key={card.key}
                      href={href}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-sky-50 opacity-0 transition group-hover:opacity-100" aria-hidden />
                      <div className="relative flex flex-col gap-3 h-full">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                          <span className="text-xs rounded-full border border-slate-200 px-2 py-1 text-slate-600">{t.hero.ctaSecondary}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed flex-1">{card.description}</p>
                        <span className="text-sm font-semibold text-teal-700 group-hover:text-teal-900">Explore →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-gradient-to-b from-slate-900 to-slate-950 text-sky-50">
            <div className="max-w-6xl mx-auto px-4 space-y-8">
              <div className="md:flex md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-teal-200">{t.enterprise.heading}</p>
                  <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-white">Multilateral & enterprise partnerships</h2>
                  <p className="mt-3 text-sm md:text-base text-sky-100/80 max-w-3xl">{t.enterprise.intro}</p>
                </div>
                <Link
                  href="/#contact"
                  className="inline-flex items-center rounded-full bg-white text-sky-900 px-4 py-2 text-sm font-semibold shadow-md transition hover:bg-sky-50"
                >
                  {t.nav.ctaLabel}
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {t.enterprise.cards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-sky-100/90 shadow-md shadow-slate-950/20"
                  >
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <p className="mt-2 text-sky-100/80 leading-relaxed">{card.text}</p>
                    <ul className="mt-3 space-y-1.5">
                      {card.bullets.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-300" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="trips"
            className="py-12 md:py-16 bg-gradient-to-r from-teal-700 via-teal-600 to-sky-700 text-sky-50"
          >
            <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-[1.05fr,0.95fr] gap-10 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-teal-200 font-semibold">{t.nav.trips}</p>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold">{t.trips.heading}</h2>
                <p className="mt-4 text-sm md:text-base leading-relaxed text-sky-50/90">{t.trips.intro}</p>
                <p className="mt-4 text-sm text-teal-100">{t.sectionsShort.trips}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <Link
                    href="/trips"
                    className="inline-flex items-center rounded-full bg-white text-sky-900 px-4 py-2 font-semibold shadow-sm transition hover:bg-slate-100"
                  >
                    {t.trips.browseLink}
                  </Link>
                  <Link
                    href={serviceLinks.learning}
                    className="inline-flex items-center rounded-full border border-white/50 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
                  >
                    {t.nav.teacher}
                  </Link>
                </div>
                <p className="mt-3 text-xs text-teal-100/90">{t.trips.note}</p>
              </div>
              <div className="rounded-3xl overflow-hidden border border-white/20 bg-white/10 p-2 shadow-2xl shadow-sky-900/40">
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-2">
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
                <div className="md:hidden flex gap-2 overflow-x-auto p-1">
                  {tripCollageImages.map((image) => (
                    <div key={image.alt} className="relative min-w-[240px] aspect-[4/3] overflow-hidden rounded-2xl">
                      <Image src={image.src} alt={image.alt} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="contact" className="py-12 md:py-16 bg-slate-50 text-slate-900 border-t border-slate-100">
            <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-[0.9fr,1.1fr] gap-8 items-start">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-teal-700">{t.nav.contact}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t.contact.heading}</h2>
                <p className="text-sm md:text-base text-slate-700 leading-relaxed">{t.contact.subtitle}</p>
                <p className="text-xs md:text-sm text-slate-500">{t.contact.phoneLine}</p>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                  <p className="font-semibold text-slate-900">{t.hero.badgeTitle}</p>
                  <p className="mt-2 text-slate-600">{t.hero.badgeText}</p>
                </div>
              </div>

              <form
                onSubmit={handleInquirySubmit}
                className="grid gap-4 text-sm bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xl"
              >
                <input type="hidden" name="source" value="home_contact" />
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-800" htmlFor="contact-name">
                      {t.contact.name}
                    </label>
                    <input
                      required
                      type="text"
                      id="contact-name"
                      name="name"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-800" htmlFor="contact-email">
                      {t.contact.email}
                    </label>
                    <input
                      required
                      type="email"
                      id="contact-email"
                      name="email"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-800" htmlFor="contact-org">
                    {t.contact.organization}
                  </label>
                  <input
                    name="organization"
                    id="contact-org"
                    type="text"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-800" htmlFor="contact-service">
                      {t.contact.servicesLabel}
                    </label>
                    <select
                      name="serviceType"
                      id="contact-service"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
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
                    <label className="block mb-1 text-slate-800" htmlFor="contact-languages">
                      {t.contact.languagesNeeded}
                    </label>
                    <input
                      name="languages"
                      id="contact-languages"
                      type="text"
                      placeholder={t.contact.languagesPlaceholder}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>

                <input type="hidden" name="preferredStaff" value={preferredStaff ?? ""} />

                <div>
                  <label className="block mb-1 text-slate-800" htmlFor="contact-details">
                    {t.contact.details}
                  </label>
                  <textarea
                    name="details"
                    id="contact-details"
                    rows={4}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder={preferredStaff ? `This note will be routed to ${preferredStaff}` : t.contact.detailsPlaceholder}
                    defaultValue={preferredStaff ? `Request for ${preferredStaff}: ` : undefined}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-800" htmlFor="contact-budget">
                      {t.contact.budget}
                    </label>
                    <input
                      name="budget"
                      id="contact-budget"
                      type="text"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-800" htmlFor="contact-timeline">
                      {t.contact.timeline}
                    </label>
                    <input
                      name="timeline"
                      id="contact-timeline"
                      type="text"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                  <input
                    type="checkbox"
                    id="contact-marketing"
                    name="marketingOptIn"
                    value="yes"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-400"
                  />
                  <label htmlFor="contact-marketing" className="text-xs text-slate-700 leading-snug">
                    I agree to receive updates and occasional marketing emails from JB Linguistics. You can opt out at any
                    time.
                  </label>
                </div>

                <div className="pt-1 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <button
                    type="submit"
                    disabled={inquiryStatus === "loading"}
                    className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-md shadow-teal-500/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-busy={inquiryStatus === "loading"}
                  >
                    {inquiryStatus === "loading" ? "Sending…" : t.contact.submit}
                  </button>
                  <p className="text-[11px] text-slate-500 max-w-xs">{t.contact.disclaimer}</p>
                </div>
                {inquiryMessage && (
                  <p
                    className={`text-xs ${inquiryStatus === "error" ? "text-rose-600" : "text-teal-700"}`}
                    aria-live="polite"
                  >
                    {inquiryMessage}
                  </p>
                )}
                <p className="text-[11px] text-slate-400">{t.contact.techNote}</p>
              </form>
            </div>
          </section>
        </main>

        <section className="bg-gradient-to-r from-teal-600 to-sky-700 text-sky-50">
          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm md:text-base font-medium text-center md:text-left">{t.globalCta.text}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/#contact"
                className="inline-flex items-center rounded-full bg-white text-sky-900 px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-sky-50 whitespace-nowrap"
              >
                {t.globalCta.primary}
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center rounded-full border border-white/70 text-white px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                {t.globalCta.secondary}
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} JB Linguistics LLC. All rights reserved.</p>
            <p className="opacity-80">{t.footer.tagline}</p>
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
