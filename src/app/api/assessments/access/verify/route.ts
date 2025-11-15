import { NextResponse } from "next/server";
import { listAccessCodes, saveAccessCodes } from "@/lib/server/storage";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.code) {
      return NextResponse.json({ message: "Access code required." }, { status: 400 });
    }
    const normalized = String(body.code).toUpperCase();
    const codes = await listAccessCodes();
    const idx = codes.findIndex((entry) => entry.code === normalized);
    if (idx === -1) {
      return NextResponse.json({ message: "Access code not found." }, { status: 404 });
    }
    const record = codes[idx];
    if (!record.active) {
      return NextResponse.json({ message: "Access code deactivated. Contact JB Linguistics." }, { status: 403 });
    }
    if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
      return NextResponse.json({ message: "Access code expired." }, { status: 403 });
    }
    if (record.uses >= record.maxUses) {
      return NextResponse.json({ message: "Access code already used the maximum number of times." }, { status: 403 });
    }
    record.uses += 1;
    record.lastUsedAt = new Date().toISOString();
    codes[idx] = record;
    await saveAccessCodes(codes);
    return NextResponse.json({
      code: record.code,
      label: record.label,
      candidateName: record.candidateName,
      candidateEmail: record.candidateEmail,
    });
  } catch (err) {
    console.error("Access verify error", err);
    return NextResponse.json({ message: "Unable to verify access code." }, { status: 500 });
  }
}
