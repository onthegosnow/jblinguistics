import { NextRequest, NextResponse } from "next/server";
import { getApplicationById, requireAdmin } from "@/lib/server/storage";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const { id } = await params;
    const record = await getApplicationById(id);
    if (!record) {
      return NextResponse.json({ message: "Application not found." }, { status: 404 });
    }
    const bytes = Buffer.from(record.resume.data, "base64");
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": record.resume.mimeType,
        "Content-Length": record.resume.size.toString(),
        "Content-Disposition": `attachment; filename="${record.resume.filename.replace(/"/g, "'")}"`,
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
