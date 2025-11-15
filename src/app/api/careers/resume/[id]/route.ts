import { NextResponse } from "next/server";
import { getApplicationById, requireAdmin } from "@/lib/server/storage";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const record = await getApplicationById(params.id);
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
    const status = (err as NodeJS.ErrnoException).statusCode || 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to download resume." }, { status });
  }
}
