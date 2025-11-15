import Link from "next/link";
import EducationBookingEngine from "@/components/education-booking-engine";

export const metadata = {
  title: "Book Jonathan Brooks — JB Linguistics",
  description:
    "Secure a session with JB Linguistics for coaching, translation, or interpretation planning. Configure service type, language, and time zone.",
};

export default function BookWithJBPage() {
  const integrationSteps = [
    "Sign your services agreement. We provide the booking password/portal link immediately afterward.",
    "Use the form below to capture the service focus, language, and preferred slots.",
    "If you connect a third-party scheduler (Cal.com, Calendly, HubSpot, etc.), set NEXT_PUBLIC_BOOKING_URL so this form deep-links into it.",
    "If you prefer manual coordination, copy the payload that appears after submission and send it to your JB Linguistics contact.",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50 text-slate-900">
      <section className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <div>
          <nav className="text-xs text-slate-500">
            <Link href="/teachers" className="hover:underline">
              Teachers
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">Book with JB</span>
          </nav>
          <h1 className="mt-3 text-4xl font-bold text-sky-900">Book a session with Jonathan Brooks</h1>
          <p className="mt-3 text-base text-slate-700 leading-relaxed">
            Use this booking engine to request executive coaching, onboarding support, translation briefs, or interpretation rehearsals
            with JB. Once your contract is executed, we unlock the secure scheduling portal or connect the form to your preferred
            third-party booking app.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-sky-900">How JB scheduling works</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {integrationSteps.map((step) => (
              <li key={step} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <EducationBookingEngine />
      </section>
    </main>
  );
}
