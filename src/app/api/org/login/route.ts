import { NextRequest, NextResponse } from "next/server";
import {
  getOrgAdminByEmail,
  verifyOrgAdminPassword,
  createOrgAdminSession,
  logAuditEvent,
} from "@/lib/server/organization-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, organizationSlug } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required." }, { status: 400 });
    }

    // If organization slug provided, look up the org first
    let organizationId: string | undefined;
    if (organizationSlug) {
      const supabase = createSupabaseAdminClient();
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("slug", organizationSlug.toLowerCase())
        .maybeSingle();

      if (org) {
        organizationId = org.id;
      }
    }

    const admin = await getOrgAdminByEmail(email, organizationId);

    if (!admin) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    if (!admin.active) {
      return NextResponse.json({ message: "Account is deactivated." }, { status: 403 });
    }

    if (!verifyOrgAdminPassword(password, admin.passwordHash)) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    // Create session
    const session = await createOrgAdminSession(admin.id, admin.organizationId);

    // Update last login
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("organization_admins")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", admin.id);

    // Audit log
    await logAuditEvent({
      organizationId: admin.organizationId,
      actorType: "org_admin",
      actorId: admin.id,
      actorName: admin.name,
      action: "login",
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      token: session.token,
      expiresAt: session.expiresAt,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        mustReset: admin.mustReset,
        organizationName: admin.organizationName,
      },
    });
  } catch (err) {
    console.error("Organization login error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Login failed." },
      { status: 500 }
    );
  }
}
