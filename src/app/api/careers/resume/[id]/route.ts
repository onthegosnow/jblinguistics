import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { downloadCareerApplicantResume } from "@/lib/server/careers-supabase";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const { id } = await params;
    const resume = await downloadCareerApplicantResume(id);
    return new NextResponse(resume.buffer, {
      headers: {
        "Content-Type": resume.mimeType,
        "Content-Length": resume.size.toString(),
        "Content-Disposition": `attachment; filename="${resume.filename.replace(/"/g, "'")}"`,
      },
    });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to download resume." }, { status });
  }
}
