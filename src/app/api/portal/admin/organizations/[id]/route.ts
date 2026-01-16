import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import {
  getOrganizationById,
  updateOrganization,
  listOrgAdmins,
  listOrgEmployees,
  getOrgTrainingHoursSummary,
} from "@/lib/server/organization-auth";

// GET /api/portal/admin/organizations/[id] - Get organization details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    requireAdmin(token);
    const { id } = await params;

    const organization = await getOrganizationById(id);
    if (!organization) {
      return NextResponse.json({ message: "Organization not found." }, { status: 404 });
    }

    // Get additional details
    const admins = await listOrgAdmins(id);
    const employees = await listOrgEmployees(id);

    // Get current month summary
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    const hoursSummary = await getOrgTrainingHoursSummary(id, startDate, endDate);

    return NextResponse.json({
      organization,
      admins: admins.map((a) => ({
        id: a.id,
        email: a.email,
        name: a.name,
        role: a.role,
        active: a.active,
        lastLoginAt: a.lastLoginAt,
      })),
      employees: employees.map((e) => ({
        id: e.id,
        studentId: e.studentId,
        studentName: e.studentName,
        department: e.department,
        status: e.status,
      })),
      currentMonthHours: hoursSummary,
    });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to get organization." },
      { status }
    );
  }
}

// PATCH /api/portal/admin/organizations/[id] - Update organization
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    requireAdmin(token);
    const { id } = await params;

    const body = await request.json();

    const organization = await updateOrganization(id, body);
    if (!organization) {
      return NextResponse.json({ message: "Organization not found." }, { status: 404 });
    }

    return NextResponse.json({ organization });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update organization." },
      { status }
    );
  }
}
