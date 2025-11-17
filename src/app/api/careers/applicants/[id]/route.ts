import { NextRequest, NextResponse } from "next/server";
import { deleteApplicationById, requireAdmin } from "@/lib/server/storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ message: "Missing applicant id" }, { status: 400 });
    }
    const removed = await deleteApplicationById(id);
    if (!removed) {
      return NextResponse.json({ message: "Applicant not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to delete applicant." }, { status });
  }
}
