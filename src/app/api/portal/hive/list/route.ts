import { NextRequest, NextResponse } from "next/server";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { listHiveFiles } from "@/lib/server/hive-supabase";

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  try {
    const { approved, pending, rejected } = await listHiveFiles({ includePending: true, userId: user.id, includeSignedUrl: true });
    return NextResponse.json({ approved, pending, rejected });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Hive files.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
