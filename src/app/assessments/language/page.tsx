"use client";

import { useEffect, useMemo, useState } from "react";
import { assessmentQuestions, assessmentLevels, type AssessmentQuestion, type AssessmentLevel } from "@/lib/assessments";
import { languages } from "@/lib/copy";

const SHARED_PASSWORD = process.env.NEXT_PUBLIC_ASSESSMENT_PASSWORD ?? "jb-linguistics-2026";
const STORAGE_KEY_AUTH = "jb_assessment_authorized";
const STORAGE_KEY_SESSION = "jb_assessment_session";
const QUESTION_TARGET = 200;

type Stage = "locked" | "setup" | "testing" | "results";
type AccessMode = "shared" | "code";

type AnswerMap = Record<string, number | null>;

type LevelBreakdown = Record<AssessmentLevel, { correct: number; incorrect: number; unanswered: number; total: number }>;

type SubmissionSummary = {
  totalCorrect: number;
  totalQuestions: number;
  percentage: number;
  breakdown: LevelBreakdown;
};

type AccessMeta = {
  mode: AccessMode;
  code?: string;
  label?: string;
  presetName?: string;
  presetEmail?: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  de: "German",
  nl: "Dutch",
  fr: "French",
  sv: "Swedish",
  es: "Spanish",
  zh: "Mandarin Chinese",
};

const guidelines = [
  "All 200 items are randomized and mixed across CEFR bands so that examinees cannot guess the level.",
  "Each prompt is localized for the test-taker’s preferred UI language. Answer options remain in English to benchmark proficiency.",
  "Timing controls, proctoring, or screen-recording can be layered via your LMS or meeting platform.",
  "Scores are broken down per CEFR level for rapid placement. Results can be emailed automatically to a hiring manager or LMS inbox.",
];

function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getPrompt(question: AssessmentQuestion, lang: string): string {
  if (question.promptByLang?.[lang as keyof typeof question.promptByLang]) {
    return question.promptByLang[lang as keyof typeof question.promptByLang] as string;
  }
  return question.prompt;
}

function getOptions(question: AssessmentQuestion, lang: string): string[] {
  if (question.optionsByLang?.[lang as keyof typeof question.optionsByLang]) {
    return question.optionsByLang[lang as keyof typeof question.optionsByLang] as string[];
  }
  return question.options;
}

function buildInitialBreakdown(): LevelBreakdown {
  return assessmentLevels.reduce((acc, level) => {
    acc[level] = { correct: 0, incorrect: 0, unanswered: 0, total: 0 };
    return acc;
  }, {} as LevelBreakdown);
}

