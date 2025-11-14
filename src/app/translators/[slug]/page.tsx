import Image from "next/image";
import Link from "next/link";
import { getStaffBySlug, hasRole } from "@/lib/staff";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
};

export default function TranslatorProfilePage({ params }: Props) {
  const person = getStaffBySlug(params.slug);

  if (!person || !hasRole(person, "translator")) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50 text-slate-900 pb-16">
      <section className="max-w-4xl mx-auto px-4 pt-10">
        <Link
          href="/translators"
          className="text-xs text-sky-700 hover:text-sky-900"
        >
          ← Back to all translators
        </Link>

        <div className="mt-4 grid md:grid-cols-[1.1fr,1.4fr] gap-6 items-start">
          <div className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-teal-100 overflow-hidden">
            <div className="relative h-64">
              <Image
                src={person.image}
                alt={person.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h1 className="text-2xl font-bold text-sky-900">
                {person.name}
              </h1>
              <p className="mt-1 text-xs text-teal-700">{person.languages}</p>
              <p className="mt-2 text-sm text-slate-700">{person.tagline}</p>
            </div>
          </div>

          <div className="space-y-5">
            <section>
              <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">
                Overview
              </h2>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                {person.overview}
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">
                Specializations
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {(person.specialties ?? person.expertise ?? []).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">
                Project Focus
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {person.linguistics.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white/90 p-5">
          <h2 className="text-base font-semibold text-sky-900">
            Ready to work with {person.name}?
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Tell us about your document, meeting, or interpretation need and we’ll confirm availability.
          </p>
          <div className="mt-4">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
            >
              Contact JB
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
