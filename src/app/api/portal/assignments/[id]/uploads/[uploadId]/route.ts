import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { listAssignmentUploads, requirePortalUserFromToken } from "@/lib/server/storage";
import { listAssignmentsForUser } from "@/lib/server/portal-helpers";

type Params = {
  params: { id: string; uploadId: string };
};

export async function GET(request: NextRequest, { params }: Params) {
  const user = await requirePortalUserFromToken(request.headers.get("x-portal-token") ?? undefined);
  const assignments = await listAssignmentsForUser(user);
  const allowed = assignments.some((assignment) => assignment.id === params.id);
  if (!allowed) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }
  const uploads = await listAssignmentUploads();
  const upload = uploads.find((u) => u.id === params.uploadId && u.assignmentId === params.id && u.userId === user.id);
  if (!upload) {
    return NextResponse.json({ message: "Upload not found." }, { status: 404 });
  }
  const buffer = Buffer.from(upload.data, "base64");
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": upload.mimeType,
      "Content-Length": buffer.length.toString(),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(upload.filename)}"`,
    },
  });
}
