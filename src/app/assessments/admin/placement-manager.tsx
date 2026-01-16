"use client";

import { useEffect, useState } from "react";

type QuestionStats = {
  cefrLevel: string;
  totalQuestions: number;
  activeQuestions: number;
  avgCorrectRate: number;
};

type Question = {
  id: string;
  language: string;
  cefrLevel: string;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  skillArea?: string;
  topic?: string;
  active: boolean;
  timesShown: number;
  timesCorrect: number;
};

type PlacementTest = {
  id: string;
  guestName?: string;
  guestEmail?: string;
  language: string;
  status: string;
  percentageScore?: number;
  recommendedLevel?: string;
  createdAt: string;
  completedAt?: string;
};

const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "german", label: "German" },
  { id: "french", label: "French" },
  { id: "spanish", label: "Spanish" },
  { id: "italian", label: "Italian" },
  { id: "portuguese", label: "Portuguese" },
  { id: "dutch", label: "Dutch" },
  { id: "russian", label: "Russian" },
  { id: "mandarin", label: "Mandarin" },
  { id: "japanese", label: "Japanese" },
  { id: "korean", label: "Korean" },
  { id: "arabic", label: "Arabic" },
];

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const SKILL_AREAS = ["grammar", "vocabulary", "reading", "listening", "writing"] as const;

