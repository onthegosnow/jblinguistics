import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import {
  createPack,
  updatePack,
  deletePack,
  listPacks,
  getPackWithItems,
  addItemToPack,
  removeItemFromPack,
  reorderPackItems,
  listPackSuggestions,
  updateSuggestionStatus,
} from "@/lib/server/hive-supabase";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  const packId = request.nextUrl.searchParams.get("packId");
  const suggestions = request.nextUrl.searchParams.get("suggestions") === "true";

  try {
    // Get suggestions
    if (suggestions) {
      const data = await listPackSuggestions({ status: "pending" });
      return NextResponse.json({ suggestions: data });
    }

    // Get single pack with items
    if (packId) {
      const data = await getPackWithItems(packId, { includeSignedUrl: true });
      return NextResponse.json(data);
    }

    // List all packs
    const packs = await listPacks();
    return NextResponse.json({ packs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load packs.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  const body = (await request.json().catch(() => ({}))) as {
    action?:
      | "create"
      | "update"
      | "delete"
      | "add-item"
      | "remove-item"
      | "reorder"
      | "publish"
      | "unpublish"
      | "accept-suggestion"
      | "reject-suggestion";
    // For create/update
    id?: string;
    name?: string;
    description?: string;
    language?: string;
    level?: string;
    weekNumber?: number;
    // For add/remove item
    packId?: string;
    hiveFileId?: string;
    // For reorder
    itemIds?: string[];
    // For suggestion
    suggestionId?: string;
  };

  if (!body.action) {
    return NextResponse.json({ message: "action is required." }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "create": {
        if (!body.name) {
          return NextResponse.json({ message: "name is required." }, { status: 400 });
        }
        const pack = await createPack({
          name: body.name,
          description: body.description,
          language: body.language,
          level: body.level,
          weekNumber: body.weekNumber,
        });
        return NextResponse.json({ success: true, pack });
      }

      case "update": {
        if (!body.id) {
          return NextResponse.json({ message: "id is required." }, { status: 400 });
        }
        const pack = await updatePack({
          id: body.id,
          name: body.name,
          description: body.description,
          language: body.language,
          level: body.level,
          weekNumber: body.weekNumber,
        });
        return NextResponse.json({ success: true, pack });
      }

      case "delete": {
        if (!body.id) {
          return NextResponse.json({ message: "id is required." }, { status: 400 });
        }
        await deletePack(body.id);
        return NextResponse.json({ success: true });
      }

      case "publish": {
        if (!body.id) {
          return NextResponse.json({ message: "id is required." }, { status: 400 });
        }
        await updatePack({ id: body.id, published: true });
        return NextResponse.json({ success: true });
      }

      case "unpublish": {
        if (!body.id) {
          return NextResponse.json({ message: "id is required." }, { status: 400 });
        }
        await updatePack({ id: body.id, published: false });
        return NextResponse.json({ success: true });
      }

      case "add-item": {
        if (!body.packId || !body.hiveFileId) {
          return NextResponse.json({ message: "packId and hiveFileId are required." }, { status: 400 });
        }
        const item = await addItemToPack(body.packId, body.hiveFileId);
        return NextResponse.json({ success: true, item });
      }

      case "remove-item": {
        if (!body.packId || !body.hiveFileId) {
          return NextResponse.json({ message: "packId and hiveFileId are required." }, { status: 400 });
        }
        await removeItemFromPack(body.packId, body.hiveFileId);
        return NextResponse.json({ success: true });
      }

      case "reorder": {
        if (!body.packId || !body.itemIds) {
          return NextResponse.json({ message: "packId and itemIds are required." }, { status: 400 });
        }
        await reorderPackItems(body.packId, body.itemIds);
        return NextResponse.json({ success: true });
      }

      case "accept-suggestion": {
        if (!body.suggestionId) {
          return NextResponse.json({ message: "suggestionId is required." }, { status: 400 });
        }
        await updateSuggestionStatus(body.suggestionId, "accepted");
        return NextResponse.json({ success: true });
      }

      case "reject-suggestion": {
        if (!body.suggestionId) {
          return NextResponse.json({ message: "suggestionId is required." }, { status: 400 });
        }
        await updateSuggestionStatus(body.suggestionId, "rejected");
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ message: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process request.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
