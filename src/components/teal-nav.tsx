"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { languages, type Lang } from "@/lib/copy";
import { useLanguage } from "@/lib/language-context";
import { getPublicStaffByRole, type PublicStaff } from "@/lib/public-staff";
import { destinations, type Destination } from "@/lib/trips";
import { translationServices } from "@/lib/translation-services";

interface TealNavProps extends React.HTMLAttributes<HTMLElement> {
  usePageAnchors?: boolean;
  className?: string;
}

export function TealNav({ usePageAnchors = false, className = "", ...rest }: TealNavProps) {
  const { lang, setLang, t } = useLanguage();
  const sectionHref = (id: string) => (usePageAnchors ? `#${id}` : `/#${id}`);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);
  const translationItems = useMemo(() => {
    const cards = t.services?.cards ?? [];
    const titleFor = (key: string, fallback: string) =>
      cards.find((card) => card.key === key)?.title ?? fallback;
    return translationServices.map((service) => {
      let localizedLabel = service.name;
      if (service.slug === "websites") localizedLabel = titleFor("translation", service.name);
      if (service.slug === "documents") localizedLabel = titleFor("documents", service.name);
      if (service.slug === "interpretation") localizedLabel = titleFor("interpretation", service.name);
      return {
        key: service.slug,
        label: localizedLabel,
        summary: service.summary,
        infoHref: service.infoHref,
        requestHref: service.requestHref,
      };
    });
  }, [t.services?.cards]);
  const [teachers, setTeachers] = useState<PublicStaff[]>([]);
  const [translators, setTranslators] = useState<PublicStaff[]>([]);

  const prioritizeFounder = (list: PublicStaff[]) =>
    [...list].sort((a, b) => {
      const aFounder = a.slug === "jonathan-brooks" ? -1 : 0;
      const bFounder = b.slug === "jonathan-brooks" ? -1 : 0;
      if (aFounder !== bFounder) return aFounder - bFounder;
      return a.name.localeCompare(b.name);
    });

  useEffect(() => {
    getPublicStaffByRole("teacher").then((list) => setTeachers(prioritizeFounder(list)));
    getPublicStaffByRole("translator").then((list) => setTranslators(prioritizeFounder(list)));
  }, []);

  const topTeachers = useMemo(() => teachers.slice(0, 3), [teachers]);
  const topTranslators = useMemo(() => translators.slice(0, 3), [translators]);

  useEffect(() => {
    if (!langOpen) return;
    const handlePointer = (event: PointerEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [langOpen]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
    setExpandedService(null);
  };
  return (
    <header
      className={`sticky top-0 z-30 bg-[#0fb5b3] border-b border-[#0a8c8a]/80 text-sky-900 backdrop-blur ${className}`}
      {...rest}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3 md:py-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center">
            <Image
              src="/Brand/JB LOGO no TEXT.png"
              alt="JB Linguistics LLC"
              width={76}
              height={76}
              priority
              className="h-12 w-12 md:h-16 md:w-16 drop-shadow-sm object-contain"
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 md:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileOpen((prev) => {
                const next = !prev;
                if (!next) {
                  setMobileServicesOpen(false);
                  setExpandedService(null);
                }
                return next;
              })
            }
            className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "Close" : "Menu"}
            <span aria-hidden>{mobileOpen ? "✕" : "☰"}</span>
          </button>
          <LanguageMenu
            lang={lang}
            setLang={setLang}
            open={langOpen}
            setOpen={setLangOpen}
            langRef={langRef}
          />
        </div>

        <nav className="hidden md:flex flex-1 items-center justify-end gap-3 text-sm font-semibold flex-nowrap">
          <Link
            href="/"
            className="px-2 py-2 text-sky-900 whitespace-nowrap hover:bg-white/30 hover:text-sky-950 rounded-full transition"
          >
            Home
          </Link>
          <div className="flex items-center gap-1 rounded-full flex-nowrap">
            <Link
              href="/services/linguistic-learning"
              className="px-3 py-2 text-sky-900 whitespace-nowrap hover:bg-white/30 hover:text-sky-950 rounded-full transition"
            >
              {t.nav.teacher}
            </Link>
            <TranslationDropdown label={t.nav.translator} items={translationItems} />
            <TripsDropdown
              label={t.nav.trips}
              baseHref="/trips"
              items={destinations}
              viewAllLabel={t.nav.viewAllDestinations}
            />
          </div>
          <CombinedStaffDropdown
            label={t.nav.staff}
            teachersLabel={t.nav.teacher}
            translatorsLabel={t.nav.translator}
            teachers={teachers}
            translators={translators}
          />
          <Link
            href="/teachers/jonathan-brooks"
            className="px-3 py-2 text-sky-900 whitespace-nowrap hover:bg-white/30 hover:text-sky-950 rounded-full transition"
          >
            {t.nav.aboutJb}
          </Link>
          <NavDropdown label={t.nav.contact} href={sectionHref("contact")} summary={t.sectionsShort.contact} />
          <Link
            href="/careers"
            className="px-3 py-2 text-sky-900 whitespace-nowrap hover:bg-white/30 hover:text-sky-950 rounded-full transition"
          >
            {t.nav.careers}
          </Link>
          <Link
            href={sectionHref("contact")}
            className="ml-1 inline-flex items-center rounded-full bg-white text-sky-900 px-4 py-2 text-sm font-semibold hover:bg-sky-50 transition shadow-sm whitespace-nowrap"
          >
            {t.nav.ctaLabel}
          </Link>
          <LanguageMenu
            lang={lang}
            setLang={setLang}
            open={langOpen}
            setOpen={setLangOpen}
            langRef={langRef}
          />
        </nav>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-white/20 bg-[#0b9a98] text-white max-h-[80vh] overflow-y-auto overscroll-contain">
          <div className="px-4 py-4 space-y-2 text-sm font-semibold">
            <Link href="/" className="block rounded-2xl bg-white/10 px-4 py-2" onClick={closeMobileMenu}>
              Home
            </Link>
            <Link
              href="/services/linguistic-learning"
              className="block rounded-2xl bg-white/10 px-4 py-2"
              onClick={closeMobileMenu}
            >
              {t.nav.teacher}
            </Link>
            <div className="rounded-2xl bg-white/10 px-4 py-3 space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-between text-left text-xs uppercase tracking-[0.3em] text-white/70"
                onClick={() => {
                  setMobileServicesOpen((prev) => {
                    const next = !prev;
                    if (!next) setExpandedService(null);
                    return next;
                  });
                }}
              >
                <span>{t.nav.translator}</span>
                <span aria-hidden>{mobileServicesOpen ? "−" : "+"}</span>
              </button>
              {mobileServicesOpen && (
                <div className="space-y-3">
                  {translationItems.map((item) => (
                    <div key={item.key}>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-left"
                        onClick={() => setExpandedService((prev) => (prev === item.key ? null : item.key))}
                      >
                        <span className="text-sm font-semibold">{item.label}</span>
                        <span aria-hidden>{expandedService === item.key ? "−" : "+"}</span>
                      </button>
                      {expandedService === item.key && (
                        <div className="mt-2 rounded-2xl bg-white/10 p-3 space-y-2 text-[12px]">
                          <p className="text-white/80">{item.summary}</p>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={item.infoHref}
                              className="inline-flex items-center rounded-full bg-white/90 text-sky-900 px-3 py-1 font-semibold"
                              onClick={closeMobileMenu}
                            >
                              Overview
                            </Link>
                            <Link
                              href={item.requestHref}
                              className="inline-flex items-center rounded-full border border-white/50 px-3 py-1 font-semibold"
                              onClick={closeMobileMenu}
                            >
                              Request
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link href="/trips" className="block rounded-2xl bg-white/10 px-4 py-2" onClick={closeMobileMenu}>
              {t.nav.trips}
            </Link>
            <Link
              href="/teachers/jonathan-brooks"
              className="block rounded-2xl bg-white/10 px-4 py-2"
              onClick={closeMobileMenu}
            >
              {t.nav.aboutJb}
            </Link>
            <div className="rounded-2xl bg-white/10 px-4 py-3 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">{t.nav.staff}</p>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-1">{t.nav.teacher}</p>
                <div className="space-y-1 text-[13px]">
                  {topTeachers.map((person) => (
                    <Link
                      key={person.slug}
                      href={person.profilePath ?? `/teachers/${person.slug}`}
                      className="block rounded-2xl bg-white/10 px-3 py-2"
                      onClick={closeMobileMenu}
                    >
                      {person.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-1">{t.nav.translator}</p>
                <div className="space-y-1 text-[13px]">
                  {topTranslators.map((person) => (
                    <Link
                      key={person.slug}
                      href={person.profilePath ?? `/translators/${person.slug}`}
                      className="block rounded-2xl bg-white/10 px-3 py-2"
                      onClick={closeMobileMenu}
                    >
                      {person.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/careers"
              className="block rounded-2xl bg-white/10 px-4 py-2"
              onClick={closeMobileMenu}
            >
              {t.nav.careers}
            </Link>
            <Link
              href={sectionHref("contact")}
              className="block rounded-2xl bg-white text-center text-sky-900 px-4 py-2 shadow"
              onClick={closeMobileMenu}
            >
              {t.nav.ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function LanguageMenu({
  lang,
  setLang,
  open,
  setOpen,
  langRef,
}: {
  lang: Lang;
  setLang: (lang: Lang) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  langRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="relative" ref={langRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-full border border-sky-900/30 bg-white/80 px-3 py-2 text-xs font-semibold text-sky-900"
      >
        {lang.toUpperCase()} <span aria-hidden>{open ? "▲" : "▼"}</span>
        <span className="sr-only">Select language</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white text-slate-700 shadow-xl p-2 text-sm z-40">
          {languages.map((code) => (
            <button
              key={code}
              onClick={() => {
                setLang(code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 ${
                lang === code ? "font-semibold text-sky-900" : ""
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NavDropdown({
  label,
  summary,
  href,
}: {
  label: string;
  summary: string;
  href: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <a
        href={href}
        className="px-3 py-2 text-sky-900 whitespace-nowrap hover:bg-white/30 hover:text-sky-950 rounded-full transition"
      >
        {label}
      </a>
      {open && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white shadow-xl p-4 text-xs text-slate-700 z-20">
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

function TranslationDropdown({
  label,
  items,
}: {
  label: string;
  items: { key: string; label: string; summary: string; infoHref: string; requestHref: string }[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 px-3 py-2 text-sky-900 whitespace-nowrap hover:bg-white/30 hover:text-sky-950 rounded-full transition"
      >
        {label}
        <span aria-hidden className="text-[10px]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[360px] rounded-2xl bg-white shadow-xl p-4 text-xs text-slate-700 z-40">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.key} className="rounded-2xl border border-slate-100 p-3">
                <p className="text-sm font-semibold text-sky-900">{item.label}</p>
                <p className="mt-1 text-[12px] text-slate-600">{item.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                  <Link
                    href={item.infoHref}
                    className="inline-flex items-center rounded-full bg-slate-900 text-white px-3 py-1 hover:bg-slate-800"
                    onClick={() => setOpen(false)}
                  >
                    Overview
                  </Link>
                  <Link
                    href={item.requestHref}
                    className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-sky-900 hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    Request
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function titleCaseLangs(value?: string) {
  if (!value) return "";
  return value
    .split(/[,/|·•–-]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(", ");
}

function CombinedStaffDropdown({
  label,
  teachers,
  translators,
  teachersLabel,
  translatorsLabel,
}: {
  label: string;
  teachers: PublicStaff[];
  translators: PublicStaff[];
  teachersLabel: string;
  translatorsLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const topTeachers = teachers.slice(0, 3);
  const topTranslators = translators.slice(0, 3);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 px-3 py-2 text-sky-900 whitespace-nowrap hover:bg-white/30 hover:text-sky-950 rounded-full transition"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <span aria-hidden className="text-[10px]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[420px] rounded-2xl bg-white shadow-xl p-4 text-xs text-slate-700 z-40">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{teachersLabel}</p>
              <p className="text-[11px] text-slate-500">{teachersLabel}</p>
              <div className="mt-2 space-y-2">
                {topTeachers.map((person) => (
                  <Link
                    key={person.slug}
                    href={person.profilePath ?? `/teachers/${person.slug}`}
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 border border-slate-100 hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      <Image
                        src={person.image || (person as any).photo_url || "/Brand/JB LOGO no TEXT.png"}
                        alt={person.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        style={{ objectPosition: person.imageFocus ?? "center" }}
                        unoptimized={Boolean((person as any).photo_url)}
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-sky-900 block">{person.name}</span>
                      <span className="block text-[10px] text-slate-500">
                        {person.languages || (person as any).languages_display || ""}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/teachers"
                className="mt-3 inline-flex items-center text-[11px] font-semibold text-sky-700 hover:text-sky-900"
                onClick={() => setOpen(false)}
              >
                {teachersLabel} · {teachers.length}+
              </Link>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{translatorsLabel}</p>
              <p className="text-[11px] text-slate-500">{translatorsLabel}</p>
              <div className="mt-2 space-y-2">
                {topTranslators.map((person) => (
                  <Link
                    key={person.slug}
                    href={person.profilePath ?? `/translators/${person.slug}`}
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 border border-slate-100 hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      <Image
                        src={person.image || (person as any).photo_url || "/Brand/JB LOGO no TEXT.png"}
                        alt={person.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        style={{ objectPosition: person.imageFocus ?? "center" }}
                        unoptimized={Boolean((person as any).photo_url)}
                      />
                    </div>
                  <div>
                    <span className="font-semibold text-sky-900 block">{person.name}</span>
                    <span className="block text-[10px] text-slate-500">
                      {titleCaseLangs(person.languages || (person as any).languages_display)}
                    </span>
                  </div>
                </Link>
              ))}
              </div>
              <Link
                href="/translators"
                className="mt-3 inline-flex items-center text-[11px] font-semibold text-sky-700 hover:text-sky-900"
                onClick={() => setOpen(false)}
              >
                {translatorsLabel} · {translators.length}+
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TripsDropdown({
  label,
  items,
  baseHref,
  viewAllLabel,
}: {
  label: string;
  items: Destination[];
  baseHref: string;
  viewAllLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 px-3 py-2 text-sky-900 whitespace-nowrap hover:bg-white/30 hover:text-sky-950 rounded-full transition"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <span aria-hidden className="text-[10px]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 rounded-2xl bg-white shadow-xl p-3 text-xs text-slate-700 z-40">
          <div className="grid gap-2 max-h-72 overflow-auto">
            {items.slice(0, 6).map((trip) => (
              <Link
                key={trip.slug}
                href={`${baseHref}/${trip.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 p-2 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                <div className="relative h-14 w-20 overflow-hidden rounded-xl bg-slate-100">
                  {trip.hero || trip.heroSplit?.left ? (
                    <Image src={trip.hero ?? trip.heroSplit?.left ?? "/images/trips/florida.jpg"} alt={trip.name} fill className="object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-500 flex h-full w-full items-center justify-center">
                      {trip.name}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sky-900">{trip.name}</p>
                  <p className="text-[11px] text-slate-500">{trip.region}</p>
                </div>
              </Link>
            ))}
          </div>
          <a
            href={baseHref}
            className="mt-2 inline-flex items-center text-[11px] font-semibold text-sky-700 hover:text-sky-900"
            onClick={() => setOpen(false)}
          >
            {viewAllLabel}
          </a>
        </div>
      )}
    </div>
  );
}
