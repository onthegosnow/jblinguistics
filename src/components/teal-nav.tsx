"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang, CopyContent } from "@/lib/copy";
import { hasRole, staff, type StaffMember } from "@/lib/staff";
import { destinations, type Destination } from "@/lib/trips";

type TealNavProps = {
  lang: Lang;
  t: CopyContent;
  ctaLabel: string;
  onChangeLang?: (lang: Lang) => void;
  usePageAnchors?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

export function TealNav({
  lang,
  t,
  ctaLabel,
  onChangeLang,
  usePageAnchors = false,
  className = "",
  ...rest
}: TealNavProps) {
  const showLangToggle = typeof onChangeLang === "function";
  const sectionHref = (id: string) =>
    usePageAnchors ? `#${id}` : `/#${id}`;

  return (
    <header
      className={`sticky top-0 z-30 bg-teal-700/90 backdrop-blur text-white border-b border-teal-500/60 ${className}`}
      {...rest}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <Image
              src="/Brand/IMG_0364_Longer%202.png"
              alt="JB Linguistics LLC"
              width={200}
              height={48}
              priority
              className="h-8 w-auto md:h-10 drop-shadow-sm"
            />
            <span className="sr-only">JB Linguistics LLC</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <NavDropdown
            label={t.nav.mission}
            href={sectionHref("mission")}
            summary={t.sectionsShort.mission}
          />
          <StaffDropdown
            label={t.nav.teacher}
            baseHref="/teachers"
            items={staff.filter((p) => hasRole(p, "teacher"))}
          />
          <StaffDropdown
            label={t.nav.translator}
            baseHref="/translators"
            items={staff.filter((p) => hasRole(p, "translator"))}
          />
          <Link
            href="/teachers/jonathan-brooks"
            className="px-3 py-2 text-sm font-medium text-sky-50 hover:text-white hover:bg-teal-500/60 rounded-full transition"
          >
            About JB
          </Link>
          <TripsDropdown
            label={t.nav.trips}
            baseHref="/trips"
            items={destinations}
          />
          <NavDropdown
            label={t.nav.contact}
            href={sectionHref("contact")}
            summary={t.sectionsShort.contact}
          />
          <Link
            href={sectionHref("contact")}
            className="ml-1 inline-flex items-center rounded-full bg-white text-sky-900 px-3 py-2 text-sm font-semibold hover:bg-sky-50 transition shadow-sm"
          >
            {ctaLabel}
          </Link>

          {showLangToggle && (
            <div className="ml-4 flex items-center gap-1 text-xs bg-sky-900/40 rounded-full p-1">
              {(["en", "de"] as Lang[]).map((code) => (
                <button
                  key={code}
                  onClick={() => onChangeLang?.(code)}
                  className={`px-2 py-1 rounded-full ${
                    lang === code
                      ? "bg-white text-sky-900 font-semibold"
                      : "text-sky-50"
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </nav>
      </div>
    </header>
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
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href={href}
        className="px-3 py-2 text-sm font-medium text-sky-50 hover:text-white hover:bg-teal-500/60 rounded-full transition"
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

function StaffDropdown({
  label,
  items,
  baseHref,
}: {
  label: string;
  items: StaffMember[];
  baseHref: string;
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
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-sky-50 hover:text-white hover:bg-teal-500/60 rounded-full transition"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <span aria-hidden className="text-[10px]">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white shadow-xl p-3 text-xs text-slate-700 z-40">
          <ul className="max-h-64 overflow-auto space-y-1.5">
            {items.map((person) => (
              <li key={person.slug}>
                <a
                  href={`${baseHref}/${person.slug}`}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    <Image
                      src={person.image}
                      alt={person.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-sky-900 block">
                      {person.name}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {person.languages}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={baseHref}
            className="mt-2 block text-[11px] font-semibold text-sky-700 hover:text-sky-900"
            onClick={() => setOpen(false)}
          >
            View all →
          </a>
        </div>
      )}
    </div>
  );
}

function TripsDropdown({
  label,
  items,
  baseHref,
}: {
  label: string;
  items: Destination[];
  baseHref: string;
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
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-sky-50 hover:text-white hover:bg-teal-500/60 rounded-full transition"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <span aria-hidden className="text-[10px]">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white shadow-xl p-3 text-xs text-slate-700 z-40">
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-auto">
            {items.map((d) => (
              <a
                key={d.slug}
                href={`${baseHref}/${d.slug}`}
                className="rounded-xl px-2 py-1.5 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                <span className="font-semibold text-sky-900">{d.name}</span>
                {d.region && (
                  <span className="block text-[10px] text-slate-500">{d.region}</span>
                )}
              </a>
            ))}
          </div>
          <a
            href={baseHref}
            className="mt-2 block text-[11px] font-semibold text-sky-700 hover:text-sky-900"
            onClick={() => setOpen(false)}
          >
            View all destinations →
          </a>
        </div>
      )}
    </div>
  );
}

export default TealNav;
