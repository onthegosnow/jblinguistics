"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  teacherAssessmentLanguages,
  type TeacherAssessmentLanguage,
  type TeacherAssessmentScore,
  type TeacherAssessmentAnswer,
} from "@/lib/teacher-assessment";
import { translatorLanguages, type TranslatorExerciseLanguage } from "@/lib/translator-exercise";
import TripsManager from "./trips-manager";
import { StudentsManager } from "./students-manager";
import OrganizationsManager from "./organizations-manager";
import PlacementManager from "./placement-manager";
import ClassesManager from "./classes-manager";

const STORAGE_KEY = "jb_assessment_admin_token";
const normalizeRoom = (value: string) => value?.trim().toLowerCase().replace(/\s+/g, "_");
const extraTeacherLanguages = [
  { id: "farsi", label: "Farsi" },
  { id: "arabic", label: "Arabic" },
  { id: "polish", label: "Polish" },
  { id: "hindi", label: "Hindi" },
  { id: "swahili", label: "Swahili" },
] as const;
const teacherLanguageOptions = [
  { id: "english", label: "English" },
  { id: "german", label: "German" },
  { id: "french", label: "French" },
  { id: "dutch", label: "Dutch" },
  { id: "danish", label: "Danish" },
  { id: "swedish", label: "Swedish" },
  { id: "norwegian", label: "Norwegian" },
  { id: "russian", label: "Russian" },
  { id: "italian", label: "Italian" },
  { id: "spanish", label: "Spanish" },
  { id: "portuguese", label: "Portuguese" },
  { id: "mandarin", label: "Mandarin" },
  { id: "japanese", label: "Japanese" },
  { id: "korean", label: "Korean" },
  { id: "farsi", label: "Farsi" },
  { id: "arabic", label: "Arabic" },
  { id: "polish", label: "Polish" },
  { id: "hindi", label: "Hindi" },
  { id: "swahili", label: "Swahili" },
] as const;
const teacherLanguageLabels = teacherLanguageOptions.reduce<Record<string, string>>((acc, lang) => {
  acc[lang.id] = lang.label;
  return acc;
}, {});
// Clearer English labels for common Asian languages
teacherLanguageLabels["zh"] = "Chinese (Simplified)";
teacherLanguageLabels["zh-TW"] = "Chinese (Traditional)";
teacherLanguageLabels["ja"] = "Japanese";
teacherLanguageLabels["ko"] = "Korean";
const translatorLanguageOptions = [
  { id: "english", label: "English" },
  { id: "german", label: "German" },
  { id: "french", label: "French" },
  { id: "dutch", label: "Dutch" },
  { id: "danish", label: "Danish" },
  { id: "swedish", label: "Swedish" },
  { id: "norwegian", label: "Norwegian" },
  { id: "russian", label: "Russian" },
  { id: "italian", label: "Italian" },
  { id: "spanish", label: "Spanish" },
  { id: "portuguese", label: "Portuguese" },
  { id: "mandarin", label: "Mandarin" },
  { id: "japanese", label: "Japanese" },
  { id: "korean", label: "Korean" },
  { id: "farsi", label: "Farsi" },
  { id: "arabic", label: "Arabic" },
  { id: "polish", label: "Polish" },
  { id: "hindi", label: "Hindi" },
  { id: "swahili", label: "Swahili" },
  { id: "other", label: "Other" },
] as const;
const translatorLanguageLabels = translatorLanguageOptions.reduce<Record<string, string>>((acc, lang) => {
  acc[lang.id] = lang.label;
  return acc;
}, {});
const certOptions = [
  "TESOL/TEFL/CELTA/DELTA",
  "State/IB teaching cert",
  "MA Applied Linguistics",
  "ATA certified",
  "Court-certified interpreter",
  "Legal/Medical translation",
  "HIPAA",
  "UN/embassy/secure clearance",
  "DoD/ITAR/FOIA handling",
  "Security clearance (specify)",
] as const;
const certSlug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type SubmissionRecord = {
  id: string;
  submittedAt: string;
  candidateName: string;
  candidateEmail?: string;
  proctorEmail: string;
  testLanguage: string;
  summary: {
    totalCorrect: number;
    totalQuestions: number;
    percentage: number;
    breakdown: Record<string, { correct: number; incorrect: number; unanswered: number; total: number }>;
  };
  accessMeta?: { mode: string; code?: string; label?: string };
};

type AccessCodeRecord = {
  code: string;
  label: string;
  candidateName?: string;
  candidateEmail?: string;
  maxUses: number;
  uses: number;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  notes?: string;
};

const PublicStaffPreview = dynamic(() => import("./public-staff-preview").then((m) => m.PublicStaffPreview), {
  ssr: false,
});

type ApplicantRecord = {
  id: string;
  submittedAt: string;
  name: string;
  email?: string;
  status?: "active" | "rejected";
  rejectedAt?: string | null;
  interviewNotes?: string;
  location?: string;
  languages?: string;
  experience?: string;
  availability?: string;
  message?: string;
  roles: string[];
  workingLanguages?: string[];
  inviteSentAt?: string | null;
  hireSentAt?: string | null;
  docuSignSentAt?: string | null;
  resume: { filename: string; mimeType: string; size: number };
  resumeInsights?: {
    summary: string;
    keywords: string[];
    score: number;
    verdict: "strong" | "review";
    reasoning: string;
  };
  teacherAssessments?: Array<{
    language: TeacherAssessmentLanguage;
    seed: number;
    answers: TeacherAssessmentAnswer[];
    responses: { conflict: string; attendance: string };
    score: TeacherAssessmentScore;
  }>;
  translatorExercise?: {
    language: TranslatorExerciseLanguage;
    submission: string;
    score: number | null;
    missingTokens: string[];
  };
};

type PortalUserAdmin = {
  id: string;
  name: string;
  email: string;
  roles: ("teacher" | "translator")[];
  languages?: string[];
  createdAt: string;
  active: boolean;
  publicProfile?: {
    visibility: string;
    roles: string[];
    slug: string;
  } | null;
};

type PortalAssignmentAdmin = {
  id: string;
  title: string;
  assignmentType: "class" | "translation";
  description?: string;
  client?: string;
  languagePair?: string;
  hoursAssigned: number;
  startDate?: string;
  dueDate?: string;
  status: "assigned" | "accepted" | "rejected" | "in_progress" | "submitted" | "completed";
  participants: string[];
  assignees: { id: string; name: string; email: string }[];
  schedule?: string;
  meetingUrl?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionNote?: string;
  createdAt: string;
  updatedAt: string;
};

type EmailLog = {
  id: string;
  subject: string;
  body: string;
  sent_to: Array<{ name?: string; email?: string }>;
  created_at: string;
  archived?: boolean;
};

type StudentPortal = {
  id: string;
  name: string;
  email: string;
  active: boolean;
};

type InquiryAdmin = {
  id: string;
  createdAt: string | null;
  name: string;
  email: string;
  organization: string | null;
  serviceType: string | null;
  languages: string | null;
  details: string | null;
  source: string;
  metadata?: Record<string, string>;
};

type CRMContact = {
  id: string;
  name: string;
  email: string;
  organization?: string | null;
  contactType?: string | null;
  serviceInterest?: string | null;
  status?: string | null;
  marketingOptIn?: boolean | null;
  createdAt?: string | null;
  nextFollowupAt?: string | null;
};

