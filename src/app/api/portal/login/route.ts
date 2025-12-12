import { NextRequest, NextResponse } from "next/server";
import { createPortalSession, listPortalUsers, verifyPortalPassword, type PortalUserRole, type PortalUserRecord } from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const { email, password } = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  // Try Supabase first (portal_users)
  const supabase = createSupabaseAdminClient();
  type UserLike = Omit<PortalUserRecord, "createdAt" | "languages"> & {
    createdAt?: string;
    languages?: string[] | null;
    mustReset?: boolean;
  };
  let user: UserLike | undefined;

  const { data } = await supabase
    .from("portal_users")
    .select("id, name, email, roles, languages, password_hash, active, created_at, must_reset")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (data) {
    const needsReset = data.must_reset ?? true;
    user = {
      id: data.id,
      name: data.name,
      email: data.email,
      roles: ((data.roles as string[]) ?? []).filter((r): r is PortalUserRole => r === "teacher" || r === "translator"),
      languages: (data.languages as string[] | null) ?? null,
      passwordHash: data.password_hash,
      active: data.active ?? true,
      createdAt: data.created_at ?? undefined,
      mustReset: needsReset,
    };
    // If missing, set must_reset true so first login forces reset
    if (needsReset && data.must_reset !== true) {
      await supabase.from("portal_users").update({ must_reset: true }).eq("id", data.id);
    }
  } else {
    // fallback to file-based users
    const users = await listPortalUsers();
    const found = users.find((u) => u.active && u.email.toLowerCase() === normalizedEmail);
    if (found) user = found;
  }

  if (!user || !user.active) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const verifyUser: PortalUserRecord = {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles ?? [],
    languages: user.languages ?? undefined,
    passwordHash: user.passwordHash,
    active: user.active,
    createdAt: user.createdAt ?? new Date().toISOString(),
  };

  if (!verifyPortalPassword(password, verifyUser)) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const session = await createPortalSession(user.id);
  const { passwordHash, ...sanitized } = user as UserLike;
  return NextResponse.json({ token: session.token, user: sanitized, mustReset: sanitized.mustReset ?? false });
}
