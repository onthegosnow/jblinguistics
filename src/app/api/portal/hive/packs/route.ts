import { NextRequest, NextResponse } from "next/server";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { listPacks, getPackWithItems, suggestForPack } from "@/lib/server/hive-supabase";

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  await requirePortalUserFromToken(token);

  const packId = request.nextUrl.searchParams.get("packId");

  try {
    // Get single pack with items
    if (packId) {
      const data = await getPackWithItems(packId, { includeSignedUrl: true });
      // Only return published packs to teachers
      if (!data.pack.published) {
        return NextResponse.json({ message: "Pack not found." }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    // List all published packs
    const packs = await listPacks({ publishedOnly: true });
    return NextResponse.json({ packs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load packs.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);

  const body = (await request.json().catch(() => ({}))) as {
    action?: "suggest";
    hiveFileId?: string;
    packId?: string;
  };

  if (body.action !== "suggest") {
    return NextResponse.json({ message: "Unknown action." }, { status: 400 });
  }

  if (!body.hiveFileId) {
    return NextResponse.json({ message: "hiveFileId is required." }, { status: 400 });
  }

  try {
    const suggestion = await suggestForPack({
      hiveFileId: body.hiveFileId,
      packId: body.packId,
      suggestedBy: user.id,
      suggestedByName: user.name ?? user.email,
    });
    return NextResponse.json({ success: true, suggestion });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit suggestion.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
