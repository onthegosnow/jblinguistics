import Image from "next/image";
import Link from "next/link";
import { getStaffBySlug, hasRole, staff } from "@/lib/staff";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return staff.filter((person) => hasRole(person, "teacher")).map((person) => ({ slug: person.slug }));
}

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function TeacherProfilePage({ params }: Props) {
  const { slug } = await params;
  const person = getStaffBySlug(slug);

  if (!person || person.role !== "teacher") {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-teal-50 text-slate-900 pb-16">
      <section className="max-w-4xl mx-auto px-4 pt-10">
        <Link
          href="/teachers"
          className="text-xs text-sky-700 hover:text-sky-900"
        >
          ← Back to all teachers
        </Link>

        <div className="mt-4 grid md:grid-cols-[1.1fr,1.4fr] gap-6 items-start">
          <div className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-teal-100 overflow-hidden">
            <div className="relative h-[30rem]">
              <Image
                src={person.image}
                alt={person.name}
                fill
                className="object-cover"
                style={{ objectPosition: person.imageFocus ?? "center" }}
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

            {/* Profile Highlights — only for Jonathan Brooks */}
            {slug === "jonathan-brooks" && (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">
                  Profile Highlights
                </h2>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>B.Sc. in World Religion Studies with a minor in Biblical Historical Studies</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>Master’s in International Affairs</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>168-hour TEFL certification</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>Fluent in English; B2+ German &amp; French</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>B1 in Russian, Dutch, Swedish, and Danish</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>Travel experience in 102 countries with international volunteer groups</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>Aircraft industry training on Airbus and Boeing fleets</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>Private pilot licenses (EASA &amp; FAA)</span>
                  </li>
                </ul>
              </section>
            )}

            <section>
              <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">
                Educational &amp; Professional Background
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {person.background.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">
                Linguistic Focus
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
      </section>
    </main>
  );
}
