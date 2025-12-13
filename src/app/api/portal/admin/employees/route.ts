import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";
import { ONBOARDING_BUCKET } from "@/lib/server/onboarding-supabase";
import { createPortalPasswordHash, requireAdmin } from "@/lib/server/storage";
import { generateTempPassword, sendPortalCredentials } from "@/lib/server/portal-supabase";

type ActionPayload = {
  action?: "note" | "status" | "delete" | "roles";
  userId?: string;
  note?: string;
  createdBy?: string;
  status?: string;
  terminationDate?: string | null;
  teacherRole?: boolean;
  translatorRole?: boolean;
  teachingLanguages?: string[];
  translatingLanguages?: string[];
  certifications?: string[];
};

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const supabase = createSupabaseAdminClient();

  const [
    usersRes,
    employeesRes,
    notesRes,
    uploadsRes,
    portalUploadsRes,
    assignmentsRes,
    applicantsRes,
    envelopesRes,
  ] = await Promise.all([
    supabase
      .from("portal_users")
      .select("id, name, email, roles, languages, active, created_at, bio, phone, address, city, state, country, photo_url"),
    supabase
      .from("portal_employees")
      .select(
        "user_id, status, termination_date, notes, updated_at, teacher_role, translator_role, teaching_languages, translating_languages, certifications"
      ),
    supabase.from("portal_employee_notes").select("id, user_id, note, created_at, created_by").order("created_at", { ascending: false }),
    supabase.from("portal_employee_uploads").select("id, user_id, kind, filename, mime_type, size, path, created_at").order("created_at", {
      ascending: false,
    }),
    supabase
      .from("portal_user_uploads")
      .select("id, user_id, kind, filename, mime_type, size, path, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("portal_assignments").select(
      "id, title, assignment_type, status, assigned_to, client, language_pair, hours_assigned, start_date, due_date"
    ),
    supabase
      .from("career_applications")
      .select(
        [
          "id",
          "submitted_at",
          "name",
          "email",
          "location",
          "languages",
          "working_languages",
          "experience",
          "availability",
          "message",
          "roles",
          "hire_sent_at",
          "resume_path",
          "resume_filename",
          "resume_insights",
          "interview_notes",
        ].join(",")
      ),
    supabase.from("onboarding_envelopes").select("applicant_id, doc_path, completed_at, envelope_id"),
  ]);

  const users = usersRes.data ?? [];
  const employeeRows = employeesRes.data ?? [];
  const notes = notesRes.data ?? [];
  const uploads = uploadsRes.data ?? [];
  const portalUploads = portalUploadsRes.data ?? [];
  const assignments = assignmentsRes.data ?? [];
  const applicants = applicantsRes.data ?? [];
  const envelopes = envelopesRes.data ?? [];

  // hydrate assessments tied to applications
  const appIds = applicants.map((a) => a.id).filter(Boolean);
  let teacherAssessmentsByApp = new Map<string, any[]>();
  let translatorExerciseByApp = new Map<string, any>();
  if (appIds.length) {
    const [{ data: teacherData }, { data: translatorData }] = await Promise.all([
      supabase
        .from("teacher_assessments")
        .select("application_id, language, seed, answers, responses, score")
        .in("application_id", appIds),
      supabase
        .from("translator_exercises")
        .select("application_id, language, submission, score, missing_tokens")
        .in("application_id", appIds),
    ]);
    teacherAssessmentsByApp = new Map<string, any[]>();
    (teacherData ?? []).forEach((row: any) => {
      const list = teacherAssessmentsByApp.get(row.application_id) ?? [];
      list.push({
        language: row.language,
        seed: row.seed,
        answers: row.answers,
        responses: row.responses,
        score: row.score,
      });
      teacherAssessmentsByApp.set(row.application_id, list);
    });
    translatorExerciseByApp = new Map<string, any>();
    (translatorData ?? []).forEach((row: any) => {
      translatorExerciseByApp.set(row.application_id, {
        language: row.language,
        submission: row.submission,
        score: row.score,
        missingTokens: row.missing_tokens ?? [],
      });
    });
  }

  // Quick lookup maps
  const applicantByEmail = new Map<string, any>();
  applicants.forEach((a) => applicantByEmail.set((a.email ?? "").toLowerCase(), a));
  const envelopeByApplicant = new Map<string, any>();
  envelopes.forEach((e) => {
    if (e.applicant_id && (!envelopeByApplicant.has(e.applicant_id) || envelopeByApplicant.get(e.applicant_id).completed_at < e.completed_at)) {
      envelopeByApplicant.set(e.applicant_id, e);
    }
  });

  const employeeMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      roles: string[];
      languages: string[];
      active: boolean;
      created_at?: string | null;
      status?: string | null;
      termination_date?: string | null;
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
      application?: any;
      assignments: Array<{ id: string; title: string; status: string; client?: string | null; languagePair?: string | null }>;
      notes: Array<{ id: string; note: string; createdAt: string; createdBy?: string | null }>;
      uploads: Array<{ id: string; kind: string; filename: string; createdAt: string; mimeType?: string | null; size?: number | null; path?: string | null; signedUrl?: string }>;
    }
  >();
  users.forEach((u) => {
    employeeMap.set(u.id, {
      id: u.id,
      name: u.name,
      email: u.email,
      roles: u.roles ?? [],
      languages: u.languages ?? [],
      active: u.active ?? true,
      created_at: u.created_at ?? null,
      status: "active",
      termination_date: null,
      bio: u.bio ?? null,
      phone: u.phone ?? null,
      address: u.address ?? null,
      city: u.city ?? null,
      state: u.state ?? null,
      country: u.country ?? null,
      photoUrl: u.photo_url ?? null,
      notes: [],
      uploads: [],
      assignments: [],
    });
  });

  employeeRows.forEach((row) => {
    const item = employeeMap.get(row.user_id);
    if (item) {
      item.status = row.status ?? "active";
      item.termination_date = row.termination_date ?? null;
      (item as any).statusNotes = row.notes ?? null;
      (item as any).teacher_role = row.teacher_role ?? false;
      (item as any).translator_role = row.translator_role ?? false;
      (item as any).teaching_languages = row.teaching_languages ?? [];
      (item as any).translating_languages = row.translating_languages ?? [];
      (item as any).certifications = row.certifications ?? [];
    }
  });

  notes.forEach((n) => {
    const item = employeeMap.get(n.user_id);
    if (item) {
      item.notes.push({
        id: n.id,
        note: n.note,
        createdAt: n.created_at,
        createdBy: n.created_by ?? null,
      });
    }
  });

  for (const u of uploads) {
    const item = employeeMap.get(u.user_id);
    if (item) {
      let signedUrl: string | undefined;
      if (u.path) {
        const signed = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(u.path, 60 * 60);
        if (!signed.error) signedUrl = signed.data.signedUrl;
      }
      item.uploads.push({
        id: u.id,
        kind: u.kind ?? "file",
        filename: u.filename,
        mimeType: u.mime_type,
        size: u.size,
        path: u.path,
        signedUrl,
        createdAt: u.created_at,
      });
    }
  }

  for (const u of portalUploads) {
    const item = employeeMap.get(u.user_id);
    if (item) {
      let signedUrl: string | undefined;
      if (u.path) {
        const signed = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(u.path, 60 * 60);
        if (!signed.error) signedUrl = signed.data.signedUrl;
      }
      item.uploads.push({
        id: u.id,
        kind: u.kind ?? "file",
        filename: u.filename,
        mimeType: u.mime_type,
        size: u.size,
        path: u.path,
        signedUrl,
        createdAt: u.created_at,
      });

      // Always pick the most recent photo upload as the display photo
      if (u.kind === "photo" && signedUrl) {
        const existingCreatedAt = (item as any).__photoCreatedAt as string | undefined;
        const isNewer =
          !existingCreatedAt ||
          (u.created_at && new Date(u.created_at).getTime() > new Date(existingCreatedAt).getTime());
        if (isNewer) {
          (item as any).__photoCreatedAt = u.created_at ?? null;
          item.photoUrl = signedUrl;
        }
      }
    }
  }

  assignments.forEach((a) => {
    (a.assigned_to as string[] | null)?.forEach((uid) => {
      const item = employeeMap.get(uid);
      if (item) {
        item.assignments.push({
          id: a.id,
          title: a.title,
          status: a.status,
          client: a.client,
          languagePair: a.language_pair,
        });
      }
    });
  });

  // Attach resume/contract if matched by email/applicant
  for (const emp of employeeMap.values()) {
    const applicant = applicantByEmail.get(emp.email.toLowerCase());
    if (applicant?.resume_path) {
      const signed = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(applicant.resume_path, 60 * 60);
      if (!signed.error) {
        emp.resumeUrl = signed.data.signedUrl;
        emp.resumeName =
          applicant.resume_filename ??
          (applicant.resume_path ? applicant.resume_path.split("/").pop() ?? "resume.pdf" : "resume.pdf");
      }
    }
    if (applicant?.id) {
      const env = envelopeByApplicant.get(applicant.id);
      if (env?.doc_path) {
        const signed = await supabase.storage.from(ONBOARDING_BUCKET).createSignedUrl(env.doc_path, 60 * 60);
        if (!signed.error) {
          emp.contractUrl = signed.data.signedUrl;
          emp.contractName =
            env.envelope_id ? `${env.envelope_id}.pdf` : env.doc_path ? env.doc_path.split("/").pop() ?? "contract.pdf" : "contract.pdf";
        }
      }
    }
    if (applicant) {
      emp.application = {
        id: applicant.id,
        submittedAt: applicant.submitted_at ?? null,
        name: applicant.name,
        email: applicant.email,
        location: applicant.location ?? null,
        languages: applicant.languages ?? null,
        workingLanguages: applicant.working_languages ?? [],
        experience: applicant.experience ?? null,
        availability: applicant.availability ?? null,
        message: applicant.message ?? null,
        roles: applicant.roles ?? [],
        hireSentAt: applicant.hire_sent_at ?? null,
        resumeInsights: applicant.resume_insights ?? null,
        interviewNotes: applicant.interview_notes ?? null,
        teacherAssessments: teacherAssessmentsByApp.get(applicant.id) ?? [],
        translatorExercise: translatorExerciseByApp.get(applicant.id) ?? null,
      };
    }
  }

  return NextResponse.json({ employees: Array.from(employeeMap.values()) });
}

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const contentType = request.headers.get("content-type") ?? "";
  const supabase = createSupabaseAdminClient();

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const userId = (form.get("userId") as string | null)?.trim();
    const kind = (form.get("kind") as string | null)?.trim() || "file";
    const file = form.get("file");
    if (!userId || !(file instanceof File)) {
      return NextResponse.json({ message: "userId and file are required." }, { status: 400 });
    }
    const safeName = (file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `employee_uploads/${userId}/${Date.now()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await supabase.storage.from(RESUME_BUCKET).upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });
    if (upload.error) return NextResponse.json({ message: upload.error.message }, { status: 500 });
    const { error } = await supabase.from("portal_employee_uploads").insert({
      user_id: userId,
      kind,
      filename: safeName,
      mime_type: file.type || null,
      size: buffer.length,
      path,
    });
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const body = (await request.json().catch(() => ({}))) as ActionPayload;
  if (body.action === "note") {
    if (!body.userId || !body.note) return NextResponse.json({ message: "userId and note required." }, { status: 400 });
    const { error } = await supabase.from("portal_employee_notes").insert({
      user_id: body.userId,
      note: body.note,
      created_by: body.createdBy ?? null,
    });
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  if (body.action === "status") {
    if (!body.userId) return NextResponse.json({ message: "userId required." }, { status: 400 });

    const status = body.status ?? "active";
    // Update employee status/termination
    const { error: empError } = await supabase.from("portal_employees").upsert({
      user_id: body.userId,
      status,
      termination_date: body.terminationDate ?? null,
      updated_at: new Date().toISOString(),
    });
    if (empError) return NextResponse.json({ message: empError.message }, { status: 500 });

    // Lock/unlock portal account + optionally send fresh temp password on reactivate
    if (status === "inactive") {
      await supabase.from("portal_users").update({ active: false }).eq("id", body.userId);
    } else if (status === "active") {
      const temp = generateTempPassword();
      const password_hash = createPortalPasswordHash(temp);
      const { data: userRow } = await supabase
        .from("portal_users")
        .update({ active: true, must_reset: true, password_hash })
        .eq("id", body.userId)
        .select("email, name")
        .maybeSingle();
      if (userRow?.email) {
        await sendPortalCredentials(userRow.email, userRow.name ?? userRow.email, temp, { reset: true }).catch(() => undefined);
      }
    }

    return NextResponse.json({ success: true });
  }

  if (body.action === "roles") {
    if (!body.userId) return NextResponse.json({ message: "userId required." }, { status: 400 });
    const { data: existing } = await supabase
      .from("portal_employees")
      .select("staff_visibility")
      .eq("user_id", body.userId)
      .maybeSingle();
    const publishTeacher = body.teacherRole ?? false;
    const publishTranslator = body.translatorRole ?? false;
    const visibility = publishTeacher || publishTranslator ? existing?.staff_visibility ?? "hidden" : "hidden";
    const { error } = await supabase
      .from("portal_employees")
      .upsert({
        user_id: body.userId,
        teacher_role: body.teacherRole ?? false,
        translator_role: body.translatorRole ?? false,
        teaching_languages: body.teachingLanguages ?? [],
        translating_languages: body.translatingLanguages ?? [],
        certifications: body.certifications ?? [],
        publish_teacher: publishTeacher,
        publish_translator: publishTranslator,
        staff_visibility: visibility,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", body.userId);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (body.action === "delete") {
    if (!body.userId) return NextResponse.json({ message: "userId required." }, { status: 400 });
    // Remove uploads metadata
    await supabase.from("portal_employee_uploads").delete().eq("user_id", body.userId);
    await supabase.from("portal_user_uploads").delete().eq("user_id", body.userId);
    await supabase.from("portal_employee_notes").delete().eq("user_id", body.userId);
    await supabase.from("portal_employees").delete().eq("user_id", body.userId);
    await supabase.from("portal_users").delete().eq("id", body.userId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: "Unsupported action" }, { status: 400 });
}
