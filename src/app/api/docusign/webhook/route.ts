import { NextResponse } from "next/server";
import { fetchLatestApplicationByEmail } from "@/lib/server/careers-supabase";
import { ensurePortalUser } from "@/lib/server/portal-supabase";
import { saveOnboardingEnvelope, verifyDocusignHmac } from "@/lib/server/onboarding-supabase";

// DocuSign Connect webhook (REST v2.1 with documents, envelope completed)
export async function POST(request: Request) {
  const secret = process.env.DOCUSIGN_HMAC_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Webhook not configured." }, { status: 500 });
  }

  const raw = Buffer.from(await request.arrayBuffer());
  const signature = request.headers.get("x-docusign-signature-1");
  if (!verifyDocusignHmac(raw, signature, secret)) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const envelopeId: string | undefined =
    payload?.envelopeId ??
    payload?.data?.envelopeId ??
    payload?.envelopeSummary?.envelopeId ??
    payload?.envelope?.envelopeId;

  if (!envelopeId) {
    return NextResponse.json({ message: "Missing envelopeId" }, { status: 400 });
  }

  const signer =
    payload?.recipients?.signers?.[0] ??
    payload?.data?.recipients?.signers?.[0] ??
    payload?.envelope?.recipients?.signers?.[0];
  const signerName: string | null = signer?.name ?? null;
  const signerEmail: string | null = signer?.email ?? null;

  const completedAt: string | null =
    payload?.completedDateTime ??
    payload?.data?.completedDateTime ??
    payload?.envelope?.completedDateTime ??
    payload?.statusDateTime ??
    null;

  // Try to find the document base64
  const documents =
    payload?.envelopeDocuments ??
    payload?.data?.envelopeDocuments ??
    payload?.envelope?.documents ??
    payload?.documents;

  let documentBase64: string | undefined;
  if (Array.isArray(documents) && documents.length) {
    documentBase64 =
      documents.find((doc: any) => doc?.documentBase64)?.documentBase64 ?? documents[0]?.documentBase64 ?? documents[0]?.pdfBytes;
  } else if (typeof payload?.documentBase64 === "string") {
    documentBase64 = payload.documentBase64;
  }

  if (!documentBase64) {
    return NextResponse.json({ message: "No document provided" }, { status: 400 });
  }

  const documentBuffer = Buffer.from(documentBase64, "base64");
  const filename: string =
    documents?.[0]?.name ??
    documents?.[0]?.documentName ??
    documents?.[0]?.fileName ??
    `docusign-${envelopeId}.pdf`;

  try {
    await saveOnboardingEnvelope({
      envelopeId,
      signerName,
      signerEmail,
      completedAt,
      documentBuffer,
      filename,
    });

    // Create portal user if needed based on applicant data
    if (signerEmail) {
      const applicant = await fetchLatestApplicationByEmail(signerEmail);
      const roles = applicant?.roles ?? [];
      const languages = (applicant?.working_languages as string[] | null) ?? [];
      await ensurePortalUser({
        name: signerName || applicant?.name || signerEmail,
        email: signerEmail,
        roles: roles.length ? roles : ["teacher"],
        languages,
        sendEmail: true,
      });
    }
  } catch (err) {
    console.error("Failed to save onboarding envelope", err);
    return NextResponse.json({ message: "Failed to save document" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
