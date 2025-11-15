import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  addPortalAssignment,
  appendAssignmentUpload,
  listPortalAssignments,
  listPortalUsers,
  PortalAssignmentRecord,
  requireAdmin,
} from "@/lib/server/storage";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const [assignments, users] = await Promise.all([listPortalAssignments(), listPortalUsers()]);
  const withNames = assignments.map((assignment) => ({
    ...assignment,
    assignees: assignment.assignedTo
      .map((id) => users.find((u) => u.id === id))
      .filter(Boolean)
      .map((u) => ({ id: u!.id, name: u!.name, email: u!.email })),
  }));
  return NextResponse.json({ assignments: withNames });
}

type AdminAssignmentInput = {
  title?: string;
  assignmentType?: PortalAssignmentRecord["assignmentType"];
  description?: string;
  client?: string;
  languagePair?: string;
  hoursAssigned?: number;
  startDate?: string;
  dueDate?: string;
  status?: PortalAssignmentRecord["status"];
  assignedTo?: string[];
  participants?: string[];
  attachments?: Array<{
    filename: string;
    mimeType: string;
    size: number;
    data: string;
    category?: "original" | "final" | "worksheet" | "support";
  }>;
};

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const body = (await request.json().catch(() => ({}))) as AdminAssignmentInput;
  if (!body.title || !body.assignmentType || !body.hoursAssigned || !body.assignedTo?.length) {
    return NextResponse.json(
      { message: "Title, type, hours assigned, and at least one assignee are required." },
      { status: 400 }
    );
  }

  const assignment = await addPortalAssignment({
    title: body.title.trim(),
    assignmentType: body.assignmentType,
    description: body.description?.trim(),
    client: body.client?.trim(),
    languagePair: body.languagePair?.trim(),
    hoursAssigned: Number(body.hoursAssigned) || 0,
    startDate: body.startDate,
    dueDate: body.dueDate,
    status: body.status ?? "assigned",
    assignedTo: body.assignedTo,
    participants: body.participants?.map((p) => p.trim()).filter(Boolean) ?? [],
  });

  if (body.attachments?.length) {
    await Promise.all(
      body.attachments.map((file) =>
        appendAssignmentUpload({
          id: crypto.randomUUID(),
          assignmentId: assignment.id,
          userId: "admin",
          category: file.category ?? "support",
          filename: file.filename,
          mimeType: file.mimeType,
          size: file.size,
          data: file.data,
          uploadedAt: new Date().toISOString(),
        })
      )
    );
  }

  return NextResponse.json({ assignment }, { status: 201 });
}
