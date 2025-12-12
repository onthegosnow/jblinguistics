import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { listOnboardingEnvelopes, saveOnboardingEnvelope } from "@/lib/server/onboarding-supabase";
import { requireAdmin } from "@/lib/server/storage";
import { ensurePortalUser } from "@/lib/server/portal-supabase";

export async function GET(request: Request) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const envelopes = await listOnboardingEnvelopes();
  return NextResponse.json({ envelopes });
}

export async function POST(request: Request) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File is required." }, { status: 400 });
  }

  const signerName = (form.get("name") as string | null) ?? null;
  const signerEmail = (form.get("email") as string | null) ?? null;
  const completedAt = (form.get("completedAt") as string | null) ?? null;
  const envelopeId = (form.get("envelopeId") as string | null) ?? randomUUID();
  const applicantId = (form.get("applicantId") as string | null) ?? null;
  const rolesRaw = (form.get("roles") as string | null) ?? "";
  const languagesRaw = (form.get("languages") as string | null) ?? "";
  const roles = rolesRaw
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const languages = languagesRaw
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    await saveOnboardingEnvelope({
      envelopeId,
      signerName,
      signerEmail,
      completedAt,
      documentBuffer: buffer,
      filename: file.name || "agreement.pdf",
      applicantId,
    });

    if (signerEmail) {
      await ensurePortalUser({
        name: signerName ?? signerEmail,
        email: signerEmail,
        roles: roles.length ? roles : ["teacher"],
        languages,
        sendEmail: true,
      });
    }
  } catch (err) {
    console.error("Manual onboarding upload failed", err);
    return NextResponse.json({ message: (err as Error).message ?? "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
