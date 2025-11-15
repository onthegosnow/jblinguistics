import { NextRequest, NextResponse } from "next/server";
import { buildAssignmentDetail } from "@/lib/server/portal-helpers";
import { listAttendanceRecords, listAssignmentTimeEntries, requirePortalUserFromToken } from "@/lib/server/storage";

type Params = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params }: Params) {
  const user = await requirePortalUserFromToken(request.headers.get("x-portal-token") ?? undefined);
  const detail = await buildAssignmentDetail(params.id, user);
  if (!detail) {
    return NextResponse.json({ message: "Assignment not found." }, { status: 404 });
  }
  const month = request.nextUrl.searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ message: "Month must be YYYY-MM." }, { status: 400 });
  }
  const [timeEntries, attendance] = await Promise.all([listAssignmentTimeEntries(), listAttendanceRecords()]);
  const entrySubset = timeEntries.filter(
    (entry) =>
      entry.assignmentId === detail.assignment.id && entry.userId === user.id && entry.date.startsWith(month)
  );
  const attendanceSubset = attendance.filter(
    (record) =>
      record.assignmentId === detail.assignment.id &&
      record.userId === user.id &&
      record.sessionDate.startsWith(month)
  );

  const timeHeader = "Date,Hours,Notes,Issues,Extra Hours Requested,Extra Hours Notes";
  const timeRows = entrySubset.map((entry) =>
    [
      entry.date,
      entry.hours,
      JSON.stringify(entry.notes ?? ""),
      JSON.stringify(entry.issues ?? ""),
      entry.extraHoursRequested ? "Yes" : "No",
      JSON.stringify(entry.extraHoursNote ?? ""),
    ].join(",")
  );

  const attendanceHeader = "Session Date,Session Label,Participant,Attended,Notes";
  const attendanceRows = attendanceSubset.flatMap((record) =>
    record.participants.map((participant) =>
      [
        record.sessionDate,
        JSON.stringify(record.sessionLabel ?? ""),
        JSON.stringify(participant.name),
        participant.attended ? "Present" : "Absent",
        JSON.stringify(participant.notes ?? ""),
      ].join(",")
    )
  );

  const csv = [timeHeader, ...timeRows, "", attendanceHeader, ...attendanceRows].join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${detail.assignment.title.replace(/\s+/g, "_")}_${month}.csv"`,
    },
  });
}
