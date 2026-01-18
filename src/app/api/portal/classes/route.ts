import { NextRequest, NextResponse } from "next/server";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import {
  listClasses,
  getClass,
  getClassEnrollments,
  getClassSessions,
  getTeacherDashboardStats,
  generateICalEvent,
  generateGoogleCalendarUrl,
} from "@/lib/server/classes";

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);

  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("id");
    const view = searchParams.get("view"); // "dashboard", "sessions", "calendar"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Teacher dashboard stats
    if (view === "dashboard") {
      const stats = await getTeacherDashboardStats(user.id);
      return NextResponse.json(stats);
    }

    // Get sessions for teacher's classes
    if (view === "sessions") {
      const sessions = await getClassSessions({
        teacherId: user.id,
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

      // Verify teacher owns this class
      if (cls.teacher_id !== user.id) {
        return NextResponse.json({ message: "Access denied" }, { status: 403 });
      }

      const enrollments = await getClassEnrollments(classId);
      const sessions = await getClassSessions({ classId });

      return NextResponse.json({ class: cls, enrollments, sessions });
    }

    // List teacher's classes
    const classes = await listClasses({
      teacherId: user.id,
      status: "active",
      includeStudentCount: true,
    });

    return NextResponse.json({ classes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load classes.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);

  const body = (await request.json().catch(() => ({}))) as {
    action?: "get-calendar";
    sessionId?: string;
    format?: "ical" | "google";
  };

  if (!body.action) {
    return NextResponse.json({ message: "action is required." }, { status: 400 });
  }

  try {
    if (body.action === "get-calendar") {
      if (!body.sessionId) {
        return NextResponse.json({ message: "sessionId is required." }, { status: 400 });
      }

      // Get sessions for teacher's classes and find the requested one
      const sessions = await getClassSessions({ teacherId: user.id });
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
