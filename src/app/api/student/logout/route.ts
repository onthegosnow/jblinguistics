import { NextRequest, NextResponse } from "next/server";
import { invalidateStudentSession } from "@/lib/server/student-auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-student-token") ?? undefined;
    await invalidateStudentSession(token);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Student logout error:", err);
    return NextResponse.json({ success: true }); // Always return success for logout
  }
}
