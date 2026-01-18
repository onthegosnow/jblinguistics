import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import {
  createSession,
  updateSession,
  deleteSession,
  getClassSessions,
  getSessionAttendance,
  markAttendance,
  generateICalEvent,
  generateGoogleCalendarUrl,
} from "@/lib/server/classes";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("classId");
    const sessionId = searchParams.get("sessionId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const includeCancelled = searchParams.get("includeCancelled") === "true";

    // Get attendance for specific session
    if (sessionId) {
      const attendance = await getSessionAttendance(sessionId);
      return NextResponse.json({ attendance });
    }

    // Get sessions
    const sessions = await getClassSessions({
      classId: classId ?? undefined,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
      includeCancelled,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load sessions.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  const body = (await request.json().catch(() => ({}))) as {
    action?: "create" | "update" | "delete" | "cancel" | "mark-attendance" | "get-calendar";
    // For create/update
    id?: string;
    classId?: string;
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    recurringPattern?: string;
    recurringEndDate?: string;
    meetingUrl?: string;
    meetingProvider?: string;
    location?: string;
    sessionType?: "regular" | "makeup" | "exam" | "orientation";
    // For cancel
    cancelReason?: string;
    // For attendance
    sessionId?: string;
    studentId?: string;
    attendanceStatus?: "present" | "absent" | "excused" | "late";
    notes?: string;
    // For calendar
    format?: "ical" | "google";
  };

  if (!body.action) {
    return NextResponse.json({ message: "action is required." }, { status: 400 });
  }

  try {
    if (body.action === "create") {
      if (!body.classId || !body.startTime || !body.endTime) {
        return NextResponse.json(
          { message: "classId, startTime, and endTime are required." },
          { status: 400 }
        );
      }

      const session = await createSession({
        classId: body.classId,
        title: body.title,
        description: body.description,
        startTime: body.startTime,
        endTime: body.endTime,
        recurringPattern: body.recurringPattern,
        recurringEndDate: body.recurringEndDate,
        meetingUrl: body.meetingUrl,
        meetingProvider: body.meetingProvider,
        location: body.location,
        sessionType: body.sessionType,
      });

      return NextResponse.json({ success: true, session });
    }

    if (body.action === "update") {
      if (!body.id) {
        return NextResponse.json({ message: "id is required." }, { status: 400 });
      }

      const session = await updateSession({
        id: body.id,
        updates: {
          title: body.title,
          description: body.description,
          startTime: body.startTime,
          endTime: body.endTime,
          meetingUrl: body.meetingUrl,
          meetingProvider: body.meetingProvider,
          location: body.location,
          sessionType: body.sessionType,
        },
      });

      return NextResponse.json({ success: true, session });
    }

    if (body.action === "delete") {
      if (!body.id) {
        return NextResponse.json({ message: "id is required." }, { status: 400 });
      }

      await deleteSession(body.id);
      return NextResponse.json({ success: true });
    }

    if (body.action === "cancel") {
      if (!body.id) {
        return NextResponse.json({ message: "id is required." }, { status: 400 });
      }

      const session = await updateSession({
        id: body.id,
        updates: {
          cancelled: true,
          cancelledReason: body.cancelReason,
        },
      });

      return NextResponse.json({ success: true, session });
    }

    if (body.action === "mark-attendance") {
      if (!body.sessionId || !body.studentId || !body.attendanceStatus) {
        return NextResponse.json(
          { message: "sessionId, studentId, and attendanceStatus are required." },
          { status: 400 }
        );
      }

      const attendance = await markAttendance({
        sessionId: body.sessionId,
        studentId: body.studentId,
        status: body.attendanceStatus,
        notes: body.notes,
      });

      return NextResponse.json({ success: true, attendance });
    }

    if (body.action === "get-calendar") {
      if (!body.sessionId) {
        return NextResponse.json({ message: "sessionId is required." }, { status: 400 });
      }

      const sessions = await getClassSessions({ classId: undefined });
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
