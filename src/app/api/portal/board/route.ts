import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { requirePortalUserFromToken } from "@/lib/server/storage";

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  const supabase = createSupabaseAdminClient();
  const { searchParams } = new URL(request.url);
  const room = (searchParams.get("room") || "announcements").trim();

  const { data, error } = await supabase
    .from("board_messages")
    .select("id, room, user_id, author_name, message, created_at")
    .order("created_at", { ascending: false })
    .limit(200)
    .ilike("room", room || "announcements");

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({
    messages: data ?? [],
    rooms: ["announcements", "staff_lounge", "onboarding", "hive", "feature_requests"],
    userId: user.id,
  });
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  const body = (await request.json().catch(() => ({}))) as { room?: string; message?: string };
  const room = (body.room || "announcements").trim();
  const message = (body.message || "").trim();
  if (!message) {
    return NextResponse.json({ message: "Message required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("board_messages").insert({
    room,
    user_id: user.id,
    author_name: user.name || user.email,
    message,
  });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
