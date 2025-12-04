import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const DOCUSIGN_URL =
  "https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=063afaed-c871-441a-8842-43f37f4be944&env=na4&acct=2b24bf93-0c1a-4a00-ac3d-94a41015425c&v=2";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const APPLICATION_INBOX = process.env.CAREER_APPLICATION_EMAIL ?? "jblinguisticsllc@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required." }, { status: 400 });
    }
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return NextResponse.json({ message: "SMTP is not configured." }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const subject = "JB Linguistics • Freelancer Onboarding Agreement";
    const textBody = [
      `Hi ${name},`,
      "",
      "Please complete the onboarding agreement at the link below:",
      DOCUSIGN_URL,
      "",
      "If you have any questions, reply to this email.",
      "",
      "— JB Linguistics",
    ].join("\n");
    const htmlBody = `
      <p>Hi ${name},</p>
      <p>Please complete the onboarding agreement at the link below:</p>
      <p><a href="${DOCUSIGN_URL}">Freelancer Onboarding (DocuSign)</a></p>
      <p>If you have any questions, reply to this email.</p>
      <p>— JB Linguistics</p>
    `;

    await transporter.sendMail({
      from: SMTP_FROM ?? APPLICATION_INBOX ?? SMTP_USER,
      to: email,
      bcc: APPLICATION_INBOX,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Hire email error", err);
    const status = 500;
    const message = err instanceof Error ? err.message : "Unable to send onboarding email.";
    return NextResponse.json({ message }, { status });
  }
}
