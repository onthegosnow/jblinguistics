"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "jb_portal_token";

type AssignmentSummary = {
  assignment: {
    id: string;
    title: string;
    assignmentType: "class" | "translation";
    client?: string;
    languagePair?: string;
    hoursAssigned: number;
    startDate?: string;
    dueDate?: string;
    status: "assigned" | "in_progress" | "submitted" | "completed";
    participants: string[];
  };
  hoursLogged: number;
  hoursRemaining: number;
  attendanceSummary: Array<{ name: string; attended: number; total: number; rate: number }>;
  timeEntriesCount: number;
  attendanceSessions: number;
  uploads: Array<{ id: string; filename: string; uploadedAt: string; size: number; category: string }>;
};

type AssignmentDetail = {
  assignment: AssignmentSummary["assignment"];
  hoursLogged: number;
  hoursRemaining: number;
  timeEntries: Array<{
    id: string;
    date: string;
    hours: number;
    notes?: string;
    issues?: string;
    extraHoursRequested?: boolean;
    extraHoursNote?: string;
  }>;
  attendanceRecords: Array<{
    id: string;
    sessionDate: string;
    sessionLabel?: string;
    participants: Array<{ name: string; attended: boolean; notes?: string }>;
  }>;
  attendanceSummary: AssignmentSummary["attendanceSummary"];
  uploads: Array<{ id: string; filename: string; uploadedAt: string; size: number; category: string }>;
};

