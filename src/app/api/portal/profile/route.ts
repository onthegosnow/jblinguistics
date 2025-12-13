import { NextRequest, NextResponse } from "next/server";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";
import { ONBOARDING_BUCKET } from "@/lib/server/onboarding-supabase";

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  const supabase = createSupabaseAdminClient();
  const [{ data, error }, uploadsRes, applicantRes, empRes] = await Promise.all([
    supabase
      .from("portal_users")
      .select("id, name, email, bio, phone, address, city, state, country, photo_url, languages")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("portal_user_uploads")
      .select("id, kind, filename, mime_type, size, path, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("career_applications").select("id, email, resume_path, resume_filename").eq("email", user.email ?? "").maybeSingle(),
    supabase
      .from("onboarding_envelopes")
      .select("applicant_id, doc_path, envelope_id, completed_at")
      .eq("applicant_id", undefined)
      .maybeSingle(),
    supabase
      .from("portal_employees")
      .select(
        "teacher_role, translator_role, teaching_languages, translating_languages, certifications, publish_teacher, publish_translator, staff_visibility, ai_bio_draft, ai_bio_prompt, ai_bio_updated_at"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (error || !data) return NextResponse.json({ message: error?.message ?? "Profile not found" }, { status: 500 });
  const uploads = uploadsRes.data ?? [];
  const uploadsWithUrls = await Promise.all(
    uploads.map(async (u) => {
      let signedUrl: string | undefined;
      if (u.path) {
        const signed = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(u.path, 60 * 60);
        if (!signed.error) signedUrl = signed.data.signedUrl;
      }
      return {
        id: u.id,
        kind: u.kind ?? "file",
        filename: u.filename,
        mimeType: u.mime_type,
        size: u.size,
        path: u.path,
        signedUrl,
        uploadedAt: u.created_at,
      };
    }),
  );
  let resumeUrl: string | undefined;
  let resumeName: string | undefined;
  if (applicantRes.data?.resume_path) {
    const signed = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(applicantRes.data.resume_path, 60 * 60);
    if (!signed.error) {
      resumeUrl = signed.data.signedUrl;
      resumeName = applicantRes.data.resume_filename ?? applicantRes.data.resume_path.split("/").pop() ?? "resume.pdf";
    }
  }

  let contractUrl: string | undefined;
  let contractName: string | undefined;
  if (applicantRes.data?.id) {
    const env = await supabase
      .from("onboarding_envelopes")
      .select("doc_path, envelope_id")
      .eq("applicant_id", applicantRes.data.id)
      .order("completed_at", { ascending: false })
      .maybeSingle();
    if (env.data?.doc_path) {
      const signed = await supabase.storage.from(ONBOARDING_BUCKET).createSignedUrl(env.data.doc_path, 60 * 60);
      if (!signed.error) {
        contractUrl = signed.data.signedUrl;
        contractName = env.data.envelope_id ? `${env.data.envelope_id}.pdf` : env.data.doc_path.split("/").pop() ?? "contract.pdf";
      }
    }
  }

  // If no employee record found for this user_id, or if another record with the same email is newer, reuse the latest one
  let employee = empRes.data;
  if (user.email) {
    const { data: matchingUsers } = await supabase.from("portal_users").select("id").ilike("email", user.email);
    const ids = (matchingUsers ?? []).map((u: any) => u.id).filter(Boolean);
    if (ids.length) {
      const { data: empRows } = await supabase
        .from("portal_employees")
          .select(
            "user_id, teacher_role, translator_role, teaching_languages, translating_languages, certifications, publish_teacher, publish_translator, staff_visibility, ai_bio_draft, ai_bio_prompt, ai_bio_updated_at, updated_at"
          )
        .in("user_id", ids);
      if (empRows?.length) {
        const latest = empRows.reduce((prev: any, curr: any) => {
          const prevTime = prev?.updated_at ? new Date(prev.updated_at).getTime() : 0;
          const currTime = curr?.updated_at ? new Date(curr.updated_at).getTime() : 0;
          return currTime > prevTime ? curr : prev;
        }, empRes.data ?? empRows[0]);
        employee = latest;
        await supabase
          .from("portal_employees")
          .upsert({
            user_id: user.id,
            teacher_role: latest.teacher_role ?? false,
            translator_role: latest.translator_role ?? false,
            teaching_languages: latest.teaching_languages ?? [],
            translating_languages: latest.translating_languages ?? [],
            certifications: latest.certifications ?? [],
            publish_teacher: latest.publish_teacher ?? false,
            publish_translator: latest.publish_translator ?? false,
            staff_visibility: latest.staff_visibility ?? "visible",
            ai_bio_draft: latest.ai_bio_draft ?? null,
            ai_bio_prompt: latest.ai_bio_prompt ?? null,
            ai_bio_updated_at: latest.ai_bio_updated_at ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }
    }
  }

  const { data: pubProfile } = await supabase
    .from("public_staff_profiles")
    .select("visibility")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    profile: {
      ...data,
      teacher_role: employee && "teacher_role" in employee ? (employee as any).teacher_role ?? false : false,
      translator_role: employee && "translator_role" in employee ? (employee as any).translator_role ?? false : false,
      teaching_languages: employee && "teaching_languages" in employee ? (employee as any).teaching_languages ?? [] : [],
      translating_languages: employee && "translating_languages" in employee ? (employee as any).translating_languages ?? [] : [],
      certifications: employee && "certifications" in employee ? (employee as any).certifications ?? [] : [],
      publish_teacher: employee && "publish_teacher" in employee ? (employee as any).publish_teacher ?? false : false,
      publish_translator: employee && "publish_translator" in employee ? (employee as any).publish_translator ?? false : false,
      staff_visibility: employee && "staff_visibility" in employee ? (employee as any).staff_visibility ?? "pending" : "pending",
      ai_bio_draft: employee && "ai_bio_draft" in employee ? (employee as any).ai_bio_draft ?? null : null,
      ai_bio_prompt: employee && "ai_bio_prompt" in employee ? (employee as any).ai_bio_prompt ?? null : null,
      ai_bio_updated_at: employee && "ai_bio_updated_at" in employee ? (employee as any).ai_bio_updated_at ?? null : null,
    },
    publishStatus: pubProfile?.visibility ?? "pending",
    uploads: uploadsWithUrls,
    coreDocs: { resumeUrl, resumeName, contractUrl, contractName },
  });
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    bio?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    photoUrl?: string;
    languages?: string[];
  };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("portal_users")
    .update({
      name: body.name ?? undefined,
      bio: body.bio ?? undefined,
      phone: body.phone ?? undefined,
      address: body.address ?? undefined,
      city: body.city ?? undefined,
      state: body.state ?? undefined,
      country: body.country ?? undefined,
      photo_url: body.photoUrl ?? undefined,
      languages: body.languages ?? undefined,
    })
    .eq("id", user.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
