import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { listPlacementTests, createTestCode } from "@/lib/server/placement-tests";

// GET /api/portal/admin/placement/tests - List placement tests
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    requireAdmin(token);

    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const organizationId = searchParams.get("organizationId") ?? undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;

    const tests = await listPlacementTests({
      language,
      status,
      organizationId,
      limit,
    });

    return NextResponse.json({ tests });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to list tests." },
      { status }
    );
  }
}

// POST /api/portal/admin/placement/tests - Create test access code
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    requireAdmin(token);

    const body = await request.json();
    const { language, organizationId, maxUses, expiresAt, label, notes } = body;

    if (!language) {
      return NextResponse.json({ message: "Language is required." }, { status: 400 });
    }

    const code = await createTestCode({
      language,
      organizationId,
      maxUses,
      expiresAt,
      label,
      notes,
    });

    return NextResponse.json({ code });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to create access code." },
      { status }
    );
  }
}
