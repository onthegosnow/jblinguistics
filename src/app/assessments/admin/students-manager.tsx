"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  active: boolean;
  mustReset: boolean;
  createdAt: string;
  enrollmentCounts?: { active: number; completed: number };
};

type Enrollment = {
  id: string;
  language: string;
  currentLevel: string;
  targetLevel?: string;
  teacherId?: string;
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
};

type PortalUser = {
  id: string;
  name: string;
  email: string;
};

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const CEFR_LABELS: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Proficiency",
};

export function StudentsManager({ token }: { token: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<PortalUser[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<{
    student: Student;
    enrollments: Enrollment[];
    progress: Progress[];
    certificates: Certificate[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Form states
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    country: "",
  });
  const [newEnrollment, setNewEnrollment] = useState({
    language: "",
    teacherId: "",
    currentLevel: "A1",
    targetLevel: "",
  });
  const [newCert, setNewCert] = useState({
    enrollmentId: "",
    language: "",
    level: "A1",
  });
  const [newProgress, setNewProgress] = useState({
    enrollmentId: "",
    language: "",
    level: "A1",
    assessmentScore: "",
    notes: "",
  });

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/admin/students", {
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/portal/admin/users", {
        headers: { "x-admin-token": token },
      });
      if (res.ok) {
        const data = await res.json();
        setTeachers((data.users || []).filter((u: any) => u.roles?.includes("teacher")));
      }
    } catch {
      // Ignore
    }
  };

  const fetchStudentDetails = async (studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/admin/students/${studentId}`, {
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("Failed to fetch student details");
      const data = await res.json();
      setSelectedStudent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async () => {
    if (!newStudent.name || !newStudent.email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/portal/admin/students", {
        method: "POST",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create student");
      }
      const data = await res.json();
      alert(`Student created! Temporary password: ${data.tempPassword}\n\nShare this with the student so they can log in at /student/login`);
      setShowCreateModal(false);
      setNewStudent({ name: "", email: "", phone: "", city: "", country: "" });
      fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  const createEnrollment = async () => {
    if (!selectedStudent || !newEnrollment.language) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/admin/students/${selectedStudent.student.id}/enroll`, {
        method: "POST",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify(newEnrollment),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create enrollment");
      }
      alert("Enrollment created!");
      setShowEnrollModal(false);
      setNewEnrollment({ language: "", teacherId: "", currentLevel: "A1", targetLevel: "" });
      fetchStudentDetails(selectedStudent.student.id);
      fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create enrollment");
    } finally {
      setLoading(false);
    }
  };

  const recordProgress = async () => {
    if (!selectedStudent || !newProgress.enrollmentId || !newProgress.language || !newProgress.level) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/admin/students/${selectedStudent.student.id}/progress`, {
        method: "POST",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: newProgress.enrollmentId,
          language: newProgress.language,
          level: newProgress.level,
          assessmentScore: newProgress.assessmentScore ? parseInt(newProgress.assessmentScore) : undefined,
          notes: newProgress.notes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to record progress");
      }
      alert("Level completion recorded!");
      setShowProgressModal(false);
      setNewProgress({ enrollmentId: "", language: "", level: "A1", assessmentScore: "", notes: "" });
      fetchStudentDetails(selectedStudent.student.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record progress");
    } finally {
      setLoading(false);
    }
  };

  const issueCertificate = async () => {
    if (!selectedStudent || !newCert.language || !newCert.level) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/admin/students/${selectedStudent.student.id}/certificate`, {
        method: "POST",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify(newCert),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to issue certificate");
      }
      const data = await res.json();
      alert(`Certificate issued!\n\nCertificate #: ${data.certificate.certificateNumber}\n\nThe student can download it from their portal.`);
      setShowCertModal(false);
      setNewCert({ enrollmentId: "", language: "", level: "A1" });
      fetchStudentDetails(selectedStudent.student.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to issue certificate");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (studentId: string) => {
    if (!confirm("Reset this student's password?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/portal/admin/students", {
        method: "POST",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action: "reset" }),
      });
      if (!res.ok) throw new Error("Failed to reset password");
      const data = await res.json();
      alert(`Password reset! New temporary password: ${data.tempPassword}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (studentId: string, currentlyActive: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/admin/students", {
        method: "POST",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action: currentlyActive ? "deactivate" : "reactivate" }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      if (!currentlyActive) {
        const data = await res.json();
        if (data.tempPassword) {
          alert(`Reactivated! Temporary password: ${data.tempPassword}`);
        }
      }
      fetchStudents();
      if (selectedStudent?.student.id === studentId) {
        fetchStudentDetails(studentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Student Management</h2>
          <p className="text-sm text-slate-400">Manage students, enrollments, progress, and certificates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium"
        >
          + Add Student
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline text-sm">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Students List */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h3 className="font-medium text-white mb-3">Students ({students.length})</h3>
          {loading && !selectedStudent && <p className="text-slate-400 text-sm">Loading...</p>}

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => fetchStudentDetails(student.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  selectedStudent?.student.id === student.id
                    ? "bg-teal-500/20 border-teal-500"
                    : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{student.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      student.active ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {student.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-sm text-slate-400">{student.email}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {student.enrollmentCounts?.active || 0} active, {student.enrollmentCounts?.completed || 0} completed
                  {student.city && ` • ${student.city}`}
                </div>
              </button>
            ))}
            {students.length === 0 && !loading && (
              <p className="text-slate-500 text-center py-8">No students yet. Click "Add Student" to create one.</p>
            )}
          </div>
        </div>

        {/* Student Details */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          {selectedStudent ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedStudent.student.name}</h3>
                  <p className="text-sm text-slate-400">{selectedStudent.student.email}</p>
                  {selectedStudent.student.phone && (
                    <p className="text-sm text-slate-500">{selectedStudent.student.phone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => resetPassword(selectedStudent.student.id)}
                    className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 text-white rounded"
                  >
                    Reset PW
                  </button>
                  <button
                    onClick={() => toggleActive(selectedStudent.student.id, selectedStudent.student.active)}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedStudent.student.active
                        ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                    }`}
                  >
                    {selectedStudent.student.active ? "Deactivate" : "Reactivate"}
                  </button>
                </div>
              </div>

              {/* Enrollments */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-300">Enrollments</h4>
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="text-xs text-teal-400 hover:text-teal-300"
                  >
                    + Add
                  </button>
                </div>
                {selectedStudent.enrollments.length === 0 ? (
                  <p className="text-slate-500 text-sm">No enrollments yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudent.enrollments.map((e) => (
                      <div key={e.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{e.language}</div>
                          <div className="text-xs text-slate-400">
                            {e.currentLevel} - {CEFR_LABELS[e.currentLevel]}
                            {e.targetLevel && ` → ${e.targetLevel}`}
                            {e.teacherName && ` • ${e.teacherName}`}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            e.status === "active"
                              ? "bg-teal-500/20 text-teal-300"
                              : e.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-slate-600 text-slate-400"
                          }`}
                        >
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-300">Progress History</h4>
                  {selectedStudent.enrollments.length > 0 && (
                    <button
                      onClick={() => {
                        const active = selectedStudent.enrollments.find((e) => e.status === "active");
                        if (active) {
                          setNewProgress({
                            enrollmentId: active.id,
                            language: active.language,
                            level: active.currentLevel,
                            assessmentScore: "",
                            notes: "",
                          });
                        }
                        setShowProgressModal(true);
                      }}
                      className="text-xs text-teal-400 hover:text-teal-300"
                    >
                      + Record Level
                    </button>
                  )}
                </div>
                {selectedStudent.progress.length === 0 ? (
                  <p className="text-slate-500 text-sm">No progress recorded.</p>
                ) : (
                  <div className="space-y-1">
                    {selectedStudent.progress.slice(0, 5).map((p) => (
                      <div key={p.id} className="text-sm flex items-center justify-between py-1">
                        <span className="text-white">
                          {p.language} {p.level}
                          {p.assessmentScore !== undefined && (
                            <span className="text-slate-400"> ({p.assessmentScore}%)</span>
                          )}
                        </span>
                        <span className="text-xs text-slate-500">
                          {p.completedAt && new Date(p.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certificates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-300">Certificates</h4>
                  <button
                    onClick={() => {
                      const active = selectedStudent.enrollments.find((e) => e.status === "active");
                      if (active) {
                        setNewCert({
                          enrollmentId: active.id,
                          language: active.language,
                          level: active.currentLevel,
                        });
                      }
                      setShowCertModal(true);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    + Issue Certificate
                  </button>
                </div>
                {selectedStudent.certificates.length === 0 ? (
                  <p className="text-slate-500 text-sm">No certificates issued.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudent.certificates.map((c) => (
                      <div key={c.id} className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🏆</span>
                          <div>
                            <div className="text-white font-medium">
                              {c.language} - Level {c.level}
                            </div>
                            <div className="text-xs text-slate-400">
                              #{c.certificateNumber} • {new Date(c.issuedDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-12">Select a student to view details</div>
          )}
        </div>
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Student</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={newStudent.city}
                    onChange={(e) => setNewStudent({ ...newStudent, city: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={newStudent.country}
                    onChange={(e) => setNewStudent({ ...newStudent, country: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createStudent}
                disabled={loading || !newStudent.name || !newStudent.email}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 text-white rounded-lg"
              >
                {loading ? "Creating..." : "Create Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Add Enrollment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Language *</label>
                <input
                  type="text"
                  placeholder="e.g., English, Spanish, German"
                  value={newEnrollment.language}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, language: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Teacher</label>
                <select
                  value={newEnrollment.teacherId}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, teacherId: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">-- No teacher assigned --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Current Level</label>
                  <select
                    value={newEnrollment.currentLevel}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, currentLevel: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    {CEFR_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l} - {CEFR_LABELS[l]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Target Level</label>
                  <select
                    value={newEnrollment.targetLevel}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, targetLevel: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">-- None --</option>
                    {CEFR_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEnrollModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={createEnrollment}
                disabled={loading || !newEnrollment.language}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 text-white rounded-lg"
              >
                {loading ? "Creating..." : "Create Enrollment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Record Level Completion</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Enrollment *</label>
                <select
                  value={newProgress.enrollmentId}
                  onChange={(e) => {
                    const enrollment = selectedStudent?.enrollments.find((en) => en.id === e.target.value);
                    setNewProgress({
                      ...newProgress,
                      enrollmentId: e.target.value,
                      language: enrollment?.language || "",
                      level: enrollment?.currentLevel || "A1",
                    });
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">-- Select enrollment --</option>
                  {selectedStudent?.enrollments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.language} ({e.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Level Completed *</label>
                <select
                  value={newProgress.level}
                  onChange={(e) => setNewProgress({ ...newProgress, level: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  {CEFR_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l} - {CEFR_LABELS[l]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Assessment Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Optional"
                  value={newProgress.assessmentScore}
                  onChange={(e) => setNewProgress({ ...newProgress, assessmentScore: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Notes</label>
                <textarea
                  value={newProgress.notes}
                  onChange={(e) => setNewProgress({ ...newProgress, notes: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowProgressModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={recordProgress}
                disabled={loading || !newProgress.enrollmentId || !newProgress.level}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 text-white rounded-lg"
              >
                {loading ? "Recording..." : "Record Progress"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Issue Certificate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Language *</label>
                <input
                  type="text"
                  placeholder="e.g., English, Spanish, German"
                  value={newCert.language}
                  onChange={(e) => setNewCert({ ...newCert, language: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">CEFR Level *</label>
                <select
                  value={newCert.level}
                  onChange={(e) => setNewCert({ ...newCert, level: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  {CEFR_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l} - {CEFR_LABELS[l]}
                    </option>
                  ))}
                </select>
              </div>
              {selectedStudent && selectedStudent.enrollments.length > 0 && (
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Link to Enrollment (optional)</label>
                  <select
                    value={newCert.enrollmentId}
                    onChange={(e) => setNewCert({ ...newCert, enrollmentId: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">-- None --</option>
                    {selectedStudent.enrollments.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.language} ({e.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCertModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={issueCertificate}
                disabled={loading || !newCert.language || !newCert.level}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 text-white rounded-lg"
              >
                {loading ? "Issuing..." : "Issue Certificate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
