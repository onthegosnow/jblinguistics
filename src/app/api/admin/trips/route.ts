import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// GET - List all trips (for admin)
export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("learning_trips")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ trips: data ?? [] });
}

// POST - Create new trip
export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  const body = await request.json();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("learning_trips")
    .insert({
      slug: body.slug,
      name: body.name,
      region: body.region,
      blurb: body.blurb,
      hero_image: body.hero_image,
      hero_split_left: body.hero_split_left,
      hero_split_right: body.hero_split_right,
      hero_split_alt_left: body.hero_split_alt_left,
      hero_split_alt_right: body.hero_split_alt_right,
      highlights: body.highlights || [],
      lengths: body.lengths || [14],
      custom_itinerary: body.custom_itinerary || {},
      published: body.published || false,
      sort_order: body.sort_order || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ trip: data }, { status: 201 });
}
