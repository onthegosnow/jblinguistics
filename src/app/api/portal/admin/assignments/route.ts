import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  addPortalAssignment,
  appendAssignmentUpload,
  listPortalAssignments,
  listPortalUsers,
  PortalAssignmentRecord,
  requireAdmin,
  updatePortalAssignment,
} from "@/lib/server/storage";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? process.env.SMTP_USER;

async function sendAssignmentNotification(
  assignees: Array<{ email: string; name: string }>,
  assignment: { title: string; hoursAssigned: number; client?: string; startDate?: string; dueDate?: string; description?: string }
) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("SMTP not configured, skipping assignment notification");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  for (const assignee of assignees) {
    const firstName = assignee.name?.split(" ")[0] || "there";
    const dateInfo = assignment.startDate && assignment.dueDate
      ? `\nDates: ${assignment.startDate} to ${assignment.dueDate}`
      : assignment.startDate
        ? `\nStart date: ${assignment.startDate}`
        : "";
    const clientInfo = assignment.client ? `\nClient: ${assignment.client}` : "";
    const descInfo = assignment.description ? `\n\nDescription:\n${assignment.description}` : "";

    const text = `Hi ${firstName},

You have been assigned a new class/assignment on JB Linguistics Portal.

Assignment: ${assignment.title}
Hours: ${assignment.hoursAssigned}${clientInfo}${dateInfo}${descInfo}

Please log in to the portal to view details and track your time.

– JB Linguistics Team`;

    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to: assignee.email,
        subject: `New Assignment: ${assignment.title}`,
        text,
      });
    } catch (err) {
      console.error(`Failed to send assignment notification to ${assignee.email}:`, err);
    }
  }
}

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

  const users = await listPortalUsers();
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

  // Send email notification to assignees
  const assignees = body.assignedTo
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => !!u && !!u.email)
    .map((u) => ({ email: u.email, name: u.name }));

  if (assignees.length > 0) {
    sendAssignmentNotification(assignees, {
      title: assignment.title,
      hoursAssigned: assignment.hoursAssigned,
      client: assignment.client,
      startDate: assignment.startDate,
      dueDate: assignment.dueDate,
      description: assignment.description,
    }).catch((err) => console.error("Failed to send assignment notifications:", err));
  }

  return NextResponse.json({ assignment }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const body = (await request.json().catch(() => ({}))) as AdminAssignmentInput & { id?: string };

  if (!body.id) {
    return NextResponse.json({ message: "Assignment ID is required." }, { status: 400 });
  }

  try {
    const updated = await updatePortalAssignment(body.id, (existing) => ({
      ...existing,
      title: body.title?.trim() ?? existing.title,
      assignmentType: body.assignmentType ?? existing.assignmentType,
      description: body.description?.trim() ?? existing.description,
      client: body.client?.trim() ?? existing.client,
      languagePair: body.languagePair?.trim() ?? existing.languagePair,
      hoursAssigned: body.hoursAssigned !== undefined ? Number(body.hoursAssigned) : existing.hoursAssigned,
      startDate: body.startDate ?? existing.startDate,
      dueDate: body.dueDate ?? existing.dueDate,
      status: body.status ?? existing.status,
      assignedTo: body.assignedTo ?? existing.assignedTo,
      participants: body.participants?.map((p) => p.trim()).filter(Boolean) ?? existing.participants,
    }));

    return NextResponse.json({ assignment: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update assignment";
    return NextResponse.json({ message }, { status: 500 });
  }
}
