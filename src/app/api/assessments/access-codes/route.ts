import { NextResponse } from "next/server";
import { listAccessCodes, saveAccessCodes, requireAdmin, type AccessCodeRecord } from "@/lib/server/storage";

function generateCode() {
  const chunk = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JB-${chunk()}-${chunk()}`;
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const codes = await listAccessCodes();
    return NextResponse.json({ codes });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to load access codes." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const body = await request.json();
    const codes = await listAccessCodes();
    const code = (body.code || generateCode()).toUpperCase();
    if (codes.some((entry) => entry.code === code)) {
      return NextResponse.json({ message: "Code already exists." }, { status: 409 });
    }
    const record: AccessCodeRecord = {
      code,
      label: body.label || `Access for ${body.candidateName || "candidate"}`,
      candidateName: body.candidateName,
      candidateEmail: body.candidateEmail,
      maxUses: body.maxUses && body.maxUses > 0 ? body.maxUses : 1,
      uses: 0,
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: body.expiresAt,
      notes: body.notes,
    };
    codes.push(record);
    await saveAccessCodes(codes);
    return NextResponse.json({ code: record });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to create access code." }, { status });
  }
}
