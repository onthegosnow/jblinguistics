"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export default function CareersPage() {
  const { t } = useLanguage();
  const copy = t.careersPage;
  const rolesCopy = copy.roleOptions;
  const formCopy = copy.form;
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["translator"]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const toggleRole = (value: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || formCopy.error);
      }
      form.reset();
      setSelectedRoles(["translator"]);
      setStatus("success");
      setMessage(formCopy.success);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : formCopy.error);
    }
  };

  const roleInputs = [
    { key: "translator", label: rolesCopy.translator },
    { key: "educator", label: rolesCopy.educator },
    { key: "both", label: rolesCopy.both },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-teal-50 text-slate-900">
      <section className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <div className="rounded-3xl bg-white border border-teal-100 shadow-xl p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-500 font-semibold">Careers</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-sky-900">{copy.title}</h1>
          <p className="mt-4 text-sm md:text-base text-slate-700 leading-relaxed">{copy.intro}</p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">{copy.rolesTitle}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {roleInputs.map((role) => (
                <span key={role.key} className="rounded-full bg-white border border-slate-200 px-3 py-1">
                  {role.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-sky-900">{formCopy.heading}</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm" encType="multipart/form-data">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.name}</span>
                <input name="name" required className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.email}</span>
                <input type="email" name="email" required className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.location}</span>
                <input name="location" className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.languages}</span>
                <input name="languages" className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. EN ↔ DE, FR" />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.experience}</span>
                <input name="experience" className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.availability}</span>
                <input name="availability" className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. 15 hrs/week" />
              </label>
            </div>
            <fieldset className="rounded-2xl border border-slate-200 p-4">
              <legend className="px-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                {copy.rolesTitle}
              </legend>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {roleInputs.map((role) => (
                  <label key={role.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="roles"
                      value={role.key}
                      checked={selectedRoles.includes(role.key)}
                      onChange={() => toggleRole(role.key)}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>{role.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-1">
              <span className="text-slate-600">{formCopy.message}</span>
              <textarea
                name="message"
                rows={4}
                className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-600">{formCopy.resume}</span>
              <input
                name="resume"
                type="file"
                required
                accept=".pdf,.doc,.docx,.rtf,.txt"
                className="rounded-2xl border border-dashed border-teal-400 bg-teal-50 px-4 py-3 text-sm"
              />
              <span className="text-xs text-slate-500">{formCopy.resumeHint}</span>
            </label>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center rounded-full bg-teal-600 text-white px-6 py-2 text-sm font-semibold hover:bg-teal-500 transition disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : formCopy.submit}
            </button>
            {message && (
              <p className={`text-sm ${status === "error" ? "text-rose-600" : "text-teal-700"}`}>{message}</p>
            )}
            <input type="hidden" name="landing" value="careers-page" />
          </form>
          <p className="mt-6 text-xs text-slate-500">{copy.supportNote}</p>
          <p className="mt-2 text-xs">
            <Link href="/">← {copy.backLink}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
