"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STORAGE_KEY = "jb_student_token";

type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
};

type Enrollment = {
  id: string;
  language: string;
  currentLevel: string;
  targetLevel?: string;
  teacherName?: string;
  status: string;
  startDate?: string;
};

type Progress = {
  id: string;
  language: string;
  level: string;
  completedAt?: string;
  assessorName?: string;
  assessmentScore?: number;
};

type Certificate = {
  id: string;
  language: string;
  level: string;
  certificateNumber: string;
  issuedDate: string;
  valid: boolean;
};

const CEFR_LABELS: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Proficiency",
};

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      router.push("/student/login");
      return;
    }

    fetchProfile(token);
  }, [router]);

  async function fetchProfile(token: string) {
    try {
      const res = await fetch("/api/student/profile", {
        headers: { "x-student-token": token },
      });

      if (res.status === 401) {
        localStorage.removeItem(STORAGE_KEY);
        router.push("/student/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to load profile.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setStudent(data.student);
      setEnrollments(data.enrollments || []);
      setProgress(data.progress || []);
      setCertificates(data.certificates || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load profile.");
      setLoading(false);
    }
  }

  async function handleLogout() {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      await fetch("/api/student/logout", {
        method: "POST",
        headers: { "x-student-token": token },
      }).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    router.push("/student/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-red-200 max-w-md">
          <p>{error}</p>
          <button
            onClick={() => router.push("/student/login")}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const completedEnrollments = enrollments.filter((e) => e.status === "completed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-xl font-bold text-white hover:text-teal-400 transition-colors">
              JB Linguistics
            </Link>
            <span className="text-slate-500 ml-2">/ Student Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">{student?.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {student?.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-400 mt-1">
            Track your language learning progress and certificates.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl font-bold text-teal-400">{activeEnrollments.length}</div>
            <div className="text-slate-400 mt-1">Active Courses</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl font-bold text-emerald-400">{progress.length}</div>
            <div className="text-slate-400 mt-1">Levels Completed</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl font-bold text-amber-400">{certificates.length}</div>
            <div className="text-slate-400 mt-1">Certificates Earned</div>
          </div>
        </div>

        {/* Active Enrollments */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Active Courses</h2>
          {activeEnrollments.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-slate-400">
              No active courses. Contact your administrator to enroll.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{enrollment.language}</h3>
                      <p className="text-slate-400 text-sm">
                        {enrollment.teacherName ? `with ${enrollment.teacherName}` : "Teacher not assigned"}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-sm rounded-full">
                      {enrollment.currentLevel}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Current Level</span>
                      <span className="text-white">
                        {enrollment.currentLevel} - {CEFR_LABELS[enrollment.currentLevel] || ""}
                      </span>
                    </div>
                    {enrollment.targetLevel && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-slate-400">Target Level</span>
                        <span className="text-white">
                          {enrollment.targetLevel} - {CEFR_LABELS[enrollment.targetLevel] || ""}
                        </span>
                      </div>
                    )}
                    {enrollment.startDate && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-slate-400">Started</span>
                        <span className="text-white">
                          {new Date(enrollment.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                        style={{
                          width: `${((["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(enrollment.currentLevel) + 1) / 6) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>A1</span>
                      <span>A2</span>
                      <span>B1</span>
                      <span>B2</span>
                      <span>C1</span>
                      <span>C2</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Certificates */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">My Certificates</h2>
            {certificates.length > 0 && (
              <Link
                href="/student/certificates"
                className="text-teal-400 hover:text-teal-300 text-sm"
              >
                View All &rarr;
              </Link>
            )}
          </div>
          {certificates.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-slate-400">
              No certificates yet. Complete a level to earn your first certificate!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.slice(0, 3).map((cert) => (
                <div
                  key={cert.id}
                  className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{cert.language}</h3>
                      <p className="text-amber-300 text-sm">Level {cert.level}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-700/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Certificate #</span>
                      <span className="text-white font-mono text-xs">{cert.certificateNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-slate-400">Issued</span>
                      <span className="text-white">
                        {new Date(cert.issuedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Progress */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Progress History</h2>
          {progress.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-slate-400">
              No progress recorded yet. Keep learning!
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Assessed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {progress.slice(0, 10).map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 text-white">{p.language}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-teal-500/20 text-teal-300 text-sm rounded">
                          {p.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {p.assessmentScore !== undefined ? `${p.assessmentScore}%` : "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{p.assessorName || "-"}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {p.completedAt
                          ? new Date(p.completedAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
