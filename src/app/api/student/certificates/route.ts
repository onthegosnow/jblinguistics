import { NextRequest, NextResponse } from "next/server";
import { requireStudentFromToken, getStudentCertificates } from "@/lib/server/student-auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-student-token") ?? undefined;
    const student = await requireStudentFromToken(token);

    const certificates = await getStudentCertificates(student.id);

    return NextResponse.json({ certificates });
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to load certificates." },
      { status }
    );
  }
}
