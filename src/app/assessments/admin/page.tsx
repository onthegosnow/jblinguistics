"use client";

import { useCallback, useEffect, useState } from "react";
import {
  teacherAssessmentLanguages,
  type TeacherAssessmentLanguage,
  type TeacherAssessmentScore,
  type TeacherAssessmentAnswer,
} from "@/lib/teacher-assessment";
import { translatorLanguages, type TranslatorExerciseLanguage } from "@/lib/translator-exercise";

const STORAGE_KEY = "jb_assessment_admin_token";
const teacherLanguageLabels = teacherAssessmentLanguages.reduce(
  (acc, lang) => {
    acc[lang.id] = lang.label;
    return acc;
  },
  {} as Record<TeacherAssessmentLanguage, string>
);
const translatorLanguageLabels = translatorLanguages.reduce(
  (acc, lang) => {
    acc[lang.id] = lang.label;
    return acc;
  },
  {} as Record<TranslatorExerciseLanguage, string>
);

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
  workingLanguages?: TeacherAssessmentLanguage[];
  resume: { filename: string; mimeType: string; size: number };
  resumeInsights?: {
    summary: string;
    keywords: string[];
    score: number;
    verdict: "strong" | "review";
    reasoning: string;
  };
  teacherAssessments?: Array<{
    language: TeacherAssessmentLanguage;
    seed: number;
    answers: TeacherAssessmentAnswer[];
    responses: { conflict: string; attendance: string };
    score: TeacherAssessmentScore;
  }>;
  translatorExercise?: {
    language: TranslatorExerciseLanguage;
    submission: string;
    score: number | null;
    missingTokens: string[];
  };
};

type PortalUserAdmin = {
  id: string;
  name: string;
  email: string;
  roles: ("teacher" | "translator")[];
  languages?: string[];
  createdAt: string;
  active: boolean;
};

type PortalAssignmentAdmin = {
  id: string;
  title: string;
  assignmentType: "class" | "translation";
  description?: string;
  client?: string;
  languagePair?: string;
  hoursAssigned: number;
  startDate?: string;
  dueDate?: string;
  status: "assigned" | "in_progress" | "submitted" | "completed";
  participants: string[];
  assignees: { id: string; name: string; email: string }[];
  createdAt: string;
  updatedAt: string;
};

