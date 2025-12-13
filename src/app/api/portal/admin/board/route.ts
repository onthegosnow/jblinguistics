import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/server/storage";

const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const supabase = createSupabaseAdminClient();
  const { searchParams } = new URL(request.url);
  const allowedRooms = ["announcements", "staff_lounge", "onboarding", "hive", "feature_requests"];
  const room = (searchParams.get("room") || "announcements").trim().toLowerCase().replace(/\s+/g, "_");
  const safeRoom = allowedRooms.includes(room) ? room : "announcements";

  const { data, error } = await supabase
    .from("board_messages")
    .select("id, room, user_id, author_name, message, created_at")
    .ilike("room", safeRoom)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({
    messages: data ?? [],
    rooms: allowedRooms,
  });
}

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const body = (await request.json().catch(() => ({}))) as { room?: string; message?: string; author?: string };
  const allowedRooms = ["announcements", "staff_lounge", "onboarding", "hive", "feature_requests"];
  const room = (body.room || "announcements").trim().toLowerCase().replace(/\s+/g, "_");
  const safeRoom = allowedRooms.includes(room) ? room : "announcements";
  const message = (body.message || "").trim();
  if (!message) {
    return NextResponse.json({ message: "Message required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("board_messages").insert({
    room: safeRoom,
    user_id: ADMIN_USER_ID,
    author_name: body.author || "JB Linguistics",
    message,
  });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Message id required" }, { status: 400 });
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("board_messages").delete().eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
