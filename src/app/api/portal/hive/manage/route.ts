import { NextRequest, NextResponse } from "next/server";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { deleteHiveFile, rejectHiveFile, listHiveFiles, replaceHiveFile, buildHiveFilename } from "@/lib/server/hive-supabase";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  const body = (await request.json().catch(() => ({}))) as {
    action?: "delete" | "reject" | "replace";
    id?: string;
    note?: string;
    // For replace action
    filename?: string;
    data?: string; // base64
    mime?: string;
    size?: number;
  };
  if (!body.id || !body.action) {
    return NextResponse.json({ message: "id and action are required." }, { status: 400 });
  }

  try {
    // ensure ownership before destructive actions
    const { approved, pending, rejected } = await listHiveFiles({ includePending: true, includeSignedUrl: false, userId: user.id });
    const mine = [...approved, ...pending, ...rejected].find((f) => f.id === body.id);
    if (!mine) return NextResponse.json({ message: "Not found or not yours." }, { status: 403 });

    if (body.action === "delete") {
      await deleteHiveFile({ id: body.id });
    } else if (body.action === "reject") {
      await rejectHiveFile({ id: body.id, note: body.note });
    } else if (body.action === "replace") {
      if (!body.data || !body.filename) {
        return NextResponse.json({ message: "File data and filename are required for replace." }, { status: 400 });
      }

      // Build filename using existing metadata from the rejected file
      const ext = body.filename.includes(".") ? body.filename.substring(body.filename.lastIndexOf(".") + 1) : "bin";
      const autoName = buildHiveFilename({
        level: mine.level ?? "A1",
        skill: mine.skill ?? "General",
        topic: mine.topic ?? "Topic",
        descriptor: "",
        fileType: mine.file_type ?? "File",
        teacherName: mine.teacher_name ?? user.name ?? user.email,
        date: new Date().toISOString().slice(0, 10),
        extension: ext,
      });

      const updated = await replaceHiveFile({
        id: body.id,
        fileDataBase64: body.data,
        filename: autoName,
        mime: body.mime,
        size: body.size,
      });
      return NextResponse.json({ success: true, file: updated });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update Hive file.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
