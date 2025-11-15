import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { buildAssignmentDetail } from "@/lib/server/portal-helpers";
import { appendAttendanceRecord, requirePortalUserFromToken } from "@/lib/server/storage";

type Params = {
  params: { id: string };
};

export async function POST(request: NextRequest, { params }: Params) {
  const user = await requirePortalUserFromToken(request.headers.get("x-portal-token") ?? undefined);
  const detail = await buildAssignmentDetail(params.id, user);
  if (!detail) {
    return NextResponse.json({ message: "Assignment not found." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    sessionDate?: string;
    sessionLabel?: string;
    participants?: Array<{ name: string; attended: boolean; notes?: string }>;
  };

  if (!body.sessionDate || !body.participants?.length) {
    return NextResponse.json({ message: "Session date and participants are required." }, { status: 400 });
  }

  const normalizedParticipants = body.participants.map((participant) => ({
    name: participant.name,
    attended: Boolean(participant.attended),
    notes: participant.notes?.trim(),
  }));

  await appendAttendanceRecord({
    id: crypto.randomUUID(),
    assignmentId: detail.assignment.id,
    userId: user.id,
    sessionDate: body.sessionDate,
    sessionLabel: body.sessionLabel?.trim(),
    participants: normalizedParticipants,
    createdAt: new Date().toISOString(),
  });

  const updated = await buildAssignmentDetail(params.id, user);
  return NextResponse.json(updated);
}
