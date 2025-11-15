import { NextRequest, NextResponse } from "next/server";
import { buildAssignmentDetail } from "@/lib/server/portal-helpers";
import { appendAssignmentTimeEntry, requirePortalUserFromToken } from "@/lib/server/storage";
import crypto from "crypto";

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
    date?: string;
    hours?: number;
    notes?: string;
    issues?: string;
    extraHoursRequested?: boolean;
    extraHoursNote?: string;
  };

  if (!body.hours || Number.isNaN(Number(body.hours))) {
    return NextResponse.json({ message: "Hours are required." }, { status: 400 });
  }

  const entry = {
    id: crypto.randomUUID(),
    assignmentId: detail.assignment.id,
    userId: user.id,
    date: body.date ?? new Date().toISOString().slice(0, 10),
    hours: Number(body.hours),
    notes: body.notes?.trim(),
    issues: body.issues?.trim(),
    extraHoursRequested: Boolean(body.extraHoursRequested),
    extraHoursNote: body.extraHoursNote?.trim(),
    createdAt: new Date().toISOString(),
  };

  await appendAssignmentTimeEntry(entry);
  const updated = await buildAssignmentDetail(params.id, user);
  return NextResponse.json(updated);
}
