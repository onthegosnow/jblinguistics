import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import {
  getStudentById,
  updateStudent,
  getStudentEnrollments,
  getStudentProgress,
  getStudentCertificates,
} from "@/lib/server/student-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request.headers.get("x-admin-token") ?? undefined);

    const { id } = await params;
    const student = await getStudentById(id);

    if (!student) {
      return NextResponse.json({ message: "Student not found." }, { status: 404 });
    }

    const [enrollments, progress, certificates] = await Promise.all([
      getStudentEnrollments(id),
      getStudentProgress(id),
      getStudentCertificates(id),
    ]);

    return NextResponse.json({
      student,
      enrollments,
      progress,
      certificates,
    });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to get student." },
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

    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      timezone?: string;
      preferredLanguage?: string;
      active?: boolean;
    };

    const updated = await updateStudent(id, body);

    if (!updated) {
      return NextResponse.json({ message: "Student not found." }, { status: 404 });
    }

    return NextResponse.json({ student: updated });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update student." },
      { status }
    );
  }
}
