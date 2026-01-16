import { NextRequest, NextResponse } from "next/server";
import { invalidateOrgAdminSession } from "@/lib/server/organization-auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    await invalidateOrgAdminSession(token);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Organization logout error:", err);
    return NextResponse.json(
      { message: "Logout failed." },
      { status: 500 }
    );
  }
}
