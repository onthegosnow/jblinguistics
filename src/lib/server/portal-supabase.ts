import crypto from "crypto";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "../supabase-server";
import { createPortalPasswordHash } from "./storage";

export type PortalUserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  roles: string[];
  languages: string[] | null;
  company: string | null;
  created_at: string;
  active: boolean;
};

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const APPLICATION_INBOX = process.env.CAREER_APPLICATION_EMAIL ?? "jblinguisticsllc@gmail.com";

export function generateTempPassword() {
  return crypto.randomBytes(8).toString("base64url");
}

async function sendPortalCredentials(email: string, name: string, tempPassword: string) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP not configured; skipping portal credential email.");
    return;
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const portalUrl = "https://www.jblinguistics.com/portal";
  const subject = "Your JB Linguistics portal access";
  const text = [
    `Hi ${name || "there"},`,
    "",
    "Welcome to JB Linguistics. Your portal account is ready.",
    "",
    `Portal URL: ${portalUrl}`,
    `Email: ${email}`,
    `Temporary password: ${tempPassword}`,
    "",
    "Please sign in and reset your password immediately. If you have any trouble, reply to this email.",
    "",
    "– JB Linguistics Team",
  ].join("\n");
  const html = `
    <p>Hi ${name || "there"},</p>
    <p>Welcome to JB Linguistics. Your portal account is ready.</p>
    <p>
      Portal URL: <a href="${portalUrl}">${portalUrl}</a><br/>
      Email: ${email}<br/>
      Temporary password: ${tempPassword}
    </p>
    <p>Please sign in and reset your password immediately. If you have any trouble, reply to this email.</p>
    <p>– JB Linguistics Team</p>
  `;
  await transporter.sendMail({
    from: SMTP_FROM ?? APPLICATION_INBOX ?? SMTP_USER,
    to: email,
    subject,
    text,
    html,
  });
}

export async function ensurePortalUser(params: {
  name?: string | null;
  email: string;
  roles?: string[];
  languages?: string[];
  company?: string | null;
  sendEmail?: boolean;
}): Promise<{ user: PortalUserRow; tempPassword?: string }> {
  const supabase = createSupabaseAdminClient();
  const email = params.email.trim().toLowerCase();
  const { data: existing } = await supabase.from("portal_users").select("*").ilike("email", email).maybeSingle();

  if (existing) {
    const mergedRoles = Array.from(new Set([...(existing.roles ?? []), ...(params.roles ?? [])]));
    const mergedLangs = Array.from(new Set([...(existing.languages ?? []), ...(params.languages ?? [])]));
    const { data, error } = await supabase
      .from("portal_users")
      .update({
        name: params.name || existing.name,
        roles: mergedRoles,
        languages: mergedLangs,
        company: params.company ?? existing.company,
        active: true,
      })
      .eq("id", existing.id)
      .select()
      .maybeSingle();
    if (error || !data) throw new Error(error?.message ?? "Unable to update portal user");
    return { user: data as PortalUserRow };
  }

  const tempPassword = generateTempPassword();
  const password_hash = createPortalPasswordHash(tempPassword);
  const { data, error } = await supabase
    .from("portal_users")
    .insert({
      name: params.name || email,
      email,
      password_hash,
      roles: params.roles?.length ? params.roles : ["teacher"],
      languages: params.languages ?? [],
      company: params.company ?? null,
      active: true,
    })
    .select()
    .maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "Unable to create portal user");
  if (params.sendEmail !== false) {
    await sendPortalCredentials(email, params.name || email, tempPassword);
  }
  return { user: data as PortalUserRow, tempPassword };
}
