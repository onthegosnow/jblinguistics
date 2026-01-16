import { NextRequest, NextResponse } from "next/server";
import { verifyCertificate } from "@/lib/server/student-auth";

/**
 * Public API to verify a certificate by its number
 * No authentication required - this is meant for public verification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;

    if (!number) {
      return NextResponse.json({ message: "Certificate number required." }, { status: 400 });
    }

    const result = await verifyCertificate(number);

    if (!result) {
      return NextResponse.json({
        verified: false,
        message: "Certificate not found.",
      });
    }

    if (!result.valid) {
      return NextResponse.json({
        verified: false,
        message: "This certificate has been revoked.",
        certificate: {
          number: result.certificate?.certificateNumber,
          language: result.certificate?.language,
          level: result.certificate?.level,
          issuedDate: result.certificate?.issuedDate,
        },
      });
    }

    return NextResponse.json({
      verified: true,
      studentName: result.studentName,
      certificate: {
        number: result.certificate?.certificateNumber,
        language: result.certificate?.language,
        level: result.certificate?.level,
        issuedDate: result.certificate?.issuedDate,
      },
    });
  } catch (err) {
    console.error("Certificate verification error:", err);
    return NextResponse.json(
      { message: "Failed to verify certificate." },
      { status: 500 }
    );
  }
}
