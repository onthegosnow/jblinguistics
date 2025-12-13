import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/server/storage";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("public_staff_profiles")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ profiles: data ?? [] });
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request.headers.get("x-admin-token") ?? undefined);
    const body = (await request.json().catch(() => ({}))) as {
      slug?: string;
      userId?: string;
      action?: "approve" | "hide";
    };
    if (!body.slug && !body.userId) {
      return NextResponse.json({ message: "slug or userId required" }, { status: 400 });
    }
    const supabase = createSupabaseAdminClient();
    const visibility = body.action === "approve" ? "visible" : "hidden";
    const update = await supabase
      .from("public_staff_profiles")
      .update({ visibility, updated_at: new Date().toISOString() })
      .or(`slug.eq.${body.slug ?? ""},user_id.eq.${body.userId ?? ""}`);
    if (update.error) {
      return NextResponse.json({ message: update.error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to update profile." }, { status });
  }
}
