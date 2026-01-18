import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  listClasses,
  getClass,
  getClassSessions,
  getStudentDashboardStats,
  generateICalEvent,
  generateGoogleCalendarUrl,
} from "@/lib/server/classes";

async function requireStudentFromToken(token?: string) {
  if (!token) {
    throw new Error("Unauthorized");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", token)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Student not found");
  }

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-student-token") ?? undefined;
    const student = await requireStudentFromToken(token);

    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("id");
    const view = searchParams.get("view"); // "dashboard", "sessions"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Student dashboard stats
    if (view === "dashboard") {
      const stats = await getStudentDashboardStats(student.id);
      return NextResponse.json(stats);
    }

    // Get sessions for student's enrolled classes
    if (view === "sessions") {
      const sessions = await getClassSessions({
        studentId: student.id,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      });
      return NextResponse.json({ sessions });
    }

    // Get single class with details
    if (classId) {
      const cls = await getClass(classId);
      if (!cls) {
        return NextResponse.json({ message: "Class not found" }, { status: 404 });
      }

      // Get sessions for this class
      const sessions = await getClassSessions({ classId });

      return NextResponse.json({ class: cls, sessions });
    }

    // List student's enrolled classes
    const classes = await listClasses({
      studentId: student.id,
      status: "active",
    });

    return NextResponse.json({ classes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load classes.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-student-token") ?? undefined;
    const student = await requireStudentFromToken(token);

    const body = (await request.json().catch(() => ({}))) as {
      action?: "get-calendar";
      sessionId?: string;
      format?: "ical" | "google";
    };

    if (!body.action) {
      return NextResponse.json({ message: "action is required." }, { status: 400 });
    }

    if (body.action === "get-calendar") {
      if (!body.sessionId) {
        return NextResponse.json({ message: "sessionId is required." }, { status: 400 });
      }

      // Get sessions for student's enrolled classes and find the requested one
      const sessions = await getClassSessions({ studentId: student.id });
      const session = sessions.find((s) => s.id === body.sessionId);

      if (!session) {
        return NextResponse.json({ message: "Session not found." }, { status: 404 });
      }

      if (body.format === "google") {
        const url = generateGoogleCalendarUrl(session);
        return NextResponse.json({ url });
      } else {
        const ical = generateICalEvent(session);
        return NextResponse.json({ ical });
      }
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process request.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
