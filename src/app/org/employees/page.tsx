"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Employee = {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  allocatedHoursPerMonth?: number;
  status: string;
  startDate?: string;
  enrollments?: Array<{
    id: string;
    language: string;
    currentLevel: string;
    status: string;
    teacherName?: string;
  }>;
};

export default function OrgEmployeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "on_leave" | "terminated">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("org_token");
    if (!token) {
      router.push("/org/login");
      return;
    }

    async function loadEmployees() {
      try {
        const res = await fetch("/api/org/employees", {
          headers: { "x-org-token": token! },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("org_token");
            router.push("/org/login");
            return;
          }
          throw new Error("Failed to load employees");
        }

        const data = await res.json();
        setEmployees(data.employees || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load employees");
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, [router]);

  const filteredEmployees =
    filter === "all" ? employees : employees.filter((e) => e.status === filter);

  const statusCounts = {
    all: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    on_leave: employees.filter((e) => e.status === "on_leave").length,
    terminated: employees.filter((e) => e.status === "terminated").length,
  };

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
            <h1 className="text-xl font-bold text-white">Employees</h1>
            <p className="text-sm text-slate-400">Manage enrolled employees</p>
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
              className="py-3 text-sm font-medium text-teal-400 border-b-2 border-teal-400"
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
        <div className="flex gap-2 mb-6">
          {(["all", "active", "on_leave", "terminated"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-teal-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {status === "all"
                ? "All"
                : status === "on_leave"
                ? "On Leave"
                : status.charAt(0).toUpperCase() + status.slice(1)}{" "}
              ({statusCounts[status]})
            </button>
          ))}
        </div>

        {/* Employee List */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          {filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No employees found.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                    Enrollments
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                    Allocated Hours
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{emp.studentName}</div>
                      <div className="text-sm text-slate-400">{emp.studentEmail}</div>
                      {emp.employeeId && (
                        <div className="text-xs text-slate-500">ID: {emp.employeeId}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">{emp.department || "—"}</div>
                      <div className="text-sm text-slate-400">{emp.jobTitle || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {emp.enrollments?.map((e, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded"
                          >
                            {e.language} ({e.currentLevel})
                          </span>
                        ))}
                        {!emp.enrollments?.length && (
                          <span className="text-slate-500 text-sm">No enrollments</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {emp.allocatedHoursPerMonth || "—"} hrs/mo
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded ${
                          emp.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : emp.status === "on_leave"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {emp.status === "on_leave" ? "On Leave" : emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/org/employees/${emp.id}`}
                        className="text-teal-400 hover:text-teal-300 text-sm"
                      >
                        View
                      </Link>
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
