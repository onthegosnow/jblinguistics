import { NextResponse } from "next/server";
import { listInquiriesFromSupabase } from "@/lib/server/inquiries-supabase";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/server/storage";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as { metadata?: Record<string, string>; status?: string };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("inquiries")
    .update({
      metadata: body.metadata ?? null,
      source: body.status ?? undefined,
    })
    .eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
