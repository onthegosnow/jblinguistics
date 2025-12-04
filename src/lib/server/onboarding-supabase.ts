import crypto from "crypto";
import { createSupabaseAdminClient } from "../supabase-server";
import { RESUME_BUCKET } from "../supabase-server";

export type OnboardingEnvelope = {
  envelopeId: string;
  signerName?: string | null;
  signerEmail?: string | null;
  completedAt?: string | null;
  docPath: string;
  applicantId?: string | null;
  createdAt?: string | null;
};

const ONBOARDING_BUCKET = process.env.ONBOARDING_BUCKET ?? "onboarding";

export async function saveOnboardingEnvelope(params: {
  envelopeId: string;
  signerName?: string | null;
  signerEmail?: string | null;
  completedAt?: string | null;
  documentBuffer: Buffer;
  filename?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const safeFilename = sanitizeFilename(params.filename || "agreement.pdf");
  const docPath = `envelopes/${params.envelopeId}/${Date.now()}-${safeFilename}`;

  const { error: uploadError } = await supabase.storage
    .from(ONBOARDING_BUCKET)
    .upload(docPath, params.documentBuffer, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const applicantId = params.signerEmail ? await findApplicantIdByEmail(params.signerEmail) : null;

  const { error: insertError } = await supabase
    .from("onboarding_envelopes")
    .upsert(
      {
        envelope_id: params.envelopeId,
        signer_name: params.signerName ?? null,
        signer_email: params.signerEmail ?? null,
        completed_at: params.completedAt ?? null,
        doc_path: docPath,
        applicant_id: applicantId,
      },
      { onConflict: "envelope_id" },
    );
  if (insertError) {
    throw new Error(insertError.message);
  }
}

export async function listOnboardingEnvelopes(): Promise<
  Array<OnboardingEnvelope & { docUrl?: string; resumeUrl?: string }>
> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("onboarding_envelopes")
    .select("envelope_id, signer_name, signer_email, completed_at, doc_path, applicant_id, created_at")
    .order("completed_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const results: Array<OnboardingEnvelope & { docUrl?: string; resumeUrl?: string }> = [];
  for (const row of rows) {
    let docUrl: string | undefined;
    let resumeUrl: string | undefined;
    if (row.doc_path) {
      const signed = await supabase.storage.from(ONBOARDING_BUCKET).createSignedUrl(row.doc_path, 60 * 60);
      if (!signed.error) {
        docUrl = signed.data.signedUrl;
      }
    }
    if (row.applicant_id) {
      const { data: resumeRow } = await supabase
        .from("career_applications")
        .select("resume_path")
        .eq("id", row.applicant_id)
        .maybeSingle();
      const resumePath = resumeRow?.resume_path;
      if (resumePath) {
        const signedResume = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(resumePath, 60 * 60);
        if (!signedResume.error) {
          resumeUrl = signedResume.data.signedUrl;
        }
      }
    }
    results.push({
      envelopeId: row.envelope_id,
      signerName: row.signer_name,
      signerEmail: row.signer_email,
      completedAt: row.completed_at,
      docPath: row.doc_path,
      applicantId: row.applicant_id,
      createdAt: row.created_at,
      docUrl,
      resumeUrl,
    });
  }
  return results;
}

function sanitizeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function findApplicantIdByEmail(email: string): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("career_applications")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (error) return null;
  return data?.id ?? null;
}

export function verifyDocusignHmac(rawBody: Buffer, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;
  const key = Buffer.from(secret, "base64");
  const hmac = crypto.createHmac("sha256", key).update(rawBody).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signatureHeader));
}
