import { NextRequest, NextResponse } from "next/server";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { getStudentsForTeacher } from "@/lib/server/student-auth";

// GET /api/portal/students - Get students assigned to the current teacher
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    const user = await requirePortalUserFromToken(token);

    const students = await getStudentsForTeacher(user.id);

    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
      })),
    });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to fetch students." },
      { status }
    );
  }
}
