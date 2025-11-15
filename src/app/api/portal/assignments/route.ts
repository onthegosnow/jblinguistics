import { NextRequest, NextResponse } from "next/server";
import { summarizeAttendance } from "@/lib/server/portal-helpers";
import {
  listAttendanceRecords,
  listAssignmentTimeEntries,
  listAssignmentUploads,
  listPortalAssignments,
  requirePortalUserFromToken,
} from "@/lib/server/storage";

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  const [assignments, timeEntries, attendance, uploads] = await Promise.all([
    listPortalAssignments(),
    listAssignmentTimeEntries(),
    listAttendanceRecords(),
    listAssignmentUploads(),
  ]);

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    languages: user.languages,
  };

  const items = assignments
    .filter((assignment) => assignment.assignedTo.includes(user.id))
    .map((assignment) => {
      const assignmentEntries = timeEntries.filter((entry) => entry.assignmentId === assignment.id && entry.userId === user.id);
      const assignmentAttendance = attendance.filter(
        (record) => record.assignmentId === assignment.id && record.userId === user.id
      );
      const assignmentUploads = uploads
        .filter((upload) => upload.assignmentId === assignment.id && upload.userId === user.id)
        .map((upload) => ({
          id: upload.id,
          category: upload.category,
          filename: upload.filename,
          size: upload.size,
          uploadedAt: upload.uploadedAt,
        }));

      const hoursLogged = assignmentEntries.reduce((sum, entry) => sum + entry.hours, 0);
      return {
        assignment,
        hoursLogged,
        hoursRemaining: Math.max(assignment.hoursAssigned - hoursLogged, 0),
        attendanceSummary: summarizeAttendance(assignment.participants, assignmentAttendance),
        timeEntriesCount: assignmentEntries.length,
        attendanceSessions: assignmentAttendance.length,
        uploads: assignmentUploads,
      };
    });

  return NextResponse.json({ assignments: items, user: sanitizedUser });
}
