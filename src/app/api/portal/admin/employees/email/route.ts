import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/server/storage";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? process.env.CAREER_APPLICATION_EMAIL ?? process.env.SMTP_USER;

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const supabase = createSupabaseAdminClient();
  const includeArchived = request.nextUrl.searchParams.get("includeArchived") === "true";
  const { data, error } = await supabase
    .from("portal_email_logs")
    .select("id, subject, body, sent_to, created_at, archived")
    .eq("archived", includeArchived ? undefined : false)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  const rows = (data ?? []).filter(Boolean);
  return NextResponse.json({ emails: rows });
}

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  // archive action
  const body = (await request.json().catch(() => ({}))) as { action?: string; id?: string; subject?: string; message?: string };
  if (body.action === "archive" && body.id) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("portal_email_logs").update({ archived: true }).eq("id", body.id);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return NextResponse.json({ message: "SMTP not configured" }, { status: 400 });
  }
  const subject = (body.subject || "JB Linguistics update").trim();
  const rawMessage = (body.message || "").trim();
  if (!rawMessage) return NextResponse.json({ message: "Message required" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("portal_users")
    .select("name, email")
    .contains("roles", ["teacher"])
    .eq("active", true);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  const recipients = (data ?? []).filter((r) => r.email);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  for (const r of recipients) {
    const firstName = (r.name || "").split(" ")[0] || "there";
    const personalized = rawMessage.replace(/\(first name\)/gi, firstName);
    const text = `Hi ${firstName},\n\n${personalized}\n\n– JB Linguistics`;
    await transporter
      .sendMail({ from: SMTP_FROM, to: r.email, subject, text })
      .catch(() => undefined);
  }

  // log
  await supabase.from("portal_email_logs").insert({
    subject,
    body: rawMessage,
    sent_to: recipients.map((r) => ({ name: r.name, email: r.email })),
  });

  return NextResponse.json({ success: true, count: recipients.length });
}
