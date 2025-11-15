import Link from "next/link";

const formats = [
  {
    title: "Remote simultaneous",
    text: "Diplomatic visits, executive board sessions, investor days, and NGO briefings hosted on Zoom, Teams, Webex, or your preferred RSI hub.",
  },
  {
    title: "Consecutive & liaison",
    text: "C-suite interviews, technical workshops, vendor diligence, and negotiations that require slower pacing and note-taking.",
  },
  {
    title: "Hybrid standby",
    text: "In-room interpreters paired with a virtual backline so you can pivot between live and remote participation without losing coverage.",
  },
];

const prepItems = [
  "Terminology mining from decks, RFPs, safety manuals, and regulatory filings",
  "Speaker briefings to confirm cadence, acronyms, and confidentiality rules",
  "Recording-ready audio routing plus compliance with German security expectations and EU privacy guidance",
];

export default function SimultaneousInterpretationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-600 font-semibold">Services / Simultaneous Interpretation</p>
        <h1 className="mt-3 text-4xl font-extrabold text-sky-900">
          Remote-first interpretation for UN briefings, airlines, and regulated industries
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          We coordinate linguists who understand procurement, irregular operations, security clearances, and investor relations.
          Whether you are updating Lufthansa stakeholders, briefing a UN cluster, or rolling out a new banking platform, we scope
          interpretation as a managed project with clear prep paths and follow-up notes.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {formats.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 text-sm text-slate-700">
              <h3 className="text-base font-semibold text-sky-900">{item.title}</h3>
              <p className="mt-2">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-teal-600 text-white px-5 py-2 text-sm font-semibold hover:bg-teal-500 transition"
          >
            Request interpreter availability
          </Link>
          <Link
            href="/teachers/jonathan-brooks"
            className="inline-flex items-center rounded-full border border-sky-900/20 bg-white px-5 py-2 text-sm font-semibold text-sky-900 hover:bg-slate-50 transition"
          >
            Review compliance background
          </Link>
        </div>
      </section>

      <section className="py-12 bg-slate-900 text-sky-50">
        <div className="max-w-5xl mx-auto px-4 grid gap-8 md:grid-cols-[1fr,1fr]">
          <div>
            <h2 className="text-2xl font-bold">Standard prep plan</h2>
            <ul className="mt-4 space-y-1.5 text-sm">
              {prepItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/5 p-5 text-sm">
            <h3 className="text-base font-semibold text-white">Languages & partners</h3>
            <p className="mt-2 text-sky-100">
              Core languages: Dutch, English, French, German, Mandarin, Spanish, Swedish. Additional languages are available through
              our vetted contractor bench, complete with NDAs and QA notes.
            </p>
            <p className="mt-3 text-sky-100">
              Trusted for UN cluster calls, Lufthansa-aligned briefings, and treasury-level disclosure meetings.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-sm text-slate-700">
          <h2 className="text-2xl font-bold text-sky-900">Engagement flow</h2>
          <ol className="mt-5 space-y-3">
            {[
              "Alignment call (30 minutes) to capture agenda, participants, and confidentiality rules",
              "Shared prep folder with scripts, decks, safety notices, and run-of-show",
              "Live interpretation with backup channels plus immediate post-session recap",
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="text-sky-700 font-semibold">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6">
            <Link
              href="/#contact"
              className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition"
            >
              Tell us about your meeting
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
