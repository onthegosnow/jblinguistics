import { NextRequest, NextResponse } from "next/server";
import { verifyTestCode } from "@/lib/server/placement-tests";

// GET /api/placement/verify-code?code=XXX - Verify an access code without using it
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ valid: false, message: "Code is required." }, { status: 400 });
    }

    const verification = await verifyTestCode(code);

    if (!verification.valid) {
      return NextResponse.json({
        valid: false,
        message: verification.message || "Invalid or expired access code.",
      });
    }

    return NextResponse.json({
      valid: true,
      language: verification.language,
      label: verification.label,
      organizationId: verification.organizationId,
    });
  } catch (err) {
    console.error("Code verification error:", err);
    return NextResponse.json(
      { valid: false, message: "Failed to verify code." },
      { status: 500 }
    );
  }
}
