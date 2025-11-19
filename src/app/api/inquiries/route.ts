import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveInquiryToSupabase, type InquiryPayload } from "@/lib/server/inquiries-supabase";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const INQUIRY_INBOX = process.env.CONTACT_INQUIRY_EMAIL ?? process.env.CAREER_APPLICATION_EMAIL ?? "jblinguisticsllc@gmail.com";

const KNOWN_FIELDS = new Set([
  "name",
  "email",
  "organization",
  "serviceType",
  "languages",
  "details",
  "budget",
  "timeline",
  "source",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required." }, { status: 400 });
    }

    const payload: InquiryPayload = {
      name,
      email,
      organization: optionalString(formData.get("organization")),
      serviceType: optionalString(formData.get("serviceType")),
      languages: optionalString(formData.get("languages")),
      details: optionalString(formData.get("details")) ?? optionalString(formData.get("message")),
      budget: optionalString(formData.get("budget")),
      timeline: optionalString(formData.get("timeline")),
      source: optionalString(formData.get("source")) ?? "contact",
      metadata: collectMetadata(formData),
    };

    await saveInquiryToSupabase(payload);
    await sendInquiryEmail(payload);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Inquiry submission failed", err);
    return NextResponse.json({ message: "Unable to submit inquiry." }, { status: 500 });
  }
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function collectMetadata(formData: FormData) {
  const metadata: Record<string, string> = {};
  for (const [key, rawValue] of formData.entries()) {
    if (KNOWN_FIELDS.has(key)) continue;
    if (typeof rawValue !== "string") continue;
    const trimmed = rawValue.trim();
    if (!trimmed) continue;
    metadata[key] = trimmed;
  }
  return Object.keys(metadata).length ? metadata : undefined;
}

async function sendInquiryEmail(payload: InquiryPayload) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP credentials missing; skipping inquiry email notification.");
    return;
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

  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.organization ? `Organization: ${payload.organization}` : undefined,
    payload.serviceType ? `Service interest: ${payload.serviceType}` : undefined,
    payload.languages ? `Languages: ${payload.languages}` : undefined,
    payload.budget ? `Budget: ${payload.budget}` : undefined,
    payload.timeline ? `Timeline: ${payload.timeline}` : undefined,
    payload.details ? `Details: ${payload.details}` : undefined,
    `Source: ${payload.source}`,
  ].filter(Boolean) as string[];

  if (payload.metadata) {
    lines.push("", "Additional fields:");
    for (const [key, value] of Object.entries(payload.metadata)) {
      lines.push(`- ${key}: ${value}`);
    }
  }

  try {
    await transporter.sendMail({
      from: SMTP_FROM ?? INQUIRY_INBOX ?? SMTP_USER,
      to: INQUIRY_INBOX,
      subject: `New JB Linguistics inquiry — ${payload.name}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("Unable to send inquiry email", err);
  }
}
