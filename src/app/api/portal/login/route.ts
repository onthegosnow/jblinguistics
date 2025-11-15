import { NextRequest, NextResponse } from "next/server";
import { createPortalSession, listPortalUsers, verifyPortalPassword } from "@/lib/server/storage";

export async function POST(request: NextRequest) {
  const { email, password } = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }
  const users = await listPortalUsers();
  const user = users.find((u) => u.active && u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !verifyPortalPassword(password, user)) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }
  const session = await createPortalSession(user.id);
  const sanitized = { ...user };
  delete (sanitized as { passwordHash?: string }).passwordHash;
  return NextResponse.json({ token: session.token, user: sanitized });
}
