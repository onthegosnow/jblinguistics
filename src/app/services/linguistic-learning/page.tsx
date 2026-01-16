"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { getPublicStaffByRole, type PublicStaff } from "@/lib/public-staff";
import { destinations } from "@/lib/trips";

const focusAreas = [
  "Executive English, aviation-specific English, and multilingual leadership coaching",
  "Dedicated sprints for onboarding, compliance refreshers, and KPI-driven campaigns",
  "Live sessions plus asynchronous labs, recordings, and glossaries included at no cost",
  "Virtual-first delivery with optional Linguistic Learning Trips when in-person immersion is required",
];

const learningTracks = [
  {
    title: "Corporate & enterprise",
    bullets: [
      "Language playbooks tied to decks, RFPs, demos, and stakeholder updates",
      "Meeting facilitation and shadowing for sales, CX, and program teams",
      "LMS-ready micro lessons handed off to internal enablement platforms",
    ],
  },
  {
    title: "Government & diplomacy",
    bullets: [
      "Briefing rehearsals, press engagement, and negotiation simulations",
      "Cultural advisory for joint task forces, NGOs, and inter-agency teams",
      "Security-minded workflows plus documentation for Bildungsurlaub and public funding",
    ],
  },
  {
    title: "Airlines, banks & mobility",
    bullets: [
      "Scenario planning for irregular operations, safety messaging, and passenger care",
      "Terminology refreshers for treasury/KYC, vendor diligence, and compliance",
      "Crew- and branch-friendly materials delivered in Dutch, English, French, German, Mandarin, Spanish, and Swedish",
    ],
  },
];

const reimbursementHighlights = [
  "Professional English training that improves or maintains job-related skills",
  "Programs tied to promotion, compliance, safety, or security requirements",
  "Structured courses delivered by JB Linguistics LLC (U.S.-registered vendor) and JB Linguistics GmbH (Germany-registered, serving all European markets)",
];

const documentationList = [
  "Itemized invoice with learner name, hours, rate, and objectives",
  "Certificate of completion showing hours earned and CE-ready learning objectives",
  "Detailed attendance logs and asynchronous hour summaries",
  "Bilingual course outlines for HR, CPF/OPCO, FUNDAE, and Bildungsurlaub reviewers",
];

const corporatePackages = [
  "Per learner bundles (e.g., 10 hours at a fixed rate) with direct invoicing",
  "Team sprints for sales, aviation, compliance, or service departments",
  "Subscription retainers for rolling office hours, async reviews, and lunch-and-learns",
  "Enterprise contracts that combine virtual cohorts with Linguistic Learning Trips",
];

