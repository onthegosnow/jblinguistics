import { NextRequest, NextResponse } from "next/server";
import { listAccessCodes, saveAccessCodes, requireAdmin } from "@/lib/server/storage";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const body = await request.json();
    const codes = await listAccessCodes();
    const { code } = await params;
    const idx = codes.findIndex((entry) => entry.code === code.toUpperCase());
    if (idx === -1) {
      return NextResponse.json({ message: "Code not found." }, { status: 404 });
    }
    const current = codes[idx];
    codes[idx] = {
      ...current,
      label: body.label ?? current.label,
      candidateName: body.candidateName ?? current.candidateName,
      candidateEmail: body.candidateEmail ?? current.candidateEmail,
      active: typeof body.active === "boolean" ? body.active : current.active,
      maxUses: typeof body.maxUses === "number" && body.maxUses > 0 ? body.maxUses : current.maxUses,
      expiresAt: body.expiresAt ?? current.expiresAt,
      notes: body.notes ?? current.notes,
    };
    await saveAccessCodes(codes);
    return NextResponse.json({ code: codes[idx] });
  } catch (err) {
    const status = typeof (err as { statusCode?: number }).statusCode === "number" ? (err as { statusCode?: number }).statusCode! : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to update access code." }, { status });
  }
}
