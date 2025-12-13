import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const APPLICATION_INBOX = process.env.CAREER_APPLICATION_EMAIL ?? "jblinguisticsllc@gmail.com";

export async function POST(request: Request) {
  const token = request.headers.get("x-admin-token") ?? undefined;
  requireAdmin(token);
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

    const subject = "Interview Invitation – JB Linguistics";
    const textBody = `Dear ${name},

Thank you for your interest in working with JB Linguistics LLC. We are pleased to inform you that you have been selected to move forward to the next step in our hiring process.

We would like to invite you to participate in a one-hour virtual interview, which will take place online via video conference. This interview will allow us to learn more about your background, experience, and interest in working with JB Linguistics, while also giving you the opportunity to ask any questions you may have.

To help us schedule this interview, please reply to this email with your availability for the upcoming week, including:

Days you are available
Time windows (please include your time zone)

Once we receive your availability, our team will confirm your interview time and provide you with the meeting link and additional details.

Thank you again for your interest in JB Linguistics LLC. We look forward to connecting with you soon.

Warm regards,

JB Linguistics Hiring Team
www.jblinguistics.com
`;
    const htmlBody = textBody.replace(/\n/g, "<br/>");

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
        await supabase.from("career_applications").update({ invite_sent_at: new Date().toISOString() }).eq("id", applicationId);
      } catch (err) {
        console.warn("Unable to update invite_sent_at", err);
      }
    }

    return NextResponse.json({ success: true, inviteSentAt: new Date().toISOString() });
  } catch (err) {
    console.error("Invite email error", err);
    const status = 500;
    const message = err instanceof Error ? err.message : "Unable to send interview invite.";
    return NextResponse.json({ message }, { status });
  }
}
