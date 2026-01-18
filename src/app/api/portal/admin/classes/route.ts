import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import {
  createClass,
  updateClass,
  deleteClass,
  listClasses,
  getClass,
  enrollStudent,
  unenrollStudent,
  getClassEnrollments,
} from "@/lib/server/classes";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("id");
    const teacherId = searchParams.get("teacherId");
    const status = searchParams.get("status") as "active" | "archived" | "cancelled" | null;

    // Get single class with details
    if (classId) {
      const cls = await getClass(classId);
      if (!cls) {
        return NextResponse.json({ message: "Class not found" }, { status: 404 });
      }
      const enrollments = await getClassEnrollments(classId);
      return NextResponse.json({ class: cls, enrollments });
    }

    // List all classes
    const classes = await listClasses({
      teacherId: teacherId ?? undefined,
      status: status ?? "active",
      includeStudentCount: true,
    });

    return NextResponse.json({ classes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load classes.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  const body = (await request.json().catch(() => ({}))) as {
    action?: "create" | "update" | "delete" | "enroll" | "unenroll";
    // For create/update
    id?: string;
    name?: string;
    description?: string;
    teacherId?: string | null;
    language?: string;
    level?: string;
    maxStudents?: number;
    status?: "active" | "archived" | "cancelled";
    // For enroll/unenroll
    classId?: string;
    studentId?: string;
  };

  if (!body.action) {
    return NextResponse.json({ message: "action is required." }, { status: 400 });
  }

  try {
    if (body.action === "create") {
      if (!body.name || !body.language || !body.level) {
        return NextResponse.json(
          { message: "name, language, and level are required." },
          { status: 400 }
        );
      }

      const cls = await createClass({
        name: body.name,
        description: body.description,
        teacherId: body.teacherId ?? undefined,
        language: body.language,
        level: body.level,
        maxStudents: body.maxStudents,
      });

      return NextResponse.json({ success: true, class: cls });
    }

    if (body.action === "update") {
      if (!body.id) {
        return NextResponse.json({ message: "id is required." }, { status: 400 });
      }

      const cls = await updateClass({
        id: body.id,
        updates: {
          name: body.name,
          description: body.description,
          teacherId: body.teacherId,
          language: body.language,
          level: body.level,
          maxStudents: body.maxStudents,
          status: body.status,
        },
      });

      return NextResponse.json({ success: true, class: cls });
    }

    if (body.action === "delete") {
      if (!body.id) {
        return NextResponse.json({ message: "id is required." }, { status: 400 });
      }

      await deleteClass(body.id);
      return NextResponse.json({ success: true });
    }

    if (body.action === "enroll") {
      if (!body.classId || !body.studentId) {
        return NextResponse.json(
          { message: "classId and studentId are required." },
          { status: 400 }
        );
      }

      const enrollment = await enrollStudent({
        classId: body.classId,
        studentId: body.studentId,
      });

      return NextResponse.json({ success: true, enrollment });
    }

    if (body.action === "unenroll") {
      if (!body.classId || !body.studentId) {
        return NextResponse.json(
          { message: "classId and studentId are required." },
          { status: 400 }
        );
      }

      await unenrollStudent({
        classId: body.classId,
        studentId: body.studentId,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process request.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
