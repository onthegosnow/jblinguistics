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
      .select("teacher_role, translator_role, teaching_languages, translating_languages, certifications, publish_teacher, publish_translator, staff_visibility")
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

  return NextResponse.json({
    profile: {
      ...data,
      teacher_role: empRes.data && "teacher_role" in empRes.data ? (empRes.data as any).teacher_role ?? false : false,
      translator_role: empRes.data && "translator_role" in empRes.data ? (empRes.data as any).translator_role ?? false : false,
      teaching_languages: empRes.data && "teaching_languages" in empRes.data ? (empRes.data as any).teaching_languages ?? [] : [],
      translating_languages: empRes.data && "translating_languages" in empRes.data ? (empRes.data as any).translating_languages ?? [] : [],
      certifications: empRes.data && "certifications" in empRes.data ? (empRes.data as any).certifications ?? [] : [],
      publish_teacher: empRes.data && "publish_teacher" in empRes.data ? (empRes.data as any).publish_teacher ?? false : false,
      publish_translator: empRes.data && "publish_translator" in empRes.data ? (empRes.data as any).publish_translator ?? false : false,
      staff_visibility: empRes.data && "staff_visibility" in empRes.data ? (empRes.data as any).staff_visibility ?? "visible" : "visible",
    },
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
