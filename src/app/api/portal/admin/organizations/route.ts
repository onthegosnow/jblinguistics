import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireAdmin } from "@/lib/server/storage";
import {
  listOrganizations,
  createOrganization,
  createOrgAdmin,
} from "@/lib/server/organization-auth";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;

// GET /api/portal/admin/organizations - List all organizations
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    requireAdmin(token);

    const organizations = await listOrganizations();

    return NextResponse.json({ organizations });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to list organizations." },
      { status }
    );
  }
}

// POST /api/portal/admin/organizations - Create a new organization
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    requireAdmin(token);

    const body = await request.json();
    const {
      name,
      slug,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
      billingEmail,
      city,
      country,
      contractedHoursPerMonth,
      contractedServices,
      billingRateHourly,
      notes,
      // Admin account details
      adminName,
      adminEmail,
      adminPassword,
    } = body;

    if (!name) {
      return NextResponse.json({ message: "Organization name is required." }, { status: 400 });
    }

    // Create the organization
    const organization = await createOrganization({
      name,
      slug,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
      billingEmail,
      city,
      country,
      contractedHoursPerMonth,
      contractedServices,
      billingRateHourly,
      notes,
    });

    // Create initial admin account if provided
    let adminAccount = null;
    if (adminEmail) {
      const result = await createOrgAdmin({
        organizationId: organization.id,
        email: adminEmail,
        name: adminName || primaryContactName || "Admin",
        role: "admin",
        password: adminPassword,
      });
      adminAccount = {
        id: result.admin.id,
        email: result.admin.email,
        name: result.admin.name,
        tempPassword: result.tempPassword,
      };

      // Send welcome email if no password was provided (using temp password)
      if (!adminPassword && SMTP_HOST && SMTP_USER && SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
          });

          const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://jblinguistics.com"}/org/login`;
          await transporter.sendMail({
            from: SMTP_FROM || SMTP_USER,
            to: adminEmail,
            subject: "Welcome to JB Linguistics Corporate Portal",
            html: `
              <h2>Welcome to JB Linguistics Corporate Portal</h2>
              <p>Hello ${adminAccount.name},</p>
              <p>An account has been created for you to manage ${organization.name}'s language training program.</p>
              <p><strong>Login Details:</strong></p>
              <ul>
                <li>Portal URL: <a href="${portalUrl}">${portalUrl}</a></li>
                <li>Email: ${adminEmail}</li>
                <li>Temporary Password: ${result.tempPassword}</li>
              </ul>
              <p>You will be required to change your password on first login.</p>
              <p>Best regards,<br>JB Linguistics Team</p>
            `,
          });
        } catch (emailErr) {
          console.error("Failed to send welcome email:", emailErr);
        }
      }
    }

    return NextResponse.json({
      organization,
      adminAccount,
    });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to create organization." },
      { status }
    );
  }
}
