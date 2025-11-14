import Link from "next/link";

const steps = [
  {
    title: "Share your background",
    detail:
      "Send us your CV, specializations, and availability so we can understand where you fit best.",
  },
  {
    title: "Alignment call",
    detail:
      "We schedule a short video call to review your experience, onboarding requirements, and project preferences.",
  },
  {
    title: "Security & onboarding",
    detail:
      "Depending on assignments, we may request references, NDAs, or security documentation before adding you to active rosters.",
  },
  {
    title: "Project matchmaking",
    detail:
      "Once onboarded, you’ll receive mission-specific briefs for teaching, translation, or interpretation work.",
  },
];

const benefits = [
  "Mission-driven projects with governments, NGOs, and global companies.",
  "Opportunities in both virtual and on-site formats across Europe and North America.",
  "Dedicated project managers who coordinate logistics, curriculum, and terminology support.",
  "Prompt invoicing and transparent scopes, so you know expectations up front.",
  "Option to collaborate on research, curriculum design, and high-level consulting engagements.",
];

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-slate-900 pb-16">
      <section className="max-w-4xl mx-auto px-4 pt-12">
        <p className="text-sm text-sky-700">
          <Link href="/" className="hover:underline">
            ← Back to homepage
          </Link>
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold text-sky-900">
          Join the JB Linguistics talent network
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-700 leading-relaxed">
          We partner with seasoned teachers, translators, and interpreters who thrive in
          mission-focused work. Read how our process works, explore the benefits, and send your
          application when you’re ready.
        </p>
      </section>

      <section className="mt-10 max-w-4xl mx-auto px-4 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-slate-200 p-5">
          <h2 className="text-xl font-semibold text-sky-900">How the process works</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="mt-1 h-6 w-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-sky-900">{step.title}</p>
                  <p className="text-slate-600">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-slate-200 p-5">
          <h2 className="text-xl font-semibold text-sky-900">Benefits of partnering with JB</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10 max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-white shadow-md shadow-sky-900/10 border border-slate-200 p-5 md:p-6">
          <h2 className="text-xl font-semibold text-sky-900">Application form</h2>
          <p className="mt-2 text-sm text-slate-600">
            Submit the form below or email{" "}
            <a href="mailto:info@jblinguistics.com" className="text-sky-700 underline">
              info@jblinguistics.com
            </a>{" "}
            directly. We typically reply within 3 business days.
          </p>

          <form
            action="mailto:info@jblinguistics.com?subject=New%20Talent%20Application"
            method="post"
            encType="text/plain"
            className="mt-5 grid gap-4 text-sm"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-slate-700">Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-slate-700">Email</label>
                <input
                  required
                  type="email"
                  name="email"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-slate-700">Applying as</label>
                <select
                  name="role"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="teacher">Teacher</option>
                  <option value="translator">Translator / Interpreter</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-slate-700">Primary languages</label>
                <input
                  name="languages"
                  placeholder="e.g., English ↔ German"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-slate-700">Years of experience</label>
                <input
                  name="experience_years"
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-slate-700">Availability</label>
                <input
                  name="availability"
                  placeholder="e.g., 15 hrs/week, CET timezone"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Portfolio / CV (link)</label>
              <input
                type="url"
                name="portfolio"
                placeholder="https://"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Specialties / Notes</label>
              <textarea
                name="specialties"
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition shadow-md shadow-teal-600/30"
              >
                Submit application
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
