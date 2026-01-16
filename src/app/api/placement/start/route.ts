import { NextRequest, NextResponse } from "next/server";
import {
  createPlacementTest,
  verifyTestCode,
  useTestCode,
} from "@/lib/server/placement-tests";

// POST /api/placement/start - Start a new placement test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language, name, email, accessCode, studentId } = body;

    if (!accessCode) {
      return NextResponse.json({ message: "Access code is required to start a placement test." }, { status: 400 });
    }

    if (!name && !studentId) {
      return NextResponse.json({ message: "Name is required for guest tests." }, { status: 400 });
    }

    // Verify access code (required)
    const verification = await verifyTestCode(accessCode);
    if (!verification.valid) {
      return NextResponse.json({ message: verification.message }, { status: 400 });
    }

    // Use the language from the access code
    const testLanguage = verification.language!;

    // If user specified a language, ensure it matches the code
    if (language && language.toLowerCase() !== testLanguage) {
      return NextResponse.json(
        { message: `This access code is for ${testLanguage} tests only.` },
        { status: 400 }
      );
    }

    const organizationId = verification.organizationId;
    // Use studentId from code if available, otherwise use provided studentId
    const effectiveStudentId = verification.studentId || studentId;

    // Increment usage
    await useTestCode(accessCode);

    // Create the test
    const test = await createPlacementTest({
      language: testLanguage,
      studentId: effectiveStudentId,
      guestName: name,
      guestEmail: email,
      accessCode,
      organizationId,
    });

    return NextResponse.json({
      testId: test.id,
      language: test.language,
      questionCount: test.questionCount,
      timeLimitMinutes: test.timeLimitMinutes,
    });
  } catch (err) {
    console.error("Placement test start error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to start test." },
      { status: 500 }
    );
  }
}
