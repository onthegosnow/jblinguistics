import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

const DOCUSIGN_POWERFORM_BASE =
  "https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=063afaed-c871-441a-8842-43f37f4be944&env=na4&acct=2b24bf93-0c1a-4a00-ac3d-94a41015425c&v=2";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const APPLICATION_INBOX = process.env.CAREER_APPLICATION_EMAIL ?? "jblinguisticsllc@gmail.com";

function buildPowerFormUrl(name: string, email: string) {
  return `${DOCUSIGN_POWERFORM_BASE}&Freelancer_UserName=${encodeURIComponent(name)}&Freelancer_Email=${encodeURIComponent(email)}`;
}

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
    const firstName = name.split(" ")[0] || "there";
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const subject = "Welcome to JB Linguistics – Next Steps";
    const textBody = [
      `Hi ${firstName},`,
      "",
      "Welcome to JB Linguistics! We’re excited to have you joining our global team of educators and language specialists.",
      "",
      'You’ll receive a separate email from DocuSign shortly with the subject:',
      '“Welcome to JB Linguistics — Please Complete Your New-Hire Agreement.”',
      "",
      "Please open that DocuSign email, review your Freelance Teaching & Translation Agreement, and complete all required fields.",
      "",
      "After you sign, you’ll receive another email with your Teacher/Translator Portal login details so you can:",
      "– Complete your bio",
      "– Upload a profile photo",
      "– Update your contact details",
      "– Add your certifications",
      "",
      'If you don’t see the DocuSign email within a few minutes, please check your spam or promotions folder and mark it as “Not spam.”',
      "",
      "If you have any questions at any point, just reply to this email.",
      "",
      "Warm regards,",
      "JB Linguistics Team",
    ].join("\n");
    const htmlBody = `
      <p>Hi ${firstName},</p>
      <p>Welcome to JB Linguistics! We’re excited to have you joining our global team of educators and language specialists.</p>
      <p>You’ll receive a separate email from DocuSign shortly with the subject:<br/>
      <strong>“Welcome to JB Linguistics — Please Complete Your New-Hire Agreement.”</strong></p>
      <p>Please open that DocuSign email, review your Freelance Teaching & Translation Agreement, and complete all required fields.</p>
      <p>After you sign, you’ll receive another email with your Teacher/Translator Portal login details so you can:</p>
      <ul>
        <li>Complete your bio</li>
        <li>Upload a profile photo</li>
        <li>Update your contact details</li>
        <li>Add your certifications</li>
      </ul>
      <p>If you don’t see the DocuSign email within a few minutes, please check your spam or promotions folder and mark it as “Not spam.”</p>
      <p>If you have any questions at any point, just reply to this email.</p>
      <p>Warm regards,<br/>JB Linguistics Team</p>
    `;

    const personalizedUrl = buildPowerFormUrl(name, email);

    await transporter.sendMail({
      from: SMTP_FROM ?? APPLICATION_INBOX ?? SMTP_USER,
      to: email,
      bcc: APPLICATION_INBOX,
      subject,
      text: `${textBody}\n\nComplete your agreement here:\n${personalizedUrl}\n`,
      html: `${htmlBody}<p><strong>Complete your agreement here:</strong> <a href="${personalizedUrl}">${personalizedUrl}</a></p>`,
    });

    // Log the personalized PowerForm URL (DocuSign will handle the prefilled fields when the link is used)
    console.info("DocuSign PowerForm URL (emailed):", personalizedUrl);

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
