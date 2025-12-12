import { NextRequest, NextResponse } from "next/server";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { buildHiveFilename, uploadHivePending } from "@/lib/server/hive-supabase";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  const body = (await request.json().catch(() => ({}))) as {
    language?: string;
    level?: string;
    skill?: string;
    topic?: string;
    fileType?: string;
    descriptor?: string;
    teacherName?: string;
    date?: string;
    filename?: string;
    data?: string; // base64
    mime?: string;
    size?: number;
  };

  if (!body.data || !body.filename) {
    return NextResponse.json({ message: "File data and filename are required." }, { status: 400 });
  }

  try {
    const ext = body.filename.includes(".") ? body.filename.substring(body.filename.lastIndexOf(".") + 1) : "bin";
    const autoName = buildHiveFilename({
      level: body.level ?? "A1",
      skill: body.skill ?? "General",
      topic: body.topic ?? "Topic",
      descriptor: body.descriptor ?? "",
      fileType: body.fileType ?? "File",
      teacherName: body.teacherName ?? user.name ?? user.email,
      date: body.date ?? new Date().toISOString().slice(0, 10),
      extension: ext,
    });
    const saved = await uploadHivePending({
      fileDataBase64: body.data,
      filename: autoName,
      metadata: {
        level: body.level ?? "A1",
        language: body.language ?? "English",
        skill: body.skill ?? "General",
        topic: body.topic ?? "Topic",
        descriptor: body.descriptor ?? "",
        fileType: body.fileType ?? "File",
        teacherName: body.teacherName ?? user.name ?? user.email,
        date: body.date ?? new Date().toISOString().slice(0, 10),
        uploadedBy: user.id,
        uploadedByEmail: user.email,
        size: body.size,
        mime: body.mime,
      },
    });
    return NextResponse.json({ file: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload file.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
