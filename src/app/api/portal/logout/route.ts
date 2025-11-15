import { NextRequest, NextResponse } from "next/server";
import { invalidatePortalSession } from "@/lib/server/storage";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? (await request.json().catch(() => ({}))).token;
  if (!token) {
    return NextResponse.json({ message: "No session token provided." }, { status: 400 });
  }
  await invalidatePortalSession(token);
  return NextResponse.json({ message: "Logged out." });
}