export default function LanguageAssessmentPage() {
  const [authorized, setAuthorized] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(STORAGE_KEY_AUTH) === "1";
  });
  const [accessMode, setAccessMode] = useState<AccessMode>("shared");
  const [passwordInput, setPasswordInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [accessMeta, setAccessMeta] = useState<AccessMeta | null>(null);
  const [stage, setStage] = useState<Stage>(authorized ? "setup" : "locked");
  const [testLanguage, setTestLanguage] = useState<string>(languages[0]);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [proctorEmail, setProctorEmail] = useState("");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [summary, setSummary] = useState<SubmissionSummary | null>(null);
  const [sendState, setSendState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sendMessage, setSendMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [resultsId, setResultsId] = useState<string | null>(null);

  useEffect(() => {
    if (authorized) {
      window.sessionStorage.setItem(STORAGE_KEY_AUTH, "1");
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [authorized]);

  useEffect(() => {
    if (!authorized) return;
    const payload = {
      candidateName,
      candidateEmail,
      proctorEmail,
      testLanguage,
    };
    window.sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(payload));
  }, [authorized, candidateName, candidateEmail, proctorEmail, testLanguage]);

  useEffect(() => {
    if (!authorized) return;
    const cached = window.sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCandidateName(parsed.candidateName ?? "");
        setCandidateEmail(parsed.candidateEmail ?? "");
        setProctorEmail(parsed.proctorEmail ?? "");
        if (parsed.testLanguage) setTestLanguage(parsed.testLanguage);
      } catch (err) {
        console.warn("Unable to parse cached session", err);
      }
    }
  }, [authorized]);

  const handleUnlock = async () => {
    setError(null);
    if (accessMode === "shared") {
      if (passwordInput.trim() !== SHARED_PASSWORD) {
        setError("Incorrect password. Please use the credential shared after contract signature.");
        return;
      }
      setAuthorized(true);
      setStage("setup");
      setAccessMeta({ mode: "shared" });
      return;
    }
    if (!codeInput.trim()) {
      setError("Enter the personal access code provided by JB Linguistics.");
      return;
    }
    try {
      setLoadingCode(true);
      const response = await fetch("/api/assessments/access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput.trim() }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: "Unable to verify access code." }));
        throw new Error(data.message || "Unable to verify access code.");
      }
      const data = await response.json();
      setAccessMeta({ mode: "code", code: data.code, label: data.label, presetName: data.candidateName, presetEmail: data.candidateEmail });
      setCandidateName(data.candidateName ?? "");
      setCandidateEmail(data.candidateEmail ?? "");
      setAuthorized(true);
      setStage("setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify access code.");
    } finally {
      setLoadingCode(false);
    }
  };

  const startTest = () => {
    if (!candidateName.trim()) {
      setError("Please enter the candidate name before starting the test.");
      return;
    }
    if (!proctorEmail.trim()) {
      setError("Enter the email that should receive automated results.");
      return;
    }
    setError(null);
    const shuffled = shuffle(assessmentQuestions);
    const selected = shuffled.slice(0, QUESTION_TARGET);
    const initialAnswers = selected.reduce((acc, question) => {
      acc[question.id] = null;
      return acc;
    }, {} as AnswerMap);
    setQuestions(selected);
    setAnswers(initialAnswers);
    setCurrentIndex(0);
    setSummary(null);
    setStage("testing");
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const unansweredCount = useMemo(() => {
    return questions.filter((q) => answers[q.id] == null).length;
  }, [questions, answers]);

  const submitTest = () => {
    if (questions.length === 0) return;
    const breakdown = buildInitialBreakdown();
    let correct = 0;
    questions.forEach((question) => {
      const response = answers[question.id];
      const bucket = breakdown[question.level];
      bucket.total += 1;
      if (response == null) {
        bucket.unanswered += 1;
        return;
      }
      if (response === question.answerIndex) {
        bucket.correct += 1;
        correct += 1;
      } else {
        bucket.incorrect += 1;
      }
    });
    const total = questions.length;
    setSummary({
      totalCorrect: correct,
      totalQuestions: total,
      percentage: Number(((correct / total) * 100).toFixed(1)),
      breakdown,
    });
    setStage("results");
    setSendState("idle");
    setSendMessage("");
    setResultsId(null);
  };

  const activeQuestion = questions[currentIndex];

  const handleSendResults = async () => {
    if (!summary || sendState === "sending") return;
    setSendState("sending");
    setSendMessage("");
    try {
      const payload = {
        candidateName,
        candidateEmail,
        proctorEmail,
        testLanguage,
        summary,
        responses: questions.map((question) => ({
          id: question.id,
          level: question.level,
          modality: question.modality,
          prompt: question.prompt,
          selectedIndex: answers[question.id],
          correctIndex: question.answerIndex,
          correct: answers[question.id] === question.answerIndex,
        })),
        accessMeta,
      };
      const response = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to send results");
      }
      setSendState("success");
      setSendMessage(data.message || "Results emailed successfully.");
      setResultsId(data.id ?? null);
    } catch (err) {
      setSendState("error");
      setSendMessage(err instanceof Error ? err.message : "Unable to send results right now.");
    }
  };

  const resetForNextCandidate = () => {
    setStage("setup");
    setQuestions([]);
    setAnswers({});
    setSummary(null);
    setSendState("idle");
    setSendMessage("");
    setResultsId(null);
  };

  const progressPercent = questions.length ? Math.round(((questions.length - unansweredCount) / questions.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50 text-slate-900">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold">Assessments</p>
        <h1 className="mt-3 text-4xl font-extrabold text-sky-900">Virtual Placement Test · 200 questions</h1>
        <p className="mt-4 text-base text-slate-700 leading-relaxed">
          Secure, language-aware assessment for CEFR A1–C2. Questions shuffle on every attempt, and examinees can complete the entire
          bank in one sitting with a built-in results export for your LMS or HRIS.
        </p>

        {stage === "locked" && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 max-w-xl">
            <div className="flex gap-3 text-sm font-semibold text-slate-600">
              <button
                className={`px-3 py-1.5 rounded-2xl ${accessMode === "shared" ? "bg-teal-600 text-white" : "bg-slate-100"}`}
                onClick={() => {
                  setAccessMode("shared");
                  setError(null);
                }}
                type="button"
              >
                Shared password
              </button>
              <button
                className={`px-3 py-1.5 rounded-2xl ${accessMode === "code" ? "bg-teal-600 text-white" : "bg-slate-100"}`}
                onClick={() => {
                  setAccessMode("code");
                  setError(null);
                }}
                type="button"
              >
                Personal code
              </button>
            </div>
            {accessMode === "shared" ? (
              <div className="mt-6 space-y-4">
                <label className="text-sm text-slate-700">
                  <span className="block mb-1 font-semibold">Assessment password</span>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleUnlock}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition"
                >
                  Unlock test bank
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <label className="text-sm text-slate-700">
                  <span className="block mb-1 font-semibold">Personal access code</span>
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="e.g. JB-ATL-4829"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </label>
                <button
                  type="button"
                  disabled={loadingCode}
                  onClick={handleUnlock}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition disabled:opacity-60"
                >
                  {loadingCode ? "Verifying…" : "Verify & unlock"}
                </button>
              </div>
            )}
            {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
            <p className="mt-6 text-xs text-slate-500">
              Need access? Request a unique code from the JB Linguistics admin portal so every candidate can sign in without sharing
              global credentials.
            </p>
          </div>
        )}

        {stage !== "locked" && (
          <div className="mt-10 space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-sky-900">Administration settings</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-700">
                  <span className="block mb-1 font-semibold">Candidate name</span>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  <span className="block mb-1 font-semibold">Candidate email (optional)</span>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  <span className="block mb-1 font-semibold">Results email</span>
                  <input
                    type="email"
                    value={proctorEmail}
                    onChange={(e) => setProctorEmail(e.target.value)}
                    placeholder="manager@company.com"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  <span className="block mb-1 font-semibold">Interface language</span>
                  <select
                    value={testLanguage}
                    onChange={(e) => setTestLanguage(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={startTest}
                  className="inline-flex items-center rounded-2xl bg-teal-600 text-white px-5 py-2 text-sm font-semibold hover:bg-teal-500 transition"
                  disabled={stage === "testing"}
                >
                  {stage === "testing" ? "Test in progress" : `Start randomized ${(QUESTION_TARGET).toString()}-item test`}
                </button>
                {stage === "testing" && (
                  <p className="text-xs text-slate-500">Progress saved locally until you submit.</p>
                )}
                {error && <p className="text-xs text-rose-600">{error}</p>}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-sky-900">Guidelines</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {guidelines.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {stage === "testing" && activeQuestion && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-teal-600 font-semibold">Question {currentIndex + 1} / {questions.length}</p>
                    <h3 className="text-2xl font-semibold text-sky-900 mt-1">{getPrompt(activeQuestion, testLanguage)}</h3>
                  </div>
                  <div className="text-sm text-slate-600">
                    Answered {questions.length - unansweredCount}/{questions.length} ({progressPercent}%)
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {getOptions(activeQuestion, testLanguage).map((option, idx) => {
                    const selected = answers[activeQuestion.id] === idx;
                    return (
                      <label
                        key={option}
                        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                          selected ? "border-teal-500 bg-teal-50" : "border-slate-200"
                        }`}
                      >
                        <input
                          type="radio"
                          className="mt-1"
                          name={activeQuestion.id}
                          checked={selected}
                          onChange={() => handleAnswerSelect(activeQuestion.id, idx)}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                    className="rounded-2xl border border-slate-300 px-4 py-2 disabled:opacity-60"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="rounded-2xl border border-slate-300 px-4 py-2 disabled:opacity-60"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={submitTest}
                    className="ml-auto rounded-2xl bg-sky-900 text-white px-5 py-2 font-semibold hover:bg-sky-800"
                    disabled={questions.length === 0}
                  >
                    Submit test
                  </button>
                  <span className="text-xs text-slate-500">Unanswered: {unansweredCount}</span>
                </div>
              </div>
            )}

            {stage === "results" && summary && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold">Summary</p>
                  <h2 className="text-3xl font-bold text-sky-900 mt-1">{summary.percentage}% correct ({summary.totalCorrect} / {summary.totalQuestions})</h2>
                  <p className="text-sm text-slate-600 mt-2">
                    Levels are hidden during the test but shown below for placement. Use the per-band counts to place learners, reroute
                    modules, or trigger compliance retraining.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {assessmentLevels.map((level) => {
                    const bucket = summary.breakdown[level];
                    return (
                      <div key={level} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-sky-900">Level {level}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          {bucket.correct}/{bucket.total}
                        </p>
                        <p className="text-xs text-slate-500">
                          Incorrect {bucket.incorrect} · Unanswered {bucket.unanswered}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSendResults}
                    disabled={sendState === "sending"}
                    className="rounded-2xl bg-teal-600 text-white px-5 py-2 text-sm font-semibold hover:bg-teal-500 transition disabled:opacity-60"
                  >
                    {sendState === "sending" ? "Sending…" : "Email results"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForNextCandidate}
                    className="rounded-2xl border border-slate-300 px-4 py-2 text-sm"
                  >
                    Next candidate
                  </button>
                  {resultsId && <span className="text-xs text-slate-500">Submission ID: {resultsId}</span>}
                  {sendMessage && (
                    <span
                      className={`text-sm ${
                        sendState === "error" ? "text-rose-600" : "text-teal-700"
                      }`}
                    >
                      {sendMessage}
                    </span>
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
