import { NextRequest, NextResponse } from "next/server";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { deleteHiveFile, rejectHiveFile, listHiveFiles } from "@/lib/server/hive-supabase";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  const body = (await request.json().catch(() => ({}))) as { action?: "delete" | "reject"; id?: string; note?: string };
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
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update Hive file.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
