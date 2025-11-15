import {
  AssignmentAttendanceRecord,
  AssignmentTimeEntry,
  AssignmentUploadRecord,
  listAttendanceRecords,
  listAssignmentTimeEntries,
  listAssignmentUploads,
  listPortalAssignments,
  PortalAssignmentRecord,
  PortalUserRecord,
} from "./storage";

export function summarizeAttendance(participants: string[], records: AssignmentAttendanceRecord[]) {
  const normalized = participants.map((name) => ({
    name,
    attended: 0,
    total: 0,
    rate: 0,
  }));
  const lookup = new Map(normalized.map((item) => [item.name.toLowerCase(), item]));
  records.forEach((record) => {
    record.participants.forEach((participant) => {
      const key = participant.name.toLowerCase();
      const target = lookup.get(key);
      if (!target) return;
      target.total += 1;
      if (participant.attended) target.attended += 1;
    });
  });
  return normalized.map((item) => ({
    ...item,
    rate: item.total ? Math.round((item.attended / item.total) * 100) : 0,
  }));
}

export type AssignmentDetailPayload = {
  assignment: PortalAssignmentRecord;
  hoursLogged: number;
  hoursRemaining: number;
  timeEntries: AssignmentTimeEntry[];
  attendanceRecords: AssignmentAttendanceRecord[];
  attendanceSummary: ReturnType<typeof summarizeAttendance>;
  uploads: Array<Omit<AssignmentUploadRecord, "data">>;
};

export async function buildAssignmentDetail(
  assignmentId: string,
  user: PortalUserRecord
): Promise<AssignmentDetailPayload | null> {
  const [assignments, timeEntries, attendance, uploads] = await Promise.all([
    listPortalAssignments(),
    listAssignmentTimeEntries(),
    listAttendanceRecords(),
    listAssignmentUploads(),
  ]);
  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment || !assignment.assignedTo.includes(user.id)) {
    return null;
  }
  const entries = timeEntries.filter((entry) => entry.assignmentId === assignment.id && entry.userId === user.id);
  const attendanceRecords = attendance.filter((record) => record.assignmentId === assignment.id && record.userId === user.id);
  const assignmentUploads = uploads
    .filter((upload) => upload.assignmentId === assignment.id && upload.userId === user.id)
    .map((upload) => {
      const { data, ...rest } = upload;
      void data;
      return rest;
    });

  const hoursLogged = entries.reduce((sum, entry) => sum + entry.hours, 0);
  return {
    assignment,
    hoursLogged,
    hoursRemaining: Math.max(assignment.hoursAssigned - hoursLogged, 0),
    timeEntries: entries.sort((a, b) => b.date.localeCompare(a.date)),
    attendanceRecords: attendanceRecords.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate)),
    attendanceSummary: summarizeAttendance(assignment.participants, attendanceRecords),
    uploads: assignmentUploads.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
  };
}

export async function listAssignmentsForUser(user: PortalUserRecord) {
  const assignments = await listPortalAssignments();
  return assignments.filter((assignment) => assignment.assignedTo.includes(user.id));
}

export async function listAssignmentArtifacts(assignmentId: string) {
  const [timeEntries, attendance, uploads] = await Promise.all([
    listAssignmentTimeEntries(),
    listAttendanceRecords(),
    listAssignmentUploads(),
  ]);
  return {
    timeEntries: timeEntries.filter((entry) => entry.assignmentId === assignmentId),
    attendance: attendance.filter((record) => record.assignmentId === assignmentId),
    uploads: uploads.filter((upload) => upload.assignmentId === assignmentId),
  };
}
