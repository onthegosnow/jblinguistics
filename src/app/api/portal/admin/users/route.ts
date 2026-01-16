import { NextRequest, NextResponse } from "next/server";
import { PortalUserRole, requireAdmin, createPortalPasswordHash } from "@/lib/server/storage";
import { generateTempPassword, sendPortalCredentials } from "@/lib/server/portal-supabase";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const supabase = createSupabaseAdminClient();
  const [usersRes, profilesRes] = await Promise.all([
    supabase
      .from("portal_users")
      .select("id, name, email, roles, languages, active, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("public_staff_profiles").select("user_id, visibility, roles, slug"),
  ]);
  if (usersRes.error) return NextResponse.json({ message: usersRes.error.message }, { status: 500 });

  // Build map of user_id -> public profile info
  const profileByUser = new Map<string, { visibility: string; roles: string[]; slug: string }>();
  for (const profile of profilesRes.data ?? []) {
    if (profile.user_id) {
      profileByUser.set(profile.user_id, {
        visibility: profile.visibility ?? "hidden",
        roles: profile.roles ?? [],
        slug: profile.slug ?? "",
      });
    }
  }

  // Merge profile info into users
  const users = (usersRes.data ?? []).map((u) => ({
    ...u,
    publicProfile: profileByUser.get(u.id) ?? null,
  }));

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
    roles?: PortalUserRole[];
    languages?: string[];
    action?: "reset" | "deactivate" | "reactivate";
    userId?: string;
  };

  // Administrative actions on existing users
  if (body.action && body.userId) {
    const supabase = createSupabaseAdminClient();
    if (body.action === "deactivate") {
      await supabase.from("portal_users").update({ active: false }).eq("id", body.userId);
      return NextResponse.json({ success: true });
    }
    if (body.action === "reactivate") {
      const temp = generateTempPassword();
      const password_hash = createPortalPasswordHash(temp);
      const { data, error } = await supabase
        .from("portal_users")
        .update({ active: true, must_reset: true, password_hash })
        .eq("id", body.userId)
        .select("email, name")
        .maybeSingle();
      if (error) return NextResponse.json({ message: error.message }, { status: 500 });
      if (data?.email) {
        await sendPortalCredentials(data.email, data.name ?? data.email, temp, { reset: true }).catch(() => undefined);
      }
      return NextResponse.json({ success: true, tempPassword: temp });
    }
    if (body.action === "reset") {
      const temp = body.password || generateTempPassword();
      const password_hash = createPortalPasswordHash(temp);
      const { data, error } = await supabase
        .from("portal_users")
        .update({ password_hash, must_reset: true })
        .eq("id", body.userId)
        .select("email, name")
        .maybeSingle();
      if (error) return NextResponse.json({ message: error.message }, { status: 500 });
      if (data?.email) {
        await sendPortalCredentials(data.email, data.name ?? data.email, temp, { reset: true }).catch(() => undefined);
      }
      return NextResponse.json({ success: true, tempPassword: temp }, { status: 200 });
    }
  }

  if (!body.name || !body.email) {
    return NextResponse.json({ message: "Name and email are required." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const supabase = createSupabaseAdminClient();
  const tempPassword = body.password || generateTempPassword();
  const { data, error } = await supabase
    .from("portal_users")
    .upsert(
      {
        name: body.name.trim(),
        email,
        password_hash: createPortalPasswordHash(tempPassword),
        roles: body.roles?.length ? body.roles : ["teacher"],
        languages: body.languages ?? [],
        active: true,
      },
      { onConflict: "email" }
    )
    .select()
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Unable to create user" }, { status: 500 });
  }
  return NextResponse.json({ user: data, tempPassword }, { status: 201 });
}
