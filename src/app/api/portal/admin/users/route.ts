import { NextRequest, NextResponse } from "next/server";
import {
  addPortalUser,
  createPortalPasswordHash,
  listPortalUsers,
  PortalUserRole,
  requireAdmin,
} from "@/lib/server/storage";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const users = await listPortalUsers();
  return NextResponse.json({
    users: users.map((user) => {
      const sanitized = { ...user };
      delete (sanitized as { passwordHash?: string }).passwordHash;
      return sanitized;
    }),
  });
}

export async function POST(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
    roles?: PortalUserRole[];
    languages?: string[];
  };

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ message: "Name, email, and password are required." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const users = await listPortalUsers();
  if (users.some((u) => u.email === email)) {
    return NextResponse.json({ message: "A user with that email already exists." }, { status: 409 });
  }

  const newUser = await addPortalUser({
    name: body.name.trim(),
    email,
    passwordHash: createPortalPasswordHash(body.password),
    roles: body.roles?.length ? body.roles : ["teacher"],
    languages: body.languages ?? [],
    active: true,
  });

  const sanitized = { ...newUser };
  delete (sanitized as { passwordHash?: string }).passwordHash;
  return NextResponse.json({ user: sanitized }, { status: 201 });
}
