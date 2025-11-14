import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Jonathan Brooks — JB Linguistics",
  description:
    "TEFL‑certified instructor with diplomatic and government experience. English (native), German B2+, French B2+. Bio, languages, and profile highlights.",
};

export default function JonathanBrooksPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500">
        <Link href="/teachers" className="hover:underline">
          Teachers
        </Link>{" "}
        / <span className="text-slate-700">Jonathan Brooks</span>
      </nav>

      {/* Header */}
      <header className="mt-3 flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white">
          <Image
            src="/Brand/1740435323075.jpeg"
            alt="Jonathan Brooks"
            fill
            className="object-contain p-2 bg-white"
            sizes="128px"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-sky-900">Jonathan Brooks</h1>
          <p className="mt-1 text-slate-700">
            TEFL‑certified instructor • International Affairs • Government &amp; diplomatic
            contexts
          </p>
          <p className="mt-1 text-sm text-slate-600">
            English (native) · German (B2+) · French (B2+) · Russian (B1) · Dutch (B1) ·
            Swedish (B1) · Danish (B1)
          </p>
        </div>
      </header>

      {/* Overview */}
      <section className="mt-8 grid md:grid-cols-[1.4fr,1fr] gap-8">
        <div>
          <h2 className="text-lg font-semibold text-sky-900">Overview</h2>
          <div className="mt-3 space-y-3 text-slate-700 text-sm leading-relaxed">
            <p>
              Jonathan Brooks is a TEFL‑certified language instructor and linguistics
              professional with extensive experience supporting international teams,
              executives, and public‑sector partners. His work spans corporate training,
              academic coaching, translation, and interpretation, with a focus on
              clear, context‑aware communication.
            </p>
            <p>
              Jonathan has supported German governmental entities and holds a German
              security clearance at level Ü1, enabling collaboration in sensitive,
              protocol‑driven environments. He designs programs that combine practical
              language outcomes with cultural fluency and real‑world application.
            </p>
          </div>

          {/* Profile Highlights — moved from home page */}
          <section className="mt-8">
            <h3 className="text-base font-semibold text-sky-900">Profile Highlights</h3>
            <ul className="mt-3 space-y-2 text-slate-700 text-sm">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>B.Sc. in World Religion Studies with a minor in Biblical Historical Studies</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Master’s in International Affairs</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>168-hour TEFL certification</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Fluent in English; B2+ German &amp; French</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>B1 in Russian, Dutch, Swedish, and Danish</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Travel experience in 86 countries with international volunteer groups</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Aircraft industry training on Airbus and Boeing fleets</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Private pilot licenses (EASA &amp; FAA)</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Services box */}
        <aside className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
          <h3 className="text-sm font-semibold text-sky-900">Teaching &amp; Services</h3>
          <ul className="mt-3 space-y-2 text-slate-700 text-sm">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>1:1 and small‑group training in 20+ languages</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>Corporate programs for internal teams &amp; leadership</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>Written translation &amp; localization</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>Virtual &amp; on‑site simultaneous/consecutive interpretation</span>
            </li>
          </ul>

          <div className="mt-5">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
            >
              Contact JB
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
