import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { buildAssignmentDetail } from "@/lib/server/portal-helpers";
import { appendAssignmentUpload, requirePortalUserFromToken } from "@/lib/server/storage";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await requirePortalUserFromToken(request.headers.get("x-portal-token") ?? undefined);
  const detail = await buildAssignmentDetail(id, user);
  if (!detail) {
    return NextResponse.json({ message: "Assignment not found." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    filename?: string;
    mimeType?: string;
    size?: number;
    data?: string;
    category?: "original" | "final" | "worksheet" | "support";
  };

  if (!body.filename || !body.data || !body.mimeType || !body.size) {
    return NextResponse.json({ message: "Filename, data, mimeType, and size are required." }, { status: 400 });
  }

  await appendAssignmentUpload({
    id: crypto.randomUUID(),
    assignmentId: detail.assignment.id,
    userId: user.id,
    filename: body.filename,
    mimeType: body.mimeType,
    size: body.size,
    data: body.data,
    category: body.category ?? "support",
    uploadedAt: new Date().toISOString(),
  });

  const updated = await buildAssignmentDetail(id, user);
  return NextResponse.json(updated);
}
