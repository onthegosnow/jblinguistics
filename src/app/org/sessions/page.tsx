"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Session = {
  id: string;
  studentId: string;
  studentName?: string;
  teacherId?: string;
  teacherName?: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  sessionType: string;
  topicsCovered?: string;
  status: string;
  approvedByTeacher: boolean;
  approvedByOrg?: boolean;
  billable: boolean;
};

export default function OrgSessionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("org_token");
    if (!token) {
      router.push("/org/login");
      return;
    }

    async function loadSessions() {
      try {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
        if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }

        const res = await fetch(`/api/org/sessions?${params}`, {
          headers: { "x-org-token": token! },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("org_token");
            router.push("/org/login");
            return;
          }
          throw new Error("Failed to load sessions");
        }

        const data = await res.json();
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, [router, dateRange, statusFilter]);

  const totalHours = sessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60;
  const billableHours =
    sessions.filter((s) => s.billable && s.status === "completed").reduce((sum, s) => sum + s.durationMinutes, 0) / 60;

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
            <h1 className="text-xl font-bold text-white">Training Sessions</h1>
            <p className="text-sm text-slate-400">View and approve training sessions</p>
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
              className="py-3 text-sm font-medium text-teal-400 border-b-2 border-teal-400"
            >
              Training Sessions
            </Link>
            <Link
              href="/org/reports"
              className="py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent"
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

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((d) => ({ ...d, startDate: e.target.value }))}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((d) => ({ ...d, endDate: e.target.value }))}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-sm text-slate-400">Total Sessions</div>
            <div className="text-2xl font-bold text-white">{sessions.length}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-sm text-slate-400">Total Hours</div>
            <div className="text-2xl font-bold text-white">{totalHours.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-sm text-slate-400">Billable Hours</div>
            <div className="text-2xl font-bold text-teal-400">{billableHours.toFixed(1)}</div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No sessions found for this period.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Teacher</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="text-white">
                        {new Date(session.sessionDate).toLocaleDateString()}
                      </div>
                      {session.startTime && (
                        <div className="text-sm text-slate-400">
                          {session.startTime} - {session.endTime}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white">{session.studentName || "—"}</td>
                    <td className="px-4 py-3 text-white">{session.teacherName || "—"}</td>
                    <td className="px-4 py-3 text-white">
                      {session.durationMinutes} min
                      <span className="text-slate-400 text-sm">
                        {" "}
                        ({(session.durationMinutes / 60).toFixed(1)} hrs)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 bg-slate-600 text-slate-300 text-xs rounded capitalize">
                        {session.sessionType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded ${
                          session.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : session.status === "scheduled"
                            ? "bg-blue-500/20 text-blue-400"
                            : session.status === "cancelled"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            session.approvedByTeacher ? "bg-emerald-400" : "bg-slate-500"
                          }`}
                          title="Teacher"
                        />
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            session.approvedByOrg === true
                              ? "bg-emerald-400"
                              : session.approvedByOrg === false
                              ? "bg-red-400"
                              : "bg-slate-500"
                          }`}
                          title="Organization"
                        />
                        <span className="text-xs text-slate-400">
                          {session.approvedByOrg === true
                            ? "Approved"
                            : session.approvedByOrg === false
                            ? "Disputed"
                            : "Pending"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