export default function PlacementManager({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<"questions" | "tests" | "assign">("questions");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [stats, setStats] = useState<QuestionStats[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<PlacementTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Question form
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    cefrLevel: "A1" as typeof CEFR_LEVELS[number],
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
    skillArea: "grammar" as typeof SKILL_AREAS[number],
    topic: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState("");
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  // Filter state
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [filterSkill, setFilterSkill] = useState<string>("");

  // Assign test form
  const [assignForm, setAssignForm] = useState({
    recipientName: "",
    recipientEmail: "",
    language: "english",
    expirationHours: 48,
    notes: "",
  });
  const [assignResult, setAssignResult] = useState<{
    success: boolean;
    code?: string;
    expiresAt?: string;
    emailSent?: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    loadStats();
  }, [selectedLanguage]);

  useEffect(() => {
    if (activeTab === "questions") {
      loadQuestions();
    } else if (activeTab === "tests") {
      loadTests();
    }
  }, [activeTab, selectedLanguage, filterLevel, filterSkill]);

  async function loadStats() {
    try {
      const res = await fetch(
        `/api/portal/admin/placement/questions?stats=true&language=${selectedLanguage}`,
        { headers: { "x-portal-token": token } }
      );
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || []);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ language: selectedLanguage, limit: "100" });
      if (filterLevel) params.set("level", filterLevel);
      if (filterSkill) params.set("skill", filterSkill);

      const res = await fetch(`/api/portal/admin/placement/questions?${params}`, {
        headers: { "x-portal-token": token },
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (err) {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  async function loadTests() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/portal/admin/placement/tests?language=${selectedLanguage}&limit=50`,
        { headers: { "x-portal-token": token } }
      );
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }
    } catch (err) {
      setError("Failed to load tests");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/portal/admin/placement/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-portal-token": token,
        },
        body: JSON.stringify({
          language: selectedLanguage,
          ...questionForm,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create question");
      }

      setShowQuestionModal(false);
      setQuestionForm({
        cefrLevel: "A1",
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        explanation: "",
        skillArea: "grammar",
        topic: "",
      });
      loadQuestions();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create question");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImport() {
    setSubmitting(true);
    setImportResult(null);

    try {
      // Parse CSV/JSON
      let questions: any[] = [];

      if (importData.trim().startsWith("[")) {
        // JSON format
        questions = JSON.parse(importData);
      } else {
        // CSV format
        const lines = importData.trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx] || "";
          });

          questions.push({
            language: row.language || selectedLanguage,
            cefrLevel: row.level || row.cefrlevel || "A1",
            questionText: row.question || row.questiontext || "",
            optionA: row.optiona || row.a || "",
            optionB: row.optionb || row.b || "",
            optionC: row.optionc || row.c || "",
            optionD: row.optiond || row.d || "",
            correctAnswer: row.correct || row.correctanswer || row.answer || "",
            explanation: row.explanation || "",
            skillArea: row.skill || row.skillarea || "",
            topic: row.topic || "",
          });
        }
      }

      const res = await fetch("/api/portal/admin/placement/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-portal-token": token,
        },
        body: JSON.stringify({ questions }),
      });

      const data = await res.json();
      setImportResult({ imported: data.imported, errors: data.errors || [] });
      loadQuestions();
      loadStats();
    } catch (err) {
      setImportResult({
        imported: 0,
        errors: [err instanceof Error ? err.message : "Invalid data format"],
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleQuestionActive(id: string, currentActive: boolean) {
    try {
      await fetch(`/api/portal/admin/placement/questions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-portal-token": token,
        },
        body: JSON.stringify({ active: !currentActive }),
      });
      loadQuestions();
      loadStats();
    } catch (err) {
      setError("Failed to update question");
    }
  }

  async function handleAssignTest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setAssignResult(null);

    try {
      const res = await fetch("/api/portal/admin/placement/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-portal-token": token,
        },
        body: JSON.stringify(assignForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setAssignResult({ success: false, error: data.message });
      } else {
        setAssignResult({
          success: true,
          code: data.code,
          expiresAt: data.expiresAt,
          emailSent: data.emailSent,
        });
        // Reset form for next assignment
        setAssignForm({
          recipientName: "",
          recipientEmail: "",
          language: assignForm.language,
          expirationHours: 48,
          notes: "",
        });
      }
    } catch (err) {
      setAssignResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to assign test",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const totalQuestions = stats.reduce((sum, s) => sum + s.totalQuestions, 0);
  const activeQuestions = stats.reduce((sum, s) => sum + s.activeQuestions, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Placement Tests</h2>
          <p className="text-sm text-slate-400">
            Manage question bank and view test results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
          <button onClick={() => setError("")} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-sm text-slate-400">Total Questions</div>
          <div className="text-2xl font-bold text-white">{totalQuestions}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-sm text-slate-400">Active Questions</div>
          <div className="text-2xl font-bold text-teal-400">{activeQuestions}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-sm text-slate-400">Target (2000)</div>
          <div className="text-2xl font-bold text-white">
            {Math.round((totalQuestions / 2000) * 100)}%
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-sm text-slate-400">Per Level</div>
          <div className="text-2xl font-bold text-white">~{Math.round(totalQuestions / 6)}</div>
        </div>
      </div>

      {/* Level Breakdown */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Questions by Level</h3>
        <div className="grid grid-cols-6 gap-2">
          {stats.map((s) => (
            <div key={s.cefrLevel} className="text-center">
              <div className="text-sm font-medium text-white">{s.cefrLevel}</div>
              <div className="text-lg font-bold text-teal-400">{s.totalQuestions}</div>
              <div className="text-xs text-slate-500">{s.avgCorrectRate}% correct</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "questions"
              ? "bg-teal-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Question Bank
        </button>
        <button
          onClick={() => setActiveTab("tests")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "tests"
              ? "bg-teal-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Test Results
        </button>
        <button
          onClick={() => setActiveTab("assign")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "assign"
              ? "bg-teal-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Assign Test
        </button>
      </div>

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <>
          {/* Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              >
                <option value="">All Levels</option>
                {CEFR_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              >
                <option value="">All Skills</option>
                {SKILL_AREAS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg"
              >
                Import CSV
              </button>
              <button
                onClick={() => setShowQuestionModal(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>
          </div>

          {/* Questions Table */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading...</div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No questions found. Add or import questions to get started.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Question</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Skill</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Stats</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded font-medium">
                          {q.cefrLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white text-sm max-w-md truncate">{q.questionText}</div>
                        <div className="text-xs text-slate-500">
                          Answer: {q.correctAnswer}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 capitalize">
                        {q.skillArea || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {q.timesShown > 0 ? (
                          <span>
                            {Math.round((q.timesCorrect / q.timesShown) * 100)}% ({q.timesShown})
                          </span>
                        ) : (
                          "No data"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded ${
                            q.active
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {q.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleQuestionActive(q.id, q.active)}
                          className="text-teal-400 hover:text-teal-300 text-sm"
                        >
                          {q.active ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Tests Tab */}
      {activeTab === "tests" && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : tests.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No tests taken yet.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {tests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="text-white">{t.guestName || "Anonymous"}</div>
                      <div className="text-xs text-slate-400">{t.guestEmail || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded ${
                          t.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : t.status === "in_progress"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-slate-600 text-slate-300"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {t.percentageScore != null ? `${t.percentageScore.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {t.recommendedLevel && (
                        <span className="inline-block px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded font-medium">
                          {t.recommendedLevel}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Assign Test Tab */}
      {activeTab === "assign" && (
        <div className="max-w-xl">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Assign Placement Test</h3>
            <p className="text-sm text-slate-400 mb-6">
              Send a placement test to a student or employee. They will receive an email with a unique
              access code that expires in 48 hours.
            </p>

            {assignResult?.success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-emerald-400 font-medium">Test Assigned Successfully!</p>
                    <p className="text-sm text-slate-300 mt-1">
                      Access Code: <span className="font-mono font-bold">{assignResult.code}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Expires: {assignResult.expiresAt && new Date(assignResult.expiresAt).toLocaleString()}
                    </p>
                    {assignResult.emailSent ? (
                      <p className="text-xs text-emerald-400 mt-1">✓ Email sent to recipient</p>
                    ) : (
                      <p className="text-xs text-amber-400 mt-1">⚠ Email could not be sent - share code manually</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {assignResult?.error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{assignResult.error}</p>
              </div>
            )}

            <form onSubmit={handleAssignTest} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={assignForm.recipientName}
                  onChange={(e) => setAssignForm({ ...assignForm, recipientName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Recipient Email *</label>
                <input
                  type="email"
                  value={assignForm.recipientEmail}
                  onChange={(e) => setAssignForm({ ...assignForm, recipientEmail: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Language *</label>
                <select
                  value={assignForm.language}
                  onChange={(e) => setAssignForm({ ...assignForm, language: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Code Expiration</label>
                <select
                  value={assignForm.expirationHours}
                  onChange={(e) => setAssignForm({ ...assignForm, expirationHours: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours (default)</option>
                  <option value={72}>72 hours</option>
                  <option value={168}>1 week</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Notes (optional)</label>
                <textarea
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                  placeholder="Internal notes about this assignment..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !assignForm.recipientEmail}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                {submitting ? "Sending..." : "Send Placement Test"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Add Question</h3>
            </div>

            <form onSubmit={handleCreateQuestion} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">CEFR Level *</label>
                  <select
                    value={questionForm.cefrLevel}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, cefrLevel: e.target.value as typeof CEFR_LEVELS[number] })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    {CEFR_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Skill Area</label>
                  <select
                    value={questionForm.skillArea}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, skillArea: e.target.value as typeof SKILL_AREAS[number] })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    {SKILL_AREAS.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill.charAt(0).toUpperCase() + skill.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Question *</label>
                <textarea
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white h-20"
                  placeholder="Enter the question text..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Option A *</label>
                  <input
                    type="text"
                    value={questionForm.optionA}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionA: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Option B *</label>
                  <input
                    type="text"
                    value={questionForm.optionB}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionB: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Option C</label>
                  <input
                    type="text"
                    value={questionForm.optionC}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionC: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Option D</label>
                  <input
                    type="text"
                    value={questionForm.optionD}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionD: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Correct Answer *</label>
                  <select
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Topic</label>
                  <input
                    type="text"
                    value={questionForm.topic}
                    onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="e.g., verb_tenses, articles"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Explanation</label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white h-16"
                  placeholder="Explain why the answer is correct..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white rounded-lg"
                >
                  {submitting ? "Creating..." : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Import Questions</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Paste CSV or JSON data
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm h-48"
                  placeholder={`CSV format:
level,question,optionA,optionB,optionC,optionD,correct,skill,topic
A1,She ___ a student.,am,is,are,be,B,grammar,verb_to_be

JSON format:
[{"cefrLevel":"A1","questionText":"She ___ a student.","optionA":"am","optionB":"is","optionC":"are","optionD":"be","correctAnswer":"B"}]`}
                />
              </div>

              {importResult && (
                <div
                  className={`p-3 rounded-lg ${
                    importResult.errors.length > 0
                      ? "bg-yellow-500/10 border border-yellow-500/50"
                      : "bg-emerald-500/10 border border-emerald-500/50"
                  }`}
                >
                  <div className="text-sm text-white mb-1">
                    Imported: {importResult.imported} questions
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="text-xs text-red-400">
                      Errors: {importResult.errors.slice(0, 5).join(", ")}
                      {importResult.errors.length > 5 && ` +${importResult.errors.length - 5} more`}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData("");
                    setImportResult(null);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={handleImport}
                  disabled={submitting || !importData.trim()}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white rounded-lg"
                >
                  {submitting ? "Importing..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