export default function AssessmentsAdminPage() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(STORAGE_KEY) ?? "";
  });
  const [inputToken, setInputToken] = useState("");
  const [results, setResults] = useState<SubmissionRecord[]>([]);
  const [codes, setCodes] = useState<AccessCodeRecord[]>([]);
  const [applicants, setApplicants] = useState<ApplicantRecord[]>([]);
  const [rejectedApplicants, setRejectedApplicants] = useState<ApplicantRecord[]>([]);
  const [showRejected, setShowRejected] = useState(false);
  const [selectedRejectedId, setSelectedRejectedId] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "results"
    | "codes"
    | "applicants"
    | "assignments"
    | "portalUsers"
    | "inquiries"
    | "onboarding"
    | "crm"
    | "hive"
    | "board"
    | "trips"
    | "students"
    | "organizations"
    | "placement"
    | "classes"
  >("results");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", candidateName: "", candidateEmail: "", maxUses: 1, expiresAt: "", notes: "" });
  const [portalUsers, setPortalUsers] = useState<PortalUserAdmin[]>([]);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resetMessages, setResetMessages] = useState<Record<string, string>>({});
  const [hiveApproved, setHiveApproved] = useState<any[]>([]);
  const [hivePending, setHivePending] = useState<any[]>([]);
  const [hiveRejected, setHiveRejected] = useState<any[]>([]);
  const [hiveDeadLinkCount, setHiveDeadLinkCount] = useState(0);
  const [hivePacks, setHivePacks] = useState<any[]>([]);
  const [hivePackSuggestions, setHivePackSuggestions] = useState<any[]>([]);
  const [hiveSubTab, setHiveSubTab] = useState<"pending" | "approved" | "packs" | "suggestions">("pending");
  const [hiveSelectedPack, setHiveSelectedPack] = useState<any | null>(null);
  const [hiveCheckingLinks, setHiveCheckingLinks] = useState(false);
  const [hivePackForm, setHivePackForm] = useState({ name: "", description: "", language: "English", level: "A1", weekNumber: "" });
  const [hiveEditFile, setHiveEditFile] = useState<any | null>(null);
  const [assignments, setAssignments] = useState<PortalAssignmentAdmin[]>([]);
  const [editingAssignment, setEditingAssignment] = useState<PortalAssignmentAdmin | null>(null);
  const [resendingAssignmentId, setResendingAssignmentId] = useState<string | null>(null);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentPortal[]>([]);
  const [bulkEmail, setBulkEmail] = useState({ subject: "", message: "" });
  const [bulkEmailAttachments, setBulkEmailAttachments] = useState<File[]>([]);
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loadingEmailLogs, setLoadingEmailLogs] = useState(false);
  const [showArchivedEmailLogs, setShowArchivedEmailLogs] = useState(false);
  const [expandedEmailLogs, setExpandedEmailLogs] = useState<Record<string, boolean>>({});
  const [syncingPhotos, setSyncingPhotos] = useState(false);
  const [syncPhotoResult, setSyncPhotoResult] = useState<string | null>(null);
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", roles: { teacher: true, translator: false }, languages: "" });
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    assignmentType: "class",
    description: "",
    client: "",
    languagePair: "",
    hoursAssigned: 1.5,
    startDate: "",
    dueDate: "",
    participants: [] as string[],
    assignedTo: [] as string[],
    schedule: "",
    meetingUrl: "",
  });
  const [assignmentFiles, setAssignmentFiles] = useState<FileList | null>(null);
  const [deletingApplicantId, setDeletingApplicantId] = useState<string | null>(null);
  const [sendingHireId, setSendingHireId] = useState<string | null>(null);
  const [sendingInviteId, setSendingInviteId] = useState<string | null>(null);
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
  const [uploadingOnboarding, setUploadingOnboarding] = useState(false);
  const [onboardingFiles, setOnboardingFiles] = useState<Record<string, File[]>>({});
  const [manualApplicant, setManualApplicant] = useState({
    name: "",
    email: "",
    roles: { teacher: true, translator: false },
    languages: "",
    resume: null as File | null,
  });
  const [expandedApplicants, setExpandedApplicants] = useState<Record<string, boolean>>({});
  const [expandedEmployees, setExpandedEmployees] = useState<Record<string, boolean>>({});
  const [employeeNoteDraft, setEmployeeNoteDraft] = useState<Record<string, string>>({});
  const [employeeUploadDraft, setEmployeeUploadDraft] = useState<Record<string, { file: File | null; kind: string }>>({});
  const [employeeUploadKindDraft, setEmployeeUploadKindDraft] = useState<Record<string, Record<string, string>>>({});
  const [deletingUploadId, setDeletingUploadId] = useState<string | null>(null);
  const [employeeTermination, setEmployeeTermination] = useState<Record<string, string>>({});
  const [employeeRolesDraft, setEmployeeRolesDraft] = useState<
    Record<
      string,
      {
        teacherRole: boolean;
        translatorRole: boolean;
        teachingLanguages: string[];
        translatingLanguages: string[];
        certifications: string[];
      }
    >
  >({});
  const [photoErrors, setPhotoErrors] = useState<Record<string, boolean>>({});
  const [rejectingApplicantId, setRejectingApplicantId] = useState<string | null>(null);
  const [rolesSaved, setRolesSaved] = useState<Record<string, number>>({});
  const [pendingProfilesOpen, setPendingProfilesOpen] = useState(false);
  const [savingManualApplicant, setSavingManualApplicant] = useState(false);
  const [onboardingEnvelopes, setOnboardingEnvelopes] = useState<
    Array<{
      envelopeId: string;
      signerName?: string | null;
      signerEmail?: string | null;
      completedAt?: string | null;
      docUrl?: string;
      resumeUrl?: string;
      applicantId?: string | null;
    }>
  >([]);
  const [employees, setEmployees] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      roles: string[];
      languages: string[];
      active: boolean;
      createdAt: string | null;
      status: string;
      terminationDate?: string | null;
      bio?: string | null;
      phone?: string | null;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      photoUrl?: string | null;
      resumeUrl?: string;
      resumeName?: string;
      contractUrl?: string;
      contractName?: string;
      assignments: Array<{ id: string; title: string; status: string; client?: string; languagePair?: string }>;
      notes: Array<{ id: string; note: string; createdAt: string; createdBy?: string | null }>;
      uploads: Array<{
        id: string;
        kind: string;
        filename: string;
        createdAt: string;
        mimeType?: string | null;
        size?: number | null;
        path?: string | null;
        signedUrl?: string;
        source?: "portal" | "admin";
      }>;
      application?: ApplicantRecord;
      publicProfile?: { visibility: string; roles: string[]; slug: string } | null;
    }>
  >([]);
  const [inquiries, setInquiries] = useState<InquiryAdmin[]>([]);
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>([]);
  const [boardMessages, setBoardMessages] = useState<Array<{ id: string; room: string; author_name: string | null; message: string; created_at: string }>>([]);
  const [boardRoom, setBoardRoom] = useState("announcements");
  const [boardInput, setBoardInput] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasToken = Boolean(token);

  const loadEmailLogs = useCallback(
    async (headers?: Record<string, string>) => {
      if (!token) return;
      setLoadingEmailLogs(true);
      try {
        const res = await fetch(
          `/api/portal/admin/employees/email${showArchivedEmailLogs ? "?includeArchived=true" : ""}`,
          {
            headers: headers ?? { "x-admin-token": token },
          }
        );
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        setEmailLogs(data.emails ?? []);
      } finally {
        setLoadingEmailLogs(false);
      }
    },
    [token, showArchivedEmailLogs]
  );

  const refreshData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [
        resultsRes,
        codesRes,
        applicantsRes,
        usersRes,
        assignmentsRes,
        inquiriesRes,
        onboardingRes,
        crmRes,
        employeesRes,
        hiveRes,
        boardRes,
        studentsRes,
      ] = await Promise.all([
        fetch("/api/assessments/results", { headers: { "x-admin-token": token } }),
        fetch("/api/assessments/access-codes", { headers: { "x-admin-token": token } }),
        fetch("/api/careers/applicants", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/users", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/assignments", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/inquiries", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/onboarding", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/crm/contacts", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/employees", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/hive", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/board?room=all", { headers: { "x-admin-token": token } }),
        fetch("/api/portal/admin/students", { headers: { "x-admin-token": token } }),
      ]);
      if (!resultsRes.ok) {
        const data = await resultsRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load results");
      }
      if (!codesRes.ok) {
        const data = await codesRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load access codes");
      }
      if (!applicantsRes.ok) {
        const data = await applicantsRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load applicants");
      }
      if (!usersRes.ok) {
        const data = await usersRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load portal users");
      }
      if (!assignmentsRes.ok) {
        const data = await assignmentsRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load assignments");
      }
      if (!onboardingRes.ok) {
        const data = await onboardingRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load onboarding envelopes");
      }
      if (!inquiriesRes.ok) {
        const data = await inquiriesRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load inquiries");
      }
      if (!crmRes.ok) {
        const data = await crmRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load CRM contacts");
      }
      if (!employeesRes.ok) {
        const data = await employeesRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load employees");
      }
      if (!hiveRes.ok) {
        const data = await hiveRes.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load Hive");
      }
      const resultsData = await resultsRes.json();
      const codesData = await codesRes.json();
      const applicantsData = await applicantsRes.json();
      const usersData = await usersRes.json();
      const assignmentsData = await assignmentsRes.json();
      const inquiriesData = await inquiriesRes.json();
      const onboardingData = await onboardingRes.json();
      const crmData = await crmRes.json();
      const employeesData = await employeesRes.json();
      const hiveData = await hiveRes.json();
      const boardData = await boardRes.json();
      const studentsData = studentsRes.ok ? await studentsRes.json() : { students: [] };
      setResults(resultsData.results ?? []);
      setCodes(codesData.codes ?? []);
      setApplicants(applicantsData.applicants ?? []);
      setRejectedApplicants(applicantsData.rejectedApplicants ?? []);
      setPortalUsers(usersData.users ?? []);
      setAssignments(assignmentsData.assignments ?? []);
      setStudents((studentsData.students ?? []).filter((s: StudentPortal) => s.active));
      setInquiries(inquiriesData.inquiries ?? []);
      setOnboardingEnvelopes(onboardingData.envelopes ?? []);
      const applicantMap = new Map<string, ApplicantRecord>();
      (applicantsData.applicants ?? []).forEach((app: ApplicantRecord) => {
        if (app.email) applicantMap.set(app.email.toLowerCase(), app);
      });
      const mergedEmployees =
        (employeesData.employees ?? []).map((emp: any) => {
          const app = emp.email ? applicantMap.get(String(emp.email).toLowerCase()) : undefined;
          return { ...emp, application: app };
        }) ?? [];
      setEmployees(mergedEmployees);
      setPhotoErrors({});
      // prime role drafts
      const nextRoles: Record<string, any> = {};
      mergedEmployees.forEach((emp: any) => {
        nextRoles[emp.id] = {
          teacherRole: Boolean(emp.teacher_role),
          translatorRole: Boolean(emp.translator_role),
          teachingLanguages: emp.teaching_languages ?? [],
          translatingLanguages: emp.translating_languages ?? [],
          certifications: emp.certifications ?? [],
        };
      });
      setEmployeeRolesDraft(nextRoles);
      setHiveApproved(hiveData.approved ?? []);
      setHivePending(hiveData.pending ?? []);
      setHiveRejected(hiveData.rejected ?? []);
      setHiveDeadLinkCount(hiveData.deadLinkCount ?? 0);
      // Load packs and suggestions in background
      Promise.all([
        fetch("/api/portal/admin/hive/packs", { headers: { "x-admin-token": token } }).then(r => r.ok ? r.json() : { packs: [] }),
        fetch("/api/portal/admin/hive/packs?suggestions=true", { headers: { "x-admin-token": token } }).then(r => r.ok ? r.json() : { suggestions: [] }),
      ]).then(([packsData, suggestionsData]) => {
        setHivePacks(packsData.packs ?? []);
        setHivePackSuggestions(suggestionsData.suggestions ?? []);
      }).catch(() => {});
      setBoardMessages(boardData.messages ?? []);
      setCrmContacts(
        (crmData.contacts ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          organization: c.organization ?? null,
          contactType: c.contact_type ?? c.contactType ?? null,
          serviceInterest: c.service_interest ?? c.serviceInterest ?? null,
          status: c.status ?? null,
          marketingOptIn: c.marketing_opt_in ?? null,
          createdAt: c.created_at ?? c.createdAt ?? null,
          nextFollowupAt: c.next_followup_at ?? null,
        }))
      );
      if (showBulkEmail) {
        await loadEmailLogs({ "x-admin-token": token });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [token, showBulkEmail, loadEmailLogs]);

  useEffect(() => {
    if (showBulkEmail && token) {
      loadEmailLogs();
    }
  }, [showBulkEmail, token, loadEmailLogs]);

  const deleteApplicant = useCallback(
    async (applicant: ApplicantRecord) => {
      if (!token) return;
      const confirmed = typeof window === "undefined" ? true : window.confirm(`Remove ${applicant.name}'s application?`);
      if (!confirmed) return;
      setDeletingApplicantId(applicant.id);
      try {
        const response = await fetch(`/api/careers/applicants/${applicant.id}`, {
          method: "DELETE",
          headers: { "x-admin-token": token },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Unable to delete applicant");
        }
        setApplicants((prev) => prev.filter((item) => item.id !== applicant.id));
        setRejectedApplicants((prev) => prev.filter((item) => item.id !== applicant.id));
        if (selectedRejectedId === applicant.id) {
          setSelectedRejectedId("");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to delete applicant.");
      } finally {
        setDeletingApplicantId(null);
      }
    },
    [token, selectedRejectedId]
  );

  const updateApplicantLocal = useCallback(
    (applicantId: string, updater: (applicant: ApplicantRecord) => ApplicantRecord) => {
      setApplicants((prev) => prev.map((a) => (a.id === applicantId ? updater(a) : a)));
      setRejectedApplicants((prev) => prev.map((a) => (a.id === applicantId ? updater(a) : a)));
    },
    []
  );

  const renderApplicantDetails = (applicant: ApplicantRecord) => (
    <>
      {applicant.resumeInsights && (
        <div
          className={`mt-3 rounded-2xl border p-4 text-sm ${
            applicant.resumeInsights.verdict === "strong"
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-rose-500/40 bg-rose-500/10"
          }`}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Auto bio summary</p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                applicant.resumeInsights.verdict === "strong" ? "bg-emerald-500/20 text-emerald-100" : "bg-rose-500/20 text-rose-100"
              }`}
              aria-label={applicant.resumeInsights.verdict === "strong" ? "Strong applicant" : "Needs closer review"}
            >
              <span aria-hidden>{applicant.resumeInsights.verdict === "strong" ? "👍" : "👎"}</span>
              {applicant.resumeInsights.verdict === "strong" ? "Strong candidate" : "Needs review"}
            </span>
          </div>
          <p className="mt-3 text-slate-100">{applicant.resumeInsights.summary}</p>
          <p className="mt-2 text-xs text-slate-300">
            Score: {applicant.resumeInsights.score}%{" "}
            {applicant.resumeInsights.keywords?.length ? `• Keywords: ${applicant.resumeInsights.keywords.join(", ")}` : ""}
          </p>
          <p className="mt-1 text-xs text-slate-400">{applicant.resumeInsights.reasoning}</p>
        </div>
      )}
      {applicant.teacherAssessments?.length ? (
        <div className="mt-3 space-y-3">
          {applicant.teacherAssessments.map((assessment, index) => (
            <div
              key={`${assessment.language}-${index}`}
              className="rounded-2xl border border-slate-700/60 bg-slate-900/30 p-3 text-xs text-slate-200 space-y-1"
            >
              <p className="font-semibold text-white">Educator assessment ({teacherLanguageLabels[assessment.language]})</p>
              <p>
                Score: {assessment.score.totalCorrect}/{assessment.score.totalQuestions} ({assessment.score.percentage}%)
              </p>
              <p className="text-slate-400">
                Breakdown: {Object.entries(assessment.score.breakdown)
                  .map(([level, data]) => `${level} ${data.correct}/${data.total}`)
                  .join(" · ")}
              </p>
              <p className="text-slate-400">Conflict plan: {assessment.responses.conflict}</p>
              <p className="text-slate-400">Attendance plan: {assessment.responses.attendance}</p>
            </div>
          ))}
        </div>
      ) : null}
      {applicant.translatorExercise && (
        <div className="mt-3 rounded-2xl border border-slate-700/60 bg-slate-900/30 p-3 text-xs text-slate-200 space-y-2">
          <p className="font-semibold text-white">
            Translator exercise ({translatorLanguageLabels[applicant.translatorExercise.language] ?? applicant.translatorExercise.language})
          </p>
          <p>
            Score:{" "}
            {typeof applicant.translatorExercise.score === "number" ? `${applicant.translatorExercise.score}%` : "Not auto-scored"}
          </p>
          {applicant.translatorExercise.missingTokens.length > 0 && (
            <p className="text-amber-200">Missing keywords: {applicant.translatorExercise.missingTokens.join(", ")}</p>
          )}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-3 text-slate-100 whitespace-pre-wrap">
            {applicant.translatorExercise.submission}
          </div>
        </div>
      )}
      <div className="mt-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-1">Interview notes</p>
        <textarea
          rows={3}
          value={applicant.interviewNotes ?? ""}
          onChange={(e) =>
            setApplicants((prev) => prev.map((a) => (a.id === applicant.id ? { ...a, interviewNotes: e.target.value } : a)))
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          placeholder="Add interview notes"
        />
        <button
          type="button"
          className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white ${
            savingNotesId === applicant.id ? "bg-slate-700/60 cursor-wait" : "bg-slate-600 hover:bg-slate-500"
          }`}
          onClick={async () => {
            if (!token) return;
            setSavingNotesId(applicant.id);
            setError(null);
            try {
              const res = await fetch(`/api/careers/applicants/${applicant.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-admin-token": token },
                body: JSON.stringify({ action: "note", interviewNotes: applicant.interviewNotes ?? "" }),
              });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Unable to save notes.");
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to save notes.");
            } finally {
              setSavingNotesId(null);
            }
          }}
        >
          {savingNotesId === applicant.id ? "Saving…" : "Save notes"}
        </button>
      </div>
    </>
  );

  const sendHire = useCallback(
    async (applicant: ApplicantRecord) => {
      if (!token) return;
      setError(null);
      setSendingHireId(applicant.id);
      try {
        const response = await fetch("/api/careers/hire", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-token": token },
          body: JSON.stringify({ name: applicant.name, email: applicant.email, applicationId: applicant.id }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Unable to send onboarding email.");
        }
        const sentAt = new Date().toISOString();
        setApplicants((prev) => prev.map((item) => (item.id === applicant.id ? { ...item, hireSentAt: sentAt } : item)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to send onboarding email.");
      } finally {
        setSendingHireId(null);
      }
    },
    [token]
  );

  const sendInvite = useCallback(
    async (applicant: ApplicantRecord) => {
      if (!token) return;
      setError(null);
      setSendingInviteId(applicant.id);
      try {
        const response = await fetch("/api/careers/applicants/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-token": token },
          body: JSON.stringify({ name: applicant.name, email: applicant.email, applicationId: applicant.id }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Unable to send interview invite.");
        }
        const sentAt = new Date().toISOString();
        setApplicants((prev) => prev.map((item) => (item.id === applicant.id ? { ...item, inviteSentAt: sentAt } : item)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to send interview invite.");
      } finally {
        setSendingInviteId(null);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!hasToken) return;
    window.sessionStorage.setItem(STORAGE_KEY, token);
    void refreshData();
  }, [hasToken, token, refreshData]);

  const handleLogin = () => {
    if (!inputToken.trim()) {
      setError("Enter the admin token provided during onboarding.");
      return;
    }
    setToken(inputToken.trim());
    setInputToken("");
  };

  const handleSignOut = () => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setToken("");
    setInputToken("");
    setError(null);
  };

  const handleCreateCode = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/assessments/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to create code.");
      }
      setForm({ label: "", candidateName: "", candidateEmail: "", maxUses: 1, expiresAt: "", notes: "" });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create code.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCode = async (code: AccessCodeRecord) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assessments/access-codes/${code.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ active: !code.active }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to update code.");
      }
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update code.");
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = useCallback(
    async (applicant: ApplicantRecord) => {
      if (!token) return;
      try {
        const response = await fetch(`/api/careers/resume/${applicant.id}`, {
          headers: { "x-admin-token": token },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Unable to download resume");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = applicant.resume.filename || "resume";
        anchor.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to download resume.");
      }
    },
    [token]
  );

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",").pop() ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleCreatePortalUser = async () => {
    if (!token) return;
    if (!userForm.name || !userForm.email) {
      setError("Name and email are required for portal users.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const roles = Object.entries(userForm.roles)
        .filter(([, value]) => value)
        .map(([key]) => key) as ("teacher" | "translator")[];
      const response = await fetch("/api/portal/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          password: userForm.password || undefined,
          roles,
          languages: userForm.languages
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to create portal user.");
      }
      setUserForm({ name: "", email: "", password: "", roles: { teacher: true, translator: false }, languages: "" });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create portal user.");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPhotos = async () => {
    if (!token) return;
    setSyncingPhotos(true);
    setSyncPhotoResult(null);
    try {
      const res = await fetch("/api/admin/sync-photos", {
        method: "POST",
        headers: { "x-admin-token": token },
      });
      const data = await res.json();
      if (res.ok) {
        setSyncPhotoResult(data.message || "Photos synced successfully");
      } else {
        setSyncPhotoResult(`Error: ${data.error || "Sync failed"}`);
      }
    } catch (err) {
      setSyncPhotoResult("Error: Network request failed");
    } finally {
      setSyncingPhotos(false);
    }
  };

  const handleResetPortalUser = async (userId: string) => {
    if (!token) return;
    setResettingUserId(userId);
    setError(null);
    try {
      const response = await fetch(`/api/portal/admin/users/${userId}/reset`, {
        method: "POST",
        headers: { "x-admin-token": token },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to reset password.");
      }
      const data = await response.json().catch(() => ({}));
      const temp = data.tempPassword ? `Temp password: ${data.tempPassword}` : "Password reset.";
      setResetMessages((prev) => ({ ...prev, [userId]: temp }));
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setResettingUserId(null);
    }
  };

  const markProspect = async (inq: InquiryAdmin) => {
    if (!token) return;
    setWorking(inq.id);
    setError(null);
    try {
      const response = await fetch(`/api/portal/admin/inquiries/${inq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          metadata: { ...(inq.metadata ?? {}), marketingStatus: "prospect" },
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to update inquiry.");
      }
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update inquiry.");
    } finally {
      setWorking(null);
    }
  };

  const addEmployeeNote = async (userId: string) => {
    if (!token) return;
    const note = employeeNoteDraft[userId]?.trim();
    if (!note) return;
    try {
      await fetch("/api/portal/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ action: "note", userId, note }),
      });
      setEmployeeNoteDraft((prev) => ({ ...prev, [userId]: "" }));
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save note.");
    }
  };

  const updateEmployeeStatus = async (userId: string, status: string, terminationDate: string | null) => {
    if (!token) return;
    try {
      await fetch("/api/portal/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ action: "status", userId, status, terminationDate }),
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status.");
    }
  };

  const updateEmployeeRoles = async (userId: string) => {
    if (!token) return;
    const draft = employeeRolesDraft[userId];
    if (!draft) return;
    setWorking(userId);
    setError(null);
    try {
      const res = await fetch("/api/portal/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          action: "roles",
          userId,
          teacherRole: draft.teacherRole,
          translatorRole: draft.translatorRole,
          teachingLanguages: draft.teachingLanguages,
          translatingLanguages: draft.translatingLanguages,
          certifications: draft.certifications,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to save roles.");
      }
      setRolesSaved((prev) => ({ ...prev, [userId]: Date.now() }));
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save roles.");
    } finally {
      setWorking(null);
    }
  };

  const exportApplicantsCsv = async () => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch("/api/careers/applicants/export", {
        headers: { "x-admin-token": token },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to export applicants.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "career_applicants.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to export applicants.");
    }
  };

  const uploadEmployeeFile = async (userId: string) => {
    if (!token) return;
    const draft = employeeUploadDraft[userId];
    if (!draft?.file) {
      setError("Select a file to upload.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("kind", draft.kind || "file");
      fd.append("file", draft.file);
      await fetch("/api/portal/admin/employees", {
        method: "POST",
        headers: { "x-admin-token": token },
        body: fd,
      });
      setEmployeeUploadDraft((prev) => ({ ...prev, [userId]: { kind: draft.kind || "file", file: null } }));
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload file.");
    }
  };

  const deleteEmployeeUpload = async (userId: string, upload: { id: string; path?: string | null }) => {
    if (!token) return;
    const confirmed = typeof window === "undefined" ? true : window.confirm("Delete this file?");
    if (!confirmed) return;
    setDeletingUploadId(upload.id);
    setError(null);
    try {
      const res = await fetch("/api/portal/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ action: "deleteUpload", userId, uploadId: upload.id, path: upload.path ?? null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to delete file.");
      }
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete file.");
    } finally {
      setDeletingUploadId(null);
    }
  };

  const sendToCrm = async (inq: InquiryAdmin, contactType: "student" | "client") => {
    if (!token) return;
    setWorking(inq.id);
    setError(null);
    try {
      const response = await fetch("/api/portal/admin/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          inquiryId: inq.id,
          contactType,
          serviceInterest: inq.serviceType ?? undefined,
          status: contactType === "client" ? "prospect" : "lead",
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to send to CRM.");
      }
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send to CRM.");
    } finally {
      setWorking(null);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!token) return;
    setWorking(id);
    setError(null);
    try {
      const response = await fetch(`/api/portal/admin/inquiries/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to delete inquiry.");
      }
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete inquiry.");
    } finally {
      setWorking(null);
    }
  };

  const archiveEmailLog = async (id: string) => {
    if (!token) return;
    setLoadingEmailLogs(true);
    try {
      await fetch("/api/portal/admin/employees/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ action: "archive", id }),
      });
      await loadEmailLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to archive email.");
    } finally {
      setLoadingEmailLogs(false);
    }
  };

  const handleSendBulkEmail = async () => {
    if (!token) {
      setError("Enter the admin token first.");
      return;
    }
    if (!bulkEmail.message.trim()) {
      setError("Message is required.");
      return;
    }
    setSendingBulkEmail(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("subject", bulkEmail.subject);
      formData.append("message", bulkEmail.message);
      for (const file of bulkEmailAttachments) {
        formData.append("attachments", file);
      }
      const res = await fetch("/api/portal/admin/employees/email", {
        method: "POST",
        headers: { "x-admin-token": token },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to send email.");
      }
      setBulkEmail({ subject: "", message: "" });
      setBulkEmailAttachments([]);
      await loadEmailLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send email.");
    } finally {
      setSendingBulkEmail(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!token) return;
    if (!assignmentForm.title || !assignmentForm.assignedTo.length || !assignmentForm.hoursAssigned) {
      setError("Assignments require a title, hours, and at least one assignee.");
      return;
    }
    if (assignmentForm.startDate && assignmentForm.dueDate && assignmentForm.dueDate < assignmentForm.startDate) {
      setError("End date cannot be before start date.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const attachments =
        assignmentFiles && assignmentFiles.length
          ? await Promise.all(
              Array.from(assignmentFiles).map(async (file) => ({
                filename: file.name,
                mimeType: file.type || "application/octet-stream",
                size: file.size,
                data: await toBase64(file),
                category: "support" as const,
              }))
            )
          : [];
      const response = await fetch("/api/portal/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          title: assignmentForm.title,
          assignmentType: assignmentForm.assignmentType,
          description: assignmentForm.description,
          client: assignmentForm.client,
          languagePair: assignmentForm.languagePair,
          hoursAssigned: assignmentForm.hoursAssigned,
          startDate: assignmentForm.startDate,
          dueDate: assignmentForm.dueDate,
          assignedTo: assignmentForm.assignedTo,
          participants: assignmentForm.participants,
          schedule: assignmentForm.schedule,
          meetingUrl: assignmentForm.meetingUrl,
          attachments,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to create assignment.");
      }
      setAssignmentForm({
        title: "",
        assignmentType: "class",
        description: "",
        client: "",
        languagePair: "",
        hoursAssigned: 1.5,
        startDate: "",
        dueDate: "",
        participants: [],
        assignedTo: [],
        schedule: "",
        meetingUrl: "",
      });
      setAssignmentFiles(null);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create assignment.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment) return;
    if (assignmentForm.startDate && assignmentForm.dueDate && assignmentForm.dueDate < assignmentForm.startDate) {
      setError("End date cannot be before start date.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/admin/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          id: editingAssignment.id,
          title: assignmentForm.title,
          assignmentType: assignmentForm.assignmentType,
          description: assignmentForm.description,
          client: assignmentForm.client,
          languagePair: assignmentForm.languagePair,
          hoursAssigned: assignmentForm.hoursAssigned,
          startDate: assignmentForm.startDate,
          dueDate: assignmentForm.dueDate,
          assignedTo: assignmentForm.assignedTo,
          participants: assignmentForm.participants,
          schedule: assignmentForm.schedule,
          meetingUrl: assignmentForm.meetingUrl,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to update assignment.");
      }
      setEditingAssignment(null);
      setAssignmentForm({
        title: "",
        assignmentType: "class",
        description: "",
        client: "",
        languagePair: "",
        hoursAssigned: 1.5,
        startDate: "",
        dueDate: "",
        participants: [],
        assignedTo: [],
        schedule: "",
        meetingUrl: "",
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update assignment.");
    } finally {
      setLoading(false);
    }
  };

  const startEditingAssignment = (assignment: PortalAssignmentAdmin) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      assignmentType: assignment.assignmentType,
      description: assignment.description ?? "",
      client: assignment.client ?? "",
      languagePair: assignment.languagePair ?? "",
      hoursAssigned: assignment.hoursAssigned,
      startDate: assignment.startDate ?? "",
      dueDate: assignment.dueDate ?? "",
      participants: assignment.participants ?? [],
      assignedTo: assignment.assignees.map((a) => a.id),
      schedule: assignment.schedule ?? "",
      meetingUrl: assignment.meetingUrl ?? "",
    });
  };

  const cancelEditingAssignment = () => {
    setEditingAssignment(null);
    setAssignmentForm({
      title: "",
      assignmentType: "class",
      description: "",
      client: "",
      languagePair: "",
      hoursAssigned: 1.5,
      startDate: "",
      dueDate: "",
      participants: [],
      assignedTo: [],
      schedule: "",
      meetingUrl: "",
    });
  };

  const handleResendAssignmentNotification = async (assignmentId: string) => {
    setResendingAssignmentId(assignmentId);
    setError(null);
    try {
      const response = await fetch("/api/portal/admin/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ action: "resend", id: assignmentId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend notification");
      }
      alert(`Notification sent to: ${data.sentTo?.join(", ") || "assignees"}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend notification");
    } finally {
      setResendingAssignmentId(null);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment? This cannot be undone.")) {
      return;
    }
    setDeletingAssignmentId(assignmentId);
    setError(null);
    try {
      const response = await fetch(`/api/portal/admin/assignments?id=${assignmentId}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete assignment");
      }
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete assignment");
    } finally {
      setDeletingAssignmentId(null);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "board":
        return (
          <div className="rounded-3xl bg-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Board</h2>
              <select
                value={boardRoom}
                onChange={(e) => setBoardRoom(e.target.value)}
                className="rounded-xl bg-slate-700 px-3 py-1 text-sm"
              >
                <option value="announcements">Announcements</option>
                <option value="staff_lounge">Staff Lounge</option>
                <option value="onboarding">Onboarding</option>
                <option value="hive">The Hive</option>
                <option value="feature_requests">Feature Requests & Tech Support</option>
              </select>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 max-h-[60vh] overflow-auto space-y-2">
              {boardMessages.filter((m) => normalizeRoom(m.room) === normalizeRoom(boardRoom)).length === 0 ? (
                <p className="text-sm text-slate-400">No messages yet.</p>
              ) : (
                boardMessages
                  .filter((m) => normalizeRoom(m.room) === normalizeRoom(boardRoom))
                  .map((m) => (
                    <div key={m.id} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{m.author_name || "JB Linguistics"}</span>
                        <span>{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</span>
                      </div>
                      <div className="mt-1 flex items-start justify-between gap-3">
                        <p className="text-slate-100 whitespace-pre-wrap flex-1">{m.message}</p>
                        <button
                          type="button"
                          className="text-[11px] text-rose-300 underline"
                          onClick={async () => {
                            if (!token) return;
                            await fetch(`/api/portal/admin/board?id=${m.id}`, {
                              method: "DELETE",
                              headers: { "x-admin-token": token },
                            });
                            await refreshData();
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
            <div className="space-y-2">
              <textarea
                value={boardInput}
                onChange={(e) => setBoardInput(e.target.value)}
                rows={3}
                placeholder="Post an announcement or note to this room..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <button
                type="button"
                disabled={!boardInput.trim()}
                onClick={async () => {
                  if (!token || !boardInput.trim()) return;
                  setLoading(true);
                  setError(null);
                  try {
                    const res = await fetch("/api/portal/admin/board", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "x-admin-token": token },
                      body: JSON.stringify({ room: boardRoom, message: boardInput }),
                    });
                    if (!res.ok) {
                      const data = await res.json().catch(() => ({}));
                      throw new Error(data.message || "Unable to post message.");
                    }
                    setBoardInput("");
                    await refreshData();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Unable to post message.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-400 disabled:opacity-50"
              >
                Post to {boardRoom.replace("_", " ")}
              </button>
            </div>
          </div>
        );
      case "results":
        return (
          <div className="rounded-3xl bg-slate-800 p-6">
            <h2 className="text-xl font-semibold">Recent submissions</h2>
            {results.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No submissions stored yet.</p>
            ) : (
              <div className="mt-4 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="py-2 pr-4">Candidate</th>
                      <th className="py-2 pr-4">Score</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Results email</th>
                      <th className="py-2 pr-4">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results
                      .slice()
                      .reverse()
                      .map((result) => (
                        <tr key={result.id} className="border-t border-slate-700">
                          <td className="py-2 pr-4">
                            <p className="font-semibold text-white">{result.candidateName}</p>
                            <p className="text-xs text-slate-400">{result.candidateEmail || "–"}</p>
                          </td>
                          <td className="py-2 pr-4 text-teal-300">
                            {result.summary.percentage}% ({result.summary.totalCorrect}/{result.summary.totalQuestions})
                          </td>
                          <td className="py-2 pr-4 text-slate-300">{new Date(result.submittedAt).toLocaleString()}</td>
                          <td className="py-2 pr-4 text-slate-300">{result.proctorEmail}</td>
                          <td className="py-2 pr-4 text-xs text-slate-400">
                            {result.accessMeta?.mode === "code" ? `Code: ${result.accessMeta.code}` : "Shared"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case "codes":
        return (
          <div className="rounded-3xl bg-slate-800 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Generate access code</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Label
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g. Lufthansa Cohort"
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Candidate name (optional)
                  <input
                    type="text"
                    value={form.candidateName}
                    onChange={(e) => setForm((prev) => ({ ...prev, candidateName: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Candidate email (optional)
                  <input
                    type="email"
                    value={form.candidateEmail}
                    onChange={(e) => setForm((prev) => ({ ...prev, candidateEmail: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Max uses
                  <input
                    type="number"
                    min={1}
                    value={form.maxUses}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxUses: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Expires at (optional)
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Notes
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handleCreateCode}
                className="mt-4 inline-flex items-center rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Create code
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Existing codes</h3>
              <div className="mt-4 space-y-3">
                {codes.length === 0 ? (
                  <p className="text-sm text-slate-400">No codes available.</p>
                ) : (
                  codes.map((code) => (
                    <div key={code.code} className="rounded-2xl border border-slate-700 p-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-white">{code.label}</p>
                        <p className="text-xs text-slate-400">{code.code}</p>
                        <p className="text-xs text-slate-500">
                          Uses: {code.uses}/{code.maxUses}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCode(code)}
                        className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          code.active ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-700 text-slate-200"
                        }`}
                      >
                        {code.active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      case "applicants":
        return (
          <div className="rounded-3xl bg-slate-800 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Career applicants</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={refreshData}
                  className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={exportApplicantsCsv}
                  className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                >
                  Export CSV
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-100 space-y-3">
              <p className="font-semibold">Add applicant manually</p>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs text-slate-300 uppercase tracking-wide">
                  Name
                  <input
                    type="text"
                    value={manualApplicant.name}
                    onChange={(e) => setManualApplicant((prev) => ({ ...prev, name: e.target.value }))}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-300 uppercase tracking-wide">
                  Email
                  <input
                    type="email"
                    value={manualApplicant.email}
                    onChange={(e) => setManualApplicant((prev) => ({ ...prev, email: e.target.value }))}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-200">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={manualApplicant.roles.teacher}
                    onChange={(e) => setManualApplicant((prev) => ({ ...prev, roles: { ...prev.roles, teacher: e.target.checked } }))}
                  />
                  Teacher
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={manualApplicant.roles.translator}
                    onChange={(e) => setManualApplicant((prev) => ({ ...prev, roles: { ...prev.roles, translator: e.target.checked } }))}
                  />
                  Translator
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-300 uppercase tracking-wide">
                  Languages (comma)
                  <input
                    type="text"
                    value={manualApplicant.languages}
                    onChange={(e) => setManualApplicant((prev) => ({ ...prev, languages: e.target.value }))}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-300 uppercase tracking-wide">
                  Resume (PDF)
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setManualApplicant((prev) => ({ ...prev, resume: e.target.files?.[0] ?? null }))}
                    className="text-slate-200"
                  />
                </label>
              </div>
              <button
                type="button"
                disabled={savingManualApplicant}
                onClick={async () => {
                  if (!token) {
                    setError("Enter the admin token to add an applicant.");
                    return;
                  }
                  if (!manualApplicant.name || !manualApplicant.email || !manualApplicant.resume) {
                    setError("Name, email, and resume are required.");
                    return;
                  }
                  setSavingManualApplicant(true);
                  setError(null);
                  try {
                    const fd = new FormData();
                    fd.append("name", manualApplicant.name);
                    fd.append("email", manualApplicant.email);
                    const roles: string[] = [];
                    if (manualApplicant.roles.teacher) roles.push("teacher");
                    if (manualApplicant.roles.translator) roles.push("translator");
                    fd.append("roles", roles.join(","));
                    if (manualApplicant.languages) fd.append("languages", manualApplicant.languages);
                    fd.append("resume", manualApplicant.resume);
                    const res = await fetch("/api/portal/admin/applicants", {
                      method: "POST",
                      headers: { "x-admin-token": token },
                      body: fd,
                    });
                    if (!res.ok) {
                      const data = await res.json().catch(() => ({}));
                      throw new Error(data.message || "Unable to add applicant.");
                    }
                    setManualApplicant({
                      name: "",
                      email: "",
                      roles: { teacher: true, translator: false },
                      languages: "",
                      resume: null,
                    });
                    await refreshData();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Unable to add applicant.");
                  } finally {
                    setSavingManualApplicant(false);
                  }
                }}
                className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
              >
                {savingManualApplicant ? "Saving…" : "Save applicant"}
              </button>
            </div>
            {applicants.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No applications yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="rounded-2xl border border-slate-700 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-white">{applicant.name}</p>
                        <p className="text-xs text-slate-400">{applicant.email}</p>
                        {applicant.resumeInsights?.verdict ? (
                          <span
                            className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                              applicant.resumeInsights.verdict === "strong"
                                ? "bg-emerald-500/20 text-emerald-100"
                                : "bg-rose-500/20 text-rose-100"
                            }`}
                          >
                            {applicant.resumeInsights.verdict === "strong" ? "Strong candidate" : "Needs review"}
                          </span>
                        ) : null}
                      </div>
                      {/* Action buttons organized in logical groups */}
                      <div className="flex flex-col gap-3">
                        {/* Primary actions row */}
                        <div className="flex flex-wrap gap-2 items-center">
                          <button
                            type="button"
                            onClick={() => downloadResume(applicant)}
                            className="inline-flex items-center rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600"
                          >
                            Download resume
                          </button>

                          <div className="flex items-center gap-2 text-xs text-slate-200 bg-slate-800 px-3 py-1.5 rounded-lg">
                            <input
                              type="checkbox"
                              checked={Boolean(applicant.docuSignSentAt)}
                              onChange={async (e) => {
                                if (!token) return;
                                const checked = e.target.checked;
                                setSendingHireId(applicant.id);
                                setError(null);
                                try {
                                  const res = await fetch(`/api/careers/applicants/${applicant.id}`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                                    body: JSON.stringify({ action: "docu_sign_sent", hireSent: checked }),
                                  });
                                  if (!res.ok) {
                                    const data = await res.json().catch(() => ({}));
                                    throw new Error(data.message || "Unable to update DocuSign checkbox.");
                                  }
                                  const sentAt = checked ? new Date().toISOString() : null;
                                  setApplicants((prev) =>
                                    prev.map((item) => (item.id === applicant.id ? { ...item, docuSignSentAt: sentAt } : item))
                                  );
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : "Unable to update DocuSign checkbox.");
                                } finally {
                                  setSendingHireId(null);
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <span>DocuSign sent</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => sendHire(applicant)}
                            disabled={sendingHireId === applicant.id}
                            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              sendingHireId === applicant.id
                                ? "bg-amber-900/50 text-amber-100 cursor-wait"
                                : "bg-amber-400 text-slate-900 hover:bg-amber-300"
                            }`}
                          >
                            {sendingHireId === applicant.id ? "Sending…" : "Send hire email"}
                          </button>
                        </div>

                        {/* Timestamps row */}
                        {(applicant.hireSentAt || applicant.docuSignSentAt) && (
                          <div className="flex flex-wrap gap-3 text-xs text-emerald-200">
                            {applicant.hireSentAt && <span>Hire email: {new Date(applicant.hireSentAt).toLocaleString()}</span>}
                            {applicant.docuSignSentAt && <span>DocuSign: {new Date(applicant.docuSignSentAt).toLocaleString()}</span>}
                          </div>
                        )}

                        {/* Interview & Onboarding row */}
                        <div className="flex flex-wrap gap-2 items-center">
                          <button
                            type="button"
                            onClick={() => sendInvite(applicant)}
                            disabled={sendingInviteId === applicant.id}
                            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              sendingInviteId === applicant.id
                                ? "bg-slate-700/60 text-slate-200 cursor-wait"
                                : "bg-slate-600 text-white hover:bg-slate-500"
                            }`}
                          >
                            {sendingInviteId === applicant.id ? "Sending…" : "Invite to interview"}
                          </button>

                          {applicant.inviteSentAt && (
                            <span className="text-xs text-emerald-200">
                              Invited {new Date(applicant.inviteSentAt).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Onboarding upload row */}
                        <div className="flex flex-wrap gap-2 items-center">
                          <label className="inline-flex items-center">
                            <span className="sr-only">Upload onboarding PDFs</span>
                            <input
                              type="file"
                              multiple
                              accept="application/pdf"
                              onChange={(e) =>
                                setOnboardingFiles((prev) => {
                                  const files = e.target.files ? Array.from(e.target.files) : [];
                                  return { ...prev, [applicant.id]: files };
                                })
                              }
                              className="hidden"
                              id={`upload-${applicant.id}`}
                            />
                            <label
                              htmlFor={`upload-${applicant.id}`}
                              className="inline-flex cursor-pointer items-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
                            >
                              {onboardingFiles[applicant.id]?.length
                                ? `${onboardingFiles[applicant.id].length} PDF${onboardingFiles[applicant.id].length > 1 ? "s" : ""} selected`
                                : "Upload onboarding PDFs"}
                            </label>
                          </label>

                          {onboardingFiles[applicant.id]?.length > 0 && (
                            <button
                              type="button"
                              disabled={uploadingOnboarding}
                              onClick={async () => {
                                if (!token) {
                                  setError("Enter the admin token to upload.");
                                  return;
                                }
                                const files = onboardingFiles[applicant.id] ?? [];
                                if (!files.length) {
                                  setError("Select onboarding PDF(s) first.");
                                  return;
                                }
                                setUploadingOnboarding(true);
                                setError(null);
                                try {
                                  for (const file of files) {
                                    const fd = new FormData();
                                    fd.append("email", applicant.email || "");
                                    fd.append("name", applicant.name || "");
                                    fd.append("applicantId", applicant.id);
                                    const roles: string[] = applicant.roles?.length ? applicant.roles : ["teacher"];
                                    fd.append("roles", roles.join(","));
                                    if (applicant.workingLanguages?.length) {
                                      fd.append("languages", applicant.workingLanguages.join(","));
                                    }
                                    fd.append("completedAt", new Date().toISOString().slice(0, 10));
                                    fd.append("file", file);
                                    const res = await fetch("/api/portal/admin/onboarding", {
                                      method: "POST",
                                      headers: { "x-admin-token": token },
                                      body: fd,
                                    });
                                    if (!res.ok) {
                                      const data = await res.json().catch(() => ({}));
                                      throw new Error(data.message || "Upload failed");
                                    }
                                  }
                                  setOnboardingFiles((prev) => ({ ...prev, [applicant.id]: [] }));
                                  // Remove from applicants view once onboarded
                                  setApplicants((prev) => prev.filter((item) => item.id !== applicant.id));
                                  await refreshData();
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : "Upload failed");
                                } finally {
                                  setUploadingOnboarding(false);
                                }
                              }}
                              className="inline-flex items-center rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 disabled:opacity-60"
                            >
                              {uploadingOnboarding ? "Uploading…" : "Save upload"}
                            </button>
                          )}
                        </div>

                        {/* Secondary actions row */}
                        <div className="flex flex-wrap gap-2 items-center">
                          <button
                            type="button"
                            onClick={() => setExpandedApplicants((prev) => ({ ...prev, [applicant.id]: !prev[applicant.id] }))}
                            className="inline-flex items-center rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600"
                          >
                            {expandedApplicants[applicant.id] ? "Hide details" : "Show details"}
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              if (!token) {
                                setError("Enter the admin token to reject.");
                                return;
                              }
                              setRejectingApplicantId(applicant.id);
                              try {
                                const res = await fetch(`/api/careers/applicants/${applicant.id}`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "x-admin-token": token },
                                  body: JSON.stringify({ action: "reject" }),
                                });
                                if (!res.ok) {
                                  const data = await res.json().catch(() => ({}));
                                  throw new Error(data.message || "Unable to reject applicant.");
                                }
                                const rejectedAt = new Date().toISOString();
                                setApplicants((prev) => prev.filter((item) => item.id !== applicant.id));
                                setRejectedApplicants((prev) => {
                                  const withoutDuplicate = prev.filter((item) => item.id !== applicant.id);
                                  return [...withoutDuplicate, { ...applicant, status: "rejected", rejectedAt }];
                                });
                                if (!showRejected) {
                                  setShowRejected(true);
                                }
                                if (!selectedRejectedId) {
                                  setSelectedRejectedId(applicant.id);
                                }
                                await refreshData();
                              } catch (err) {
                                setError(err instanceof Error ? err.message : "Unable to reject applicant.");
                              } finally {
                                setRejectingApplicantId(null);
                              }
                            }}
                            disabled={rejectingApplicantId === applicant.id}
                            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              rejectingApplicantId === applicant.id
                                ? "bg-amber-900/50 text-amber-200 cursor-not-allowed"
                                : "bg-amber-500 text-slate-900 hover:bg-amber-400"
                            }`}
                          >
                            {rejectingApplicantId === applicant.id ? "Rejecting…" : "Reject"}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteApplicant(applicant)}
                            disabled={deletingApplicantId === applicant.id}
                            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              deletingApplicantId === applicant.id
                                ? "bg-rose-900/50 text-rose-200 cursor-not-allowed"
                                : "bg-rose-600 text-white hover:bg-rose-500"
                            }`}
                          >
                            {deletingApplicantId === applicant.id ? "Removing…" : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Submitted {new Date(applicant.submittedAt).toLocaleDateString()} — Roles: {applicant.roles.join(", ")}
                    </p>
                    {applicant.workingLanguages?.length ? (
                      <p className="text-xs text-slate-500">
                        Working languages: {applicant.workingLanguages.map((lang) => teacherLanguageLabels[lang] ?? lang).join(", ")}
                      </p>
                    ) : null}
                    {expandedApplicants[applicant.id] && renderApplicantDetails(applicant)}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 border-t border-slate-700 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Rejected applicants</h3>
                  <p className="text-xs text-slate-400">Rejected candidates live here until you delete them forever.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejected((prev) => !prev)}
                    className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    {showRejected ? "Hide rejected" : `Show rejected (${rejectedApplicants.length})`}
                  </button>
                  <select
                    value={selectedRejectedId}
                    disabled={rejectedApplicants.length === 0}
                    onChange={(e) => setSelectedRejectedId(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-white disabled:opacity-50"
                  >
                    <option value="">All rejected</option>
                    {rejectedApplicants.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name} {app.email ? `— ${app.email}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {!showRejected ? (
                <p className="mt-3 text-xs text-slate-400">Open the dropdown to review or delete rejected applicants.</p>
              ) : rejectedApplicants.length === 0 ? (
                <p className="mt-3 text-xs text-slate-400">No rejected applicants yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {(selectedRejectedId
                    ? rejectedApplicants.filter((app) => app.id === selectedRejectedId)
                    : rejectedApplicants
                  ).map((applicant) => (
                    <div key={applicant.id} className="rounded-2xl border border-amber-700/60 bg-slate-900/40 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-white">{applicant.name}</p>
                          <p className="text-xs text-slate-400">{applicant.email}</p>
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-100">
                            Rejected {applicant.rejectedAt ? new Date(applicant.rejectedAt).toLocaleDateString() : "recently"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => downloadResume(applicant)}
                            className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold hover:bg-slate-600"
                          >
                            Download resume
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedApplicants((prev) => ({ ...prev, [applicant.id]: !prev[applicant.id] }))}
                            className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600"
                          >
                            {expandedApplicants[applicant.id] ? "Hide details" : "Show details"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteApplicant(applicant)}
                            disabled={deletingApplicantId === applicant.id}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              deletingApplicantId === applicant.id
                                ? "bg-rose-900/50 text-rose-200 cursor-not-allowed"
                                : "bg-rose-600 text-white hover:bg-rose-500"
                            }`}
                          >
                            {deletingApplicantId === applicant.id ? "Removing…" : "Delete"}
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Submitted {new Date(applicant.submittedAt).toLocaleDateString()} — Roles: {applicant.roles.join(", ")}
                      </p>
                      {applicant.workingLanguages?.length ? (
                        <p className="text-xs text-slate-500">
                          Working languages: {applicant.workingLanguages.map((lang) => teacherLanguageLabels[lang] ?? lang).join(", ")}
                        </p>
                      ) : null}
                      {expandedApplicants[applicant.id] && renderApplicantDetails(applicant)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case "onboarding":
        return (
          <div className="rounded-3xl bg-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active employees</h2>
              <div className="flex items-center gap-3">
                {syncPhotoResult && (
                  <span className={`text-xs ${syncPhotoResult.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>
                    {syncPhotoResult}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSyncPhotos}
                  disabled={syncingPhotos}
                  className="inline-flex items-center rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
                >
                  {syncingPhotos ? "Syncing..." : "Sync Photos to Public Site"}
                </button>
              </div>
            </div>
            {showBulkEmail && (
              <div className="mt-3 rounded-2xl border border-slate-700 bg-slate-900 p-4 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-200 font-semibold">Email all freelancers</p>
                    <p className="text-xs text-slate-400">
                      Use "(first name)" in the message to personalize each email. Sent emails are logged below.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={showArchivedEmailLogs}
                      onChange={(e) => {
                        setShowArchivedEmailLogs(e.target.checked);
                        void loadEmailLogs();
                      }}
                    />
                    Show archived
                  </label>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Subject</label>
                    <input
                      type="text"
                      placeholder="Subject"
                      value={bulkEmail.subject}
                      onChange={(e) => setBulkEmail((prev) => ({ ...prev, subject: e.target.value }))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                    />
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Message</label>
                    <textarea
                      rows={4}
                      placeholder="Message body"
                      value={bulkEmail.message}
                      onChange={(e) => setBulkEmail((prev) => ({ ...prev, message: e.target.value }))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                    />
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Attachments (optional)</label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setBulkEmailAttachments(e.target.files ? Array.from(e.target.files) : [])}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-slate-700 file:px-3 file:py-1 file:text-xs file:text-slate-200"
                    />
                    {bulkEmailAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {bulkEmailAttachments.map((file, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">
                            {file.name}
                            <button
                              type="button"
                              onClick={() => setBulkEmailAttachments((prev) => prev.filter((_, i) => i !== idx))}
                              className="ml-1 text-slate-400 hover:text-red-400"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSendBulkEmail}
                      disabled={sendingBulkEmail}
                      className="inline-flex items-center rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-400 disabled:opacity-60"
                    >
                      {sendingBulkEmail ? "Sending…" : "Send to all active freelancers"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-200">History</p>
                      <button
                        type="button"
                        onClick={() => loadEmailLogs()}
                        className="text-xs rounded-full border border-slate-600 px-3 py-1 text-slate-200 hover:bg-slate-700"
                      >
                        Refresh
                      </button>
                    </div>
                    {loadingEmailLogs ? (
                      <p className="text-xs text-slate-400">Loading…</p>
                    ) : emailLogs.length === 0 ? (
                      <p className="text-xs text-slate-400">No messages logged yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-auto">
                        {emailLogs.map((log) => (
                          <div key={log.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 space-y-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-white">{log.subject || "(no subject)"}</p>
                                <p className="text-[11px] text-slate-400">
                                  {new Date(log.created_at).toLocaleString()} · {log.sent_to?.length ?? 0} recipients{" "}
                                  {log.archived ? "· Archived" : ""}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => setExpandedEmailLogs((prev) => ({ ...prev, [log.id]: !prev[log.id] }))}
                                  className="text-[11px] rounded-full border border-slate-600 px-2 py-1 text-slate-200 hover:bg-slate-700"
                                >
                                  {expandedEmailLogs[log.id] ? "Hide" : "Details"}
                                </button>
                                {!log.archived && (
                                  <button
                                    type="button"
                                    onClick={() => archiveEmailLog(log.id)}
                                    className="text-[11px] rounded-full border border-slate-600 px-2 py-1 text-slate-200 hover:bg-slate-700"
                                  >
                                    Archive
                                  </button>
                                )}
                              </div>
                            </div>
                            {expandedEmailLogs[log.id] && (
                              <div className="mt-2 space-y-2">
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Message</p>
                                  <p className="text-xs text-slate-300 whitespace-pre-wrap">{log.body}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                    Sent to ({log.sent_to?.length ?? 0} recipients)
                                  </p>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {(log.sent_to ?? []).map((r, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-200"
                                        title={r.email}
                                      >
                                        {r.name || r.email || "Unknown"}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            {!expandedEmailLogs[log.id] && (
                              <p className="text-xs text-slate-300 max-h-8 overflow-hidden text-ellipsis line-clamp-1">{log.body}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {employees.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No employees yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {employees
                  .filter((e) => e.status !== "inactive")
                  .map((emp) => (
                    <div key={emp.id} className="rounded-2xl border border-slate-700 p-4 space-y-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          {emp.photoUrl && !photoErrors[emp.id] ? (
                            <img
                              src={emp.photoUrl}
                              alt={`${emp.name} photo`}
                              className="h-16 w-16 rounded-full object-cover border border-slate-600"
                              onError={() => setPhotoErrors((prev) => ({ ...prev, [emp.id]: true }))}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-sm font-semibold">
                              {emp.name?.[0]?.toUpperCase() ?? ""}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{emp.name}</p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                            <p className="text-xs text-slate-500">
                              Roles: {emp.roles.join(", ")} · Languages: {emp.languages.join(", ") || "—"}
                            </p>
                            {(emp.phone || emp.address || emp.city || emp.country) && (
                              <p className="text-[11px] text-slate-500">
                                {emp.phone ? `${emp.phone} · ` : ""}
                                {emp.address ? `${emp.address}, ` : ""}
                                {emp.city ? `${emp.city}, ` : ""}
                                {emp.country ?? ""}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">
                            Status: {emp.status}
                          </span>
                          {emp.publicProfile ? (
                            emp.publicProfile.visibility === "visible" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                                Live
                                {emp.publicProfile.roles.includes("teacher") && (
                                  <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px]">Teacher</span>
                                )}
                                {emp.publicProfile.roles.includes("translator") && (
                                  <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px]">Translator</span>
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white">
                                Pending approval
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-600 px-3 py-1 text-xs font-semibold text-slate-300">
                              No profile
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setExpandedEmployees((prev) => ({ ...prev, [emp.id]: !prev[emp.id] }))}
                            className="inline-flex items-center rounded-full bg-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-500"
                          >
                            {expandedEmployees[emp.id] ? "Hide details" : "Details"}
                          </button>
                        </div>
                        
                      </div>
                      {expandedEmployees[emp.id] && (
                        <div className="space-y-3 border-t border-slate-700/70 pt-3">
                          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 space-y-2 text-sm text-slate-200">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Roles & approvals</p>
                            <div className="flex flex-wrap gap-3">
                              <label className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={employeeRolesDraft[emp.id]?.teacherRole ?? false}
                                  onChange={(e) =>
                                    setEmployeeRolesDraft((prev) => ({
                                      ...prev,
                                      [emp.id]: { ...(prev[emp.id] ?? {}), teacherRole: e.target.checked },
                                    }))
                                  }
                                />
                                Teacher
                              </label>
                              <label className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={employeeRolesDraft[emp.id]?.translatorRole ?? false}
                                  onChange={(e) =>
                                    setEmployeeRolesDraft((prev) => ({
                                      ...prev,
                                      [emp.id]: { ...(prev[emp.id] ?? {}), translatorRole: e.target.checked },
                                    }))
                                  }
                                />
                                Translator
                              </label>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-[11px] text-slate-400 mb-1">Teaching languages</p>
                                <div className="flex flex-wrap gap-2">
                                  {teacherLanguageOptions.map((lang: { id: string; label: string }, idx) => (
                                    <label key={`${String(lang.id)}-${idx}`} className="flex items-center gap-1 text-[11px] text-slate-300">
                                      <input
                                        type="checkbox"
                                        checked={employeeRolesDraft[emp.id]?.teachingLanguages?.includes(lang.id) ?? false}
                                        onChange={(e) => {
                                          setEmployeeRolesDraft((prev) => {
                                            const current = prev[emp.id]?.teachingLanguages ?? [];
                                            const next = e.target.checked
                                              ? Array.from(new Set([...current, lang.id]))
                                              : current.filter((l) => l !== lang.id);
                                            return { ...prev, [emp.id]: { ...(prev[emp.id] ?? {}), teachingLanguages: next } };
                                          });
                                        }}
                                      />
                                      {teacherLanguageLabels[lang.id] ?? lang.label ?? String(lang.id)}
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-400 mb-1">Translating languages</p>
                                <div className="flex flex-wrap gap-2">
                                  {translatorLanguageOptions.map((lang: { id: string; label: string }, idx) => (
                                    <label key={`${String(lang.id)}-${idx}`} className="flex items-center gap-1 text-[11px] text-slate-300">
                                      <input
                                        type="checkbox"
                                        checked={employeeRolesDraft[emp.id]?.translatingLanguages?.includes(lang.id) ?? false}
                                        onChange={(e) => {
                                          setEmployeeRolesDraft((prev) => {
                                            const current = prev[emp.id]?.translatingLanguages ?? [];
                                            const next = e.target.checked
                                              ? Array.from(new Set([...current, lang.id]))
                                              : current.filter((l) => l !== lang.id);
                                            return { ...prev, [emp.id]: { ...(prev[emp.id] ?? {}), translatingLanguages: next } };
                                          });
                                        }}
                                      />
                                      {lang.label}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400 mb-1">Certifications / clearances</p>
                              <div className="flex flex-wrap gap-2">
                                {certOptions.map((cert) => {
                                  const slug = `cert_${certSlug(cert)}`;
                                  const certUpload =
                                    emp.uploads.find((u) => u.kind === slug && u.signedUrl) ||
                                    emp.uploads.find((u) => u.kind === "cert" && u.signedUrl);
                                  return (
                                    <label key={cert} className="flex items-center gap-1 text-[11px] text-slate-300">
                                      <input
                                        type="checkbox"
                                        checked={employeeRolesDraft[emp.id]?.certifications?.includes(cert) ?? false}
                                        onChange={(e) => {
                                          setEmployeeRolesDraft((prev) => {
                                            const current = prev[emp.id]?.certifications ?? [];
                                            const next = e.target.checked
                                              ? Array.from(new Set([...current, cert]))
                                              : current.filter((c) => c !== cert);
                                            return { ...prev, [emp.id]: { ...(prev[emp.id] ?? {}), certifications: next } };
                                          });
                                        }}
                                      />
                                      {certUpload ? (
                                        <a href={certUpload.signedUrl} target="_blank" rel="noopener noreferrer" className="underline text-teal-300">
                                          {cert}
                                        </a>
                                      ) : (
                                        cert
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => updateEmployeeRoles(emp.id)}
                                className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
                              >
                                Save approvals
                              </button>
                              {working === emp.id ? (
                                <span className="text-[11px] text-slate-400">Saving…</span>
                              ) : rolesSaved[emp.id] ? (
                                <span className="text-[11px] text-emerald-300">Saved</span>
                              ) : null}
                            </div>
                          </div>
                          {emp.bio ? (
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-1">Bio</p>
                              <p className="text-sm text-slate-200 whitespace-pre-wrap">{emp.bio}</p>
                            </div>
                          ) : null}
                          {emp.application ? (
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Application</p>
                              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200 space-y-2">
                                <p className="text-[11px] text-slate-400">
                                  Submitted: {emp.application.submittedAt ? new Date(emp.application.submittedAt).toLocaleString() : "—"}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  Roles: {emp.application.roles.join(", ") || "—"} · Languages: {emp.application.languages || "—"}
                                </p>
                                {emp.application.location && (
                                  <p className="text-[11px] text-slate-400">Location: {emp.application.location}</p>
                                )}
                                {emp.application.availability && (
                                  <p className="text-[11px] text-slate-400">Availability: {emp.application.availability}</p>
                                )}
                                {emp.application.interviewNotes && (
                                  <div>
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300 mb-1">Interview notes</p>
                                    <p className="text-sm whitespace-pre-wrap">{emp.application.interviewNotes}</p>
                                  </div>
                                )}
                                {emp.application.resumeInsights && (
                                  <div className="space-y-1">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Resume overview</p>
                                    <p className="text-sm">{emp.application.resumeInsights.summary}</p>
                                    <p className="text-[11px] text-slate-400">
                                      Score: {emp.application.resumeInsights.score} · Verdict: {emp.application.resumeInsights.verdict}
                                    </p>
                                    {emp.application.resumeInsights.keywords?.length ? (
                                      <p className="text-[11px] text-slate-400">
                                        Keywords: {emp.application.resumeInsights.keywords.join(", ")}
                                      </p>
                                    ) : null}
                                  </div>
                                )}
                                {emp.application.teacherAssessments?.length ? (
                                  <div className="space-y-1">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Teacher assessment</p>
                                    {emp.application.teacherAssessments.map((t, idx) => (
                                      <p key={idx} className="text-[11px] text-slate-400">
                                        {teacherLanguageLabels[t.language]} · Score: {t.score.percentage}%
                                      </p>
                                    ))}
                                  </div>
                                ) : null}
                                {emp.application.translatorExercise ? (
                                  <div className="space-y-1">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Translator exercise</p>
                                    <p className="text-[11px] text-slate-400">
                                      {translatorLanguageLabels[emp.application.translatorExercise.language]} · Score:{" "}
                                      {emp.application.translatorExercise.score ?? "N/A"}
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Assignments</p>
                            {emp.assignments.length === 0 ? (
                              <p className="text-xs text-slate-400">No assignments.</p>
                            ) : (
                              <ul className="text-sm text-slate-100 space-y-1">
                                {emp.assignments.map((a) => (
                                  <li key={a.id} className="flex items-center gap-2">
                                    <span className="font-semibold">{a.title}</span>
                                    <span className="text-xs text-slate-400">{a.status}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-1">Notes</p>
                            <div className="space-y-1">
                              {emp.notes.length === 0 ? (
                                <p className="text-xs text-slate-400">No notes yet.</p>
                              ) : (
                                emp.notes.map((n) => (
                                  <div key={n.id} className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-100">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] text-slate-400">
                                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                                      </span>
                                      {n.createdBy ? <span className="text-[11px] text-slate-500">{n.createdBy}</span> : null}
                                    </div>
                                    <p className="text-slate-100">{n.note}</p>
                                  </div>
                                ))
                              )}
                              <div className="mt-2 flex flex-col gap-2">
                                <textarea
                                  rows={2}
                                  placeholder="Add note"
                                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                                  onChange={(e) => setEmployeeNoteDraft((prev) => ({ ...prev, [emp.id]: e.target.value }))}
                                  value={employeeNoteDraft[emp.id] ?? ""}
                                />
                                <button
                                  type="button"
                                  onClick={() => addEmployeeNote(emp.id)}
                                  className="inline-flex items-center rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-teal-400"
                                >
                                  Save note
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-1">Core documents</p>
                            {(!emp.resumeUrl && !emp.contractUrl) ? (
                              <p className="text-xs text-slate-400">No resume or contract on file.</p>
                            ) : (
                              <ul className="text-xs text-slate-200 space-y-1">
                                {emp.resumeUrl ? (
                                  <li className="flex items-center gap-2">
                                    <span className="font-semibold">Resume</span>
                                    <a
                                      href={emp.resumeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-teal-300 underline"
                                    >
                                      {emp.resumeName ?? "Download"}
                                    </a>
                                  </li>
                                ) : null}
                                {emp.contractUrl ? (
                                  <li className="flex items-center gap-2">
                                    <span className="font-semibold">Contract</span>
                                    <a
                                      href={emp.contractUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-teal-300 underline"
                                    >
                                      {emp.contractName ?? "Download"}
                                    </a>
                                  </li>
                                ) : null}
                              </ul>
                            )}
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-1">Uploads</p>
                            {emp.uploads.length === 0 ? (
                              <p className="text-xs text-slate-400">No uploads yet.</p>
                            ) : (
                              <ul className="text-xs text-slate-200 space-y-1">
                                {emp.uploads.map((u) => {
                                  const displayKind =
                                    u.kind && u.kind.startsWith("cert_")
                                      ? `Certification: ${u.kind.replace(/^cert_/, "").replace(/-/g, " ")}`
                                      : u.kind;
                                  return (
                                    <li key={u.id} className="flex flex-wrap items-center gap-2">
                                      <span className="font-semibold">{displayKind}</span>
                                      {u.signedUrl ? (
                                        <a href={u.signedUrl} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">
                                          {u.filename}
                                        </a>
                                      ) : (
                                        <span>{u.filename}</span>
                                      )}
                                      <span className="text-[11px] text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}</span>
                                      <select
                                        className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                                        value={
                                          employeeUploadKindDraft[emp.id]?.[u.id] ??
                                          (u.kind || "photo")
                                        }
                                        onChange={(e) =>
                                          setEmployeeUploadKindDraft((prev) => ({
                                            ...prev,
                                            [emp.id]: { ...(prev[emp.id] ?? {}), [u.id]: e.target.value },
                                          }))
                                        }
                                      >
                                        <option value="photo">Photo / headshot</option>
                                        <option value="id">ID / passport</option>
                                        <option value="cert">Certification (unspecified)</option>
                                        {certOptions.map((c) => (
                                          <option key={c} value={`cert_${certSlug(c)}`}>
                                            Certification: {c}
                                          </option>
                                        ))}
                                        <option value="education">Education document</option>
                                        <option value="resume_override">Replace resume (PDF/Word)</option>
                                        <option value="other">Other</option>
                                      </select>
                                      <button
                                        type="button"
                                        className="rounded-full bg-slate-700 px-2 py-1 text-[11px] font-semibold text-white hover:bg-slate-600"
                                        onClick={async () => {
                                          const newKind = employeeUploadKindDraft[emp.id]?.[u.id] ?? u.kind;
                                          if (!newKind || !token) return;
                                          try {
                                            await fetch("/api/portal/admin/employees", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json", "x-admin-token": token },
                                              body: JSON.stringify({ action: "uploads", userId: emp.id, uploads: [{ id: u.id, kind: newKind }] }),
                                            });
                                            await refreshData();
                                          } catch (err) {
                                            setError(err instanceof Error ? err.message : "Unable to update upload type.");
                                          }
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        className="rounded-full bg-rose-700/90 px-2 py-1 text-[11px] font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
                                        onClick={() => deleteEmployeeUpload(emp.id, u)}
                                        disabled={deletingUploadId === u.id}
                                      >
                                        {deletingUploadId === u.id ? "Deleting…" : "Delete"}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                            <div className="mt-2 flex flex-col gap-2">
                          <select
                            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                            onChange={(e) => setEmployeeUploadDraft((prev) => ({ ...prev, [emp.id]: { ...(prev[emp.id] ?? {}), kind: e.target.value } }))}
                            value={employeeUploadDraft[emp.id]?.kind ?? "photo"}
                          >
                            <option value="photo">Photo / headshot</option>
                            <option value="id">ID / passport</option>
                            <option value="cert">Certification (unspecified)</option>
                            {certOptions.map((c) => (
                              <option key={c} value={`cert_${certSlug(c)}`}>
                                Certification: {c}
                              </option>
                            ))}
                            <option value="education">Education document</option>
                            <option value="resume_override">Replace resume (PDF/Word)</option>
                            <option value="other">Other</option>
                          </select>
                              <input
                                type="file"
                                onChange={(e) =>
                                  setEmployeeUploadDraft((prev) => ({
                                    ...prev,
                                    [emp.id]: { ...(prev[emp.id] ?? {}), file: e.target.files?.[0] ?? null },
                                  }))
                                }
                                className="text-xs text-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => uploadEmployeeFile(emp.id)}
                                className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
                              >
                                Upload
                              </button>
                            </div>
                          </div>
                          {emp.uploads.some((u) => u.kind === "education") ? (
                            <div className="mt-3">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-1">Education documents</p>
                              <ul className="text-xs text-slate-200 space-y-1">
                                {emp.uploads
                                  .filter((u) => u.kind === "education")
                                  .map((u) => (
                                    <li key={u.id} className="flex items-center gap-2">
                                      <span className="font-semibold">Education</span>
                                      {u.signedUrl ? (
                                        <a href={u.signedUrl} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">
                                          {u.filename}
                                        </a>
                                      ) : (
                                        <span>{u.filename}</span>
                                      )}
                                      <span className="text-[11px] text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ) : null}
                          <div className="flex flex-wrap gap-2 items-center">
                            <label className="text-xs text-slate-300">
                              Termination date:
                              <input
                                type="date"
                                className="ml-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-white"
                                onChange={(e) => setEmployeeTermination((prev) => ({ ...prev, [emp.id]: e.target.value }))}
                                value={employeeTermination[emp.id] ?? ""}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => updateEmployeeStatus(emp.id, "inactive", employeeTermination[emp.id] ?? null)}
                              className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                            >
                              Move to inactive
                            </button>
                            {emp.status !== "active" && (
                              <button
                                type="button"
                                onClick={() => updateEmployeeStatus(emp.id, "active", null)}
                                className="inline-flex items-center rounded-full bg-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-500"
                              >
                                Mark active
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                <div className="border-t border-slate-700 pt-4">
                  <h3 className="text-lg font-semibold">Inactive employees</h3>
                  <div className="mt-2 space-y-2">
                    {employees.filter((e) => e.status === "inactive").length === 0 ? (
                      <p className="text-sm text-slate-400">None</p>
                    ) : (
                      employees
                        .filter((e) => e.status === "inactive")
                        .map((emp) => (
                          <div key={emp.id} className="rounded-xl border border-slate-700 p-3 text-sm text-slate-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{emp.name}</div>
                                <div className="text-xs text-slate-400">{emp.email}</div>
                                {emp.terminationDate ? (
                                  <div className="text-[11px] text-slate-500">Terminated: {emp.terminationDate}</div>
                                ) : null}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedEmployees((prev) => ({ ...prev, [emp.id]: !prev[emp.id] }))}
                                  className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600"
                                >
                                  {expandedEmployees[emp.id] ? "Hide details" : "Details"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateEmployeeStatus(emp.id, "active", null)}
                                  className="inline-flex items-center rounded-full bg-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-500"
                                >
                                  Reactivate
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!confirm("This will permanently delete this user and their files. Continue?")) return;
                                    setWorking(emp.id);
                                    try {
                                      const res = await fetch("/api/portal/admin/employees", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", "x-admin-token": token ?? "" },
                                        body: JSON.stringify({ action: "delete", userId: emp.id }),
                                      });
                                      if (!res.ok) {
                                        const data = await res.json().catch(() => ({}));
                                        throw new Error(data.message || "Unable to delete user.");
                                      }
                                      await refreshData();
                                    } catch (err) {
                                      setError(err instanceof Error ? err.message : "Unable to delete user.");
                                    } finally {
                                      setWorking(null);
                                    }
                                  }}
                                  className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            {expandedEmployees[emp.id] && (
                              <div className="border-t border-slate-700 pt-2 space-y-2 text-xs text-slate-200">
                                <p>Roles: {emp.roles.join(", ")} · Languages: {emp.languages.join(", ") || "—"}</p>
                                {emp.bio && <p className="whitespace-pre-wrap">Bio: {emp.bio}</p>}
                                {emp.resumeUrl || emp.contractUrl ? (
                                  <div className="space-y-1">
                                    <p className="font-semibold text-slate-100">Core documents</p>
                                    {emp.resumeUrl ? (
                                      <a href={emp.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">
                                        {emp.resumeName ?? "Resume"}
                                      </a>
                                    ) : null}
                                    {emp.contractUrl ? (
                                      <a href={emp.contractUrl} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">
                                        {emp.contractName ?? "Contract"}
                                      </a>
                                    ) : null}
                                  </div>
                                ) : null}
                                {emp.uploads.length > 0 ? (
                                  <div className="space-y-1">
                                    <p className="font-semibold text-slate-100">Uploads</p>
                                    <ul className="space-y-1">
                                      {emp.uploads.map((u) => (
                                        <li key={u.id} className="flex items-center gap-2">
                                          <span className="text-[11px] uppercase text-slate-400">{u.kind}</span>
                                          {u.signedUrl ? (
                                            <a href={u.signedUrl} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">
                                              {u.filename}
                                            </a>
                                          ) : (
                                            <span>{u.filename}</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : null}
                                {emp.application ? (
                                  <div className="space-y-1">
                                    <p className="font-semibold text-slate-100">Application</p>
                                    <p className="text-[11px] text-slate-400">
                                      Submitted:{" "}
                                      {emp.application.submittedAt ? new Date(emp.application.submittedAt).toLocaleString() : "—"}
                                    </p>
                                    {emp.application.interviewNotes && (
                                      <p className="text-[11px] text-slate-400 whitespace-pre-wrap">
                                        Interview notes: {emp.application.interviewNotes}
                                      </p>
                                    )}
                                    {emp.application.resumeInsights && (
                                      <p className="text-[11px] text-slate-400">
                                        Resume score: {emp.application.resumeInsights.score} · Verdict:{" "}
                                        {emp.application.resumeInsights.verdict}
                                      </p>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "assignments":
        return (
          <div className="rounded-3xl bg-slate-800 p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{editingAssignment ? "Edit assignment" : "Create assignment"}</h2>
                {editingAssignment && (
                  <button
                    type="button"
                    onClick={cancelEditingAssignment}
                    className="text-sm text-slate-400 hover:text-slate-200"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Title
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Type
                  <select
                    value={assignmentForm.assignmentType}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, assignmentType: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  >
                    <option value="class">Class / cohort</option>
                    <option value="translation">Translation</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Client / account
                  <input
                    type="text"
                    value={assignmentForm.client}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, client: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Language pair
                  <input
                    type="text"
                    value={assignmentForm.languagePair}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, languagePair: e.target.value }))}
                    placeholder="e.g. EN ↔ DE"
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Hours assigned
                  <input
                    type="number"
                    min={1.5}
                    step={1.5}
                    value={assignmentForm.hoursAssigned}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, hoursAssigned: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Start date
                  <input
                    type="date"
                    value={assignmentForm.startDate}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  End date
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    min={assignmentForm.startDate || undefined}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                  {assignmentForm.startDate && assignmentForm.dueDate && assignmentForm.dueDate < assignmentForm.startDate && (
                    <span className="text-xs text-red-400 mt-1 block">End date cannot be before start date</span>
                  )}
                </label>
                <div className="text-xs text-slate-300 uppercase tracking-wide">
                  Participants (students)
                  <div className="mt-2 max-h-32 overflow-y-auto rounded-2xl border border-slate-600 bg-slate-900 p-2">
                    {students.length === 0 ? (
                      <p className="text-slate-500 text-sm py-1">No students in the system yet.</p>
                    ) : (
                      students.map((student) => (
                        <label key={student.id} className="flex items-center gap-2 py-1 text-sm text-slate-200 normal-case">
                          <input
                            type="checkbox"
                            checked={assignmentForm.participants.includes(student.id)}
                            onChange={(e) =>
                              setAssignmentForm((prev) => ({
                                ...prev,
                                participants: e.target.checked
                                  ? [...prev.participants, student.id]
                                  : prev.participants.filter((id) => id !== student.id),
                              }))
                            }
                          />
                          <span>{student.name}</span>
                          <span className="text-xs text-slate-400">({student.email})</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                {assignmentForm.assignmentType === "class" && (
                  <>
                    <label className="text-xs text-slate-300 uppercase tracking-wide">
                      Schedule (e.g., "Every Wednesday 7:00-8:30pm PST")
                      <input
                        type="text"
                        value={assignmentForm.schedule}
                        onChange={(e) => setAssignmentForm((prev) => ({ ...prev, schedule: e.target.value }))}
                        placeholder="Every Wednesday 7:00-8:30pm PST"
                        className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-300 uppercase tracking-wide">
                      Meeting URL (Teams/Zoom link)
                      <input
                        type="url"
                        value={assignmentForm.meetingUrl}
                        onChange={(e) => setAssignmentForm((prev) => ({ ...prev, meetingUrl: e.target.value }))}
                        placeholder="https://teams.microsoft.com/..."
                        className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                      />
                    </label>
                  </>
                )}
                <label className="text-xs text-slate-300 uppercase tracking-wide md:col-span-2">
                  Description / brief
                  <textarea
                    rows={3}
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Assign to</p>
                <div className="mt-2 flex flex-col gap-2">
                  {portalUsers.map((user) => (
                    <label key={user.id} className="inline-flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={assignmentForm.assignedTo.includes(user.id)}
                        onChange={(e) =>
                          setAssignmentForm((prev) => {
                            const assignedTo = e.target.checked
                              ? [...prev.assignedTo, user.id]
                              : prev.assignedTo.filter((id) => id !== user.id);
                            return { ...prev, assignedTo };
                          })
                        }
                      />
                      <span>{user.name}</span>
                      <span className="text-xs text-slate-400">({user.email})</span>
                    </label>
                  ))}
                </div>
              </div>
              {!editingAssignment && (
                <label className="mt-4 block text-xs uppercase tracking-wide text-slate-400">
                  Attach brief / files
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setAssignmentFiles(e.target.files)}
                    className="mt-1 block text-sm"
                  />
                </label>
              )}
              <button
                type="button"
                onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
                className="mt-4 inline-flex items-center rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                {editingAssignment ? "Save changes" : "Publish assignment"}
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Active assignments</h3>
              <div className="mt-4 space-y-3">
                {assignments.length === 0 ? (
                  <p className="text-sm text-slate-400">No assignments yet.</p>
                ) : (
                  assignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-2xl border border-slate-700 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{assignment.title}</p>
                          <p className="text-xs text-slate-400">
                            {assignment.assignmentType === "class" ? "Class" : "Translation"} · {assignment.hoursAssigned} hrs ·{" "}
                            {assignment.status}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Assigned to: {assignment.assignees.map((a) => `${a.name} (${a.email})`).join(", ") || "—"}
                          </p>
                          {assignment.client && (
                            <p className="text-xs text-slate-500">Client: {assignment.client}</p>
                          )}
                          {assignment.startDate && assignment.dueDate && (
                            <p className="text-xs text-amber-200">
                              {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                          )}
                          {!assignment.startDate && assignment.dueDate && (
                            <p className="text-xs text-amber-200">
                              Ends {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => startEditingAssignment(assignment)}
                            className="text-xs text-teal-400 hover:text-teal-300"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResendAssignmentNotification(assignment.id)}
                            disabled={resendingAssignmentId === assignment.id}
                            className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                          >
                            {resendingAssignmentId === assignment.id ? "Sending..." : "Resend"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            disabled={deletingAssignmentId === assignment.id}
                            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            {deletingAssignmentId === assignment.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      case "portalUsers":
        return (
          <div className="rounded-3xl bg-slate-800 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Create portal user</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Name
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Email
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Temporary password
                  <input
                    type="text"
                    value={userForm.password}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300 uppercase tracking-wide">
                  Languages (comma separated)
                  <input
                    type="text"
                    value={userForm.languages}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, languages: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-200">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userForm.roles.teacher}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, roles: { ...prev.roles, teacher: e.target.checked } }))}
                  />
                  Teacher
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userForm.roles.translator}
                    onChange={(e) =>
                      setUserForm((prev) => ({ ...prev, roles: { ...prev.roles, translator: e.target.checked } }))
                    }
                  />
                  Translator
                </label>
              </div>
              <button
                type="button"
                onClick={handleCreatePortalUser}
                className="mt-4 inline-flex items-center rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Create user
              </button>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold">Active users</h3>
                <div className="mt-4 space-y-3">
                  {portalUsers.filter((u) => u.active !== false).length === 0 ? (
                    <p className="text-sm text-slate-400">No users yet.</p>
                  ) : (
                    portalUsers
                      .filter((u) => u.active !== false)
                      .map((user) => {
                        const createdAt = (user as any).created_at ?? (user as any).createdAt ?? null;
                        const pub = user.publicProfile;
                        const isLive = pub?.visibility === "visible";
                        const isPending = pub && pub.visibility !== "visible";
                        const primaryRole = pub?.roles?.includes("translator") && !pub?.roles?.includes("teacher") ? "translators" : "teachers";
                        const profileUrl = isLive && pub?.slug ? `/${primaryRole}/${pub.slug}` : null;
                        return (
                          <div
                            key={user.id}
                            className="rounded-2xl border border-slate-700 p-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white">{user.name}</p>
                                {isLive ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                    Live
                                    {pub?.roles?.includes("teacher") && (
                                      <span className="rounded bg-emerald-500/50 px-1 py-0.5">T</span>
                                    )}
                                    {pub?.roles?.includes("translator") && (
                                      <span className="rounded bg-emerald-500/50 px-1 py-0.5">Tr</span>
                                    )}
                                  </span>
                                ) : isPending ? (
                                  <span className="inline-flex items-center rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                    Pending
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-slate-600 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                                    No profile
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{user.email}</p>
                              <p className="text-xs text-slate-500">
                                Roles: {user.roles.join(", ")} · Languages: {user.languages?.join(", ") || "—"}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {createdAt ? `Created ${new Date(createdAt).toLocaleDateString()}` : "Created: –"} · Active
                              </p>
                              {resetMessages[user.id] ? (
                                <p className="text-[11px] text-emerald-200">{resetMessages[user.id]}</p>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {profileUrl && (
                                <a
                                  href={profileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-500"
                                >
                                  View profile
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleResetPortalUser(user.id)}
                                disabled={resettingUserId === user.id}
                                className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600 disabled:opacity-60"
                              >
                                {resettingUserId === user.id ? "Resetting…" : "Reset password"}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!token) return;
                                  await fetch("/api/portal/admin/users", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                                    body: JSON.stringify({ action: "deactivate", userId: user.id }),
                                  });
                                  await refreshData();
                                }}
                                className="inline-flex items-center rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-500"
                              >
                                Deactivate
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Deactivated users</h3>
                <div className="mt-4 space-y-3">
                  {portalUsers.filter((u) => u.active === false).length === 0 ? (
                    <p className="text-sm text-slate-400">None</p>
                  ) : (
                    portalUsers
                      .filter((u) => u.active === false)
                      .map((user) => {
                        const createdAt = (user as any).created_at ?? (user as any).createdAt ?? null;
                        return (
                          <div
                            key={user.id}
                            className="rounded-2xl border border-slate-700 p-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <p className="font-semibold text-white">{user.name}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                              <p className="text-[11px] text-slate-500">
                                {createdAt ? `Created ${new Date(createdAt).toLocaleDateString()}` : "Created: –"} · Inactive
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!token) return;
                                  await fetch("/api/portal/admin/users", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                                    body: JSON.stringify({ action: "reactivate", userId: user.id }),
                                  });
                                  await refreshData();
                                }}
                                className="inline-flex items-center rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-teal-400"
                              >
                                Reactivate
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-700/60">
              <button
                type="button"
                onClick={() => setPendingProfilesOpen((prev) => !prev)}
                className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
              >
                {pendingProfilesOpen ? "Hide profile approvals" : "Review pending profiles"}
              </button>
              {pendingProfilesOpen ? (
                <div className="mt-3 rounded-2xl border border-slate-700 bg-slate-900 p-4">
                  <PublicStaffPreview token={token} />
                </div>
              ) : null}
            </div>
          </div>
        );
      case "inquiries":
        return (
          <div className="rounded-3xl bg-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">Inquiries</h3>
                <p className="text-sm text-slate-400">Recent contact form submissions</p>
              </div>
              <button
                type="button"
                onClick={refreshData}
                className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
              >
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900">
              <table className="min-w-full text-sm text-slate-100">
                <thead className="bg-slate-800 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Service</th>
                    <th className="px-3 py-2 text-left">Languages</th>
                    <th className="px-3 py-2 text-left">Details</th>
                    <th className="px-3 py-2 text-left">Source</th>
                    <th className="px-3 py-2 text-left">Marketing</th>
                    <th className="px-3 py-2 text-left">Submitted</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-4 text-center text-slate-400">
                        No inquiries yet.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inq) => (
                      <tr key={inq.id} className="border-t border-slate-700 align-top">
                        <td className="px-3 py-2 font-semibold text-white">
                          <div>{inq.name}</div>
                          {inq.organization && <div className="text-xs text-slate-400">{inq.organization}</div>}
                        </td>
                        <td className="px-3 py-2">
                          <a href={`mailto:${inq.email}`} className="text-teal-300 hover:underline">
                            {inq.email}
                          </a>
                        </td>
                        <td className="px-3 py-2 text-slate-200">{inq.serviceType ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-200">{inq.languages ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-200 max-w-xs whitespace-pre-wrap break-words">
                          {inq.details ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-400">{inq.source}</td>
                        <td className="px-3 py-2 text-xs text-slate-300 space-y-1">
                          {inq.metadata?.marketingOptIn === "true" ? "Opted in" : "No opt-in"}
                          {inq.metadata?.marketingStatus ? <div>Status: {inq.metadata.marketingStatus}</div> : null}
                          {inq.metadata?.preferredStaff ? <div>Staff: {inq.metadata.preferredStaff}</div> : null}
                          {inq.metadata?.referral ? <div>Referral: {inq.metadata.referral}</div> : null}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-400">
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-300 space-y-2">
                          <button
                            type="button"
                            onClick={() => markProspect(inq)}
                            disabled={working === inq.id}
                            className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
                          >
                            {working === inq.id ? "Saving…" : "Send to CRM"}
                          </button>
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => sendToCrm(inq, "student")}
                              disabled={working === inq.id}
                              className="inline-flex items-center rounded-full bg-sky-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-sky-400 disabled:opacity-60"
                            >
                              {working === inq.id ? "Sending…" : "To Student CRM"}
                            </button>
                            <button
                              type="button"
                              onClick={() => sendToCrm(inq, "client")}
                              disabled={working === inq.id}
                              className="inline-flex items-center rounded-full bg-indigo-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
                            >
                              {working === inq.id ? "Sending…" : "To Client CRM"}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteInquiry(inq.id)}
                            disabled={working === inq.id}
                            className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                          >
                            {working === inq.id ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "crm":
        return (
          <div className="rounded-3xl bg-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">CRM Contacts</h3>
                <p className="text-sm text-slate-400">Contacts promoted from inquiries or added manually.</p>
              </div>
              <button
                type="button"
                onClick={refreshData}
                className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
              >
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900">
              <table className="min-w-full text-sm text-slate-100">
                <thead className="bg-slate-800 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Service</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Marketing</th>
                    <th className="px-3 py-2 text-left">Follow-up</th>
                    <th className="px-3 py-2 text-left">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {crmContacts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-4 text-center text-slate-400">
                        No contacts yet. Promote an inquiry to CRM to see it here.
                      </td>
                    </tr>
                  ) : (
                    crmContacts.map((c) => (
                      <tr key={c.id} className="border-t border-slate-700">
                        <td className="px-3 py-2 font-semibold text-white">{c.name}</td>
                        <td className="px-3 py-2">
                          <a href={`mailto:${c.email}`} className="text-teal-300 hover:underline">
                            {c.email}
                          </a>
                          {c.organization ? <div className="text-[11px] text-slate-400">{c.organization}</div> : null}
                        </td>
                        <td className="px-3 py-2 text-slate-200">{c.contactType ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-200">{c.serviceInterest ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-200">{c.status ?? "lead"}</td>
                        <td className="px-3 py-2 text-xs text-slate-300">{c.marketingOptIn ? "Opted in" : "No opt-in"}</td>
                        <td className="px-3 py-2 text-xs text-slate-300">
                          {c.nextFollowupAt ? new Date(c.nextFollowupAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "hive":
        return (
          <div className="rounded-3xl bg-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Hive Mind</h3>
                <p className="text-sm text-slate-400">Manage teacher resources, packs, and link health.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setHiveCheckingLinks(true);
                    try {
                      const res = await fetch("/api/portal/admin/hive", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "x-admin-token": token },
                        body: JSON.stringify({ action: "check-all-links" }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        alert(`Link check complete: ${data.results.valid} valid, ${data.results.dead} dead, ${data.results.errors} errors`);
                        await refreshData();
                      }
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Link check failed.");
                    } finally {
                      setHiveCheckingLinks(false);
                    }
                  }}
                  disabled={hiveCheckingLinks}
                  className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-60"
                >
                  {hiveCheckingLinks ? "Checking…" : "Check All Links"}
                </button>
                <button
                  type="button"
                  onClick={refreshData}
                  className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Dead link warning banner */}
            {hiveDeadLinkCount > 0 && (
              <div className="rounded-xl bg-amber-500/20 border border-amber-500/40 p-3 flex items-center gap-3">
                <span className="text-amber-400 text-xl">⚠</span>
                <div>
                  <p className="text-amber-200 font-semibold text-sm">{hiveDeadLinkCount} dead link{hiveDeadLinkCount !== 1 ? "s" : ""} detected</p>
                  <p className="text-amber-300/70 text-xs">Check the Approved tab and filter by link status to review.</p>
                </div>
              </div>
            )}

            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-slate-700 pb-3">
              {(["pending", "approved", "packs", "suggestions"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setHiveSubTab(tab); setHiveSelectedPack(null); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    hiveSubTab === tab ? "bg-teal-500 text-slate-900" : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {tab === "pending" ? `Pending (${hivePending.length})` :
                   tab === "approved" ? `Approved (${hiveApproved.length})` :
                   tab === "packs" ? `Packs (${hivePacks.length})` :
                   `Suggestions (${hivePackSuggestions.length})`}
                </button>
              ))}
            </div>

            {/* Pending tab */}
            {hiveSubTab === "pending" && (
              <div className="rounded-2xl border border-slate-700 p-4">
                <div className="space-y-2 max-h-[60vh] overflow-auto text-sm text-slate-100">
                  {hivePending.length === 0 ? (
                    <p className="text-slate-400 text-sm">No pending uploads.</p>
                  ) : (
                    hivePending.map((file) => {
                      const resourceType = file.resource_type || "file";
                      const icon = resourceType === "video" ? "🎬" : resourceType === "link" ? "🔗" : "📄";
                      const url = file.signed_url || file.url || "#";
                      return (
                        <div key={file.id} className="border border-slate-700 rounded-xl p-3 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{icon}</span>
                            <p className="font-semibold text-white flex-1">{file.display_name}</p>
                          </div>
                          <p className="text-xs text-slate-400">
                            {file.language || "—"} · {file.level || "—"} · {file.skill || "—"} · {file.topic || "—"}
                          </p>
                          {url !== "#" && (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-teal-300 underline">
                              {resourceType === "file" ? "Download file" : "Open link"}
                            </a>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs mt-1">
                            <button
                              type="button"
                              onClick={async () => {
                                setWorking(file.id);
                                try {
                                  const res = await fetch("/api/portal/admin/hive", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                                    body: JSON.stringify({ action: "approve", id: file.id }),
                                  });
                                  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Unable to approve");
                                  await refreshData();
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : "Unable to approve.");
                                } finally {
                                  setWorking(null);
                                }
                              }}
                              className="rounded-full bg-teal-500 px-3 py-1 font-semibold text-slate-900 hover:bg-teal-400 disabled:opacity-60"
                              disabled={working === file.id}
                            >
                              {working === file.id ? "Working…" : "Approve"}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const note = window.prompt("Add a note about this rejection (optional):") ?? "";
                                setWorking(file.id);
                                try {
                                  const res = await fetch("/api/portal/admin/hive", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                                    body: JSON.stringify({ action: "reject", id: file.id, note }),
                                  });
                                  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Unable to reject");
                                  await refreshData();
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : "Unable to reject.");
                                } finally {
                                  setWorking(null);
                                }
                              }}
                              className="rounded-full border border-amber-400 px-3 py-1 font-semibold text-amber-200 hover:bg-amber-500/20 disabled:opacity-60"
                              disabled={working === file.id}
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => setHiveEditFile(file)}
                              className="rounded-full border border-slate-600 px-3 py-1 font-semibold text-slate-200 hover:bg-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!window.confirm("Delete this upload?")) return;
                                setWorking(file.id);
                                try {
                                  const res = await fetch("/api/portal/admin/hive", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                                    body: JSON.stringify({ action: "delete", id: file.id }),
                                  });
                                  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Unable to delete");
                                  await refreshData();
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : "Unable to delete.");
                                } finally {
                                  setWorking(null);
                                }
                              }}
                              className="rounded-full border border-slate-600 px-3 py-1 font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-60"
                              disabled={working === file.id}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Approved tab */}
            {hiveSubTab === "approved" && (
              <div className="rounded-2xl border border-slate-700 p-4">
                <div className="space-y-2 max-h-[60vh] overflow-auto text-sm text-slate-100">
                  {hiveApproved.length === 0 ? (
                    <p className="text-slate-400 text-sm">No approved files yet.</p>
                  ) : (
                    hiveApproved.map((file) => {
                      const resourceType = file.resource_type || "file";
                      const icon = resourceType === "video" ? "🎬" : resourceType === "link" ? "🔗" : "📄";
                      const url = file.signed_url || file.url || "#";
                      const linkStatus = file.link_status || "unchecked";
                      const statusIcon = linkStatus === "valid" ? "✓" : linkStatus === "dead" ? "✗" : linkStatus === "error" ? "?" : "—";
                      const statusColor = linkStatus === "valid" ? "text-emerald-400" : linkStatus === "dead" ? "text-rose-400" : "text-slate-500";
                      return (
                        <div
                          key={file.id}
                          className={`border rounded-xl p-3 flex flex-col gap-2 hover:bg-slate-700/40 transition ${
                            linkStatus === "dead" ? "border-rose-500/50 bg-rose-500/10" : "border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{icon}</span>
                            <p className="font-semibold text-white flex-1">{file.display_name}</p>
                            {(resourceType === "video" || resourceType === "link") && (
                              <span className={`text-xs font-mono ${statusColor}`} title={`Link status: ${linkStatus}`}>
                                {statusIcon}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {file.language || "—"} · {file.level || "—"} · {file.skill || "—"} · {file.topic || "—"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Uploaded {file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : "—"}
                            {file.link_checked_at && ` · Link checked ${new Date(file.link_checked_at).toLocaleDateString()}`}
                          </p>
                          <div className="flex flex-wrap gap-2 items-center">
                            {url !== "#" && (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-teal-300 underline">
                                {resourceType === "file" ? "Download" : "Open link"}
                              </a>
                            )}
                            {(resourceType === "video" || resourceType === "link") && (
                              <button
                                type="button"
                                onClick={async () => {
                                  setWorking(file.id);
                                  try {
                                    const res = await fetch("/api/portal/admin/hive", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json", "x-admin-token": token },
                                      body: JSON.stringify({ action: "check-link", id: file.id }),
                                    });
                                    if (res.ok) {
                                      const data = await res.json();
                                      alert(`Link status: ${data.status}`);
                                      await refreshData();
                                    }
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : "Check failed.");
                                  } finally {
                                    setWorking(null);
                                  }
                                }}
                                className="text-[11px] text-slate-400 underline disabled:opacity-60"
                                disabled={working === file.id}
                              >
                                Check link
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setHiveEditFile(file)}
                              className="text-[11px] text-amber-300 underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!window.confirm("Delete this resource?")) return;
                                setWorking(file.id);
                                try {
                                  const res = await fetch("/api/portal/admin/hive", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                                    body: JSON.stringify({ action: "delete", id: file.id }),
                                  });
                                  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Unable to delete");
                                  await refreshData();
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : "Unable to delete.");
                                } finally {
                                  setWorking(null);
                                }
                              }}
                              className="text-[11px] text-rose-300 underline disabled:opacity-60"
                              disabled={working === file.id}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Packs tab */}
            {hiveSubTab === "packs" && (
              <div className="space-y-4">
                {hiveSelectedPack ? (
                  <div className="rounded-2xl border border-slate-700 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setHiveSelectedPack(null)}
                        className="text-sm text-teal-300 hover:text-teal-200"
                      >
                        ← Back to packs
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/portal/admin/hive/packs", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "x-admin-token": token },
                                body: JSON.stringify({
                                  action: hiveSelectedPack.published ? "unpublish" : "publish",
                                  id: hiveSelectedPack.id,
                                }),
                              });
                              if (res.ok) {
                                await refreshData();
                                setHiveSelectedPack((p: any) => p ? { ...p, published: !p.published } : null);
                              }
                            } catch {}
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            hiveSelectedPack.published
                              ? "border border-amber-400 text-amber-200 hover:bg-amber-500/20"
                              : "bg-teal-500 text-slate-900 hover:bg-teal-400"
                          }`}
                        >
                          {hiveSelectedPack.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm("Delete this pack?")) return;
                            try {
                              const res = await fetch("/api/portal/admin/hive/packs", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "x-admin-token": token },
                                body: JSON.stringify({ action: "delete", id: hiveSelectedPack.id }),
                              });
                              if (res.ok) {
                                setHiveSelectedPack(null);
                                await refreshData();
                              }
                            } catch {}
                          }}
                          className="rounded-full border border-rose-400 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                        >
                          Delete Pack
                        </button>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{hiveSelectedPack.name}</h4>
                      {hiveSelectedPack.description && <p className="text-sm text-slate-400 mt-1">{hiveSelectedPack.description}</p>}
                      <p className="text-xs text-slate-500 mt-1">
                        {hiveSelectedPack.language} · {hiveSelectedPack.level}
                        {hiveSelectedPack.week_number && ` · Week ${hiveSelectedPack.week_number}`}
                        {" · "}{hiveSelectedPack.published ? <span className="text-emerald-400">Published</span> : <span className="text-amber-400">Draft</span>}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-white">Items in pack</h5>
                      {(hiveSelectedPack.items || []).length === 0 ? (
                        <p className="text-slate-400 text-sm">No items yet. Add resources from the approved list below.</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-auto">
                          {hiveSelectedPack.items.map((item: any) => {
                            const file = item.hive_file || item;
                            const resourceType = file.resource_type || "file";
                            const icon = resourceType === "video" ? "🎬" : resourceType === "link" ? "🔗" : "📄";
                            return (
                              <div key={item.id} className="flex items-center gap-2 border border-slate-700 rounded-lg p-2 text-sm">
                                <span>{icon}</span>
                                <span className="flex-1 truncate">{file.display_name}</span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await fetch("/api/portal/admin/hive/packs", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", "x-admin-token": token },
                                        body: JSON.stringify({
                                          action: "remove-item",
                                          packId: hiveSelectedPack.id,
                                          hiveFileId: file.id,
                                        }),
                                      });
                                      // Refresh pack
                                      const res = await fetch(`/api/portal/admin/hive/packs?packId=${hiveSelectedPack.id}`, {
                                        headers: { "x-admin-token": token },
                                      });
                                      if (res.ok) {
                                        const data = await res.json();
                                        setHiveSelectedPack({ ...data.pack, items: data.items });
                                      }
                                    } catch {}
                                  }}
                                  className="text-xs text-rose-300 hover:text-rose-200"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-white">Add approved resources</h5>
                      <div className="space-y-1 max-h-48 overflow-auto">
                        {hiveApproved
                          .filter((f) => !(hiveSelectedPack.items || []).some((i: any) => (i.hive_file?.id || i.id) === f.id))
                          .map((file) => {
                            const resourceType = file.resource_type || "file";
                            const icon = resourceType === "video" ? "🎬" : resourceType === "link" ? "🔗" : "📄";
                            return (
                              <div key={file.id} className="flex items-center gap-2 text-sm">
                                <span>{icon}</span>
                                <span className="flex-1 truncate text-slate-300">{file.display_name}</span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await fetch("/api/portal/admin/hive/packs", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", "x-admin-token": token },
                                        body: JSON.stringify({
                                          action: "add-item",
                                          packId: hiveSelectedPack.id,
                                          hiveFileId: file.id,
                                        }),
                                      });
                                      // Refresh pack
                                      const res = await fetch(`/api/portal/admin/hive/packs?packId=${hiveSelectedPack.id}`, {
                                        headers: { "x-admin-token": token },
                                      });
                                      if (res.ok) {
                                        const data = await res.json();
                                        setHiveSelectedPack({ ...data.pack, items: data.items });
                                      }
                                    } catch {}
                                  }}
                                  className="text-xs text-teal-300 hover:text-teal-200"
                                >
                                  + Add
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Create pack form */}
                    <div className="rounded-2xl border border-slate-700 p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-white">Create New Pack</h4>
                      <div className="grid md:grid-cols-5 gap-3 text-sm">
                        <input
                          type="text"
                          value={hivePackForm.name}
                          onChange={(e) => setHivePackForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Pack name"
                          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                        />
                        <input
                          type="text"
                          value={hivePackForm.description}
                          onChange={(e) => setHivePackForm((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Description"
                          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                        />
                        <select
                          value={hivePackForm.language}
                          onChange={(e) => setHivePackForm((p) => ({ ...p, language: e.target.value }))}
                          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                        >
                          <option>English</option>
                          <option>Spanish</option>
                          <option>German</option>
                          <option>French</option>
                          <option>Italian</option>
                          <option>Portuguese</option>
                        </select>
                        <select
                          value={hivePackForm.level}
                          onChange={(e) => setHivePackForm((p) => ({ ...p, level: e.target.value }))}
                          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                        >
                          {["A1", "A1+", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C1+", "C2", "C2+"].map((l) => <option key={l}>{l}</option>)}
                        </select>
                        <input
                          type="number"
                          value={hivePackForm.weekNumber}
                          onChange={(e) => setHivePackForm((p) => ({ ...p, weekNumber: e.target.value }))}
                          placeholder="Week #"
                          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!hivePackForm.name.trim()) return;
                          try {
                            const res = await fetch("/api/portal/admin/hive/packs", {
                              method: "POST",
                              headers: { "Content-Type": "application/json", "x-admin-token": token },
                              body: JSON.stringify({
                                action: "create",
                                name: hivePackForm.name,
                                description: hivePackForm.description,
                                language: hivePackForm.language,
                                level: hivePackForm.level,
                                weekNumber: hivePackForm.weekNumber ? parseInt(hivePackForm.weekNumber) : undefined,
                              }),
                            });
                            if (res.ok) {
                              setHivePackForm({ name: "", description: "", language: "English", level: "A1", weekNumber: "" });
                              await refreshData();
                            }
                          } catch {}
                        }}
                        disabled={!hivePackForm.name.trim()}
                        className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-400 disabled:opacity-60"
                      >
                        Create Pack
                      </button>
                    </div>

                    {/* Pack list */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hivePacks.length === 0 ? (
                        <p className="text-slate-400 text-sm col-span-full">No packs created yet.</p>
                      ) : (
                        hivePacks.map((pack) => (
                          <button
                            key={pack.id}
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/portal/admin/hive/packs?packId=${pack.id}`, {
                                  headers: { "x-admin-token": token },
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  setHiveSelectedPack({ ...data.pack, items: data.items });
                                }
                              } catch {}
                            }}
                            className="border border-slate-700 rounded-2xl p-4 bg-slate-900 text-left hover:bg-slate-700/50 transition"
                          >
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-white flex-1">{pack.name}</h4>
                              {pack.published ? (
                                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full">Published</span>
                              ) : (
                                <span className="text-[10px] bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">Draft</span>
                              )}
                            </div>
                            {pack.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pack.description}</p>}
                            <p className="text-xs text-slate-500 mt-2">
                              {pack.language} · {pack.level}
                              {pack.week_number && ` · Week ${pack.week_number}`}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Suggestions tab */}
            {hiveSubTab === "suggestions" && (
              <div className="rounded-2xl border border-slate-700 p-4">
                <div className="space-y-2 max-h-[60vh] overflow-auto">
                  {hivePackSuggestions.length === 0 ? (
                    <p className="text-slate-400 text-sm">No pending suggestions.</p>
                  ) : (
                    hivePackSuggestions.map((suggestion) => {
                      const file = suggestion.hive_file || {};
                      const resourceType = file.resource_type || "file";
                      const icon = resourceType === "video" ? "🎬" : resourceType === "link" ? "🔗" : "📄";
                      return (
                        <div key={suggestion.id} className="border border-slate-700 rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-white">{file.display_name || "Unknown"}</p>
                              <p className="text-xs text-slate-400">Suggested by {suggestion.suggested_by_name || "Unknown"}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                const packId = window.prompt("Enter pack ID to add this resource to:");
                                if (!packId) return;
                                try {
                                  await fetch("/api/portal/admin/hive/packs", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                                    body: JSON.stringify({ action: "add-item", packId, hiveFileId: file.id }),
                                  });
                                  await fetch("/api/portal/admin/hive/packs", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                                    body: JSON.stringify({ action: "accept-suggestion", suggestionId: suggestion.id }),
                                  });
                                  await refreshData();
                                } catch {}
                              }}
                              className="rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-teal-400"
                            >
                              Accept & Add
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await fetch("/api/portal/admin/hive/packs", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                                    body: JSON.stringify({ action: "reject-suggestion", suggestionId: suggestion.id }),
                                  });
                                  await refreshData();
                                } catch {}
                              }}
                              className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Edit File Modal */}
            {hiveEditFile && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
                  <h3 className="text-lg font-bold text-white mb-4">Edit Resource</h3>
                  <div className="space-y-3">
                    <label className="block text-sm text-slate-200">
                      Display Name
                      <input
                        type="text"
                        value={hiveEditFile.display_name || ""}
                        onChange={(e) => setHiveEditFile({ ...hiveEditFile, display_name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-sm text-slate-200">
                        Language
                        <select
                          value={hiveEditFile.language || "English"}
                          onChange={(e) => setHiveEditFile({ ...hiveEditFile, language: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                          <option value="Portuguese">Portuguese</option>
                          <option value="Italian">Italian</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Japanese">Japanese</option>
                          <option value="Korean">Korean</option>
                          <option value="Arabic">Arabic</option>
                          <option value="Russian">Russian</option>
                          <option value="Other">Other</option>
                        </select>
                      </label>
                      <label className="block text-sm text-slate-200">
                        Level
                        <select
                          value={hiveEditFile.level || "A1"}
                          onChange={(e) => setHiveEditFile({ ...hiveEditFile, level: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm"
                        >
                          <option value="A1">A1</option>
                          <option value="A1+">A1+</option>
                          <option value="A2">A2</option>
                          <option value="A2+">A2+</option>
                          <option value="B1">B1</option>
                          <option value="B1+">B1+</option>
                          <option value="B2">B2</option>
                          <option value="B2+">B2+</option>
                          <option value="C1">C1</option>
                          <option value="C1+">C1+</option>
                          <option value="C2">C2</option>
                          <option value="C2+">C2+</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-sm text-slate-200">
                        Skill
                        <select
                          value={hiveEditFile.skill || "General"}
                          onChange={(e) => setHiveEditFile({ ...hiveEditFile, skill: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm"
                        >
                          <option value="General">General</option>
                          <option value="Speaking">Speaking</option>
                          <option value="Listening">Listening</option>
                          <option value="Reading">Reading</option>
                          <option value="Writing">Writing</option>
                          <option value="Grammar">Grammar</option>
                          <option value="Vocabulary">Vocabulary</option>
                          <option value="Pronunciation">Pronunciation</option>
                        </select>
                      </label>
                      <label className="block text-sm text-slate-200">
                        Topic
                        <input
                          type="text"
                          value={hiveEditFile.topic || ""}
                          onChange={(e) => setHiveEditFile({ ...hiveEditFile, topic: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm"
                          placeholder="e.g., Travel, Business, Food"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-sm text-slate-200">
                        File Type
                        <select
                          value={hiveEditFile.file_type || "File"}
                          onChange={(e) => setHiveEditFile({ ...hiveEditFile, file_type: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm"
                        >
                          <option value="File">File</option>
                          <option value="Worksheet">Worksheet</option>
                          <option value="Lesson Plan">Lesson Plan</option>
                          <option value="Presentation">Presentation</option>
                          <option value="Audio">Audio</option>
                          <option value="Video">Video</option>
                          <option value="Link">Link</option>
                          <option value="Assessment">Assessment</option>
                          <option value="Game">Game</option>
                          <option value="Flashcards">Flashcards</option>
                        </select>
                      </label>
                    </div>
                    {(hiveEditFile.resource_type === "video" || hiveEditFile.resource_type === "link") && (
                      <label className="block text-sm text-slate-200">
                        URL
                        <input
                          type="url"
                          value={hiveEditFile.url || ""}
                          onChange={(e) => setHiveEditFile({ ...hiveEditFile, url: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm"
                          placeholder="https://..."
                        />
                      </label>
                    )}
                    <label className="block text-sm text-slate-200">
                      Notes / Description
                      <textarea
                        value={hiveEditFile.notes || ""}
                        onChange={(e) => setHiveEditFile({ ...hiveEditFile, notes: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm"
                        rows={3}
                        placeholder="Optional description or notes"
                      />
                    </label>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setHiveEditFile(null)}
                      className="px-4 py-2 text-sm text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={working === hiveEditFile.id}
                      onClick={async () => {
                        setWorking(hiveEditFile.id);
                        try {
                          const res = await fetch("/api/portal/admin/hive", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "x-admin-token": token },
                            body: JSON.stringify({
                              action: "update",
                              id: hiveEditFile.id,
                              displayName: hiveEditFile.display_name,
                              language: hiveEditFile.language,
                              level: hiveEditFile.level,
                              skill: hiveEditFile.skill,
                              topic: hiveEditFile.topic,
                              fileType: hiveEditFile.file_type,
                              weekNumber: hiveEditFile.week_number,
                              url: hiveEditFile.url,
                              description: hiveEditFile.notes,
                            }),
                          });
                          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Unable to update");
                          setHiveEditFile(null);
                          await refreshData();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Unable to update.");
                        } finally {
                          setWorking(null);
                        }
                      }}
                      className="px-4 py-2 text-sm font-semibold bg-teal-500 text-slate-900 rounded-lg hover:bg-teal-400 disabled:opacity-60"
                    >
                      {working === hiveEditFile.id ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "trips":
        return <TripsManager token={token} />;
      case "students":
        return <StudentsManager token={token} />;
      case "organizations":
        return <OrganizationsManager token={token} />;
      case "placement":
        return <PlacementManager token={token} />;
      case "classes":
        return <ClassesManager adminToken={token} />;
      default:
        return null;
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-300 font-semibold">Assessments · Admin</p>
            <h1 className="mt-3 text-4xl font-extrabold">JB Linguistics · Secure Portal</h1>
            <p className="mt-3 text-slate-300 text-sm">
              Monitor submissions, trigger exports, and generate personal access codes so each candidate has a unique login. Future releases
              will add client-level dashboards and individualized learning portals powered by these same credentials.
            </p>
          </div>
          {hasToken && (
            <button
              type="button"
              onClick={handleSignOut}
              className="ml-4 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign out"
            >
              Sign out
            </button>
          )}
        </div>

        {!hasToken ? (
          <div className="mt-8 rounded-3xl bg-slate-800 p-6 max-w-lg">
            <label className="text-sm text-slate-200">
              <span className="block mb-2 font-semibold">Admin token</span>
              <input
                type="password"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-600 bg-slate-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </label>
            <button
              type="button"
              onClick={handleLogin}
              className="mt-4 inline-flex items-center rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Unlock portal
            </button>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex rounded-3xl bg-slate-800 p-1 text-sm flex-wrap gap-1">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "results" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("results")}
                >
                  Results
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "codes" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("codes")}
                >
                  Access codes
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "applicants" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("applicants")}
                >
                  Applicants
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "onboarding" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("onboarding")}
                >
                  Active employees
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "assignments" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("assignments")}
                >
                  Assignments
                </button>
                <button
                  type="button"
              className={`px-3 py-1.5 rounded-2xl ${activeTab === "portalUsers" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
              onClick={() => setActiveTab("portalUsers")}
            >
              Portal users
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-2xl ${activeTab === "board" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
              onClick={() => setActiveTab("board")}
            >
              Board
            </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "inquiries" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("inquiries")}
                >
                  Inquiries
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "hive" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("hive")}
                >
                  Hive
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "crm" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("crm")}
                >
                  CRM
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "trips" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("trips")}
                >
                  Learning Trips
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "students" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("students")}
                >
                  Students
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "organizations" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("organizations")}
                >
                  Corporate Clients
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "placement" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("placement")}
                >
                  Placement Tests
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-2xl ${activeTab === "classes" ? "bg-teal-500 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setActiveTab("classes")}
                >
                  Classes
                </button>
              </div>
              <button
                type="button"
                onClick={refreshData}
              className="rounded-2xl border border-slate-600 px-4 py-2 text-sm"
            >
              Refresh
            </button>
            {activeTab === "onboarding" && (
              <button
                type="button"
                onClick={() => {
                  const next = !showBulkEmail;
                  setShowBulkEmail(next);
                  if (next) void loadEmailLogs();
                }}
                className="rounded-2xl border border-slate-600 px-4 py-2 text-sm"
              >
                {showBulkEmail ? "Hide email all freelancers" : "Email all freelancers"}
              </button>
            )}
            {loading && <span className="text-xs text-slate-400">Syncing…</span>}
            {error && <span className="text-xs text-rose-300">{error}</span>}
          </div>

            {renderTabContent()}
          </div>
        )}
      </section>
    </main>
  );
}
