import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslationService, translationServices } from "@/lib/translation-services";

type TranslationRequestPageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return translationServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: TranslationRequestPageProps): Promise<Metadata> {
  const service = getTranslationService(params.slug);
  if (!service) return {};
  return {
    title: `${service.name} · Request translation support`,
    description: service.summary,
  };
}

export default function TranslationRequestPage({ params }: TranslationRequestPageProps) {
  const service = getTranslationService(params.slug);
  if (!service) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-teal-50 text-slate-900">
      <section className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-teal-600 font-semibold">Translation request</p>
          <h1 className="mt-3 text-4xl font-extrabold text-sky-900">{service.name}</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-700">{service.description}</p>
        </div>
        <div className="rounded-3xl border border-teal-100 bg-white shadow-sm p-5">
          <h2 className="text-xl font-semibold text-sky-900">Why teams choose this service</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {service.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] text-sm">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-sky-900">Deliverables</h3>
            <ul className="mt-3 space-y-2 text-slate-700">
              {service.deliverables.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-sky-900">Next steps</h3>
            <ol className="mt-3 space-y-2 text-slate-700">
              {[
                "Share source files securely through our contact portal.",
                "Receive a scoped estimate and compliance checklist.",
                "Approve timelines, payment terms, and reviewer assignments.",
                "Track delivery inside our encrypted client workspace.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="text-sky-700 font-semibold">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-full bg-teal-600 text-white px-5 py-2 font-semibold hover:bg-teal-500 transition"
              >
                Submit project details
              </Link>
              <Link
                href={service.infoHref}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 font-semibold text-sky-900 hover:bg-white"
              >
                View full service overview
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
