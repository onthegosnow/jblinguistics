import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requirePortalUserFromToken } from "@/lib/server/storage";
import {
  recordLevelCompletion,
  getStudentById,
  type CEFRLevel,
} from "@/lib/server/student-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Can be called by admin or authenticated teacher
    const adminToken = request.headers.get("x-admin-token");
    const portalToken = request.headers.get("x-portal-token");

    let assessorId: string | undefined;

    if (adminToken) {
      requireAdmin(adminToken);
    } else if (portalToken) {
      const teacher = await requirePortalUserFromToken(portalToken);
      assessorId = teacher.id;
    } else {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: studentId } = await params;

    // Verify student exists
    const student = await getStudentById(studentId);
    if (!student) {
      return NextResponse.json({ message: "Student not found." }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      enrollmentId?: string;
      language?: string;
      level?: CEFRLevel;
      assessmentScore?: number;
      notes?: string;
    };

    if (!body.enrollmentId || !body.language || !body.level) {
      return NextResponse.json(
        { message: "Enrollment ID, language, and level are required." },
        { status: 400 }
      );
    }

    const progress = await recordLevelCompletion({
      studentId,
      enrollmentId: body.enrollmentId,
      language: body.language,
      level: body.level,
      assessedBy: assessorId,
      assessmentScore: body.assessmentScore,
      notes: body.notes,
    });

    return NextResponse.json({ progress }, { status: 201 });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to record progress." },
      { status }
    );
  }
}
