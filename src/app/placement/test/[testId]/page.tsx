"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Question = {
  id: string;
  questionText: string;
  questionType: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  cefrLevel: string;
};

type TestState = {
  status: "not_started" | "in_progress" | "completed";
  questionCount: number;
  currentQuestionIndex: number;
  timeLimitMinutes: number;
  startedAt?: string;
};

type QuestionState = {
  questionOrder: number;
  totalQuestions: number;
  question: Question;
  selectedAnswer?: string;
  flaggedForReview: boolean;
  timeRemainingMinutes: number;
};

type Results = {
  totalCorrect: number;
  totalAnswered: number;
  percentageScore: number;
  scoreA1: number;
  scoreA2: number;
  scoreB1: number;
  scoreB2: number;
  scoreC1: number;
  scoreC2: number;
  recommendedLevel: string;
};

const CEFR_LABELS: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Proficiency",
};

export default function PlacementTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [testState, setTestState] = useState<TestState | null>(null);
  const [questionState, setQuestionState] = useState<QuestionState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Load test status
  const loadTestStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/placement/${testId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load test.");
        return null;
      }

      setTestState(data);

      if (data.status === "completed") {
        setResults({
          totalCorrect: data.totalCorrect,
          totalAnswered: data.totalAnswered,
          percentageScore: data.percentageScore,
          scoreA1: data.scoreA1,
          scoreA2: data.scoreA2,
          scoreB1: data.scoreB1,
          scoreB2: data.scoreB2,
          scoreC1: data.scoreC1,
          scoreC2: data.scoreC2,
          recommendedLevel: data.recommendedLevel || data.finalLevel,
        });
      }

      return data;
    } catch (err) {
      setError("Network error. Please try again.");
      return null;
    }
  }, [testId]);

  // Load a specific question
  const loadQuestion = useCallback(async (order: number) => {
    try {
      const res = await fetch(`/api/placement/${testId}/question/${order}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load question.");
        return;
      }

      setQuestionState(data);
      setSelectedAnswer(data.selectedAnswer || "");
      setTimeRemaining(Math.floor(data.timeRemainingMinutes * 60));
    } catch (err) {
      setError("Network error. Please try again.");
    }
  }, [testId]);

  // Start the test
  async function startTest() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/placement/${testId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to start test.");
        setSubmitting(false);
        return;
      }

      // Load first question
      await loadTestStatus();
      await loadQuestion(1);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Submit answer
  async function submitAnswer() {
    if (!selectedAnswer || !questionState) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/placement/${testId}/question/${questionState.questionOrder}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: selectedAnswer }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to submit answer.");
        setSubmitting(false);
        return;
      }

      if (data.nextQuestion) {
        await loadQuestion(data.nextQuestion);
      } else {
        // Test complete - submit for scoring
        await completeTest();
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Complete the test
  async function completeTest() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/placement/${testId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to complete test.");
        return;
      }

      setResults({
        totalCorrect: data.totalCorrect,
        totalAnswered: data.totalAnswered,
        percentageScore: data.percentageScore,
        scoreA1: data.scoreA1,
        scoreA2: data.scoreA2,
        scoreB1: data.scoreB1,
        scoreB2: data.scoreB2,
        scoreC1: data.scoreC1,
        scoreC2: data.scoreC2,
        recommendedLevel: data.recommendedLevel,
      });
      setTestState((prev) => prev ? { ...prev, status: "completed" } : null);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Navigate to a specific question
  async function goToQuestion(order: number) {
    if (order < 1 || order > (testState?.questionCount || 200)) return;
    await loadQuestion(order);
  }

  // Initial load
  useEffect(() => {
    async function init() {
      const status = await loadTestStatus();
      if (status?.status === "in_progress") {
        await loadQuestion(status.currentQuestionIndex || 1);
      }
      setLoading(false);
    }
    init();
  }, [loadTestStatus, loadQuestion]);

  // Timer
  useEffect(() => {
    if (testState?.status !== "in_progress") return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          completeTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testState?.status]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading test...</div>
      </div>
    );
  }

  // Results view
  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="bg-slate-800/50 border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/" className="text-xl font-bold text-white">
              JB Linguistics
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-teal-400">{results.recommendedLevel}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Test Complete!</h1>
            <p className="text-slate-400">
              Your recommended level is{" "}
              <span className="text-teal-400 font-semibold">
                {results.recommendedLevel} - {CEFR_LABELS[results.recommendedLevel]}
              </span>
            </p>
          </div>

          {/* Overall Score */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Overall Results</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-white">{results.totalCorrect}</div>
                <div className="text-sm text-slate-400">Correct Answers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{results.totalAnswered}</div>
                <div className="text-sm text-slate-400">Questions Answered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-400">{results.percentageScore.toFixed(1)}%</div>
                <div className="text-sm text-slate-400">Overall Score</div>
              </div>
            </div>
          </div>

          {/* Level Breakdown */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Score by Level</h2>
            <div className="space-y-3">
              {[
                { level: "A1", score: results.scoreA1 },
                { level: "A2", score: results.scoreA2 },
                { level: "B1", score: results.scoreB1 },
                { level: "B2", score: results.scoreB2 },
                { level: "C1", score: results.scoreC1 },
                { level: "C2", score: results.scoreC2 },
              ].map(({ level, score }) => (
                <div key={level} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-slate-300">{level}</div>
                  <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        score >= 70 ? "bg-teal-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm text-slate-300">{score.toFixed(1)}%</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              70% or higher indicates proficiency at that level
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Link
              href="/placement"
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
            >
              Take Another Test
            </Link>
            <Link
              href="/student/login"
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
            >
              Register for Classes
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Not started view
  if (testState?.status === "not_started") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="bg-slate-800/50 border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/" className="text-xl font-bold text-white">
              JB Linguistics
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Ready to Begin</h1>
            <p className="text-slate-400 mb-6">
              You have {testState.timeLimitMinutes} minutes to complete {testState.questionCount} questions.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={startTest}
              disabled={submitting}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              {submitting ? "Starting..." : "Start Test"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // In progress view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header with timer */}
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-white font-medium">
            Question {questionState?.questionOrder || 1} of {testState?.questionCount || 200}
          </div>
          <div className={`font-mono text-lg ${timeRemaining < 300 ? "text-red-400" : "text-teal-400"}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-700">
          <div
            className="h-full bg-teal-500 transition-all"
            style={{
              width: `${((questionState?.questionOrder || 1) / (testState?.questionCount || 200)) * 100}%`,
            }}
          />
        </div>
      </header>

      {/* Question content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
            <button onClick={() => setError("")} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        {questionState && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            {/* Level badge */}
            <div className="mb-4">
              <span className="inline-block px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                Level: {questionState.question.cefrLevel}
              </span>
            </div>

            {/* Question text */}
            <h2 className="text-xl text-white mb-6 leading-relaxed">
              {questionState.question.questionText}
            </h2>

            {/* Answer options */}
            <div className="space-y-3">
              {["A", "B", "C", "D"].map((option) => {
                const optionText =
                  option === "A"
                    ? questionState.question.optionA
                    : option === "B"
                    ? questionState.question.optionB
                    : option === "C"
                    ? questionState.question.optionC
                    : questionState.question.optionD;

                if (!optionText) return null;

                return (
                  <button
                    key={option}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      selectedAnswer === option
                        ? "bg-teal-500/20 border-teal-500 text-white"
                        : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <span className="font-semibold mr-3">{option}.</span>
                    {optionText}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => goToQuestion((questionState?.questionOrder || 1) - 1)}
            disabled={questionState?.questionOrder === 1}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {questionState?.questionOrder === testState?.questionCount ? (
              <button
                onClick={completeTest}
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-medium rounded-lg"
              >
                {submitting ? "Submitting..." : "Finish Test"}
              </button>
            ) : (
              <button
                onClick={submitAnswer}
                disabled={!selectedAnswer || submitting}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white font-medium rounded-lg"
              >
                {submitting ? "Saving..." : "Next Question"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
