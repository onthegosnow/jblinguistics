"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PlacementTestStartPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    accessCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeVerified, setCodeVerified] = useState<{
    valid: boolean;
    language?: string;
    label?: string;
  } | null>(null);

  // Auto-fill code from URL parameter
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam && !formData.accessCode) {
      setFormData((prev) => ({ ...prev, accessCode: codeParam.toUpperCase() }));
    }
  }, [searchParams, formData.accessCode]);

  async function verifyCode() {
    if (!formData.accessCode || formData.accessCode.length < 4) {
      setError("Please enter a valid access code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/placement/verify-code?code=${formData.accessCode}`);
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.message || "Invalid access code.");
        setCodeVerified(null);
        setLoading(false);
        return;
      }

      setCodeVerified({
        valid: true,
        language: data.language,
        label: data.label,
      });
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/placement/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || undefined,
          accessCode: formData.accessCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to start test.");
        setLoading(false);
        return;
      }

      // Store test info and redirect
      localStorage.setItem("placement_test_id", data.testId);
      localStorage.setItem("placement_test_name", formData.name);
      router.push(`/placement/test/${data.testId}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const languageLabels: Record<string, string> = {
    english: "English",
    german: "German",
    french: "French",
    spanish: "Spanish",
    italian: "Italian",
    portuguese: "Portuguese",
    dutch: "Dutch",
    russian: "Russian",
    mandarin: "Mandarin Chinese",
    japanese: "Japanese",
    korean: "Korean",
    arabic: "Arabic",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-white">
            JB Linguistics
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Language Placement Test</h1>
          <p className="text-slate-400">
            Take our placement test to determine your current language proficiency level (A1-C2)
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-teal-400">200</div>
            <div className="text-sm text-slate-400">Questions</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-teal-400">2 hrs</div>
            <div className="text-sm text-slate-400">Time Limit</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-teal-400">A1-C2</div>
            <div className="text-sm text-slate-400">CEFR Levels</div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Enter Your Access Code</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {!codeVerified ? (
            // Step 1: Enter access code
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Access Code *
                </label>
                <input
                  type="text"
                  value={formData.accessCode}
                  onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-lg tracking-widest text-center"
                  placeholder="ENTER CODE"
                  maxLength={12}
                />
                <p className="text-xs text-slate-500 mt-1 text-center">
                  Enter the access code provided by your employer, school, or JB Linguistics
                </p>
              </div>

              <button
                type="button"
                onClick={verifyCode}
                disabled={loading || formData.accessCode.length < 4}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <p className="text-center text-sm text-slate-500 mt-4">
                Don't have an access code?{" "}
                <Link href="/inquiries" className="text-teal-400 hover:text-teal-300 underline">
                  Contact us
                </Link>
              </p>
            </div>
          ) : (
            // Step 2: Enter name and start test
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Show verified code info */}
              <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Access Code Verified</p>
                    <p className="text-lg font-semibold text-white">
                      {languageLabels[codeVerified.language || ""] || codeVerified.language} Placement Test
                    </p>
                    {codeVerified.label && (
                      <p className="text-sm text-slate-400">{codeVerified.label}</p>
                    )}
                  </div>
                  <div className="text-teal-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-slate-500 mt-1">
                  We'll send your results to this email
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCodeVerified(null);
                    setFormData({ ...formData, accessCode: "" });
                  }}
                  className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name}
                  className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? "Starting Test..." : "Begin Placement Test"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Test Instructions</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-teal-400">•</span>
              The test contains 200 multiple-choice questions across all CEFR levels (A1-C2)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400">•</span>
              You have 2 hours to complete the test
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400">•</span>
              Answer all questions - there is no penalty for guessing
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400">•</span>
              You can navigate between questions and flag them for review
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400">•</span>
              Your progress is saved automatically - you can continue later if needed
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400">•</span>
              You may only attempt this test once per access code
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default function PlacementTestStartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading...</div>
        </div>
      }
    >
      <PlacementTestStartPageInner />
    </Suspense>
  );
}
