import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { destinations } from "@/lib/trips";

// POST - Migrate existing trips from code to database
export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  const supabase = createSupabaseAdminClient();
  const results = [];

  for (let i = 0; i < destinations.length; i++) {
    const dest = destinations[i];

    const { data, error } = await supabase
      .from("learning_trips")
      .upsert({
        slug: dest.slug,
        name: dest.name,
        region: dest.region || "",
        blurb: dest.blurb || "",
        hero_image: dest.hero || "",
        hero_split_left: dest.heroSplit?.left || "",
        hero_split_right: dest.heroSplit?.right || "",
        hero_split_alt_left: dest.heroSplit?.altLeft || "",
        hero_split_alt_right: dest.heroSplit?.altRight || "",
        highlights: dest.highlights || [],
        lengths: dest.lengths || [14],
        custom_itinerary: dest.customItinerary || {},
        published: true, // Existing trips are already public
        sort_order: i,
      }, {
        onConflict: "slug"
      })
      .select()
      .single();

    if (error) {
      results.push({ slug: dest.slug, success: false, error: error.message });
    } else {
      results.push({ slug: dest.slug, success: true, id: data.id });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return NextResponse.json({
    message: `Migration complete: ${successCount} succeeded, ${failCount} failed`,
    results,
  });
}
