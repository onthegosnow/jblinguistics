import { NextResponse } from "next/server";
import { listApplications, requireAdmin } from "@/lib/server/storage";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const applications = await listApplications();
    const sanitized = applications.map(({ resume, resumeInsights, ...rest }) => ({
      ...rest,
      resumeInsights,
      resume: {
        filename: resume.filename,
        mimeType: resume.mimeType,
        size: resume.size,
      },
    }));
    return NextResponse.json({ applicants: sanitized });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to load applicants." }, { status });
  }
}
