import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

type RouteContext = { params: Promise<{ id: string }> };

// GET - Get single trip
export async function GET(request: NextRequest, context: RouteContext) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const { id } = await context.params;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("learning_trips")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ trip: data });
}

// PATCH - Update trip
export async function PATCH(request: NextRequest, context: RouteContext) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const { id } = await context.params;
  const body = await request.json();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("learning_trips")
    .update({
      slug: body.slug,
      name: body.name,
      region: body.region,
      blurb: body.blurb,
      hero_image: body.hero_image,
      hero_split_left: body.hero_split_left,
      hero_split_right: body.hero_split_right,
      hero_split_alt_left: body.hero_split_alt_left,
      hero_split_alt_right: body.hero_split_alt_right,
      highlights: body.highlights,
      lengths: body.lengths,
      custom_itinerary: body.custom_itinerary,
      published: body.published,
      sort_order: body.sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ trip: data });
}

// DELETE - Delete trip
export async function DELETE(request: NextRequest, context: RouteContext) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const { id } = await context.params;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("learning_trips")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
