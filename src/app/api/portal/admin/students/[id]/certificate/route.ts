import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requirePortalUserFromToken } from "@/lib/server/storage";
import {
  issueCertificate,
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

    let issuerId: string | undefined;

    if (adminToken) {
      requireAdmin(adminToken);
    } else if (portalToken) {
      const teacher = await requirePortalUserFromToken(portalToken);
      issuerId = teacher.id;
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
    };

    if (!body.language || !body.level) {
      return NextResponse.json(
        { message: "Language and level are required." },
        { status: 400 }
      );
    }

    const certificate = await issueCertificate({
      studentId,
      enrollmentId: body.enrollmentId,
      language: body.language,
      level: body.level,
      issuedBy: issuerId,
    });

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to issue certificate." },
      { status }
    );
  }
}
