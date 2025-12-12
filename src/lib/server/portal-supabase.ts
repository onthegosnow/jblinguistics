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

export async function sendPortalCredentials(email: string, name: string, tempPassword: string, opts?: { reset?: boolean }) {
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
  const portalUrl = "https://jblinguistics.com/portal";
  const firstName = (name || "").trim().split(" ")[0] || "there";
  const subject = opts?.reset ? "Reset your JB Linguistics portal password" : "Welcome to JB Linguistics — your portal access";
  const text = opts?.reset
    ? [
        `Hi ${firstName},`,
        "",
        "Here is your temporary password to reset your portal account.",
        "",
        `Portal URL: ${portalUrl}`,
        `Email: ${email}`,
        `Temporary password: ${tempPassword}`,
        "",
        "Please sign in and reset your password immediately. If you have any trouble, reply to this email.",
        "",
        "Best regards,",
        "JB Linguistics",
      ].join("\n")
    : [
        `Hi ${firstName},`,
        "",
        "Welcome to JB Linguistics!",
        "",
        "Your account for the Teacher/Translator Portal is now set up. This portal will keep evolving as we add new features and build out our shared resource library, “The Hive,” where you can both find class materials and upload your own.",
        "",
        "When you first sign in, please:",
        "• Complete your bio",
        "• Upload a profile photo",
        "• Update your address and contact information",
        "• Add any certifications you hold",
        "• Upload a copy of your ID or passport",
        "",
        "Here are your login details:",
        `Portal URL: ${portalUrl}`,
        `Email: ${email}`,
        `Temporary password: ${tempPassword}`,
        "",
        "Please sign in and reset your password right away.",
        "",
        "We’d also love your feedback and suggestions on how to make this portal a truly great resource for everyone, so don’t hesitate to share ideas as you start using it.",
        "",
        "Please stay tuned for upcoming emails about onboarding and training.",
        "",
        "If you run into any issues logging in or have questions, just reply to this email.",
        "",
        "Best regards,",
        "JB Linguistics",
      ].join("\n");

  const html = opts?.reset
    ? `
    <p>Hi ${firstName},</p>
    <p>Here is your temporary password to reset your portal account.</p>
    <p>
      Portal URL: <a href="${portalUrl}">${portalUrl}</a><br/>
      Email: ${email}<br/>
      Temporary password: ${tempPassword}
    </p>
    <p>Please sign in and reset your password immediately. If you have any trouble, reply to this email.</p>
    <p>Best regards,<br/>JB Linguistics</p>
  `
    : `
    <p>Hi ${firstName},</p>
    <p>Welcome to JB Linguistics!</p>
    <p>Your account for the Teacher/Translator Portal is now set up. This portal will keep evolving as we add new features and build out our shared resource library, “The Hive,” where you can both find class materials and upload your own.</p>
    <p>When you first sign in, please:</p>
    <ul>
      <li>Complete your bio</li>
      <li>Upload a profile photo</li>
      <li>Update your address and contact information</li>
      <li>Add any certifications you hold</li>
      <li>Upload a copy of your ID or passport</li>
    </ul>
    <p><strong>Login details</strong><br/>
      Portal URL: <a href="${portalUrl}">${portalUrl}</a><br/>
      Email: ${email}<br/>
      Temporary password: ${tempPassword}
    </p>
    <p>Please sign in and reset your password right away.</p>
    <p>We’d also love your feedback and suggestions on how to make this portal a truly great resource for everyone, so don’t hesitate to share ideas as you start using it.</p>
    <p>Please stay tuned for upcoming emails about onboarding and training.</p>
    <p>If you run into any issues logging in or have questions, just reply to this email.</p>
    <p>Best regards,<br/>JB Linguistics</p>
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
        must_reset: true,
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
      must_reset: true,
    })
    .select()
    .maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "Unable to create portal user");
  if (params.sendEmail !== false) {
    await sendPortalCredentials(email, params.name || email, tempPassword);
  }
  return { user: data as PortalUserRow, tempPassword };
}

export async function sendRejectionEmail(email: string, name: string, position: string) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP not configured; skipping rejection email.");
    return;
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const firstName = (name || "").trim().split(" ")[0] || "there";
  const subject = "JB Linguistics — application update";
  const lines = [
    `Hi ${firstName},`,
    "",
    `Thank you again for your interest in joining JB Linguistics and for taking the time to apply for the ${position} role.`,
    "",
    "We received a large number of strong applications and, after careful review, we’ve decided to move forward with other candidates at this time. This was not an easy decision, and it is in no way a reflection of your overall qualifications or potential.",
    "",
    "With your permission, we would be happy to keep your information on file for future opportunities that may be a better fit.",
    "",
    "We truly appreciate the time and effort you put into your application and your interest in working with us. Wishing you all the best in your continued professional journey.",
    "",
    "Warm regards,",
    "JB Linguistics",
  ];
  const text = lines.join("\\n");
  const html = lines.map((l) => `<p>${l}</p>`).join("");
  await transporter.sendMail({
    from: SMTP_FROM ?? APPLICATION_INBOX ?? SMTP_USER,
    to: email,
    subject,
    text,
    html,
  });
}