type InquiryAdmin = {
  id: string;
  createdAt: string | null;
  name: string;
  email: string;
  organization: string | null;
  serviceType: string | null;
  languages: string | null;
  details: string | null;
  source: string;
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
  const [activeTab, setActiveTab] = useState<
    "results" | "codes" | "applicants" | "assignments" | "portalUsers" | "inquiries" | "onboarding"
  >("results");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", candidateName: "", candidateEmail: "", maxUses: 1, expiresAt: "", notes: "" });
  const [portalUsers, setPortalUsers] = useState<PortalUserAdmin[]>([]);
  const [assignments, setAssignments] = useState<PortalAssignmentAdmin[]>([]);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", roles: { teacher: true, translator: false }, languages: "" });
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    assignmentType: "class",
    description: "",
    client: "",
    languagePair: "",
    hoursAssigned: 10,
    startDate: "",
    dueDate: "",
    participants: "",
    assignedTo: [] as string[],
  });
  const [assignmentFiles, setAssignmentFiles] = useState<FileList | null>(null);
  const [deletingApplicantId, setDeletingApplicantId] = useState<string | null>(null);
  const [sendingHireId, setSendingHireId] = useState<string | null>(null);
  const [onboardingEnvelopes, setOnboardingEnvelopes] = useState<
    Array<{
      envelopeId: string;
      signerName?: string | null;
      signerEmail?: string | null;
      completedAt?: string | null;
      docUrl?: string;
      resumeUrl?: string;
      applicantId?: string | null;
    }>
  >([]);
  const [inquiries, setInquiries] = useState<InquiryAdmin[]>([]);

  const hasToken = Boolean(token);

  const refreshData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [resultsRes, codesRes, applicantsRes, usersRes, assignmentsRes, inquiriesRes, onboardingRes] = await Promise.all([
        fetch("/api/assessments/results", { headers: { "x-admin-token": token } }),
        fetch("/api/assessments/access-codes", { headers: { "x-admin-token": token } }),
        fetch("/api/careers/applicants", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/users", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/assignments", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/inquiries", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/onboarding", { headers: { "x-admin-token": token } }),
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
      if (!usersRes.ok) {
        const data = await usersRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load portal users");
      }
      if (!assignmentsRes.ok) {
        const data = await assignmentsRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load assignments");
      }
      if (!onboardingRes.ok) {
        const data = await onboardingRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load onboarding envelopes");
      }
      if (!inquiriesRes.ok) {
        const data = await inquiriesRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load inquiries");
      }
      const resultsData = await resultsRes.json();
      const codesData = await codesRes.json();
      const applicantsData = await applicantsRes.json();
      const usersData = await usersRes.json();
      const assignmentsData = await assignmentsRes.json();
      const inquiriesData = await inquiriesRes.json();
      const onboardingData = await onboardingRes.json();
      setResults(resultsData.results ?? []);
      setCodes(codesData.codes ?? []);
      setApplicants(applicantsData.applicants ?? []);
      setPortalUsers(usersData.users ?? []);
      setAssignments(assignmentsData.assignments ?? []);
      setInquiries(inquiriesData.inquiries ?? []);
      setOnboardingEnvelopes(onboardingData.envelopes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deleteApplicant = useCallback(
    async (applicant: ApplicantRecord) => {
      if (!token) return;
      const confirmed = typeof window === "undefined" ? true : window.confirm(`Remove ${applicant.name}'s application?`);
      if (!confirmed) return;
      setDeletingApplicantId(applicant.id);
      try {
        const response = await fetch(`/api/careers/applicants/${applicant.id}`, {
          method: "DELETE",
          headers: { "x-admin-token": token },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Unable to delete applicant");
        }
        setApplicants((prev) => prev.filter((item) => item.id !== applicant.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to delete applicant.");
      } finally {
        setDeletingApplicantId(null);
      }
    },
    [token]
  );

  const sendHire = useCallback(
    async (applicant: ApplicantRecord) => {
      if (!token) return;
      setError(null);
      setSendingHireId(applicant.id);
      try {
        const response = await fetch("/api/careers/hire", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-token": token },
          body: JSON.stringify({ name: applicant.name, email: applicant.email }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Unable to send onboarding email.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to send onboarding email.");
      } finally {
        setSendingHireId(null);
      }
    },
    [token]
  );

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

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",").pop() ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleCreatePortalUser = async () => {
    if (!token) return;
    if (!userForm.name || !userForm.email || !userForm.password) {
      setError("Name, email, and password are required for portal users.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const roles = Object.entries(userForm.roles)
        .filter(([, value]) => value)
        .map(([key]) => key) as ("teacher" | "translator")[];
      const response = await fetch("/api/portal/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          roles,
          languages: userForm.languages
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to create portal user.");
      }
      setUserForm({ name: "", email: "", password: "", roles: { teacher: true, translator: false }, languages: "" });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create portal user.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!token) return;
    if (!assignmentForm.title || !assignmentForm.assignedTo.length || !assignmentForm.hoursAssigned) {
      setError("Assignments require a title, hours, and at least one assignee.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const attachments =
        assignmentFiles && assignmentFiles.length
          ? await Promise.all(
              Array.from(assignmentFiles).map(async (file) => ({
                filename: file.name,
                mimeType: file.type || "application/octet-stream",
                size: file.size,
                data: await toBase64(file),
                category: "support" as const,
              }))
            )
          : [];
      const response = await fetch("/api/portal/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          title: assignmentForm.title,
          assignmentType: assignmentForm.assignmentType,
          description: assignmentForm.description,
          client: assignmentForm.client,
          languagePair: assignmentForm.languagePair,
          hoursAssigned: assignmentForm.hoursAssigned,
          startDate: assignmentForm.startDate,
          dueDate: assignmentForm.dueDate,
          assignedTo: assignmentForm.assignedTo,
          participants: assignmentForm.participants
            .split("\n")
            .join(",")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          attachments,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to create assignment.");
      }
      setAssignmentForm({
        title: "",
        assignmentType: "class",
        description: "",
        client: "",
        languagePair: "",
        hoursAssigned: 10,
        startDate: "",
        dueDate: "",
        participants: "",
        assignedTo: [],
      });
      setAssignmentFiles(null);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create assignment.");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "results":
        return (
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
                          <td className="py-2 pr-4 text-slate-300">{new Date(result.submittedAt).toLocaleString()}</td>
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
        );
      case "codes":
        return (
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
                    type="date"
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
                Create code
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Existing codes</h3>
              <div className="mt-4 space-y-3">
                {codes.length === 0 ? (
                  <p className="text-sm text-slate-400">No codes available.</p>
                ) : (
                  codes.map((code) => (
                    <div key={code.code} className="rounded-2xl border border-slate-700 p-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-white">{code.label}</p>
                        <p className="text-xs text-slate-400">{code.code}</p>
                        <p className="text-xs text-slate-500">
                          Uses: {code.uses}/{code.maxUses}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCode(code)}
                        className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          code.active ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-700 text-slate-200"
                        }`}
                      >
                        {code.active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      case "applicants":
        return (
          <div className="rounded-3xl bg-slate-800 p-6">
            <h2 className="text-xl font-semibold">Career applicants</h2>
            {applicants.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No applications yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="rounded-2xl border border-slate-700 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-white">{applicant.name}</p>
                        <p className="text-xs text-slate-400">{applicant.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => downloadResume(applicant)}
                        className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold hover:bg-slate-600"
                      >
                        Download resume
                      </button>
                      <button
                        type="button"
                        onClick={() => sendHire(applicant)}
                        disabled={sendingHireId === applicant.id}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          sendingHireId === applicant.id
                            ? "bg-amber-900/50 text-amber-100 cursor-wait"
                            : "bg-amber-400 text-slate-900 hover:bg-amber-300"
                        }`}
                      >
                        {sendingHireId === applicant.id ? "Sending…" : "Send DocuSign"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteApplicant(applicant)}
                        disabled={deletingApplicantId === applicant.id}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            deletingApplicantId === applicant.id
                              ? "bg-rose-900/50 text-rose-200 cursor-not-allowed"
                              : "bg-rose-600 text-white hover:bg-rose-500"
                          }`}
                        >
                          {deletingApplicantId === applicant.id ? "Removing…" : "Delete"}
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Submitted {new Date(applicant.submittedAt).toLocaleDateString()} — Roles: {applicant.roles.join(", ")}
                    </p>
                    {applicant.workingLanguages?.length ? (
                      <p className="text-xs text-slate-500">
                        Working languages: {applicant.workingLanguages.map((lang) => teacherLanguageLabels[lang] ?? lang).join(", ")}
                      </p>
                    ) : null}
                    {applicant.resumeInsights && (
                      <div
                        className={`mt-3 rounded-2xl border p-4 text-sm ${
                          applicant.resumeInsights.verdict === "strong"
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-rose-500/40 bg-rose-500/10"
                        }`}
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Auto bio summary</p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              applicant.resumeInsights.verdict === "strong"
                                ? "bg-emerald-500/20 text-emerald-100"
                                : "bg-rose-500/20 text-rose-100"
                            }`}
                            aria-label={
                              applicant.resumeInsights.verdict === "strong"
                                ? "Strong applicant"
                                : "Needs closer review"
                            }
                          >
                            <span aria-hidden>{applicant.resumeInsights.verdict === "strong" ? "👍" : "👎"}</span>
                            {applicant.resumeInsights.verdict === "strong" ? "Strong candidate" : "Needs review"}
                          </span>
                        </div>
                        <p className="mt-3 text-slate-100">{applicant.resumeInsights.summary}</p>
                        <p className="mt-2 text-xs text-slate-300">
                          Score: {applicant.resumeInsights.score}%{" "}
                          {applicant.resumeInsights.keywords?.length
                            ? `• Keywords: ${applicant.resumeInsights.keywords.join(", ")}`
                            : ""}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{applicant.resumeInsights.reasoning}</p>
                      </div>
                    )}
                    {applicant.teacherAssessments?.length ? (
                      <div className="mt-3 space-y-3">
                        {applicant.teacherAssessments.map((assessment, index) => (
                          <div
                            key={`${assessment.language}-${index}`}
                            className="rounded-2xl border border-slate-700/60 bg-slate-900/30 p-3 text-xs text-slate-200 space-y-1"
                          >
                            <p className="font-semibold text-white">
                              Educator assessment ({teacherLanguageLabels[assessment.language]})
                            </p>
                            <p>
                              Score: {assessment.score.totalCorrect}/{assessment.score.totalQuestions} ({assessment.score.percentage}%)
                            </p>
                            <p className="text-slate-400">
                              Breakdown: {Object.entries(assessment.score.breakdown)
                                .map(([level, data]) => `${level} ${data.correct}/${data.total}`)
                                .join(" · ")}
                            </p>
                            <p className="text-slate-400">Conflict plan: {assessment.responses.conflict}</p>
                            <p className="text-slate-400">Attendance plan: {assessment.responses.attendance}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {applicant.translatorExercise && (
                      <div className="mt-3 rounded-2xl border border-slate-700/60 bg-slate-900/30 p-3 text-xs text-slate-200 space-y-2">
                        <p className="font-semibold text-white">
                          Translator exercise ({translatorLanguageLabels[applicant.translatorExercise.language] ?? applicant.translatorExercise.language})
                        </p>
                        <p>
                          Score:{" "}
                          {typeof applicant.translatorExercise.score === "number"
                            ? `${applicant.translatorExercise.score}%`
                            : "Not auto-scored"}
                        </p>
                        {applicant.translatorExercise.missingTokens.length > 0 && (
                          <p className="text-amber-200">
                            Missing keywords: {applicant.translatorExercise.missingTokens.join(", ")}
                          </p>
                        )}
                        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-3 text-slate-100 whitespace-pre-wrap">
                          {applicant.translatorExercise.submission}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "onboarding":
        return (
          <div className="rounded-3xl bg-slate-800 p-6">
            <h2 className="text-xl font-semibold">Active employees (DocuSign)</h2>
            {onboardingEnvelopes.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No completed packets yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {onboardingEnvelopes.map((env) => (
                  <div key={env.envelopeId} className="rounded-2xl border border-slate-700 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-white">{env.signerName || "Unknown"}</p>
                        <p className="text-xs text-slate-400">{env.signerEmail || "(no email)"}</p>
                        <p className="text-xs text-slate-500">Envelope: {env.envelopeId}</p>
                        {env.applicantId ? (
                          <p className="text-xs text-emerald-300">Matched applicant: {env.applicantId}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">
                          Completed: {env.completedAt ? new Date(env.completedAt).toLocaleString() : "N/A"}
                        </span>
                        {env.docUrl ? (
                          <a
                            href={env.docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-teal-400"
                          >
                            Download packet
                          </a>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-900/50 px-3 py-1 text-xs font-semibold text-amber-100">
                            No document URL
                          </span>
                        )}
                        {env.resumeUrl ? (
                          <a
                            href={env.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-white"
                          >
                            View resume
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "assignments":
        return (
          <div className="rounded-3xl bg-slate-800 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Create assignment</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Title
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Type
                  <select
                    value={assignmentForm.assignmentType}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, assignmentType: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  >
                    <option value="class">Class / cohort</option>
                    <option value="translation">Translation</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Client / account
                  <input
                    type="text"
                    value={assignmentForm.client}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, client: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Language pair
                  <input
                    type="text"
                    value={assignmentForm.languagePair}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, languagePair: e.target.value }))}
                    placeholder="e.g. EN ↔ DE"
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Hours assigned
                  <input
                    type="number"
                    min={1}
                    value={assignmentForm.hoursAssigned}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, hoursAssigned: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Start date
                  <input
                    type="date"
                    value={assignmentForm.startDate}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Due date
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Participants (comma or line separated)
                  <textarea
                    rows={2}
                    value={assignmentForm.participants}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, participants: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide md:col-span-2">
                  Description / brief
                  <textarea
                    rows={3}
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Assign to</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {portalUsers.map((user) => (
                    <label key={user.id} className="inline-flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={assignmentForm.assignedTo.includes(user.id)}
                        onChange={(e) =>
                          setAssignmentForm((prev) => {
                            const assignedTo = e.target.checked
                              ? [...prev.assignedTo, user.id]
                              : prev.assignedTo.filter((id) => id !== user.id);
                            return { ...prev, assignedTo };
                          })
                        }
                      />
                      {user.name}
                    </label>
                  ))}
                </div>
              </div>
              <label className="mt-4 block text-xs uppercase tracking-wide text-slate-400">
                Attach brief / files
                <input
                  type="file"
                  multiple
                  onChange={(e) => setAssignmentFiles(e.target.files)}
                  className="mt-1 block text-sm"
                />
              </label>
              <button
                type="button"
                onClick={handleCreateAssignment}
                className="mt-4 inline-flex items-center rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Publish assignment
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Active assignments</h3>
              <div className="mt-4 space-y-3">
                {assignments.length === 0 ? (
                  <p className="text-sm text-slate-400">No assignments yet.</p>
                ) : (
                  assignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-2xl border border-slate-700 p-4">
                      <p className="font-semibold text-white">{assignment.title}</p>
                      <p className="text-xs text-slate-400">
                        {assignment.assignmentType === "class" ? "Class" : "Translation"} · {assignment.hoursAssigned} hrs ·{" "}
                        {assignment.status}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Assigned to: {assignment.assignees.map((a) => a.name).join(", ") || "—"}
                      </p>
                      {assignment.dueDate && (
                        <p className="text-xs text-amber-200">
                          Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      case "portalUsers":
        return (
          <div className="rounded-3xl bg-slate-800 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Create portal user</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Name
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Email
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Temporary password
                  <input
                    type="text"
                    value={userForm.password}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Languages (comma separated)
                  <input
                    type="text"
                    value={userForm.languages}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, languages: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-200">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userForm.roles.teacher}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, roles: { ...prev.roles, teacher: e.target.checked } }))}
                  />
                  Teacher
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userForm.roles.translator}
                    onChange={(e) =>
                      setUserForm((prev) => ({ ...prev, roles: { ...prev.roles, translator: e.target.checked } }))
                    }
                  />
                  Translator
                </label>
              </div>
              <button
                type="button"
                onClick={handleCreatePortalUser}
                className="mt-4 inline-flex items-center rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Create user
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Active users</h3>
              <div className="mt-4 space-y-3">
                {portalUsers.length === 0 ? (
                  <p className="text-sm text-slate-400">No users yet.</p>
                ) : (
                  portalUsers.map((user) => (
                    <div key={user.id} className="rounded-2xl border border-slate-700 p-4">
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        Roles: {user.roles.join(", ")} · Languages: {user.languages?.join(", ") || "—"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      case "inquiries":
        return (
          <div className="rounded-3xl bg-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">Inquiries</h3>
                <p className="text-sm text-slate-400">Recent contact form submissions</p>
              </div>
              <button
                type="button"
                onClick={refreshData}
                className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
              >
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900">
              <table className="min-w-full text-sm text-slate-100">
                <thead className="bg-slate-800 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Service</th>
                    <th className="px-3 py-2 text-left">Languages</th>
                    <th className="px-3 py-2 text-left">Details</th>
                    <th className="px-3 py-2 text-left">Source</th>
                    <th className="px-3 py-2 text-left">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-slate-400">
                        No inquiries yet.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inq) => (
                      <tr key={inq.id} className="border-t border-slate-700 align-top">
                        <td className="px-3 py-2 font-semibold text-white">
                          <div>{inq.name}</div>
                          {inq.organization && <div className="text-xs text-slate-400">{inq.organization}</div>}
                        </td>
                        <td className="px-3 py-2">
                          <a href={`mailto:${inq.email}`} className="text-teal-300 hover:underline">
                            {inq.email}
                          </a>
                        </td>
                        <td className="px-3 py-2 text-slate-200">{inq.serviceType ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-200">{inq.languages ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-200 max-w-xs whitespace-pre-wrap break-words">
                          {inq.details ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-400">{inq.source}</td>
                        <td className="px-3 py-2 text-xs text-slate-400">
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
              <div className="inline-flex rounded-3xl bg-slate-800 p-1 text-sm flex-wrap gap-1">
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
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "onboarding" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("onboarding")}
                >
                  Active employees
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "assignments" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("assignments")}
                >
                  Assignments
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "portalUsers" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("portalUsers")}
                >
                  Portal users
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "inquiries" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("inquiries")}
                >
                  Inquiries
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

            {renderTabContent()}
          </div>
        )}
      </section>
    </main>
  );
}
