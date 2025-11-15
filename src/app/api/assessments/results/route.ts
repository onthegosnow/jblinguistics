import { NextResponse } from "next/server";
import { listSubmissions, requireAdmin } from "@/lib/server/storage";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const results = await listSubmissions();
    return NextResponse.json({ results });
  } catch (err) {
    const status = (err as NodeJS.ErrnoException).statusCode || 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to load results." }, { status });
  }
}
