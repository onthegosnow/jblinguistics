"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Summary = {
  totalHours: number;
  billableHours: number;
  sessionCount: number;
  estimatedCost?: number;
  hoursRemaining?: number;
  byStudent: Array<{
    studentId: string;
    studentName: string;
    hours: number;
    sessions: number;
  }>;
  byTeacher: Array<{
    teacherId: string;
    teacherName: string;
    hours: number;
    sessions: number;
  }>;
};

type Contract = {
  hoursPerMonth?: number;
  billingRate?: number;
};

export default function OrgReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [period, setPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  });
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("org_token");
    if (!token) {
      router.push("/org/login");
      return;
    }

    async function loadReport() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          type: "summary",
          startDate: period.startDate,
          endDate: period.endDate,
        });

        const res = await fetch(`/api/org/reports?${params}`, {
          headers: { "x-org-token": token! },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("org_token");
            router.push("/org/login");
            return;
          }
          throw new Error("Failed to load report");
        }

        const data = await res.json();
        setSummary(data.summary);
        setContract(data.contract);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [router, period]);

  async function handleExport() {
    const token = localStorage.getItem("org_token");
    if (!token) return;

    setExporting(true);
    try {
      const params = new URLSearchParams({
        startDate: period.startDate,
        endDate: period.endDate,
      });

      const res = await fetch(`/api/org/reports/export?${params}`, {
        headers: { "x-org-token": token },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `training-hours-${period.startDate}-to-${period.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  // Quick period selectors
  function setQuickPeriod(type: "this_month" | "last_month" | "this_quarter" | "this_year") {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (type) {
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "this_quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
    }

    setPeriod({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Reports</h1>
            <p className="text-sm text-slate-400">Training hours and audit reports</p>
          </div>
          <Link
            href="/org"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/30 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <Link
              href="/org"
              className="py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent"
            >
              Dashboard
            </Link>
            <Link
              href="/org/employees"
              className="py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent"
            >
              Employees
            </Link>
            <Link
              href="/org/sessions"
              className="py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent"
            >
              Training Sessions
            </Link>
            <Link
              href="/org/reports"
              className="py-3 text-sm font-medium text-teal-400 border-b-2 border-teal-400"
            >
              Reports
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Period Selection */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Report Period</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setQuickPeriod("this_month")}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded"
            >
              This Month
            </button>
            <button
              onClick={() => setQuickPeriod("last_month")}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded"
            >
              Last Month
            </button>
            <button
              onClick={() => setQuickPeriod("this_quarter")}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded"
            >
              This Quarter
            </button>
            <button
              onClick={() => setQuickPeriod("this_year")}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded"
            >
              This Year
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={period.startDate}
                onChange={(e) => setPeriod((p) => ({ ...p, startDate: e.target.value }))}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={period.endDate}
                onChange={(e) => setPeriod((p) => ({ ...p, endDate: e.target.value }))}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white rounded-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-1">Total Sessions</div>
            <div className="text-3xl font-bold text-white">{summary?.sessionCount || 0}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-1">Total Hours</div>
            <div className="text-3xl font-bold text-white">{summary?.totalHours?.toFixed(1) || 0}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-1">Billable Hours</div>
            <div className="text-3xl font-bold text-teal-400">
              {summary?.billableHours?.toFixed(1) || 0}
            </div>
          </div>
          {summary?.estimatedCost !== null && summary?.estimatedCost !== undefined && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="text-sm text-slate-400 mb-1">Estimated Cost</div>
              <div className="text-3xl font-bold text-white">
                ${summary.estimatedCost.toLocaleString()}
              </div>
              {contract?.billingRate && (
                <div className="text-xs text-slate-500">@ ${contract.billingRate}/hr</div>
              )}
            </div>
          )}
        </div>

        {/* Breakdown Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Student */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Hours by Student</h3>
            {!summary?.byStudent?.length ? (
              <p className="text-slate-400 text-sm">No data for this period.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-slate-400 border-b border-slate-700">
                    <th className="text-left pb-2">Student</th>
                    <th className="text-right pb-2">Sessions</th>
                    <th className="text-right pb-2">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byStudent.map((s) => (
                    <tr key={s.studentId} className="border-b border-slate-700/50">
                      <td className="py-2 text-white">{s.studentName}</td>
                      <td className="py-2 text-right text-slate-300">{s.sessions}</td>
                      <td className="py-2 text-right text-teal-400 font-medium">{s.hours.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* By Teacher */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Hours by Teacher</h3>
            {!summary?.byTeacher?.length ? (
              <p className="text-slate-400 text-sm">No data for this period.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-slate-400 border-b border-slate-700">
                    <th className="text-left pb-2">Teacher</th>
                    <th className="text-right pb-2">Sessions</th>
                    <th className="text-right pb-2">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byTeacher.map((t) => (
                    <tr key={t.teacherId} className="border-b border-slate-700/50">
                      <td className="py-2 text-white">{t.teacherName}</td>
                      <td className="py-2 text-right text-slate-300">{t.sessions}</td>
                      <td className="py-2 text-right text-teal-400 font-medium">{t.hours.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
