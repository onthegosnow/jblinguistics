import { NextResponse } from "next/server";
import { listAccessCodes, saveAccessCodes, requireAdmin } from "@/lib/server/storage";

export async function PATCH(request: Request, { params }: { params: { code: string } }) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const body = await request.json();
    const codes = await listAccessCodes();
    const idx = codes.findIndex((entry) => entry.code === params.code.toUpperCase());
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
    const status = (err as NodeJS.ErrnoException).statusCode || 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to update access code." }, { status });
  }
}
