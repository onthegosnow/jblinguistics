import { NextResponse } from "next/server";
import { fetchLatestApplicationByEmail } from "@/lib/server/careers-supabase";
import { ensurePortalUser } from "@/lib/server/portal-supabase";
import { saveOnboardingEnvelope, verifyDocusignHmac } from "@/lib/server/onboarding-supabase";
import { fetchEnvelopeCombinedPdf } from "@/lib/server/docusign-client";

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

  let payload: {
    envelopeId?: string;
    data?: Record<string, unknown>;
    envelopeSummary?: Record<string, unknown>;
    envelope?: Record<string, unknown>;
    recipients?: { signers?: Array<{ name?: string; email?: string }> };
    documentBase64?: string;
    envelopeDocuments?: unknown;
    documents?: unknown;
    completedDateTime?: string;
    statusDateTime?: string;
  };
  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const envelopeIdCandidates = [
    payload?.envelopeId,
    (payload?.data as { envelopeId?: unknown } | undefined)?.envelopeId,
    (payload?.envelopeSummary as { envelopeId?: unknown } | undefined)?.envelopeId,
    (payload?.envelope as { envelopeId?: unknown } | undefined)?.envelopeId,
  ];
  const envelopeId = envelopeIdCandidates.find((id): id is string => typeof id === "string");

  if (!envelopeId) {
    return NextResponse.json({ message: "Missing envelopeId" }, { status: 400 });
  }

  const signer =
    (payload?.recipients as { signers?: Array<{ name?: string; email?: string }> } | undefined)?.signers?.[0] ??
    ((payload?.data as { recipients?: { signers?: Array<{ name?: string; email?: string }> } } | undefined)?.recipients?.signers?.[0]) ??
    ((payload?.envelope as { recipients?: { signers?: Array<{ name?: string; email?: string }> } } | undefined)?.recipients?.signers?.[0]);
  const signerName: string | null = signer?.name ?? null;
  const signerEmail: string | null = signer?.email ?? null;

  const completedAtCandidate =
    payload?.completedDateTime ??
    (payload?.data as { completedDateTime?: unknown } | undefined)?.completedDateTime ??
    (payload?.envelope as { completedDateTime?: unknown } | undefined)?.completedDateTime ??
    payload?.statusDateTime ??
    null;
  const completedAt = typeof completedAtCandidate === "string" ? completedAtCandidate : null;

  // Try to find the document base64
  const documents =
    payload?.envelopeDocuments ??
    payload?.data?.envelopeDocuments ??
    payload?.envelope?.documents ??
    payload?.documents;

  let documentBase64: string | undefined;
  if (Array.isArray(documents) && documents.length) {
    const first = documents[0] as { documentBase64?: string; pdfBytes?: string; name?: string; documentName?: string; fileName?: string };
    const found = documents.find(
      (doc: { documentBase64?: string; pdfBytes?: string }) => typeof doc?.documentBase64 === "string"
    ) as { documentBase64?: string; pdfBytes?: string } | undefined;
    documentBase64 = found?.documentBase64 ?? first?.documentBase64 ?? first?.pdfBytes;
  } else if (typeof payload?.documentBase64 === "string") {
    documentBase64 = payload.documentBase64;
  }

  try {
    let documentBuffer: Buffer | null = null;
    let filename: string = `docusign-${envelopeId}.pdf`;

    if (documentBase64) {
      try {
        documentBuffer = Buffer.from(documentBase64, "base64");
        const firstDoc =
          Array.isArray(documents) && documents.length
            ? (documents[0] as { name?: string; documentName?: string; fileName?: string })
            : undefined;
        filename = firstDoc?.name ?? firstDoc?.documentName ?? firstDoc?.fileName ?? `docusign-${envelopeId}.pdf`;
      } catch (decodeErr) {
        console.warn("DocuSign webhook: base64 decode failed, will try fetch API", decodeErr);
      }
    }

    if (!documentBuffer) {
      try {
        const fetched = await fetchEnvelopeCombinedPdf(envelopeId);
        documentBuffer = fetched.buffer;
        filename = fetched.filename;
      } catch (fetchErr) {
        console.warn("DocuSign webhook: fetch combined PDF failed", fetchErr);
      }
    }

    if (documentBuffer) {
      await saveOnboardingEnvelope({
        envelopeId,
        signerName,
        signerEmail,
        completedAt,
        documentBuffer,
        filename,
      });
    } else {
      // Do not retry endlessly—acknowledge webhook but skip document save
      console.warn("DocuSign webhook: no document available, skipping save");
    }

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
    // Acknowledge to stop retries, but log the error
    return NextResponse.json({ message: "Webhook processed without saving document" }, { status: 200 });
  }

  return NextResponse.json({ success: true });
}
