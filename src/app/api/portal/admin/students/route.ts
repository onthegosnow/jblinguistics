import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import {
  listStudents,
  createStudent,
  getStudentEnrollments,
  createStudentPasswordHash,
  generateTempPassword,
} from "@/lib/server/student-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request.headers.get("x-admin-token") ?? undefined);

    const students = await listStudents();

    // Get enrollment counts for each student
    const supabase = createSupabaseAdminClient();
    const { data: enrollmentCounts } = await supabase
      .from("student_enrollments")
      .select("student_id, status")
      .in(
        "student_id",
        students.map((s) => s.id)
      );

    // Build counts map
    const countsByStudent = new Map<string, { active: number; completed: number }>();
    for (const e of enrollmentCounts ?? []) {
      const current = countsByStudent.get(e.student_id) || { active: 0, completed: 0 };
      if (e.status === "active") current.active++;
      else if (e.status === "completed") current.completed++;
      countsByStudent.set(e.student_id, current);
    }

    // Merge counts into students
    const studentsWithCounts = students.map((s) => ({
      ...s,
      enrollmentCounts: countsByStudent.get(s.id) || { active: 0, completed: 0 },
    }));

    return NextResponse.json({ students: studentsWithCounts });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to list students." },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request.headers.get("x-admin-token") ?? undefined);

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      city?: string;
      state?: string;
      country?: string;
      preferredLanguage?: string;
      action?: "reset" | "deactivate" | "reactivate";
      studentId?: string;
    };

    // Administrative actions on existing students
    if (body.action && body.studentId) {
      const supabase = createSupabaseAdminClient();

      if (body.action === "deactivate") {
        await supabase.from("students").update({ active: false }).eq("id", body.studentId);
        return NextResponse.json({ success: true });
      }

      if (body.action === "reactivate") {
        const temp = generateTempPassword();
        await supabase
          .from("students")
          .update({
            active: true,
            must_reset: true,
            password_hash: createStudentPasswordHash(temp),
          })
          .eq("id", body.studentId);
        return NextResponse.json({ success: true, tempPassword: temp });
      }

      if (body.action === "reset") {
        const temp = body.password || generateTempPassword();
        await supabase
          .from("students")
          .update({
            password_hash: createStudentPasswordHash(temp),
            must_reset: true,
          })
          .eq("id", body.studentId);
        return NextResponse.json({ success: true, tempPassword: temp });
      }
    }

    // Create new student
    if (!body.name || !body.email) {
      return NextResponse.json({ message: "Name and email are required." }, { status: 400 });
    }

    const { student, tempPassword } = await createStudent({
      email: body.email,
      name: body.name,
      password: body.password,
      phone: body.phone,
      city: body.city,
      state: body.state,
      country: body.country,
      preferredLanguage: body.preferredLanguage,
    });

    return NextResponse.json({ student, tempPassword }, { status: 201 });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to create student." },
      { status }
    );
  }
}