export default function LinguisticLearningPage() {
  const { t } = useLanguage();
  const [featuredTeachers, setFeaturedTeachers] = useState<PublicStaff[]>([]);
  const tripsHighlight = destinations.slice(0, 3);
  const benefits = t.tripBenefits ?? undefined;

  useEffect(() => {
    let active = true;
    getPublicStaffByRole("teacher").then((list) => {
      if (!active) return;
      setFeaturedTeachers(list.slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50 text-slate-900">
      <section className="max-w-5xl mx-auto px-4 py-12 space-y-5">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-600 font-semibold">Services / Linguistic Learning</p>
        <h1 className="text-4xl font-extrabold text-sky-900">Virtual-first language programs built around your deliverables</h1>
        <p className="text-base leading-relaxed text-slate-700">
          JB Linguistics LLC designs fast-paced learning environments that remove friction for aviation crews, banks, NGOs, and government
          teams. Every curriculum runs virtually by default, includes courseware at no cost, and can extend into our Linguistic Learning
          Trips when an in-person sprint is required.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {focusAreas.map((item) => (
            <div key={item} className="rounded-3xl border border-teal-100 bg-white shadow-sm p-4 text-sm text-slate-700">
              <div className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                <span>{item}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-5 py-2 text-sm font-semibold hover:bg-teal-500 transition"
          >
            Start a virtual cohort
          </Link>
          <Link
            href="/trips"
            className="inline-flex items-center rounded-full border border-sky-900/20 bg-white px-5 py-2 text-sm font-semibold text-sky-900 hover:bg-slate-50 transition"
          >
            Explore Linguistic Learning Trips
          </Link>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-sky-900">What every engagement includes</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-slate-700">
            {["Virtual classroom + LMS seats", "Asynchronous labs, recordings, and curated glossaries", "Weekly progress notes + KPI tracking"].map(
              (item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-600" />
                    <span>{item}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-b from-sky-900 to-slate-900 text-sky-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold">Tracks we run most often</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {learningTracks.map((track) => (
              <div key={track.title} className="rounded-3xl border border-white/20 bg-white/5 p-4 text-sm">
                <h3 className="text-lg font-semibold text-white">{track.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sky-100">
                  {track.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-teal-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid gap-8 md:grid-cols-[1.2fr,0.8fr]">
          <div>
            <h2 className="text-2xl font-bold text-sky-900">Employer reimbursement eligibility</h2>
            <p className="mt-3 text-sm text-slate-700">
              Language training qualifies for many corporate tuition-reimbursement and tax-advantaged programs as long as it is job-related and
              well documented. JB Linguistics structures every cohort to meet those standards.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {reimbursementHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <h3 className="text-base font-semibold text-sky-900">Documentation we provide</h3>
            <ul className="mt-3 space-y-2">
              {documentationList.map((doc) => (
                <li key={doc} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-600" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Need an example?{" "}
              <a
                href="/resources/JB_Linguistics_Sample_Certificate.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-sky-700 underline hover:text-sky-900"
              >
                Download our sample completion certificate
              </a>{" "}
              to see the format employers receive.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white/50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 grid gap-8 md:grid-cols-[1.1fr,0.9fr]">
          <div>
            <h2 className="text-2xl font-bold text-sky-900">Corporate and employee-friendly packages</h2>
            <p className="mt-2 text-sm text-slate-700">
              Whether you need a quick cohort for 10 employees or a rolling talent pipeline, we price transparently and tailor billing to your HR
              or procurement workflows.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {corporatePackages.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-3">
              <Link href="/#contact" className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold">
                Request pricing
              </Link>
              <Link href="/trips" className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
                Tie into learning trips
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-teal-200 bg-white p-5 text-sm text-slate-700">
            <h3 className="text-base font-semibold text-sky-900">Learning trips + cohorts</h3>
            <p className="mt-2">
              All Linguistic Learning Trips include 2–3 instructional hours per day, bilingual documentation, and attendance logs — making them
              eligible for reimbursement just like virtual classes.
            </p>
            <ul className="mt-3 space-y-1.5">
              {tripsHighlight.map((trip) => (
                <li key={trip.slug} className="flex justify-between text-xs">
                  <span>{trip.name}</span>
                  <Link href={`/trips/${trip.slug}`} className="text-sky-700 hover:underline">
                    View
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {benefits ? (
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-sky-900">{benefits.title}</h2>
            <p className="mt-2 text-sm text-slate-700">{benefits.description}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm text-slate-700">
              {benefits.items.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-sky-900">{item.label}</p>
                  <p className="mt-1">{item.description}</p>
                  {"link" in item && item.link ? (
                    <a
                      href={item.link}
                      target={item.link.startsWith("/") ? "_self" : "_blank"}
                      rel={item.link.startsWith("/") ? undefined : "noreferrer"}
                      className="mt-2 inline-flex items-center text-xs font-semibold text-teal-600 hover:text-teal-500 transition"
                    >
                      {"linkLabel" in item && item.linkLabel ? item.linkLabel : "Learn more"} →
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {featuredTeachers.length ? (
        <section className="py-12 bg-slate-900 text-slate-100">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold">Meet our teachers</h2>
            <p className="mt-2 text-sm text-slate-300">
              Our educator network spans aviation English, diplomacy, compliance, and customer experience. Each instructor collaborates with JB’s
              translators to deliver consistent terminology and reporting.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {featuredTeachers.map((teacher) => (
                <Link
                  key={teacher.slug}
                  href={teacher.profilePath ?? `/teachers/${teacher.slug}`}
                  className="rounded-3xl border border-white/15 bg-white/5 p-4 text-sm hover:bg-white/10 transition"
                >
                  <p className="text-base font-semibold text-white">{teacher.name}</p>
                  <p className="text-xs text-slate-300">{teacher.languages}</p>
                  <p className="mt-2 text-slate-200 line-clamp-3">{teacher.tagline}</p>
                  <span className="mt-3 inline-flex items-center text-teal-300 text-xs font-semibold">
                    View profile →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
