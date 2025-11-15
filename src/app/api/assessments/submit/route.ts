import { NextResponse } from "next/server";
import { appendSubmission } from "@/lib/server/storage";

const EMAIL_ENDPOINT = "https://api.resend.com/emails";
const EMAIL_FROM = process.env.ASSESSMENT_RESULTS_FROM ?? "JB Linguistics <noreply@jblinguistics.com>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendEmail(payload: {
  candidateName: string;
  proctorEmail: string;
  candidateEmail?: string;
  summary: { totalCorrect: number; totalQuestions: number; percentage: number };
  breakdown: Record<string, { correct: number; incorrect: number; unanswered: number; total: number }>;
}) {
  if (!RESEND_API_KEY) {
    return { sent: false, message: "Set RESEND_API_KEY to enable email delivery." };
  }
  const recipients = [payload.proctorEmail];
  if (payload.candidateEmail) {
    recipients.push(payload.candidateEmail);
  }
  const breakdownRows = Object.entries(payload.breakdown)
    .map(([level, stats]) => `${level}: ${stats.correct}/${stats.total} correct (${stats.incorrect} wrong, ${stats.unanswered} unanswered)`)
    .join("<br/>");
  const html = `
    <h2>Placement results for ${payload.candidateName}</h2>
    <p><strong>Score:</strong> ${payload.summary.percentage}% (${payload.summary.totalCorrect}/${payload.summary.totalQuestions})</p>
    <p>${breakdownRows}</p>
    <p>This automated message was sent by JB Linguistics LLC.</p>
  `;

  const response = await fetch(EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: recipients,
      subject: `Placement results for ${payload.candidateName}`,
      html,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Unable to send email via Resend");
  }
  return { sent: true, message: "Results emailed." };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.candidateName || !body.proctorEmail || !body.summary || !body.summary.totalQuestions) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const record = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      candidateName: body.candidateName,
      candidateEmail: body.candidateEmail,
      proctorEmail: body.proctorEmail,
      testLanguage: body.testLanguage ?? "en",
      summary: body.summary,
      accessMeta: body.accessMeta,
    };

    await appendSubmission(record);

    let emailResult = { sent: false, message: "Results stored locally." };
    try {
      emailResult = await sendEmail({
        candidateName: record.candidateName,
        proctorEmail: record.proctorEmail,
        candidateEmail: record.candidateEmail,
        summary: record.summary,
        breakdown: record.summary.breakdown,
      });
    } catch (err) {
      emailResult = { sent: false, message: err instanceof Error ? err.message : "Unable to send email" };
    }

    return NextResponse.json({ success: true, id: record.id, message: emailResult.message });
  } catch (err) {
    console.error("Assessment submit error", err);
    return NextResponse.json({ message: "Unable to record submission." }, { status: 500 });
  }
}
