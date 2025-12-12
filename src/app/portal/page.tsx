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

type AdminInquiry = {
  id: string;
  createdAt: string | null;
  name: string;
  email: string;
  organization: string | null;
  serviceType: string | null;
  languages: string | null;
  details: string | null;
  source: string;
};

const HIVE_LANGUAGES = ["English", "Spanish", "German", "French", "Italian", "Dutch", "Portuguese", "Chinese", "Japanese", "Korean"];
const HIVE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const HIVE_SKILLS = ["Grammar", "Vocabulary", "Reading", "Listening", "Speaking", "Writing", "Projects"];
const HIVE_TOPICS: Record<string, string[]> = {
  Grammar: [
    "Tenses/Present Simple",
    "Tenses/Present Continuous",
    "Tenses/Present Perfect",
    "Tenses/Past Simple",
    "Tenses/Past Continuous",
    "Modals/Ability",
    "Modals/Permission",
    "Modals/Obligation",
    "Conditionals/First Conditional",
    "Conditionals/Second Conditional",
    "Conditionals/Third Conditional",
    "Passive Voice/Present Passive",
    "Reported Speech/Statements",
    "Questions/Wh- Questions",
    "Articles and Determiners",
    "Comparative and Superlative",
    "Relative Clauses",
    "Prepositions/Time",
    "Prepositions/Place",
    "Phrasal Verbs",
    "Mixed Grammar Practice",
  ],
  Vocabulary: [
    "Daily Life",
    "Travel",
    "Work and Careers",
    "Education",
    "Health and Medicine",
    "Food and Cooking",
    "Home and Housing",
    "Technology",
    "Emotions and Personality",
    "Environment",
    "Sports and Hobbies",
    "Relationships",
    "Money and Finance",
    "Culture and Entertainment",
    "Weather and Nature",
    "Crime and Law",
    "Transportation",
    "Academic Vocabulary",
    "Phrasal Verbs",
    "Idioms",
    "Collocations",
    "Thematic Word Lists",
  ],
  Reading: [
    "Short Texts",
    "Articles",
    "Stories and Literature",
    "Dialogues",
    "Reading Comprehension",
    "Skimming Exercises",
    "Scanning Exercises",
    "Inference and Critical Thinking",
    "Exam Practice",
    "Worksheets",
  ],
  Listening: [
    "Dialogues",
    "Monologues",
    "Real Conversations",
    "Lectures and Talks",
    "Dictation",
    "Pronunciation and Stress",
    "Listening for Gist",
    "Listening for Detail",
    "Listening Comprehension",
    "Exam Practice",
    "Audio Files",
    "Worksheets",
  ],
  Speaking: [
    "Warm-Up Activities",
    "Conversation Prompts",
    "Role Plays",
    "Debates and Discussions",
    "Presentations",
    "Pronunciation/Sounds",
    "Pronunciation/Stress and Intonation",
    "Functional Language/Asking for Information",
    "Functional Language/Giving Opinions",
    "Functional Language/Agreeing and Disagreeing",
    "Functional Language/Making Suggestions",
    "Functional Language/Apologizing",
    "Fluency Activities",
    "Exam Practice",
  ],
  Writing: [
    "Sentences and Paragraphs",
    "Essay Writing",
    "Formal Letters",
    "Informal Emails",
    "Reports",
    "Creative Writing",
    "Academic Writing",
    "Connectors and Linking Words",
    "Editing and Proofreading",
    "Writing Prompts",
    "Exam Practice",
    "Worksheets",
  ],
  Projects: [
    "Group Projects",
    "Individual Projects",
    "Research Projects",
    "Presentations",
    "Role Play Projects",
    "Long-Term Projects",
    "Creative Projects",
    "Multimedia Projects",
    "Assessment Rubrics",
  ],
};
const HIVE_FILE_TYPES = ["Lesson Plan", "Worksheet", "PPT", "Audio", "Video", "Assessment", "Activity", "Media", "Other"];

