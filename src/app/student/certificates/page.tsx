"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STORAGE_KEY = "jb_student_token";

type Certificate = {
  id: string;
  language: string;
  level: string;
  certificateNumber: string;
  issuedDate: string;
  issuerName?: string;
  valid: boolean;
  pdfPath?: string;
};

const CEFR_LABELS: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Proficiency",
};

export default function StudentCertificatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      router.push("/student/login");
      return;
    }

    fetchCertificates(token);
  }, [router]);

  async function fetchCertificates(token: string) {
    try {
      const res = await fetch("/api/student/certificates", {
        headers: { "x-student-token": token },
      });

      if (res.status === 401) {
        localStorage.removeItem(STORAGE_KEY);
        router.push("/student/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to load certificates.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setCertificates(data.certificates || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load certificates.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold text-white hover:text-teal-400 transition-colors">
              JB Linguistics
            </Link>
            <span className="text-slate-500">/</span>
            <Link href="/student" className="text-slate-400 hover:text-white transition-colors">
              Student Portal
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-white">Certificates</span>
          </div>
          <Link
            href="/student"
            className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">My Certificates</h1>
          <p className="text-slate-400 mt-1">
            View and download your language proficiency certificates.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {certificates.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-xl font-semibold text-white mb-2">No Certificates Yet</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Complete a CEFR level assessment to earn your first certificate.
              Your teacher will assess your progress and issue certificates for each level you achieve.
            </p>
            <Link
              href="/student"
              className="inline-block mt-6 px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
            >
              View My Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className={`bg-gradient-to-br ${
                  cert.valid
                    ? "from-amber-900/30 to-amber-800/20 border-amber-700/50"
                    : "from-slate-800/50 to-slate-700/30 border-slate-600/50"
                } border rounded-xl p-6 relative overflow-hidden`}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent" />

                {/* Certificate Content */}
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🏆</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{cert.language}</h3>
                        <p className="text-amber-300">
                          Level {cert.level} - {CEFR_LABELS[cert.level] || ""}
                        </p>
                      </div>
                    </div>
                    {!cert.valid && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
                        Revoked
                      </span>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Certificate Number</span>
                      <span className="text-white font-mono">{cert.certificateNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Issue Date</span>
                      <span className="text-white">
                        {new Date(cert.issuedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {cert.issuerName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Issued By</span>
                        <span className="text-white">{cert.issuerName}</span>
                      </div>
                    )}
                  </div>

                  {cert.valid && (
                    <div className="mt-6 pt-6 border-t border-amber-700/30 flex gap-3">
                      <button
                        onClick={() => {
                          // TODO: Download PDF
                          alert("PDF download coming soon!");
                        }}
                        className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Download PDF
                      </button>
                      <button
                        onClick={() => {
                          // Copy verification link
                          const url = `${window.location.origin}/verify/${cert.certificateNumber}`;
                          navigator.clipboard.writeText(url);
                          alert("Verification link copied to clipboard!");
                        }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                      >
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CEFR Info */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-4">About CEFR Levels</h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 mb-4">
              The Common European Framework of Reference for Languages (CEFR) is an international
              standard for describing language ability. JB Linguistics certificates are aligned
              with CEFR levels.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(CEFR_LABELS).map(([level, label]) => (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-10 h-10 bg-teal-500/20 text-teal-300 rounded-lg flex items-center justify-center font-bold">
                    {level}
                  </span>
                  <span className="text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
