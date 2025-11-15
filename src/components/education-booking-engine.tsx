"use client";

import { useState } from "react";
import { languages } from "@/lib/copy";

const serviceOptions = [
  { value: "coaching", label: "1:1 or cohort coaching" },
  { value: "translation", label: "Translation / localization review" },
  { value: "interpretation", label: "Interpretation rehearsal" },
  { value: "intake", label: "Contract kickoff / planning" },
];

const durationOptions = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const timezoneOptions = [
  "UTC",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Paris",
  "America/New_York",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
];

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

export default function EducationBookingEngine({ compact = false }: { compact?: boolean }) {
  const [serviceType, setServiceType] = useState(serviceOptions[0].value);
  const [preferredLanguage, setPreferredLanguage] = useState(languages[0]);
  const [timezone, setTimezone] = useState(timezoneOptions[1]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(durationOptions[0].value);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date || !time) {
      setMessage("Please select both a date and time for your session.");
      return;
    }

    const payload = {
      serviceType,
      preferredLanguage,
      timezone,
      date,
      time,
      duration,
      notes,
    };

    if (BOOKING_URL) {
      try {
        const url = new URL(BOOKING_URL);
        Object.entries(payload).forEach(([key, value]) => url.searchParams.set(key, String(value)));
        window.open(url.toString(), "_blank", "noopener,noreferrer");
        setMessage("Booking portal opened in a new tab.");
      } catch (error) {
        console.error("Invalid booking URL", error);
        setMessage("Booking portal URL is invalid. Please check NEXT_PUBLIC_BOOKING_URL.");
      }
      return;
    }

    setMessage(
      `No third-party booking tool configured. Share this info with JB: ${JSON.stringify(payload, null, 2)}`
    );
  };

  const note = BOOKING_URL
    ? "Your selections will open in our secure booking partner portal."
    : "Set NEXT_PUBLIC_BOOKING_URL (Cal.com, Calendly, HubSpot, etc.) to route this form to your scheduling vendor.";

  return (
    <div
      className={`rounded-3xl border ${
        compact ? "border-slate-200 bg-white" : "border-slate-300 bg-white"
      } p-5 shadow-sm`}
    >
      <h3 className="text-lg font-semibold text-sky-900">
        {compact ? "Book JB for a session" : "Schedule time with JB"}
      </h3>
      <p className="mt-2 text-sm text-slate-600">{note}</p>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block mb-1 font-semibold">Service focus</span>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {serviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700">
            <span className="block mb-1 font-semibold">Preferred language</span>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {languages.map((code) => (
                <option key={code} value={code}>
                  {code.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700">
            <span className="block mb-1 font-semibold">Timezone</span>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {timezoneOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700">
            <span className="block mb-1 font-semibold">Duration</span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block mb-1 font-semibold">Preferred date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block mb-1 font-semibold">Preferred time</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
        </div>
        <label className="text-sm text-slate-700">
          <span className="block mb-1 font-semibold">Notes or context</span>
          <textarea
            rows={compact ? 2 : 4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share objectives, participants, or contract reference numbers."
            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </label>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-teal-600 text-white px-5 py-2 text-sm font-semibold hover:bg-teal-500 transition"
          >
            {BOOKING_URL ? "Open booking portal" : "Copy details"}
          </button>
          {message && <p className="text-xs text-slate-600">{message}</p>}
        </div>
      </form>
      {!BOOKING_URL && !compact && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: point <code>NEXT_PUBLIC_BOOKING_URL</code> to a Cal.com, Calendly, HubSpot, or Salesforce booking link with query
          parameters, so this form deep-links into your preferred provider.
        </p>
      )}
    </div>
  );
}
