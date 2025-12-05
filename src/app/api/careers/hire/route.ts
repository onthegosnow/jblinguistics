import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

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
    const applicationId = typeof body.applicationId === "string" ? body.applicationId : undefined;
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

    const subject = "Welcome to JB Linguistics • Complete Your Agreement";
    const textBody = [
      `Hi ${name},`,
      "",
      "Welcome to JB Linguistics! We’re excited to have you join our global team of educators and language specialists.",
      "",
      "Please review and complete your Freelance Teaching & Translation Agreement here:",
      DOCUSIGN_URL,
      "",
      "Be sure to fill in all required fields before submitting. This agreement covers:",
      "• Your role and responsibilities",
      "• Payment structure and invoicing",
      "• Scheduling guidelines",
      "• Professional conduct expectations",
      "• The HIVE MIND teaching resource system",
      "• Confidentiality and data protection requirements",
      "",
      "If you have any questions about the agreement, feel free to reply to this email.",
      "",
      "Next Step After You Sign",
      "Once you have submitted your completed agreement, please send an email to jblinguisticsllc@gmail.com with:",
      "1. A professional headshot (for our website)",
      "2. A short summary of the services you offer",
      "3. A brief professional background / bio describing the experience you would like us to advertise",
      "",
      "This information will be used to create or update your instructor profile on our website and marketing materials. Once received, we will activate your access to the Teacher Portal and the HIVE MIND, and send onboarding instructions.",
      "",
      "We’re happy to have you with us and look forward to working together!",
      "",
      "Warm regards,",
      "JB Linguistics Team",
    ].join("\n");
    const htmlBody = `
      <p>Hi ${name},</p>
      <p>Welcome to JB Linguistics! We’re excited to have you join our global team of educators and language specialists.</p>
      <p>Please review and complete your Freelance Teaching & Translation Agreement here:<br/>
      <a href="${DOCUSIGN_URL}">Freelancer Onboarding (DocuSign)</a></p>
      <p>Be sure to fill in all required fields before submitting. This agreement covers:</p>
      <ul>
        <li>Your role and responsibilities</li>
        <li>Payment structure and invoicing</li>
        <li>Scheduling guidelines</li>
        <li>Professional conduct expectations</li>
        <li>The HIVE MIND teaching resource system</li>
        <li>Confidentiality and data protection requirements</li>
      </ul>
      <p>If you have any questions about the agreement, feel free to reply to this email.</p>
      <p><strong>Next Step After You Sign</strong><br/>
      Once you have submitted your completed agreement, please send an email to <a href="mailto:jblinguisticsllc@gmail.com">jblinguisticsllc@gmail.com</a> with:</p>
      <ol>
        <li>A professional headshot (for our website)</li>
        <li>A short summary of the services you offer</li>
        <li>A brief professional background / bio describing the experience you would like us to advertise</li>
      </ol>
      <p>This information will be used to create or update your instructor profile on our website and marketing materials. Once received, we will activate your access to the Teacher Portal and the HIVE MIND, and send onboarding instructions.</p>
      <p>We’re happy to have you with us and look forward to working together!</p>
      <p>Warm regards,<br/>JB Linguistics Team</p>
    `;

    await transporter.sendMail({
      from: SMTP_FROM ?? APPLICATION_INBOX ?? SMTP_USER,
      to: email,
      bcc: APPLICATION_INBOX,
      subject,
      text: textBody,
      html: htmlBody,
    });

    if (applicationId) {
      try {
        const supabase = createSupabaseAdminClient();
        await supabase.from("career_applications").update({ hire_sent_at: new Date().toISOString() }).eq("id", applicationId);
      } catch (err) {
        console.warn("Unable to update hire_sent_at", err);
      }
    }

    return NextResponse.json({ success: true, hireSentAt: new Date().toISOString() });
  } catch (err) {
    console.error("Hire email error", err);
    const status = 500;
    const message = err instanceof Error ? err.message : "Unable to send onboarding email.";
    return NextResponse.json({ message }, { status });
  }
}
