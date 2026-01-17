import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { approveHiveFile, deleteHiveFile, listHiveFiles, rejectHiveFile } from "@/lib/server/hive-supabase";
import { checkAllHiveLinks, checkSingleLink, getDeadLinkCount } from "@/lib/server/link-checker";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  try {
    const { approved, pending, rejected } = await listHiveFiles({ includePending: true, includeSignedUrl: true });
    const deadLinkCount = await getDeadLinkCount();
    return NextResponse.json({ approved, pending, rejected, deadLinkCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Hive files.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const body = (await request.json().catch(() => ({}))) as {
    action?: "approve" | "delete" | "reject" | "check-link" | "check-all-links";
    id?: string;
    note?: string;
  };

  if (!body.action) {
    return NextResponse.json({ message: "action is required." }, { status: 400 });
  }

  try {
    // Link checking actions
    if (body.action === "check-all-links") {
      const results = await checkAllHiveLinks();
      return NextResponse.json({ success: true, results });
    }

    if (body.action === "check-link") {
      if (!body.id) {
        return NextResponse.json({ message: "id is required for check-link." }, { status: 400 });
      }
      const status = await checkSingleLink(body.id);
      return NextResponse.json({ success: true, status });
    }

    // File management actions (require id)
    if (!body.id) {
      return NextResponse.json({ message: "id is required." }, { status: 400 });
    }

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