export default function PortalPage() {
  const [token, setToken] = useState(() => (typeof window === "undefined" ? "" : window.sessionStorage.getItem(STORAGE_KEY) ?? ""));
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [hourForm, setHourForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    hours: 1,
    notes: "",
    issues: "",
    extraHoursRequested: false,
    extraHoursNote: "",
  });
  const [attendanceForm, setAttendanceForm] = useState<{
    sessionDate: string;
    sessionLabel: string;
    rows: Array<{ name: string; attended: boolean; notes: string }>;
  }>({ sessionDate: new Date().toISOString().slice(0, 10), sessionLabel: "", rows: [] });
  const [uploadState, setUploadState] = useState<{ file: File | null; category: "original" | "final" | "worksheet" | "support" }>({
    file: null,
    category: "support",
  });
  const [reportMonth, setReportMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const hasAssignments = assignments.length > 0;

  const activeAssignmentSummary = useMemo(
    () => assignments.find((item) => item.assignment.id === selectedId) ?? assignments[0],
    [assignments, selectedId]
  );

  const loadAssignments = useCallback(
    async (existingToken?: string) => {
      const auth = existingToken ?? token;
      if (!auth) return;
      setLoading(true);
      try {
        const response = await fetch("/api/portal/assignments", { headers: { "x-portal-token": auth } });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Unable to load assignments.");
        }
        const data = await response.json();
        setUser(data.user);
        setAssignments(data.assignments ?? []);
        if (!selectedId && data.assignments?.length) {
          setSelectedId(data.assignments[0].assignment.id);
        }
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : "Unable to load portal data.");
      } finally {
        setLoading(false);
      }
    },
    [token, selectedId]
  );

  const loadDetail = useCallback(
    async (assignmentId: string) => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/portal/assignments/${assignmentId}`, { headers: { "x-portal-token": token } });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Unable to load assignment.");
        }
        const payload: AssignmentDetail = await response.json();
        setDetail(payload);
        setAttendanceForm({
          sessionDate: new Date().toISOString().slice(0, 10),
          sessionLabel: "",
          rows: payload.assignment.participants.map((name) => ({
            name,
            attended: true,
            notes: "",
          })),
        });
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : "Unable to load assignment.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEY, token);
      void loadAssignments(token);
    }
  }, [token, loadAssignments]);

  useEffect(() => {
    if (selectedId) {
      void loadDetail(selectedId);
    }
  }, [selectedId, loadDetail]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    try {
      const response = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Invalid credentials.");
      }
      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      setLoginForm({ email: "", password: "" });
      await loadAssignments(data.token);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Unable to log in.");
    }
  };

  const handleLogout = async () => {
    if (!token) return;
    await fetch("/api/portal/logout", { method: "POST", headers: { "x-portal-token": token } }).catch(() => null);
    setToken("");
    setUser(null);
    setAssignments([]);
    setDetail(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const submitHours = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !activeAssignmentSummary) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/portal/assignments/${activeAssignmentSummary.assignment.id}/time-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-token": token },
        body: JSON.stringify(hourForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to save hours.");
      }
      const payload: AssignmentDetail = await response.json();
      setDetail(payload);
      setHourForm({
        date: new Date().toISOString().slice(0, 10),
        hours: 1,
        notes: "",
        issues: "",
        extraHoursRequested: false,
        extraHoursNote: "",
      });
      await loadAssignments();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Unable to save hours.");
    } finally {
      setLoading(false);
    }
  };

  const submitAttendance = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !activeAssignmentSummary) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/portal/assignments/${activeAssignmentSummary.assignment.id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-token": token },
        body: JSON.stringify({
          sessionDate: attendanceForm.sessionDate,
          sessionLabel: attendanceForm.sessionLabel,
          participants: attendanceForm.rows,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to save attendance.");
      }
      const payload: AssignmentDetail = await response.json();
      setDetail(payload);
      setAttendanceForm({
        sessionDate: new Date().toISOString().slice(0, 10),
        sessionLabel: "",
        rows: payload.assignment.participants.map((name) => ({ name, attended: true, notes: "" })),
      });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Unable to save attendance.");
    } finally {
      setLoading(false);
    }
  };

  const submitUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !activeAssignmentSummary || !uploadState.file) return;
    setLoading(true);
    try {
      const file = uploadState.file;
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",").pop() ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await fetch(`/api/portal/assignments/${activeAssignmentSummary.assignment.id}/uploads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-token": token },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          data,
          category: uploadState.category,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "Unable to upload file.");
      }
      const detailResponse: AssignmentDetail = await response.json();
      setDetail(detailResponse);
      setUploadState({ file: null, category: "support" });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Unable to upload file.");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    if (!token || !activeAssignmentSummary) return;
    try {
      const response = await fetch(
        `/api/portal/assignments/${activeAssignmentSummary.assignment.id}/report?month=${reportMonth}`,
        { headers: { "x-portal-token": token } }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to generate report.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${activeAssignmentSummary.assignment.title.replace(/\s+/g, "_")}_${reportMonth}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Unable to export report.");
    }
  };

  const markStatus = async (status: AssignmentSummary["assignment"]["status"]) => {
    if (!token || !activeAssignmentSummary) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/portal/assignments/${activeAssignmentSummary.assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-portal-token": token },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to update assignment.");
      }
      await Promise.all([loadAssignments(), loadDetail(activeAssignmentSummary.assignment.id)]);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Unable to update assignment.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl bg-slate-900 p-6 space-y-4 border border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-400">Teacher / Translator Portal</p>
            <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
          </div>
          <label className="text-sm text-slate-300 space-y-1 block">
            Email
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
          <label className="text-sm text-slate-300 space-y-1 block">
            Password
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-teal-500 py-2.5 text-slate-900 font-semibold hover:bg-teal-400 transition"
          >
            Access portal
          </button>
          {loginError && <p className="text-sm text-rose-300">{loginError}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 pb-20">
      <header className="bg-white/90 shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">JB Linguistics</p>
            <h1 className="text-2xl font-semibold text-slate-900">Teacher & Translator Portal</h1>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-4 mt-8 grid lg:grid-cols-[1fr,1.5fr] gap-8">
        <aside className="rounded-3xl bg-white shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
            <button
              type="button"
              onClick={() => loadAssignments()}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Refresh
            </button>
          </div>
          {loginError && <p className="text-sm text-rose-500">{loginError}</p>}
          {loading && <p className="text-xs text-slate-500">Syncing…</p>}
          <div className="space-y-3 max-h-[70vh] overflow-auto">
            {assignments.length === 0 ? (
              <p className="text-sm text-slate-500">No assignments yet.</p>
            ) : (
              assignments.map((item) => (
                <button
                  key={item.assignment.id}
                  type="button"
                  onClick={() => setSelectedId(item.assignment.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 ${
                    selectedId === item.assignment.id
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 bg-white hover:border-teal-200"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{item.assignment.title}</p>
                  <p className="text-xs text-slate-500">
                    {item.assignment.assignmentType === "class" ? "Class" : "Translation"} · {item.hoursLogged}/
                    {item.assignment.hoursAssigned} hrs
                  </p>
                  <p className="text-xs text-slate-500 capitalize">Status: {item.assignment.status}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6 space-y-8">
          {hasAssignments && detail ? (
            <>
              <div className="flex flex-wrap items-start gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Assignment</p>
                  <h2 className="text-2xl font-semibold text-slate-900">{detail.assignment.title}</h2>
                  <p className="text-sm text-slate-500">
                    {detail.assignment.assignmentType === "class" ? "Class" : "Translation"} · {detail.assignment.client || "Client TBD"}
                  </p>
                </div>
                <div className="ml-auto space-x-2">
                  <button
                    type="button"
                    onClick={() => markStatus("in_progress")}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Mark in progress
                  </button>
                  <button
                    type="button"
                    onClick={() => markStatus("submitted")}
                    className="rounded-full border border-teal-400 px-3 py-1 text-xs text-teal-600 hover:bg-teal-50"
                  >
                    Translation completed
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Hours</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {detail.hoursLogged} / {detail.assignment.hoursAssigned}
                  </p>
                  <p className="text-xs text-slate-500">Remaining: {detail.hoursRemaining}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Attendance sessions</p>
                  <p className="text-xl font-semibold text-slate-900">{detail.attendanceRecords.length}</p>
                  <p className="text-xs text-slate-500">Participants: {detail.assignment.participants.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Uploads</p>
                  <p className="text-xl font-semibold text-slate-900">{detail.uploads.length}</p>
                  <p className="text-xs text-slate-500">Latest: {detail.uploads[0]?.filename || "–"}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <form onSubmit={submitHours} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900">Log hours</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <label className="space-y-1 text-slate-600">
                      Date
                      <input
                        type="date"
                        value={hourForm.date}
                        onChange={(e) => setHourForm((prev) => ({ ...prev, date: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1 text-slate-600">
                      Hours
                      <input
                        type="number"
                        min={0.25}
                        step={0.25}
                        value={hourForm.hours}
                        onChange={(e) => setHourForm((prev) => ({ ...prev, hours: Number(e.target.value) }))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      />
                    </label>
                  </div>
                  <label className="text-sm text-slate-600 space-y-1">
                    Notes
                    <textarea
                      rows={2}
                      value={hourForm.notes}
                      onChange={(e) => setHourForm((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-slate-600 space-y-1">
                    Issues / delays
                    <textarea
                      rows={2}
                      value={hourForm.issues}
                      onChange={(e) => setHourForm((prev) => ({ ...prev, issues: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={hourForm.extraHoursRequested}
                      onChange={(e) => setHourForm((prev) => ({ ...prev, extraHoursRequested: e.target.checked }))}
                    />
                    Request additional hours
                  </label>
                  {hourForm.extraHoursRequested && (
                    <textarea
                      rows={2}
                      value={hourForm.extraHoursNote}
                      onChange={(e) => setHourForm((prev) => ({ ...prev, extraHoursNote: e.target.value }))}
                      placeholder="Explain why more hours are required."
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  )}
                  <button
                    type="submit"
                    className="rounded-full bg-teal-500 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-400"
                  >
                    Save hours
                  </button>
                </form>

                <form onSubmit={submitAttendance} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900">Log attendance</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <label className="space-y-1 text-slate-600">
                      Session date
                      <input
                        type="date"
                        value={attendanceForm.sessionDate}
                        onChange={(e) => setAttendanceForm((prev) => ({ ...prev, sessionDate: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1 text-slate-600">
                      Session label
                      <input
                        type="text"
                        value={attendanceForm.sessionLabel}
                        onChange={(e) => setAttendanceForm((prev) => ({ ...prev, sessionLabel: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      />
                    </label>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {attendanceForm.rows.map((row, idx) => (
                      <div key={row.name} className="flex items-center gap-2 text-sm">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={row.attended}
                            onChange={(e) =>
                              setAttendanceForm((prev) => {
                                const rows = [...prev.rows];
                                rows[idx] = { ...rows[idx], attended: e.target.checked };
                                return { ...prev, rows };
                              })
                            }
                          />
                          <span className="font-semibold text-slate-800">{row.name}</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Notes / absence reason"
                          value={row.notes}
                          onChange={(e) =>
                            setAttendanceForm((prev) => {
                              const rows = [...prev.rows];
                              rows[idx] = { ...rows[idx], notes: e.target.value };
                              return { ...prev, rows };
                            })
                          }
                          className="flex-1 rounded-xl border border-slate-300 px-2 py-1 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
                  >
                    Save attendance
                  </button>
                </form>
              </div>

              <form onSubmit={submitUpload} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">Upload documents</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <label className="space-y-1 text-slate-600">
                    File
                    <input
                      type="file"
                      onChange={(e) => setUploadState((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1 text-slate-600">
                    Category
                    <select
                      value={uploadState.category}
                      onChange={(e) => setUploadState((prev) => ({ ...prev, category: e.target.value as typeof prev.category }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    >
                      <option value="original">Original brief</option>
                      <option value="final">Final translation</option>
                      <option value="worksheet">Worksheet / class material</option>
                      <option value="support">Support file</option>
                    </select>
                  </label>
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-40"
                  disabled={!uploadState.file}
                >
                  Upload file
                </button>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-slate-700">Uploaded files</h4>
                  <div className="mt-2 space-y-2 text-xs text-slate-600">
                    {detail.uploads.length === 0 ? (
                      <p>No uploads yet.</p>
                    ) : (
                      detail.uploads.map((upload) => (
                        <a
                          key={upload.id}
                          href={`/api/portal/assignments/${detail.assignment.id}/uploads/${upload.id}`}
                          className="flex justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
                        >
                          <span>
                            {upload.filename} <span className="text-slate-400">({upload.category})</span>
                          </span>
                          <span>{new Date(upload.uploadedAt).toLocaleDateString()}</span>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </form>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-lg font-semibold text-slate-900">Attendance summary</h3>
                <div className="mt-3 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="text-left py-2">Participant</th>
                        <th className="text-left py-2">Present</th>
                        <th className="text-left py-2">Total</th>
                        <th className="text-left py-2">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.attendanceSummary.map((row) => (
                        <tr key={row.name} className="border-t border-slate-100">
                          <td className="py-2 font-semibold text-slate-800">{row.name}</td>
                          <td className="py-2">{row.attended}</td>
                          <td className="py-2">{row.total}</td>
                          <td className="py-2">{row.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm">
                <label className="text-slate-600">
                  Monthly report
                  <input
                    type="month"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    className="ml-2 rounded-xl border border-slate-300 px-3 py-1"
                  />
                </label>
                <button
                  type="button"
                  onClick={exportReport}
                  className="rounded-full bg-teal-500 text-white px-4 py-2 font-semibold hover:bg-teal-400"
                >
                  Download CSV
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select an assignment to begin tracking.</p>
          )}
        </section>
      </section>
    </main>
  );
}
