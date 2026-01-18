"use client";

import { useCallback, useEffect, useState } from "react";

type Class = {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string | null;
  language: string;
  level: string;
  max_students: number;
  status: "active" | "archived" | "cancelled";
  created_at: string;
  teacher?: { id: string; name: string; email: string } | null;
  student_count?: number;
};

type ClassEnrollment = {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  status: string;
  student?: { id: string; name: string; email: string };
};

type ClassSession = {
  id: string;
  class_id: string;
  title: string | null;
  start_time: string;
  end_time: string;
  meeting_url: string | null;
  meeting_provider: string | null;
  location: string | null;
  session_type: string;
  cancelled: boolean;
  class?: Class;
};

type Teacher = {
  id: string;
  name: string;
  email: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
};

const LEVEL_OPTIONS = [
  "A1", "A1+", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C1+", "C2", "C2+"
];

const LANGUAGE_OPTIONS = [
  "English", "German", "French", "Dutch", "Danish", "Swedish", "Norwegian",
  "Russian", "Italian", "Spanish", "Portuguese", "Mandarin", "Japanese",
  "Korean", "Farsi", "Arabic", "Polish", "Hindi", "Swahili"
];

export default function ClassesManager({ adminToken }: { adminToken: string }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected class detail view
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedEnrollments, setSelectedEnrollments] = useState<ClassEnrollment[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<ClassSession[]>([]);

  // Forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classForm, setClassForm] = useState({
    name: "",
    description: "",
    teacherId: "",
    language: "English",
    level: "A1",
    maxStudents: 10,
  });

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    meetingUrl: "",
    meetingProvider: "teams",
    location: "",
    sessionType: "regular",
    generateTeamsMeeting: false,
  });

  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [generatingTeamsForSession, setGeneratingTeamsForSession] = useState<string | null>(null);

  // Load classes
  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/admin/classes", {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) throw new Error("Failed to load classes");
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load classes");
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  // Load teachers (portal users with teacher role)
  const loadTeachers = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/admin/users", {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) return;
      const data = await res.json();
      const teacherList = (data.users || []).filter((u: any) => u.roles?.includes("teacher"));
      setTeachers(teacherList);
    } catch {
      // Ignore errors
    }
  }, [adminToken]);

  // Load students
  const loadStudents = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/admin/students", {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) return;
      const data = await res.json();
      setStudents(data.students || []);
    } catch {
      // Ignore errors
    }
  }, [adminToken]);

  // Load class details
  const loadClassDetails = useCallback(async (classId: string) => {
    try {
      const res = await fetch(`/api/portal/admin/classes?id=${classId}`, {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) throw new Error("Failed to load class details");
      const data = await res.json();
      setSelectedClass(data.class);
      setSelectedEnrollments(data.enrollments || []);

      // Load sessions
      const sessRes = await fetch(`/api/portal/admin/classes/sessions?classId=${classId}`, {
        headers: { "x-admin-token": adminToken },
      });
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setSelectedSessions(sessData.sessions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load class details");
    }
  }, [adminToken]);

  useEffect(() => {
    loadClasses();
    loadTeachers();
    loadStudents();
  }, [loadClasses, loadTeachers, loadStudents]);

  // Create class
  const handleCreateClass = async () => {
    if (!classForm.name || !classForm.language || !classForm.level) {
      setError("Name, language, and level are required");
      return;
    }

    try {
      const res = await fetch("/api/portal/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          action: "create",
          name: classForm.name,
          description: classForm.description || undefined,
          teacherId: classForm.teacherId || undefined,
          language: classForm.language,
          level: classForm.level,
          maxStudents: classForm.maxStudents,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create class");
      }

      setShowCreateForm(false);
      setClassForm({ name: "", description: "", teacherId: "", language: "English", level: "A1", maxStudents: 10 });
      loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create class");
    }
  };

  // Update class
  const handleUpdateClass = async () => {
    if (!editingClass) return;

    try {
      const res = await fetch("/api/portal/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          action: "update",
          id: editingClass.id,
          name: classForm.name,
          description: classForm.description || undefined,
          teacherId: classForm.teacherId || null,
          language: classForm.language,
          level: classForm.level,
          maxStudents: classForm.maxStudents,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update class");
      }

      setEditingClass(null);
      setClassForm({ name: "", description: "", teacherId: "", language: "English", level: "A1", maxStudents: 10 });
      loadClasses();
      if (selectedClass?.id === editingClass.id) {
        loadClassDetails(editingClass.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update class");
    }
  };

  // Delete class
  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class? This will also remove all enrollments and sessions.")) {
      return;
    }

    try {
      const res = await fetch("/api/portal/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ action: "delete", id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete class");
      }

      if (selectedClass?.id === id) {
        setSelectedClass(null);
        setSelectedEnrollments([]);
        setSelectedSessions([]);
      }
      loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete class");
    }
  };

  // Enroll student
  const handleEnrollStudent = async () => {
    if (!selectedClass || !enrollStudentId) return;

    try {
      const res = await fetch("/api/portal/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          action: "enroll",
          classId: selectedClass.id,
          studentId: enrollStudentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to enroll student");
      }

      setShowEnrollForm(false);
      setEnrollStudentId("");
      loadClassDetails(selectedClass.id);
      loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll student");
    }
  };

  // Unenroll student
  const handleUnenrollStudent = async (studentId: string) => {
    if (!selectedClass) return;
    if (!confirm("Are you sure you want to remove this student from the class?")) return;

    try {
      const res = await fetch("/api/portal/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          action: "unenroll",
          classId: selectedClass.id,
          studentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to unenroll student");
      }

      loadClassDetails(selectedClass.id);
      loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unenroll student");
    }
  };

  // Create session
  const handleCreateSession = async () => {
    if (!selectedClass || !sessionForm.startTime || !sessionForm.endTime) {
      setError("Start time and end time are required");
      return;
    }

    try {
      const res = await fetch("/api/portal/admin/classes/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          action: "create",
          classId: selectedClass.id,
          title: sessionForm.title || undefined,
          startTime: sessionForm.startTime,
          endTime: sessionForm.endTime,
          meetingUrl: sessionForm.meetingUrl || undefined,
          meetingProvider: sessionForm.meetingProvider || undefined,
          location: sessionForm.location || undefined,
          sessionType: sessionForm.sessionType,
          generateTeamsMeeting: sessionForm.generateTeamsMeeting,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create session");
      }

      setShowSessionForm(false);
      setSessionForm({ title: "", startTime: "", endTime: "", meetingUrl: "", meetingProvider: "teams", location: "", sessionType: "regular", generateTeamsMeeting: false });
      loadClassDetails(selectedClass.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    }
  };

  // Cancel session
  const handleCancelSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;

    try {
      const res = await fetch("/api/portal/admin/classes/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ action: "cancel", id: sessionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to cancel session");
      }

      if (selectedClass) {
        loadClassDetails(selectedClass.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel session");
    }
  };

  // Generate Teams meeting for existing session
  const handleGenerateTeamsLink = async (sessionId: string) => {
    setGeneratingTeamsForSession(sessionId);
    setError(null);

    try {
      const res = await fetch("/api/portal/admin/classes/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ action: "generate-teams-meeting", sessionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate Teams link");
      }

      if (selectedClass) {
        loadClassDetails(selectedClass.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate Teams link");
    } finally {
      setGeneratingTeamsForSession(null);
    }
  };

  // Format date for display
  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Class Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-teal-400"
        >
          + Create Class
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/20 border border-rose-500 p-3 text-sm text-rose-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <p className="text-slate-400">Loading classes...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Classes List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">All Classes ({classes.length})</h3>
            {classes.length === 0 ? (
              <p className="text-slate-500">No classes yet. Create one to get started.</p>
            ) : (
              <div className="space-y-2">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                      selectedClass?.id === cls.id
                        ? "border-teal-500 bg-slate-800/50"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                    onClick={() => loadClassDetails(cls.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{cls.name}</h4>
                        <p className="text-sm text-slate-400">
                          {cls.language} - {cls.level}
                        </p>
                        {cls.teacher && (
                          <p className="text-xs text-slate-500 mt-1">
                            Teacher: {cls.teacher.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-slate-400">
                          {cls.student_count ?? 0}/{cls.max_students} students
                        </span>
                        <div className="mt-2 flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingClass(cls);
                              setClassForm({
                                name: cls.name,
                                description: cls.description || "",
                                teacherId: cls.teacher_id || "",
                                language: cls.language,
                                level: cls.level,
                                maxStudents: cls.max_students,
                              });
                            }}
                            className="text-xs text-slate-400 hover:text-slate-200"
                          >
                            Edit
                          </button>
                          <span className="text-slate-600">|</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClass(cls.id);
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Class Detail View */}
          <div className="space-y-4">
            {selectedClass ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                    {selectedClass.name}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedClass(null);
                      setSelectedEnrollments([]);
                      setSelectedSessions([]);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Close
                  </button>
                </div>

                {/* Enrolled Students */}
                <div className="rounded-lg border border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">
                      Students ({selectedEnrollments.length}/{selectedClass.max_students})
                    </h4>
                    <button
                      onClick={() => setShowEnrollForm(true)}
                      className="text-xs text-teal-400 hover:text-teal-300"
                    >
                      + Add Student
                    </button>
                  </div>
                  {selectedEnrollments.length === 0 ? (
                    <p className="text-sm text-slate-500">No students enrolled yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedEnrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{enrollment.student?.name || "Unknown"}</span>
                          <button
                            onClick={() => handleUnenrollStudent(enrollment.student_id)}
                            className="text-xs text-rose-400 hover:text-rose-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sessions */}
                <div className="rounded-lg border border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Sessions</h4>
                    <button
                      onClick={() => setShowSessionForm(true)}
                      className="text-xs text-teal-400 hover:text-teal-300"
                    >
                      + Schedule Session
                    </button>
                  </div>
                  {selectedSessions.length === 0 ? (
                    <p className="text-sm text-slate-500">No sessions scheduled.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between text-sm p-2 rounded ${
                            session.cancelled ? "bg-slate-800/50 opacity-50" : ""
                          }`}
                        >
                          <div>
                            <p className={session.cancelled ? "line-through" : ""}>
                              {session.title || "Class Session"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDateTime(session.start_time)}
                            </p>
                            {session.meeting_url && (
                              <a
                                href={session.meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-teal-400 hover:underline"
                              >
                                Join Meeting
                              </a>
                            )}
                            {!session.meeting_url && !session.cancelled && (
                              <button
                                onClick={() => handleGenerateTeamsLink(session.id)}
                                disabled={generatingTeamsForSession === session.id}
                                className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                              >
                                {generatingTeamsForSession === session.id ? "Generating..." : "Generate Teams Link"}
                              </button>
                            )}
                          </div>
                          {!session.cancelled && (
                            <button
                              onClick={() => handleCancelSession(session.id)}
                              className="text-xs text-rose-400 hover:text-rose-300"
                            >
                              Cancel
                            </button>
                          )}
                          {session.cancelled && (
                            <span className="text-xs text-slate-500">Cancelled</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 rounded-lg border border-slate-700 border-dashed">
                <p className="text-slate-500">Select a class to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Class Modal */}
      {(showCreateForm || editingClass) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingClass ? "Edit Class" : "Create New Class"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="e.g., English A1 Morning Group"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  placeholder="Optional class description"
                  rows={2}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Language *
                  </label>
                  <select
                    value={classForm.language}
                    onChange={(e) => setClassForm({ ...classForm, language: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                  >
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Level *
                  </label>
                  <select
                    value={classForm.level}
                    onChange={(e) => setClassForm({ ...classForm, level: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                  >
                    {LEVEL_OPTIONS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Assign Teacher
                </label>
                <select
                  value={classForm.teacherId}
                  onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                >
                  <option value="">-- No teacher assigned --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Max Students
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={classForm.maxStudents}
                  onChange={(e) => setClassForm({ ...classForm, maxStudents: parseInt(e.target.value) || 10 })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingClass(null);
                  setClassForm({ name: "", description: "", teacherId: "", language: "English", level: "A1", maxStudents: 10 });
                }}
                className="px-4 py-2 rounded-lg border border-slate-600 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={editingClass ? handleUpdateClass : handleCreateClass}
                className="px-4 py-2 rounded-lg bg-teal-500 text-slate-900 text-sm font-medium"
              >
                {editingClass ? "Save Changes" : "Create Class"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollForm && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Student to {selectedClass.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Select Student
                </label>
                <select
                  value={enrollStudentId}
                  onChange={(e) => setEnrollStudentId(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                >
                  <option value="">-- Select a student --</option>
                  {students
                    .filter((s) => !selectedEnrollments.some((e) => e.student_id === s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEnrollForm(false);
                  setEnrollStudentId("");
                }}
                className="px-4 py-2 rounded-lg border border-slate-600 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEnrollStudent}
                disabled={!enrollStudentId}
                className="px-4 py-2 rounded-lg bg-teal-500 text-slate-900 text-sm font-medium disabled:opacity-50"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showSessionForm && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule Session for {selectedClass.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Session Title (optional)
                </label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  placeholder="e.g., Week 1 - Introduction"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Meeting URL
                </label>
                <input
                  type="url"
                  value={sessionForm.meetingUrl}
                  onChange={(e) => setSessionForm({ ...sessionForm, meetingUrl: e.target.value, generateTeamsMeeting: false })}
                  placeholder="https://teams.microsoft.com/..."
                  disabled={sessionForm.generateTeamsMeeting}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm disabled:opacity-50"
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sessionForm.generateTeamsMeeting}
                    onChange={(e) => setSessionForm({ ...sessionForm, generateTeamsMeeting: e.target.checked, meetingUrl: e.target.checked ? "" : sessionForm.meetingUrl })}
                    className="rounded border-slate-600 bg-slate-700"
                  />
                  <span className="text-sm text-slate-300">Auto-generate Teams meeting link</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Meeting Provider
                  </label>
                  <select
                    value={sessionForm.meetingProvider}
                    onChange={(e) => setSessionForm({ ...sessionForm, meetingProvider: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                  >
                    <option value="teams">Microsoft Teams</option>
                    <option value="zoom">Zoom</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="custom">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Session Type
                  </label>
                  <select
                    value={sessionForm.sessionType}
                    onChange={(e) => setSessionForm({ ...sessionForm, sessionType: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                  >
                    <option value="regular">Regular</option>
                    <option value="makeup">Makeup</option>
                    <option value="exam">Exam</option>
                    <option value="orientation">Orientation</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Location (for in-person)
                </label>
                <input
                  type="text"
                  value={sessionForm.location}
                  onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                  placeholder="Optional physical location"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowSessionForm(false);
                  setSessionForm({ title: "", startTime: "", endTime: "", meetingUrl: "", meetingProvider: "teams", location: "", sessionType: "regular", generateTeamsMeeting: false });
                }}
                className="px-4 py-2 rounded-lg border border-slate-600 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={!sessionForm.startTime || !sessionForm.endTime}
                className="px-4 py-2 rounded-lg bg-teal-500 text-slate-900 text-sm font-medium disabled:opacity-50"
              >
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