export default function PortalPage() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(() => (typeof window === "undefined" ? "" : window.sessionStorage.getItem(STORAGE_KEY) ?? ""));
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [mustReset, setMustReset] = useState(false);
  const [resetForm, setResetForm] = useState({ password: "", confirm: "" });
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
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
  const [portalTab, setPortalTab] = useState<"profile" | "board" | "assignments" | "hive">("profile");
  const [hiveApproved, setHiveApproved] = useState<any[]>([]);
  const [hivePending, setHivePending] = useState<any[]>([]);
  const [hiveRejected, setHiveRejected] = useState<any[]>([]);
  const [hiveLoading, setHiveLoading] = useState(false);
  const [hiveError, setHiveError] = useState<string | null>(null);
  const [hiveUpload, setHiveUpload] = useState<{
    language: string;
    level: string;
    skill: string;
    topic: string;
    fileType: string;
    teacherName: string;
    descriptor: string;
    date: string;
    file: File | null;
  }>({
    language: "English",
    level: "A1",
    skill: "Grammar",
    topic: HIVE_TOPICS["Grammar"]?.[0] ?? "Topic",
    fileType: "Worksheet",
    teacherName: "",
    descriptor: "",
    date: new Date().toISOString().slice(0, 10),
    file: null,
  });
  const [hiveFilter, setHiveFilter] = useState({
    language: "All",
    level: "All",
    skill: "All",
    topic: "All",
    fileType: "All",
  });
  const [hiveSearch, setHiveSearch] = useState("");
  const [boardRoom, setBoardRoom] = useState("announcements");
  const [boardMessages, setBoardMessages] = useState<
    Array<{ id: string; room: string; author_name: string | null; message: string; created_at: string }>
  >([]);
  const [boardInput, setBoardInput] = useState("");
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const rooms = ["announcements", "staff_lounge", "onboarding", "hive", "feature_requests"];
  const [reportMonth, setReportMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [adminToken, setAdminToken] = useState("");
  const [adminInquiries, setAdminInquiries] = useState<AdminInquiry[]>([]);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
    bio?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    languages?: string[];
    teacher_role?: boolean;
    translator_role?: boolean;
    teaching_languages?: string[] | number[];
    translating_languages?: string[] | number[];
    certifications?: string[];
    publish_teacher?: boolean;
    publish_translator?: boolean;
    staff_visibility?: string;
  } | null>(null);
  const [profileUploads, setProfileUploads] = useState<
    Array<{ id: string; kind: string; filename: string; uploadedAt?: string; signedUrl?: string }>
  >([]);
  const [profileDocs, setProfileDocs] = useState<{ resumeUrl?: string; resumeName?: string; contractUrl?: string; contractName?: string }>({});
  const [profileForm, setProfileForm] = useState({
    name: "",
    bio: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    languages: "",
  });
  const [uploadingProfileFile, setUploadingProfileFile] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showProfileSection, setShowProfileSection] = useState(true);
  const [resetDraft, setResetDraft] = useState({ newPassword: "", confirm: "" });
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

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

  const loadHive = useCallback(
    async (existingToken?: string) => {
      const auth = existingToken ?? token;
      if (!auth) return;
      setHiveLoading(true);
      setHiveError(null);
      try {
        const response = await fetch("/api/portal/hive/list", { headers: { "x-portal-token": auth } });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Unable to load Hive files.");
        }
        const data = await response.json();
        setHiveApproved(data.approved ?? []);
        setHivePending(data.pending ?? []);
        setHiveRejected(data.rejected ?? []);
      } catch (err) {
        setHiveError(err instanceof Error ? err.message : "Unable to load Hive files.");
      } finally {
        setHiveLoading(false);
      }
    },
    [token]
  );

  const loadBoard = useCallback(
    async (room?: string) => {
      if (!token) return;
      const selected = room ?? boardRoom;
      setBoardLoading(true);
      setBoardError(null);
      try {
        const res = await fetch(`/api/portal/board?room=${selected}`, { headers: { "x-portal-token": token } });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Unable to load board.");
        }
        const data = await res.json();
        setBoardRoom(selected);
        setBoardMessages(data.messages ?? []);
      } catch (err) {
        setBoardError(err instanceof Error ? err.message : "Unable to load board.");
      } finally {
        setBoardLoading(false);
      }
    },
    [token, boardRoom]
  );

  const loadProfile = useCallback(
    async (existingToken?: string) => {
      const auth = existingToken ?? token;
      if (!auth) return;
      setProfileLoading(true);
      setProfileError(null);
      try {
        const res = await fetch("/api/portal/profile", { headers: { "x-portal-token": auth } });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Unable to load profile.");
        }
        const data = await res.json();
        setProfile(data.profile);
        setProfileUploads(data.uploads ?? []);
        setProfileDocs(data.coreDocs ?? {});
        setAiDraft((data.profile as any)?.ai_bio_draft ?? null);
        setAiPrompt((data.profile as any)?.ai_bio_prompt ?? "");
        setProfileForm({
          name: data.profile?.name ?? "",
          bio: data.profile?.bio ?? "",
          phone: data.profile?.phone ?? "",
          address: data.profile?.address ?? "",
          city: data.profile?.city ?? "",
          state: data.profile?.state ?? "",
          country: data.profile?.country ?? "",
          languages: Array.isArray(data.profile?.languages) ? data.profile.languages.join(", ") : "",
        });
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : "Unable to load profile.");
      } finally {
        setProfileLoading(false);
      }
    },
    [token]
  );

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setProfileLoading(true);
    setProfileError(null);
    try {
      const response = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-token": token },
        body: JSON.stringify({
          name: profileForm.name,
          bio: profileForm.bio,
          phone: profileForm.phone,
          address: profileForm.address,
          city: profileForm.city,
          state: profileForm.state,
          country: profileForm.country,
          languages: profileForm.languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to save profile.");
      }
      await loadProfile(token);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Unable to save profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const uploadProfileFile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    const form = event.target as HTMLFormElement;
    const kind = (form.querySelector("select[name='kind']") as HTMLSelectElement | null)?.value || "credential";
    const input = form.querySelector("input[type='file']") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      setUploadMessage("Choose a file to upload.");
      return;
    }
    setUploadingProfileFile(true);
    setUploadMessage(null);
    try {
      const fd = new FormData();
      fd.append("kind", kind);
      fd.append("file", file);
      const res = await fetch("/api/portal/profile/upload", {
        method: "POST",
        headers: { "x-portal-token": token },
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to upload file.");
      }
      setUploadMessage("Uploaded. Admin will review and store this in your file.");
      await loadProfile(token);
      form.reset();
    } catch (err) {
      setUploadMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingProfileFile(false);
    }
  };

  const generateAiBio = async () => {
    if (!token) return;
    setAiStatus("Generating bio draft…");
    setProfileError(null);
    try {
      const res = await fetch("/api/portal/profile/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-token": token },
        body: JSON.stringify({ prompt: aiPrompt || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Unable to generate bio.");
      if (data.draft) {
        setAiDraft(data.draft);
        setProfileForm((prev) => ({ ...prev, bio: data.draft }));
        const resumeHint = data.resumeName ? ` using ${data.resumeName}` : "";
        setAiStatus(`Draft ready${resumeHint}. Review and click Save profile to keep it.`);
      } else {
        setAiStatus("No draft returned. Try again with a shorter prompt.");
      }
    } catch (err) {
      setAiStatus(err instanceof Error ? err.message : "AI generation failed.");
    }
  };

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEY, token);
      void loadAssignments(token);
      void loadHive(token);
      void loadBoard(boardRoom);
      void loadProfile(token);
    }
  }, [token, loadAssignments, loadHive, loadProfile, loadBoard, boardRoom]);

  useEffect(() => {
    if (token) {
      void loadBoard(boardRoom);
    }
  }, [boardRoom, token, loadBoard]);

  useEffect(() => {
    if (selectedId) {
      void loadDetail(selectedId);
    }
  }, [selectedId, loadDetail]);

  useEffect(() => {
    if (user && !hiveUpload.teacherName) {
      setHiveUpload((prev) => ({ ...prev, teacherName: user.name || user.email || "" }));
    }
  }, [user, hiveUpload.teacherName]);

  if (!ready) return null;

  const topicOptionsForFilter =
    hiveFilter.skill === "All"
      ? Array.from(new Set(Object.values(HIVE_TOPICS).flat()))
      : HIVE_TOPICS[hiveFilter.skill] ?? [];
  const filteredApproved = hiveApproved.filter((file) => {
    const matchesLang = hiveFilter.language === "All" || !file.language || file.language === hiveFilter.language;
    const matchesLevel = hiveFilter.level === "All" || !file.level || file.level === hiveFilter.level;
    const matchesSkill = hiveFilter.skill === "All" || !file.skill || file.skill === hiveFilter.skill;
    const matchesTopic = hiveFilter.topic === "All" || !file.topic || file.topic === hiveFilter.topic;
    const matchesTypeFilter = hiveFilter.fileType === "All" || !file.file_type || file.file_type === hiveFilter.fileType;
    const matchesSearch =
      !hiveSearch.trim() ||
      file.display_name?.toLowerCase().includes(hiveSearch.toLowerCase()) ||
      file.topic?.toLowerCase().includes(hiveSearch.toLowerCase());
    return matchesLang && matchesLevel && matchesSkill && matchesTopic && matchesTypeFilter && matchesSearch;
  });
  const filteredPending = hivePending.filter((file) => {
    const matchesLang = hiveFilter.language === "All" || !file.language || file.language === hiveFilter.language;
    const matchesLevel = hiveFilter.level === "All" || !file.level || file.level === hiveFilter.level;
    const matchesSkill = hiveFilter.skill === "All" || !file.skill || file.skill === hiveFilter.skill;
    const matchesTopic = hiveFilter.topic === "All" || !file.topic || file.topic === hiveFilter.topic;
    const matchesType = hiveFilter.fileType === "All" || !file.file_type || file.file_type === hiveFilter.fileType;
    const matchesSearch =
      !hiveSearch.trim() ||
      file.display_name?.toLowerCase().includes(hiveSearch.toLowerCase()) ||
      file.topic?.toLowerCase().includes(hiveSearch.toLowerCase());
    return matchesLang && matchesLevel && matchesSkill && matchesTopic && matchesType && matchesSearch;
  });
  const filteredRejected = hiveRejected.filter((file) => {
    const matchesLang = hiveFilter.language === "All" || !file.language || file.language === hiveFilter.language;
    const matchesLevel = hiveFilter.level === "All" || !file.level || file.level === hiveFilter.level;
    const matchesSkill = hiveFilter.skill === "All" || !file.skill || file.skill === hiveFilter.skill;
    const matchesTopic = hiveFilter.topic === "All" || !file.topic || file.topic === hiveFilter.topic;
    const matchesType = hiveFilter.fileType === "All" || !file.file_type || file.file_type === hiveFilter.fileType;
    const matchesSearch =
      !hiveSearch.trim() ||
      file.display_name?.toLowerCase().includes(hiveSearch.toLowerCase()) ||
      file.topic?.toLowerCase().includes(hiveSearch.toLowerCase()) ||
      file.notes?.toLowerCase().includes(hiveSearch.toLowerCase());
    return matchesLang && matchesLevel && matchesSkill && matchesTopic && matchesType && matchesSearch;
  });

  const applyHiveFilters = async () => {
    setHiveSearch((s) => s.trim());
    await loadHive();
  };

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
      const must = data.mustReset;
      // Default to forcing a reset if the flag is missing
      setMustReset(must === undefined ? true : Boolean(must));
      setLoginForm({ email: "", password: "" });
      if (!data.mustReset) {
        await loadAssignments(data.token);
      }
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
    setMustReset(false);
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

  const handleForgot = async () => {
    if (!forgotEmail.trim()) {
      setForgotError("Enter your email.");
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    setForgotMessage(null);
    try {
      const response = await fetch("/api/portal/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to send reset email.");
      }
      setForgotMessage("If that email exists, a temporary password was sent. Check your inbox.");
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "Unable to send reset email.");
    } finally {
      setForgotLoading(false);
    }
  };

  const loadAdminInquiries = async () => {
    if (!adminToken.trim()) {
      setAdminError("Enter the admin token to load inquiries.");
      return;
    }
    setAdminError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/portal/admin/inquiries", {
        headers: { "x-admin-token": adminToken.trim() },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load inquiries.");
      }
      const data = (await response.json()) as { inquiries: AdminInquiry[] };
      setAdminInquiries(data.inquiries ?? []);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Unable to load inquiries.");
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

  const submitReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    if (!resetForm.password || resetForm.password !== resetForm.confirm || resetForm.password.length < 8) {
      setLoginError("Passwords must match and be at least 8 characters.");
      return;
    }
    setLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/portal/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-token": token },
        body: JSON.stringify({ newPassword: resetForm.password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to reset password.");
      }
      setMustReset(false);
      setResetForm({ password: "", confirm: "" });
      await loadAssignments(token);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setResetMessage(null);
    if (!resetDraft.newPassword || resetDraft.newPassword !== resetDraft.confirm || resetDraft.newPassword.length < 8) {
      setResetMessage("Passwords must match and be at least 8 characters.");
      return;
    }
    try {
      const res = await fetch("/api/portal/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-token": token },
        body: JSON.stringify({ newPassword: resetDraft.newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to reset password.");
      }
      setResetMessage("Password updated.");
      setResetDraft({ newPassword: "", confirm: "" });
    } catch (err) {
      setResetMessage(err instanceof Error ? err.message : "Unable to reset password.");
    }
  };

  const handleHiveUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !hiveUpload.file) {
      setHiveError("Select a file to upload.");
      return;
    }
    setHiveLoading(true);
    setHiveError(null);
    try {
      const file = hiveUpload.file;
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result ?? "");
          const clean = result.includes(",") ? result.split(",").pop() ?? "" : result;
          resolve(clean);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/portal/hive/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-token": token },
        body: JSON.stringify({
          level: hiveUpload.level || "A1",
          language: hiveUpload.language || "English",
          skill: hiveUpload.skill || "General",
          topic: hiveUpload.topic || "Topic",
          fileType: hiveUpload.fileType || "File",
          teacherName: hiveUpload.teacherName || user?.name || user?.email || "Unknown",
          descriptor: hiveUpload.descriptor || "",
          date: hiveUpload.date || new Date().toISOString().slice(0, 10),
          filename: file.name,
          mime: file.type || "application/octet-stream",
          size: file.size,
          data: base64,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to upload file.");
      }
      setHiveUpload((prev) => ({ ...prev, file: null }));
      await loadHive();
    } catch (err) {
      setHiveError(err instanceof Error ? err.message : "Unable to upload file.");
    } finally {
      setHiveLoading(false);
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
        <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 space-y-4 border border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-400">Teacher / Translator Portal</p>
            <h1 className="mt-2 text-2xl font-semibold">{forgotMode ? "Reset password" : "Sign in"}</h1>
          </div>

          {!forgotMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
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
          ) : (
            <div className="space-y-4">
              <label className="text-sm text-slate-300 space-y-1 block">
                Email
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </label>
              <button
                type="button"
                disabled={forgotLoading}
                onClick={handleForgot}
                className="w-full rounded-2xl bg-teal-500 py-2.5 text-slate-900 font-semibold hover:bg-teal-400 transition disabled:opacity-60"
              >
                {forgotLoading ? "Sending..." : "Email temporary password"}
              </button>
              {forgotMessage ? <p className="text-sm text-emerald-300">{forgotMessage}</p> : null}
              {forgotError ? <p className="text-sm text-rose-300">{forgotError}</p> : null}
            </div>
          )}

          {!forgotMode ? (
            <button
              type="button"
              onClick={() => {
                setForgotMode(true);
                setForgotMessage(null);
                setForgotError(null);
                setForgotEmail(loginForm.email);
              }}
              className="text-xs text-teal-300 underline"
            >
              Forgot password?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setForgotMessage(null);
                setForgotError(null);
              }}
              className="text-xs text-teal-300 underline"
            >
              Back to sign in
            </button>
          )}
          <p className="text-xs text-slate-500">
            Issues signing in? Contact <a className="text-teal-300 underline" href="mailto:jblinguisticsllc@gmail.com">support</a>.
          </p>
        </div>
      </main>
    );
  }

  if (mustReset) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <form onSubmit={submitReset} className="w-full max-w-md rounded-3xl bg-slate-900 p-6 space-y-4 border border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-400">Teacher / Translator Portal</p>
            <h1 className="mt-2 text-2xl font-semibold">Set your password</h1>
          </div>
          <label className="text-sm text-slate-300 space-y-1 block">
            New password
            <input
              type="password"
              value={resetForm.password}
              onChange={(e) => setResetForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
          <label className="text-sm text-slate-300 space-y-1 block">
            Confirm password
            <input
              type="password"
              value={resetForm.confirm}
              onChange={(e) => setResetForm((prev) => ({ ...prev, confirm: e.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-teal-500 py-2.5 text-slate-900 font-semibold hover:bg-teal-400 transition"
            disabled={loading}
          >
            {loading ? "Saving…" : "Save password"}
          </button>
          {loginError && <p className="text-sm text-rose-300">{loginError}</p>}
          <button onClick={handleLogout} className="text-xs text-slate-400 underline">
            Log out
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white pb-20">
      <header className="bg-slate-800/80 shadow-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-300">JB Linguistics</p>
            <h1 className="text-2xl font-semibold text-white">Teacher & Translator Portal</h1>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-slate-300">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 mt-8 space-y-4">
        <div className="rounded-3xl bg-slate-800 border border-slate-700 p-6 shadow-lg text-white space-y-2">
          <p className="text-sm text-slate-200">
            Please keep your profile up to date. First-time users: complete your profile and onboarding. When new assignments arrive, you’ll get an email to check your portal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-slate-800 border border-slate-700 p-2">
          {[
            { key: "profile", label: "Profile" },
            { key: "board", label: "Community Board" },
            { key: "assignments", label: "Assignments" },
            { key: "hive", label: "Hive Mind" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setPortalTab(tab.key as typeof portalTab)}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
                portalTab === tab.key ? "bg-teal-500 text-slate-900" : "text-slate-200 hover:bg-slate-700/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {portalTab === "profile" && (
      <section className="max-w-6xl mx-auto px-4 mt-8 space-y-4">
        <div className="rounded-3xl bg-slate-800 border border-slate-700 p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-300">Welcome</p>
              <h2 className="text-xl font-semibold text-white">Profile & onboarding</h2>
              <p className="text-sm text-slate-300">Keep your contact info and required documents up to date.</p>
            </div>
            <button
              type="button"
              onClick={() => loadProfile()}
              className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-100 hover:bg-slate-700"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowProfileSection((prev) => !prev)}
              className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-100 hover:bg-slate-700"
            >
              {showProfileSection ? "Hide" : "Show"}
            </button>
          </div>
          {profileError && <p className="text-sm text-rose-300 mt-2">{profileError}</p>}
          {profileLoading && <p className="text-xs text-slate-400 mt-1">Syncing profile…</p>}

          {showProfileSection && (
            <>
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-300">Admin-approved roles</p>
                <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                  <span className={`px-3 py-1 rounded-full ${profile?.teacher_role ? "bg-teal-500 text-slate-900" : "bg-slate-800 text-slate-300"}`}>
                    Teacher {profile?.teacher_role ? "✓" : "—"}
                  </span>
                  <span className={`px-3 py-1 rounded-full ${profile?.translator_role ? "bg-teal-500 text-slate-900" : "bg-slate-800 text-slate-300"}`}>
                    Translator {profile?.translator_role ? "✓" : "—"}
                  </span>
                </div>
                {(profile?.teaching_languages?.length || profile?.translating_languages?.length) && (
                  <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-300">
                    {profile?.teaching_languages?.length ? (
                      <div>
                        <p className="font-semibold text-slate-100">Approved teaching languages</p>
                        <p>{(profile.teaching_languages as any[]).join(", ")}</p>
                      </div>
                    ) : null}
                    {profile?.translating_languages?.length ? (
                      <div>
                        <p className="font-semibold text-slate-100">Approved translating languages</p>
                        <p>{(profile.translating_languages as any[]).join(", ")}</p>
                      </div>
                    ) : null}
                  </div>
                )}
                {profile?.certifications?.length ? (
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-slate-100">Certifications</p>
                    <p>{profile.certifications.join(", ")}</p>
                  </div>
                ) : null}
                <div className="grid md:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                    <p className="font-semibold text-slate-100">Publishing</p>
                    <p>Teacher profile: {profile?.publish_teacher ? "Enabled" : "Disabled"}</p>
                    <p>Translator profile: {profile?.publish_translator ? "Enabled" : "Disabled"}</p>
                    <p>Visibility: {profile?.staff_visibility ?? "visible"}</p>
                  </div>
                  <div className="md:col-span-2 text-[11px] text-amber-300">
                    Publishing to public pages follows Admin approvals. If you’re approved as teacher only, only teacher profile can be published; translator-only likewise. Ask Admin if this looks incorrect.
                  </div>
                </div>
                <p className="text-[11px] text-amber-300">
                  Publishing to public teacher/translator pages will be limited to the roles/languages approved by admin.
                </p>
              </div>

              <form onSubmit={saveProfile} className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                <label className="space-y-1 text-slate-200">
                  Name
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                    placeholder="Your full name"
                  />
                </label>
                <label className="space-y-1 text-slate-200">
                  Phone
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                    placeholder="+49 170 1234567"
                  />
                </label>
                <label className="space-y-1 text-slate-200">
                  Address
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                    placeholder="Street and number"
                  />
                </label>
                <label className="space-y-1 text-slate-200">
                  City
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                    placeholder="City / Town"
                  />
                </label>
                <label className="space-y-1 text-slate-200">
                  State / Region
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, state: e.target.value }))}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                    placeholder="State / Province / Region"
                  />
                </label>
                <label className="space-y-1 text-slate-200">
                  Country
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, country: e.target.value }))}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                    placeholder="Country or ISO code"
                  />
                </label>
                <label className="md:col-span-2 space-y-1 text-slate-200">
                  Bio / notes
                  <textarea
                    rows={2}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                    placeholder="Short bio, specialties, availability"
                  />
                </label>
                <label className="md:col-span-2 space-y-1 text-slate-200">
                  Languages (comma separated)
                  <input
                    type="text"
                    value={profileForm.languages}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, languages: e.target.value }))}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                    placeholder="English, German"
                  />
                </label>
                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-teal-500 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-teal-400 disabled:opacity-60"
                    disabled={profileLoading}
                  >
                    Save profile
                  </button>
                  {profile?.email && <p className="text-xs text-slate-400">Account: {profile.email}</p>}
                </div>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-4 space-y-3 shadow-inner">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">Generate bio with AI</h3>
                  <p className="text-xs text-slate-400">
                    We’ll read your latest resume (override → application → recent PDF/Word upload) and draft a JB Linguistics bio. Add an optional prompt to guide tone or highlights, then click
                    Save profile to keep it.
                  </p>
                  <label className="space-y-1 text-slate-200">
                    Optional prompt (tone, focus, specialties)
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                      placeholder="e.g., Emphasize exam prep and business translation"
                    />
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={generateAiBio}
                      className="rounded-full bg-teal-500 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-teal-400 disabled:opacity-60"
                      disabled={profileLoading}
                    >
                      Generate draft
                    </button>
                    {aiStatus && <p className="text-xs text-slate-300">{aiStatus}</p>}
                  </div>
                  {aiDraft && (
                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-400">Draft (editable)</p>
                      <textarea
                        rows={4}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                        className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-4 space-y-3 shadow-inner">
                {(profileDocs.resumeUrl || profileDocs.contractUrl) && (
                  <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3 space-y-1 text-xs text-slate-200">
                    <p className="font-semibold text-slate-100">Your core documents</p>
                    {profileDocs.resumeUrl ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase text-slate-400">Resume</span>
                        <a href={profileDocs.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">
                          {profileDocs.resumeName ?? "Resume"}
                        </a>
                      </div>
                    ) : null}
                    {profileDocs.contractUrl ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase text-slate-400">Contract</span>
                        <a href={profileDocs.contractUrl} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">
                          {profileDocs.contractName ?? "Contract"}
                        </a>
                      </div>
                    ) : null}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Upload onboarding documents</h3>
                    <p className="text-xs text-slate-400">
                      Headshot, ID, certifications, tax forms. Uploads are append-only and stored in your employee file.
                    </p>
                    <p className="text-[11px] text-amber-300 mt-1">
                      For AI bio: upload a PDF or Word resume (no Pages). If using Pages, export to PDF first.
                    </p>
                  </div>
                </div>
                {profileUploads.length > 0 && (
                  <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3 space-y-1 text-xs text-slate-200">
                    <p className="font-semibold text-slate-100">Your uploaded files</p>
                    {profileUploads.map((u) => (
                      <div key={u.id} className="flex items-center gap-2">
                        <span className="text-[11px] uppercase text-slate-400">{u.kind}</span>
                        {u.signedUrl ? (
                          <a href={u.signedUrl} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">
                            {u.filename}
                          </a>
                        ) : (
                          <span>{u.filename}</span>
                        )}
                        {u.uploadedAt ? <span className="text-[11px] text-slate-500">{new Date(u.uploadedAt).toLocaleString()}</span> : null}
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={uploadProfileFile} className="grid md:grid-cols-3 gap-3 text-sm items-end">
                  <label className="space-y-1 text-slate-200">
                    Type
                    <select name="kind" className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white">
                      <option value="photo">Photo / headshot</option>
                      <option value="id">ID / passport</option>
                      <option value="cert">Certification</option>
                      <option value="tax">Tax form</option>
                      <option value="resume_override">Replace resume (PDF/Word)</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-slate-200 md:col-span-2">
                    File
                    <input type="file" name="file" className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white" />
                  </label>
                  <div className="md:col-span-3 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={uploadingProfileFile}
                      className="rounded-full bg-teal-500 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-teal-400 disabled:opacity-60"
                    >
                      {uploadingProfileFile ? "Uploading…" : "Upload to file"}
                    </button>
                    {uploadMessage && <p className="text-xs text-slate-400">{uploadMessage}</p>}
                  </div>
                </form>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-4 space-y-3 shadow-inner">
                <h3 className="text-sm font-semibold text-white">Reset password</h3>
                <p className="text-xs text-slate-400">Change your portal password at any time.</p>
                <form onSubmit={changePassword} className="grid md:grid-cols-2 gap-3 text-sm">
                  <label className="space-y-1 text-slate-200">
                    New password
                    <input
                      type="password"
                      value={resetDraft.newPassword}
                      onChange={(e) => setResetDraft((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="space-y-1 text-slate-200">
                    Confirm
                    <input
                      type="password"
                      value={resetDraft.confirm}
                      onChange={(e) => setResetDraft((prev) => ({ ...prev, confirm: e.target.value }))}
                      className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                    />
                  </label>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="rounded-full bg-teal-500 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-teal-400"
                    >
                      Update password
                    </button>
                    {resetMessage && <span className="text-xs text-slate-300">{resetMessage}</span>}
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </section>
      )}

      {portalTab === "board" && (
      <section className="max-w-6xl mx-auto px-4 mt-8 space-y-4">
        <div className="rounded-3xl bg-slate-800 border border-slate-700 p-6 shadow-lg text-white space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-300">Community board</p>
              <h2 className="text-xl font-semibold text-white">Announcements & chat</h2>
              <p className="text-sm text-slate-300">Rooms: Announcements (default), Staff Lounge, Onboarding, The Hive, Feature Requests & Tech Support.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={boardRoom}
                onChange={(e) => {
                  setBoardRoom(e.target.value);
                }}
                className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              >
                <option value="announcements">Announcements</option>
                <option value="staff_lounge">Staff Lounge</option>
                <option value="onboarding">Onboarding</option>
                <option value="hive">The Hive</option>
                <option value="feature_requests">Feature Requests & Tech Support</option>
              </select>
              <button
                type="button"
                onClick={() => loadBoard(boardRoom)}
                className="rounded-full border border-slate-600 px-3 py-2 text-xs text-slate-100 hover:bg-slate-700"
              >
                Refresh
              </button>
            </div>
          </div>
          {boardError && <p className="text-sm text-rose-300">{boardError}</p>}
          {boardLoading && <p className="text-xs text-slate-400">Loading messages…</p>}
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 max-h-[50vh] overflow-auto space-y-2">
            {boardMessages.length === 0 ? (
              <p className="text-sm text-slate-400">No messages yet.</p>
            ) : (
              boardMessages.map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{m.author_name || "JB Linguistics"}</span>
                    <span>{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</span>
                  </div>
                  <p className="mt-1 text-slate-100 whitespace-pre-wrap">{m.message}</p>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2">
            <textarea
              value={boardInput}
              onChange={(e) => setBoardInput(e.target.value)}
              rows={3}
              placeholder="Share an update or question with the room..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
            <button
              type="button"
              disabled={!boardInput.trim()}
              onClick={async () => {
                if (!token || !boardInput.trim()) return;
                setBoardError(null);
                setBoardLoading(true);
                try {
                  const res = await fetch("/api/portal/board", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "x-portal-token": token },
                    body: JSON.stringify({ room: boardRoom, message: boardInput }),
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Unable to post.");
                  }
                  setBoardInput("");
                  await loadBoard(boardRoom);
                } catch (err) {
                  setBoardError(err instanceof Error ? err.message : "Unable to post.");
                } finally {
                  setBoardLoading(false);
                }
              }}
              className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-400 disabled:opacity-50"
            >
              Post to {boardRoom.replace("_", " ")}
            </button>
          </div>
        </div>
      </section>
      )}

      {portalTab === "assignments" && (
      <section className="max-w-6xl mx-auto px-4 mt-8 grid lg:grid-cols-[1fr,1.5fr] gap-8">
        <aside className="rounded-3xl bg-slate-800 border border-slate-700 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Assignments</h2>
            <button
              type="button"
              onClick={() => loadAssignments()}
              className="text-xs text-slate-300 hover:text-white"
            >
              Refresh
            </button>
          </div>
          {loginError && <p className="text-sm text-rose-300">{loginError}</p>}
          {loading && <p className="text-xs text-slate-400">Syncing…</p>}
          <div className="space-y-3 max-h-[70vh] overflow-auto">
            {assignments.length === 0 ? (
              <p className="text-sm text-slate-300">No assignments yet.</p>
            ) : (
              assignments.map((item) => (
                <button
                  key={item.assignment.id}
                  type="button"
                  onClick={() => setSelectedId(item.assignment.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 ${
                    selectedId === item.assignment.id
                      ? "border-teal-500 bg-slate-700"
                      : "border-slate-700 bg-slate-800 hover:border-teal-400"
                  }`}
                >
                  <p className="font-semibold text-white">{item.assignment.title}</p>
                  <p className="text-xs text-slate-300">
                    {item.assignment.assignmentType === "class" ? "Class" : "Translation"} · {item.hoursLogged}/
                    {item.assignment.hoursAssigned} hrs
                  </p>
                  <p className="text-xs text-slate-300 capitalize">Status: {item.assignment.status}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-3xl bg-slate-800 border border-slate-700 p-6 space-y-8 shadow-lg">
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
      )}

      {portalTab === "hive" && (
      <section className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* Browse the Hive */}
        <div className="rounded-3xl bg-slate-800 border border-slate-700 p-6 shadow-lg text-white space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-300">JB Linguistics</p>
              <h2 className="text-xl font-semibold text-white">Hive Mind (Teacher Resources)</h2>
              <p className="text-sm text-slate-300">Search and download shared resources.</p>
            </div>
            <button
              type="button"
              onClick={() => loadHive()}
              className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-100 hover:bg-slate-700"
            >
              Refresh
            </button>
          </div>

          <div className="grid md:grid-cols-5 gap-3 text-xs md:text-sm">
            <select
              value={hiveFilter.language}
              onChange={(e) => setHiveFilter((p) => ({ ...p, language: e.target.value }))}
              className="rounded-xl border border-slate-700 bg-slate-900 text-white px-3 py-2"
            >
              <option>All</option>
              {HIVE_LANGUAGES.map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>
            <select
              value={hiveFilter.level}
              onChange={(e) => setHiveFilter((p) => ({ ...p, level: e.target.value }))}
              className="rounded-xl border border-slate-700 bg-slate-900 text-white px-3 py-2"
            >
              <option>All</option>
              {HIVE_LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
            <select
              value={hiveFilter.skill}
              onChange={(e) => {
                const nextSkill = e.target.value;
                setHiveFilter((p) => ({ ...p, skill: nextSkill, topic: "All" }));
              }}
              className="rounded-xl border border-slate-700 bg-slate-900 text-white px-3 py-2"
            >
              <option>All</option>
              {HIVE_SKILLS.map((skill) => (
                <option key={skill}>{skill}</option>
              ))}
            </select>
            <select
              value={hiveFilter.topic}
              onChange={(e) => setHiveFilter((p) => ({ ...p, topic: e.target.value }))}
              className="rounded-xl border border-slate-700 bg-slate-900 text-white px-3 py-2"
            >
              <option>All</option>
              {topicOptionsForFilter.map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>
            <select
              value={hiveFilter.fileType}
              onChange={(e) => setHiveFilter((p) => ({ ...p, fileType: e.target.value }))}
              className="rounded-xl border border-slate-700 bg-slate-900 text-white px-3 py-2"
            >
              <option>All</option>
              {HIVE_FILE_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={hiveSearch}
              onChange={(e) => setHiveSearch(e.target.value)}
              placeholder="Search by name or topic"
              className="flex-1 min-w-[240px] md:w-1/2 rounded-xl border border-slate-700 bg-slate-900 text-white px-3 py-2 text-sm placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => {
                void applyHiveFilters();
              }}
              className="rounded-full border border-slate-600 px-3 py-2 text-xs text-slate-100 hover:bg-slate-700"
            >
              Apply search
            </button>
          </div>

          {hiveError && <p className="text-sm text-rose-300 mt-2">{hiveError}</p>}
          {hiveLoading && <p className="text-xs text-slate-400 mt-1">Syncing Hive…</p>}

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 space-y-2 max-h-[60vh] overflow-auto">
            {filteredApproved.length === 0 ? (
              <p className="text-slate-400 text-sm">No resources match these filters.</p>
            ) : (
              filteredApproved.map((file) => (
                <a
                  key={file.id}
                  href={file.signed_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 border border-slate-700 rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{file.display_name}</p>
                    <p className="text-[12px] text-slate-400 truncate">
                      {file.language || "—"} · {file.level || "—"} · {file.skill || "—"} · {file.topic || "—"}
                    </p>
                  </div>
                  <span className="text-teal-300 text-xs">⬇</span>
                </a>
              ))
            )}
          </div>
        </div>

        {/* Upload & status for this teacher */}
        <div className="rounded-3xl bg-slate-800 border border-slate-700 p-6 shadow-lg text-white space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-300">Your uploads</p>
              <h2 className="text-lg font-semibold text-white">Submit to Hive</h2>
              <p className="text-sm text-slate-300">Upload materials; admins will approve or reject with notes.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Pending review</h3>
            <div className="rounded-2xl border border-slate-700 shadow-sm p-3 max-h-48 overflow-auto text-sm bg-slate-900">
              {hivePending.length === 0 ? (
                <p className="text-slate-400">No pending submissions.</p>
              ) : (
                hivePending.map((file) => (
                  <div key={file.id} className="border border-slate-700 rounded-xl px-3 py-2 space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-white truncate flex-1">{file.display_name}</p>
                      <button
                        type="button"
                        className="text-[11px] text-rose-300 underline"
                        onClick={async () => {
                          const confirmed = typeof window === "undefined" ? true : window.confirm("Delete this upload?");
                          if (!confirmed) return;
                          try {
                            await fetch("/api/portal/hive/manage", {
                              method: "POST",
                              headers: { "Content-Type": "application/json", "x-portal-token": token },
                              body: JSON.stringify({ action: "delete", id: file.id }),
                            });
                            await loadHive();
                          } catch (err) {
                            setHiveError(err instanceof Error ? err.message : "Unable to delete file.");
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 truncate">
                      {file.level || "—"} · {file.skill || "—"} · {file.topic || "—"}
                    </p>
                    <p className="text-[11px] text-slate-400">Status: Pending review</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Rejected (see note, then delete and re-upload)</h3>
            <div className="rounded-2xl border border-slate-700 shadow-sm p-3 max-h-48 overflow-auto text-sm bg-slate-900 space-y-2">
              {hiveRejected.length === 0 ? (
                <p className="text-slate-400">No rejected files.</p>
              ) : (
                hiveRejected.map((file) => (
                  <div key={file.id} className="border border-slate-700 rounded-xl px-3 py-2 flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-white truncate">{file.display_name}</p>
                      <button
                        type="button"
                        className="text-[11px] text-rose-300 underline"
                        onClick={async () => {
                          const confirmed = typeof window === "undefined" ? true : window.confirm("Delete this rejected file?");
                          if (!confirmed) return;
                          try {
                            await fetch("/api/portal/hive/manage", {
                              method: "POST",
                              headers: { "Content-Type": "application/json", "x-portal-token": token },
                              body: JSON.stringify({ action: "delete", id: file.id }),
                            });
                            await loadHive();
                          } catch (err) {
                            setHiveError(err instanceof Error ? err.message : "Unable to delete file.");
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 truncate">
                      {file.level || "—"} · {file.skill || "—"} · {file.topic || "—"}
                    </p>
                    {file.notes && <p className="text-[11px] text-amber-300">Note: {file.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleHiveUpload} className="rounded-2xl border border-slate-700 shadow-sm p-4 space-y-3 bg-slate-900 text-white">
            <h3 className="text-sm font-semibold text-white">Upload to Hive</h3>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <label className="space-y-1 text-slate-200">
                Language
                <select
                  value={hiveUpload.language}
                  onChange={(e) => setHiveUpload((prev) => ({ ...prev, language: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2"
                >
                  {HIVE_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-slate-200">
                Level (A1–C2)
                <select
                  value={hiveUpload.level}
                  onChange={(e) => setHiveUpload((prev) => ({ ...prev, level: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2"
                >
                  {HIVE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-slate-200">
                Skill
                <select
                  value={hiveUpload.skill}
                  onChange={(e) => {
                    const newSkill = e.target.value;
                    const firstTopic = (HIVE_TOPICS[newSkill] ?? [])[0] ?? "";
                    setHiveUpload((prev) => ({ ...prev, skill: newSkill, topic: firstTopic }));
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2"
                >
                  {HIVE_SKILLS.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-slate-200">
                Topic
                <select
                  value={hiveUpload.topic}
                  onChange={(e) => setHiveUpload((prev) => ({ ...prev, topic: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2"
                >
                  {(HIVE_TOPICS[hiveUpload.skill] ?? []).map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-slate-200">
                File type
                <select
                  value={hiveUpload.fileType}
                  onChange={(e) => setHiveUpload((prev) => ({ ...prev, fileType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2"
                >
                  {HIVE_FILE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-slate-200">
                Teacher name
                <input
                  type="text"
                  value={hiveUpload.teacherName}
                  onChange={(e) => setHiveUpload((prev) => ({ ...prev, teacherName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-slate-200">
                Descriptor (optional)
                <input
                  type="text"
                  value={hiveUpload.descriptor}
                  onChange={(e) => setHiveUpload((prev) => ({ ...prev, descriptor: e.target.value }))}
                  placeholder="e.g., Bingo, AnswerSheet"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-slate-200">
                Date
                <input
                  type="date"
                  value={hiveUpload.date}
                  onChange={(e) => setHiveUpload((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2"
                />
              </label>
            </div>
            <label className="space-y-1 text-slate-200 text-sm block">
              File
              <input
                type="file"
                onChange={(e) => setHiveUpload((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={hiveLoading || !hiveUpload.file}
              className="rounded-full bg-teal-500 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-400 disabled:opacity-60"
            >
              {hiveLoading ? "Uploading…" : "Upload to Hive"}
            </button>
          </form>
        </div>
      </section>
      )}
    </main>
  );
}
