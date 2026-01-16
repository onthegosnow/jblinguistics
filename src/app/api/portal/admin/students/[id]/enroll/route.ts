import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import {
  createEnrollment,
  updateEnrollment,
  getStudentById,
  type CEFRLevel,
} from "@/lib/server/student-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request.headers.get("x-admin-token") ?? undefined);

    const { id: studentId } = await params;

    // Verify student exists
    const student = await getStudentById(studentId);
    if (!student) {
      return NextResponse.json({ message: "Student not found." }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      teacherId?: string;
      language?: string;
      currentLevel?: CEFRLevel;
      targetLevel?: CEFRLevel;
      startDate?: string;
      notes?: string;
    };

    if (!body.language) {
      return NextResponse.json({ message: "Language is required." }, { status: 400 });
    }

    const enrollment = await createEnrollment({
      studentId,
      teacherId: body.teacherId,
      language: body.language,
      currentLevel: body.currentLevel,
      targetLevel: body.targetLevel,
      startDate: body.startDate,
      notes: body.notes,
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to create enrollment." },
      { status }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request.headers.get("x-admin-token") ?? undefined);

    const body = (await request.json().catch(() => ({}))) as {
      enrollmentId?: string;
      teacherId?: string;
      currentLevel?: CEFRLevel;
      targetLevel?: CEFRLevel;
      status?: "active" | "completed" | "paused" | "cancelled";
      notes?: string;
    };

    if (!body.enrollmentId) {
      return NextResponse.json({ message: "Enrollment ID is required." }, { status: 400 });
    }

    const updated = await updateEnrollment(body.enrollmentId, {
      teacherId: body.teacherId,
      currentLevel: body.currentLevel,
      targetLevel: body.targetLevel,
      status: body.status,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json({ message: "Enrollment not found." }, { status: 404 });
    }

    return NextResponse.json({ enrollment: updated });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update enrollment." },
      { status }
    );
  }
}
