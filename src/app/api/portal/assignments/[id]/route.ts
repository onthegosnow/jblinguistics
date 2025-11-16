import { NextRequest, NextResponse } from "next/server";
import { buildAssignmentDetail } from "@/lib/server/portal-helpers";
import { requirePortalUserFromToken, updatePortalAssignment } from "@/lib/server/storage";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await requirePortalUserFromToken(request.headers.get("x-portal-token") ?? undefined);
  const detail = await buildAssignmentDetail(id, user);
  if (!detail) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }
  return NextResponse.json(detail);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await requirePortalUserFromToken(request.headers.get("x-portal-token") ?? undefined);
  const detail = await buildAssignmentDetail(id, user);
  if (!detail) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }
  const body = (await request.json().catch(() => ({}))) as { status?: typeof detail.assignment.status };
  if (!body.status) {
    return NextResponse.json({ message: "Status is required." }, { status: 400 });
  }

  const updated = await updatePortalAssignment(detail.assignment.id, (record) => ({
    ...record,
    status: body.status!,
  }));
  return NextResponse.json({ assignment: updated });
}
