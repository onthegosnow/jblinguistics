"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Admin = {
  id: string;
  email: string;
  name: string;
  role: string;
  mustReset: boolean;
  organizationName?: string;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  contractedHoursPerMonth?: number;
  contractedServices?: string[];
};

type Summary = {
  totalHours: number;
  billableHours: number;
  sessionCount: number;
  estimatedCost?: number;
  hoursRemaining?: number;
};

type Employee = {
  id: string;
  studentId: string;
  studentName?: string;
  department?: string;
  status: string;
  enrollments?: Array<{
    language: string;
    currentLevel: string;
  }>;
};

export default function OrgDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("org_token");
    if (!token) {
      router.push("/org/login");
      return;
    }

    async function loadData() {
      try {
        // Fetch profile and summary in parallel
        const [profileRes, summaryRes, employeesRes] = await Promise.all([
          fetch("/api/org/profile", {
            headers: { "x-org-token": token! },
          }),
          fetch("/api/org/reports?type=summary", {
            headers: { "x-org-token": token! },
          }),
          fetch("/api/org/employees", {
            headers: { "x-org-token": token! },
          }),
        ]);

        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            localStorage.removeItem("org_token");
            localStorage.removeItem("org_admin");
            router.push("/org/login");
            return;
          }
          throw new Error("Failed to load profile");
        }

        const profileData = await profileRes.json();
        setAdmin(profileData.admin);
        setOrganization(profileData.organization);

        if (profileData.admin.mustReset) {
          router.push("/org/reset-password");
          return;
        }

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary(summaryData.summary);
        }

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json();
          setEmployees(employeesData.employees || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleLogout() {
    const token = localStorage.getItem("org_token");
    if (token) {
      await fetch("/api/org/logout", {
        method: "POST",
        headers: { "x-org-token": token },
      });
    }
    localStorage.removeItem("org_token");
    localStorage.removeItem("org_admin");
    router.push("/org/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{organization?.name}</h1>
            <p className="text-sm text-slate-400">Corporate Client Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {admin?.name} ({admin?.role})
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/30 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <Link
              href="/org"
              className="py-3 text-sm font-medium text-teal-400 border-b-2 border-teal-400"
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
              className="py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent"
            >
              Reports
            </Link>
            {organization?.contractedServices?.some((s) =>
              ["translation", "interpretation", "localization"].includes(s)
            ) && (
              <Link
                href="/org/services"
                className="py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent"
              >
                Services
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-1">This Month</div>
            <div className="text-3xl font-bold text-white">{summary?.billableHours || 0}</div>
            <div className="text-sm text-slate-400">Billable Hours</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-1">Contract</div>
            <div className="text-3xl font-bold text-white">
              {organization?.contractedHoursPerMonth || "—"}
            </div>
            <div className="text-sm text-slate-400">Hours/Month</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-1">Remaining</div>
            <div
              className={`text-3xl font-bold ${
                summary?.hoursRemaining && summary.hoursRemaining < 0
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              {summary?.hoursRemaining?.toFixed(1) || "—"}
            </div>
            <div className="text-sm text-slate-400">Hours Available</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-1">Sessions</div>
            <div className="text-3xl font-bold text-white">{summary?.sessionCount || 0}</div>
            <div className="text-sm text-slate-400">This Month</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Employees */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Active Employees</h2>
              <Link href="/org/employees" className="text-sm text-teal-400 hover:text-teal-300">
                View All
              </Link>
            </div>

            {employees.length === 0 ? (
              <p className="text-slate-400 text-sm">No employees enrolled yet.</p>
            ) : (
              <div className="space-y-3">
                {employees.slice(0, 5).map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                  >
                    <div>
                      <div className="text-white font-medium">{emp.studentName}</div>
                      <div className="text-sm text-slate-400">{emp.department || "—"}</div>
                    </div>
                    <div className="text-right">
                      {emp.enrollments?.map((e, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded ml-1"
                        >
                          {e.language} ({e.currentLevel})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contract Services */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Contract Services</h2>

            <div className="space-y-3">
              {organization?.contractedServices?.map((service) => (
                <div
                  key={service}
                  className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                      {service === "language_training" && (
                        <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {service === "translation" && (
                        <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      )}
                      {service === "interpretation" && (
                        <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                      {service === "localization" && (
                        <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-white capitalize">{service.replace(/_/g, " ")}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                    Active
                  </span>
                </div>
              ))}

              {!organization?.contractedServices?.length && (
                <p className="text-slate-400 text-sm">No services contracted.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
