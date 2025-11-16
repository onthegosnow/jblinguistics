"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { languages, type Lang } from "@/lib/copy";
import { useLanguage } from "@/lib/language-context";
import { hasRole, staff, type StaffMember } from "@/lib/staff";
import { destinations, type Destination } from "@/lib/trips";

interface TealNavProps extends React.HTMLAttributes<HTMLElement> {
  usePageAnchors?: boolean;
  className?: string;
}

export function TealNav({ usePageAnchors = false, className = "", ...rest }: TealNavProps) {
  const { lang, setLang, t } = useLanguage();
  const sectionHref = (id: string) => (usePageAnchors ? `#${id}` : `/#${id}`);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);

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
            <Link
              href="/services/translation-localization"
              className="px-3 py-2 text-sky-900 whitespace-nowrap hover:bg-white/30 hover:text-sky-950 rounded-full transition"
            >
              {t.nav.translator}
            </Link>
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
            teachers={staff.filter((p) => hasRole(p, "teacher"))}
            translators={staff.filter((p) => hasRole(p, "translator"))}
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
  langRef: React.RefObject<HTMLDivElement>;
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

function CombinedStaffDropdown({
  label,
  teachers,
  translators,
  teachersLabel,
  translatorsLabel,
}: {
  label: string;
  teachers: StaffMember[];
  translators: StaffMember[];
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
                        src={person.image}
                        alt={person.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        style={{ objectPosition: person.imageFocus ?? "center" }}
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-sky-900 block">{person.name}</span>
                      <span className="block text-[10px] text-slate-500">{person.languages}</span>
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
                        src={person.image}
                        alt={person.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        style={{ objectPosition: person.imageFocus ?? "center" }}
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-sky-900 block">{person.name}</span>
                      <span className="block text-[10px] text-slate-500">{person.languages}</span>
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
