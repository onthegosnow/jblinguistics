import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { approveHiveFile, deleteHiveFile, listHiveFiles, rejectHiveFile } from "@/lib/server/hive-supabase";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  try {
    const { approved, pending, rejected } = await listHiveFiles({ includePending: true, includeSignedUrl: true });
    return NextResponse.json({ approved, pending, rejected });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Hive files.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const body = (await request.json().catch(() => ({}))) as { action?: "approve" | "delete" | "reject"; id?: string; note?: string };
  if (!body.id || !body.action) {
    return NextResponse.json({ message: "id and action are required." }, { status: 400 });
  }
  try {
    if (body.action === "approve") {
      await approveHiveFile({ id: body.id });
    } else if (body.action === "delete") {
      await deleteHiveFile({ id: body.id });
    } else if (body.action === "reject") {
      await rejectHiveFile({ id: body.id, note: body.note });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update Hive file.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
