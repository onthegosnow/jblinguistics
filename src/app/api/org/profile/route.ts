import { NextRequest, NextResponse } from "next/server";
import {
  requireOrgAdminFromToken,
  createOrgAdminPasswordHash,
  logAuditEvent,
} from "@/lib/server/organization-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// GET /api/org/profile - Get current admin profile and organization details
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);

    return NextResponse.json({
      admin: {
        id: adminWithOrg.id,
        email: adminWithOrg.email,
        name: adminWithOrg.name,
        role: adminWithOrg.role,
        phone: adminWithOrg.phone,
        mustReset: adminWithOrg.mustReset,
      },
      organization: {
        id: adminWithOrg.organization.id,
        name: adminWithOrg.organization.name,
        slug: adminWithOrg.organization.slug,
        primaryContactName: adminWithOrg.organization.primaryContactName,
        primaryContactEmail: adminWithOrg.organization.primaryContactEmail,
        primaryContactPhone: adminWithOrg.organization.primaryContactPhone,
        city: adminWithOrg.organization.city,
        country: adminWithOrg.organization.country,
        contractStartDate: adminWithOrg.organization.contractStartDate,
        contractEndDate: adminWithOrg.organization.contractEndDate,
        contractedHoursPerMonth: adminWithOrg.organization.contractedHoursPerMonth,
        contractedServices: adminWithOrg.organization.contractedServices,
        logoUrl: adminWithOrg.organization.logoUrl,
      },
    });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to get profile." },
      { status }
    );
  }
}

// PATCH /api/org/profile - Update admin profile (name, phone, password)
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    const supabase = createSupabaseAdminClient();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone || null;

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ message: "Current password required." }, { status: 400 });
      }

      // Verify current password
      const { data: adminData } = await supabase
        .from("organization_admins")
        .select("password_hash")
        .eq("id", adminWithOrg.id)
        .single();

      if (!adminData) {
        return NextResponse.json({ message: "Admin not found." }, { status: 404 });
      }

      const crypto = await import("crypto");
      const currentHash = crypto.createHash("sha256").update(currentPassword).digest("hex");

      if (currentHash !== adminData.password_hash) {
        return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
      }

      updates.password_hash = createOrgAdminPasswordHash(newPassword);
      updates.must_reset = false;
    }

    const { error } = await supabase
      .from("organization_admins")
      .update(updates)
      .eq("id", adminWithOrg.id);

    if (error) throw new Error(error.message);

    // Audit log
    await logAuditEvent({
      organizationId: adminWithOrg.organizationId,
      actorType: "org_admin",
      actorId: adminWithOrg.id,
      actorName: adminWithOrg.name,
      action: "profile_updated",
      details: { fieldsUpdated: Object.keys(updates).filter((k) => k !== "updated_at" && k !== "password_hash") },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update profile." },
      { status }
    );
  }
}
