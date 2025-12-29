import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicStaffMap } from "@/lib/public-staff";

type Props = { params: { slug: string } };

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function TeacherProfilePage({ params }: Props) {
  const { slug } = await params;
  const map = await getPublicStaffMap();
  const person = map.get(slug);

  if (!person || !(person.roles?.includes("teacher") || person.role === "teacher")) {
    return notFound();
  }

  const overviewParas = Array.isArray(person.overview)
    ? person.overview.filter(Boolean)
    : person.overview
      ? [person.overview]
      : [];
  const background = Array.isArray(person.background) ? person.background : [];
  const linguistics = Array.isArray(person.linguistics) ? person.linguistics : [];
  const specialties =
    (Array.isArray(person.specialties) && person.specialties.length ? person.specialties : person.expertise) ?? [];
  const languagesDisplay = person.languages || (Array.isArray(person.langs) ? person.langs.join(", ") : "");
  const photo = person.image || person.photo_url || "/Brand/JB LOGO no TEXT.png";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-teal-50 text-slate-900 pb-16">
      <section className="max-w-4xl mx-auto px-4 pt-10">
        <Link href="/teachers" className="text-xs text-sky-700 hover:text-sky-900">
          ← Back to all teachers
        </Link>

        <div className="mt-4 grid md:grid-cols-[1.1fr,1.4fr] gap-6 items-start">
          <div className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-teal-100 overflow-hidden">
            <div className="relative h-[30rem]">
              <Image
                src={photo}
                alt={person.name}
                fill
                className="object-cover"
                style={{
                  objectPosition: person.imageFocus ?? "center",
                  objectFit: person.imageFit ?? "cover",
                }}
              />
            </div>
            <div className="p-4">
              <h1 className="text-2xl font-bold text-sky-900">{person.name}</h1>
              {languagesDisplay ? <p className="mt-1 text-xs text-teal-700">{languagesDisplay}</p> : null}
              {person.tagline ? <p className="mt-2 text-sm text-slate-700">{person.tagline}</p> : null}
            </div>
          </div>

          <div className="space-y-5">
            {overviewParas.length ? (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">Overview</h2>
                <div className="mt-2 space-y-2 text-sm text-slate-700 leading-relaxed">
                  {overviewParas.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </section>
            ) : null}

            {background.length ? (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">
                  Educational &amp; Professional Background
                </h2>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  {background.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {linguistics.length ? (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">Linguistic Focus</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  {linguistics.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {specialties && specialties.length ? (
              <section>
                <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">Specialties</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  {specialties.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white/90 p-5">
          <h2 className="text-base font-semibold text-sky-900">Ready to work with {person.name}?</h2>
          <p className="mt-2 text-sm text-slate-700">
            Tell us about your lesson goals and we’ll confirm availability with {person.name}.
          </p>
          <div className="mt-4">
            <Link
              href={`/#contact?preferredStaff=${encodeURIComponent(person.name)}`}
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
            >
              Contact {person.name}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
