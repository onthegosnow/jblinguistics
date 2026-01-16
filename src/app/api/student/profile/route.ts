import { NextRequest, NextResponse } from "next/server";
import {
  requireStudentFromToken,
  updateStudent,
  getStudentEnrollments,
  getStudentProgress,
  getStudentCertificates,
} from "@/lib/server/student-auth";
import {
  getStudentPendingTests,
  getStudentPlacementHistory,
} from "@/lib/server/placement-tests";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-student-token") ?? undefined;
    const student = await requireStudentFromToken(token);

    // Get enrollments, progress, certificates, and placement tests
    const [enrollments, progress, certificates, pendingTests, placementHistory] = await Promise.all([
      getStudentEnrollments(student.id),
      getStudentProgress(student.id),
      getStudentCertificates(student.id),
      getStudentPendingTests(student.id),
      getStudentPlacementHistory(student.id),
    ]);

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        address: student.address,
        city: student.city,
        state: student.state,
        country: student.country,
        timezone: student.timezone,
        preferredLanguage: student.preferredLanguage,
      },
      enrollments,
      progress,
      certificates,
      placementTests: {
        pending: pendingTests,
        history: placementHistory.map((t) => ({
          id: t.id,
          language: t.language,
          status: t.status,
          startedAt: t.startedAt,
          completedAt: t.completedAt,
          percentageScore: t.percentageScore,
          recommendedLevel: t.recommendedLevel,
          finalLevel: t.finalLevel,
        })),
      },
    });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to load profile." },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-student-token") ?? undefined;
    const student = await requireStudentFromToken(token);

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      timezone?: string;
      preferredLanguage?: string;
    };

    const updated = await updateStudent(student.id, {
      name: body.name,
      phone: body.phone,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      timezone: body.timezone,
      preferredLanguage: body.preferredLanguage,
    });

    if (!updated) {
      return NextResponse.json({ message: "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json({
      student: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        city: updated.city,
        state: updated.state,
        country: updated.country,
        timezone: updated.timezone,
        preferredLanguage: updated.preferredLanguage,
      },
    });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update profile." },
      { status }
    );
  }
}
