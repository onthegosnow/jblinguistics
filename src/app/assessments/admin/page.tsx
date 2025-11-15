"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "jb_assessment_admin_token";

type SubmissionRecord = {
  id: string;
  submittedAt: string;
  candidateName: string;
  candidateEmail?: string;
  proctorEmail: string;
  testLanguage: string;
  summary: {
    totalCorrect: number;
    totalQuestions: number;
    percentage: number;
    breakdown: Record<string, { correct: number; incorrect: number; unanswered: number; total: number }>;
  };
  accessMeta?: { mode: string; code?: string; label?: string };
};

type AccessCodeRecord = {
  code: string;
  label: string;
  candidateName?: string;
  candidateEmail?: string;
  maxUses: number;
  uses: number;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  notes?: string;
};

type ApplicantRecord = {
  id: string;
  submittedAt: string;
  name: string;
  email?: string;
  location?: string;
  languages?: string;
  experience?: string;
  availability?: string;
  message?: string;
  roles: string[];
  resume: { filename: string; mimeType: string; size: number };
};

export default function AssessmentsAdminPage() {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(STORAGE_KEY) ?? "";
  });
  const [inputToken, setInputToken] = useState("");
  const [results, setResults] = useState<SubmissionRecord[]>([]);
  const [codes, setCodes] = useState<AccessCodeRecord[]>([]);
  const [applicants, setApplicants] = useState<ApplicantRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"results" | "codes" | "applicants">("results");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", candidateName: "", candidateEmail: "", maxUses: 1, expiresAt: "", notes: "" });

  const hasToken = Boolean(token);

  const refreshData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [resultsRes, codesRes, applicantsRes] = await Promise.all([
        fetch("/api/assessments/results", { headers: { "x-admin-token": token } }),
        fetch("/api/assessments/access-codes", { headers: { "x-admin-token": token } }),
        fetch("/api/careers/applicants", { headers: { "x-admin-token": token } }),
      ]);
      if (!resultsRes.ok) {
        const data = await resultsRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load results");
      }
      if (!codesRes.ok) {
        const data = await codesRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load access codes");
      }
      if (!applicantsRes.ok) {
        const data = await applicantsRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load applicants");
      }
      const resultsData = await resultsRes.json();
      const codesData = await codesRes.json();
      const applicantsData = await applicantsRes.json();
      setResults(resultsData.results ?? []);
      setCodes(codesData.codes ?? []);
      setApplicants(applicantsData.applicants ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!hasToken) return;
    window.sessionStorage.setItem(STORAGE_KEY, token);
    void refreshData();
  }, [hasToken, token, refreshData]);

  const handleLogin = () => {
    if (!inputToken.trim()) {
      setError("Enter the admin token provided during onboarding.");
      return;
    }
    setToken(inputToken.trim());
    setInputToken("");
  };

  const handleCreateCode = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/assessments/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to create code.");
      }
      setForm({ label: "", candidateName: "", candidateEmail: "", maxUses: 1, expiresAt: "", notes: "" });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create code.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCode = async (code: AccessCodeRecord) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assessments/access-codes/${code.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ active: !code.active }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to update code.");
      }
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update code.");
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = useCallback(
    async (applicant: ApplicantRecord) => {
      if (!token) return;
      try {
        const response = await fetch(`/api/careers/resume/${applicant.id}`, {
          headers: { "x-admin-token": token },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Unable to download resume");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = applicant.resume.filename || "resume";
        anchor.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to download resume.");
      }
    },
    [token]
  );

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-teal-300 font-semibold">Assessments · Admin</p>
        <h1 className="mt-3 text-4xl font-extrabold">JB Linguistics · Secure Portal</h1>
        <p className="mt-3 text-slate-300 text-sm">
          Monitor submissions, trigger exports, and generate personal access codes so each candidate has a unique login. Future releases
          will add client-level dashboards and individualized learning portals powered by these same credentials.
        </p>

        {!hasToken ? (
          <div className="mt-8 rounded-3xl bg-slate-800 p-6 max-w-lg">
            <label className="text-sm text-slate-200">
              <span className="block mb-2 font-semibold">Admin token</span>
              <input
                type="password"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-600 bg-slate-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </label>
            <button
              type="button"
              onClick={handleLogin}
              className="mt-4 inline-flex items-center rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Unlock portal
            </button>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex rounded-3xl bg-slate-800 p-1 text-sm">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "results" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("results")}
                >
                  Results
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "codes" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("codes")}
                >
                  Access codes
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "applicants" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("applicants")}
                >
                  Applicants
                </button>
              </div>
              <button
                type="button"
                onClick={refreshData}
                className="rounded-2xl border border-slate-600 px-4 py-2 text-sm"
              >
                Refresh
              </button>
              {loading && <span className="text-xs text-slate-400">Syncing…</span>}
              {error && <span className="text-xs text-rose-300">{error}</span>}
            </div>

            {activeTab === "results" ? (
              <div className="rounded-3xl bg-slate-800 p-6">
                <h2 className="text-xl font-semibold">Recent submissions</h2>
                {results.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-400">No submissions stored yet.</p>
                ) : (
                  <div className="mt-4 overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-slate-400">
                        <tr>
                          <th className="py-2 pr-4">Candidate</th>
                          <th className="py-2 pr-4">Score</th>
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Results email</th>
                          <th className="py-2 pr-4">Access</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results
                          .slice()
                          .reverse()
                          .map((result) => (
                            <tr key={result.id} className="border-t border-slate-700">
                              <td className="py-2 pr-4">
                                <p className="font-semibold text-white">{result.candidateName}</p>
                                <p className="text-xs text-slate-400">{result.candidateEmail || "–"}</p>
                              </td>
                              <td className="py-2 pr-4 text-teal-300">
                                {result.summary.percentage}% ({result.summary.totalCorrect}/{result.summary.totalQuestions})
                              </td>
                              <td className="py-2 pr-4 text-slate-300">
                                {new Date(result.submittedAt).toLocaleString()}
                              </td>
                              <td className="py-2 pr-4 text-slate-300">{result.proctorEmail}</td>
                              <td className="py-2 pr-4 text-xs text-slate-400">
                                {result.accessMeta?.mode === "code" ? `Code: ${result.accessMeta.code}` : "Shared"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : activeTab === "codes" ? (
              <div className="rounded-3xl bg-slate-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Generate access code</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="text-xs text-slate-300 uppercase tracking-wide">
                      Label
                      <input
                        type="text"
                        value={form.label}
                        onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                        placeholder="e.g. Lufthansa Cohort"
                        className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-300 uppercase tracking-wide">
                      Candidate name (optional)
                      <input
                        type="text"
                        value={form.candidateName}
                        onChange={(e) => setForm((prev) => ({ ...prev, candidateName: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-300 uppercase tracking-wide">
                      Candidate email (optional)
                      <input
                        type="email"
                        value={form.candidateEmail}
                        onChange={(e) => setForm((prev) => ({ ...prev, candidateEmail: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-300 uppercase tracking-wide">
                      Max uses
                      <input
                        type="number"
                        min={1}
                        value={form.maxUses}
                        onChange={(e) => setForm((prev) => ({ ...prev, maxUses: Number(e.target.value) }))}
                        className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-300 uppercase tracking-wide">
                      Expires at (optional)
                      <input
                        type="datetime-local"
                        value={form.expiresAt}
                        onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-300 uppercase tracking-wide">
                      Notes
                      <input
                        type="text"
                        value={form.notes}
                        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateCode}
                    className="mt-4 inline-flex items-center rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900"
                  >
                    Generate code
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Active codes</h3>
                  {codes.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-400">No codes generated yet.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {codes
                        .slice()
                        .sort((a, b) => a.code.localeCompare(b.code))
                        .map((code) => (
                          <div key={code.code} className="rounded-2xl border border-slate-700 p-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-lg font-bold text-white">{code.code}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${code.active ? "bg-teal-500 text-slate-900" : "bg-slate-600"}`}>
                                {code.active ? "Active" : "Inactive"}
                              </span>
                              <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(code.code)}
                                className="text-xs text-slate-300 underline"
                              >
                                Copy
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleCode(code)}
                                className="text-xs text-slate-300 underline"
                              >
                                {code.active ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                            <p className="text-sm text-slate-300 mt-1">{code.label}</p>
                            <p className="text-xs text-slate-400">
                              Uses {code.uses}/{code.maxUses} · Created {new Date(code.createdAt).toLocaleString()}
                            </p>
                            {code.expiresAt && (
                              <p className="text-xs text-amber-300">Expires {new Date(code.expiresAt).toLocaleString()}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Talent applications</h2>
                  {applicants.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-400">No applicants stored yet.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {applicants
                        .slice()
                        .reverse()
                        .map((applicant) => (
                          <div key={applicant.id} className="rounded-2xl border border-slate-700 p-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <div>
                                <p className="text-base font-semibold text-white">{applicant.name}</p>
                                <p className="text-xs text-slate-400">{applicant.email || "–"}</p>
                              </div>
                              <span className="text-xs text-slate-400">{new Date(applicant.submittedAt).toLocaleString()}</span>
                              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                                {applicant.roles.map((role) => (
                                  <span key={role} className="rounded-full bg-slate-700 px-3 py-1">
                                    {role}
                                  </span>
                                ))}
                              </div>
                              <button
                                type="button"
                                className="ml-auto rounded-full border border-slate-500 px-3 py-1 text-xs"
                                onClick={() => downloadResume(applicant)}
                              >
                                Download resume
                              </button>
                            </div>
                            <div className="mt-3 grid md:grid-cols-2 gap-2 text-xs text-slate-300">
                              <p>
                                <span className="text-slate-500">Location:</span> {applicant.location || "–"}
                              </p>
                              <p>
                                <span className="text-slate-500">Languages:</span> {applicant.languages || "–"}
                              </p>
                              <p>
                                <span className="text-slate-500">Experience:</span> {applicant.experience || "–"}
                              </p>
                              <p>
                                <span className="text-slate-500">Availability:</span> {applicant.availability || "–"}
                              </p>
                            </div>
                            {applicant.message ? (
                              <p className="mt-2 text-xs text-slate-200">{applicant.message}</p>
                            ) : null}
                            <p className="mt-2 text-[11px] text-slate-500">
                              File: {applicant.resume.filename} · {(applicant.resume.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
