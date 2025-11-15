"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getStaffProfile } from "@/lib/staff-copy";

export function JonathanBrooksProfile() {
  const { lang, t } = useLanguage();
  const profile = getStaffProfile(lang, "jonathan-brooks");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <nav className="text-xs text-slate-400">
          <Link href="/teachers" className="hover:underline text-slate-200">
            {t.nav.teacher}
          </Link>{" "}
          / <span className="text-slate-100">{profile.name}</span>
        </nav>

        <header className="mt-4 flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-2 ring-teal-400/60 bg-slate-900">
            <Image
              src="/Brand/1740435323075.jpeg"
              alt={profile.name}
              fill
              className="object-cover p-2"
              sizes="128px"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-400">{t.nav.teacher}</p>
            <h1 className="text-3xl font-bold text-white mt-1">{profile.name}</h1>
            <p className="mt-2 text-slate-200 text-sm md:text-base">{profile.title}</p>
            <p className="mt-1 text-xs md:text-sm text-teal-200">{profile.languages}</p>
          </div>
        </header>

        <section className="mt-8 grid md:grid-cols-[1.4fr,1fr] gap-8">
          <div>
            <div className="rounded-3xl bg-slate-900/70 border border-teal-500/10 p-6">
              <h2 className="text-lg font-semibold text-teal-200">{t.sectionsShort.teacher}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-100">
                {profile.overview.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <section className="mt-8">
              <h3 className="text-base font-semibold text-teal-200">{profile.highlightsTitle}</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {profile.highlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="rounded-3xl border border-teal-400/30 bg-slate-900/80 p-5">
            <h3 className="text-sm font-semibold text-teal-200">{profile.servicesTitle}</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {profile.services.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                href="/teachers/book-with-jb"
                className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-900 shadow-sm"
              >
                {profile.cta}
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

