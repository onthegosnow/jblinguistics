import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { createTestCode } from "@/lib/server/placement-tests";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jblinguistics.com";

const LANGUAGE_LABELS: Record<string, string> = {
  english: "English",
  german: "German",
  french: "French",
  spanish: "Spanish",
  italian: "Italian",
  portuguese: "Portuguese",
  dutch: "Dutch",
  russian: "Russian",
  mandarin: "Mandarin Chinese",
  japanese: "Japanese",
  korean: "Korean",
  arabic: "Arabic",
  farsi: "Farsi",
  polish: "Polish",
  hindi: "Hindi",
  swahili: "Swahili",
};

// POST /api/portal/placement/assign - Teacher assigns a placement test
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    const user = await requirePortalUserFromToken(token);

    const body = await request.json();
    const {
      studentId,
      recipientName,
      recipientEmail,
      language,
      expirationHours = 48,
      notes,
    } = body;

    if (!recipientEmail) {
      return NextResponse.json({ message: "Recipient email is required." }, { status: 400 });
    }

    if (!language) {
      return NextResponse.json({ message: "Language is required." }, { status: 400 });
    }

    // Calculate expiration (default 48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Generate the access code
    const testCode = await createTestCode({
      language: language.toLowerCase(),
      studentId: studentId || undefined,
      maxUses: 1,
      expiresAt: expiresAt.toISOString(),
      label: `Assigned by ${user.name || user.email} to ${recipientName || recipientEmail}`,
      notes: notes || `Assigned via teacher portal`,
    });

    // Send the email
    let emailSent = false;
    let emailError: string | null = null;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_PORT === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const languageLabel = LANGUAGE_LABELS[language.toLowerCase()] || language;
        const placementUrl = `${SITE_URL}/placement`;
        const expirationDate = expiresAt.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        });

        const teacherName = user.name || "Your Teacher";

        await transporter.sendMail({
          from: SMTP_FROM || SMTP_USER,
          to: recipientEmail,
          subject: `Your ${languageLabel} Placement Test Access Code - JB Linguistics`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; border-radius: 12px 12px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">JB Linguistics</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Language Placement Test</p>
              </div>

              <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
                <p style="color: #334155; font-size: 16px; margin: 0 0 16px 0;">
                  Hello${recipientName ? ` ${recipientName}` : ""},
                </p>

                <p style="color: #334155; font-size: 16px; margin: 0 0 24px 0;">
                  <strong>${teacherName}</strong> has assigned you a <strong>${languageLabel}</strong> placement test. This test will assess your current proficiency level on the CEFR scale (A1-C2).
                </p>

                <div style="background: #ffffff; border: 2px solid #14b8a6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                  <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Your Access Code</p>
                  <p style="color: #0f172a; font-size: 32px; font-family: monospace; font-weight: bold; letter-spacing: 4px; margin: 0;">
                    ${testCode.code}
                  </p>
                </div>

                <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                  <p style="color: #92400e; font-size: 14px; margin: 0;">
                    <strong>⏰ This code expires on:</strong><br>
                    ${expirationDate}
                  </p>
                </div>

                <div style="margin-bottom: 24px;">
                  <p style="color: #334155; font-size: 14px; margin: 0 0 12px 0;"><strong>Test Details:</strong></p>
                  <ul style="color: #64748b; font-size: 14px; margin: 0; padding-left: 20px;">
                    <li>200 multiple-choice questions</li>
                    <li>2-hour time limit</li>
                    <li>Questions cover all CEFR levels (A1-C2)</li>
                    <li>Your progress is saved automatically</li>
                  </ul>
                </div>

                <div style="text-align: center;">
                  <a href="${placementUrl}" style="display: inline-block; background: #14b8a6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Start Your Test
                  </a>
                </div>

                <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
                  Or visit: <a href="${placementUrl}" style="color: #14b8a6;">${placementUrl}</a>
                </p>
              </div>

              <div style="background: #1e293b; padding: 16px 32px; border-radius: 0 0 12px 12px;">
                <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                  JB Linguistics • Language Services & Training<br>
                  <a href="${SITE_URL}" style="color: #14b8a6;">${SITE_URL}</a>
                </p>
              </div>
            </div>
          `,
        });

        emailSent = true;
      } catch (err) {
        console.error("Failed to send placement test email:", err);
        emailError = err instanceof Error ? err.message : "Unknown email error";
      }
    } else {
      emailError = "SMTP not configured";
    }

    return NextResponse.json({
      success: true,
      code: testCode.code,
      expiresAt: expiresAt.toISOString(),
      emailSent,
      emailError,
      recipientEmail,
      language,
      studentId: studentId || null,
    });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to assign placement test." },
      { status }
    );
  }
}
