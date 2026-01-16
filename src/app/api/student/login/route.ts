import { NextRequest, NextResponse } from "next/server";
import {
  getStudentByEmail,
  verifyStudentPassword,
  createStudentSession,
  updateStudentPassword,
} from "@/lib/server/student-auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      newPassword?: string;
    };

    if (!body.email || !body.password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const email = body.email.toLowerCase().trim();
    const student = await getStudentByEmail(email);

    if (!student) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    if (!student.active) {
      return NextResponse.json({ message: "Account is inactive. Please contact support." }, { status: 401 });
    }

    if (!verifyStudentPassword(body.password, student.passwordHash)) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    // Check if password reset required
    if (student.mustReset) {
      if (!body.newPassword) {
        return NextResponse.json(
          { message: "Password reset required.", mustReset: true },
          { status: 200 }
        );
      }

      // Validate new password
      if (body.newPassword.length < 8) {
        return NextResponse.json(
          { message: "New password must be at least 8 characters." },
          { status: 400 }
        );
      }

      // Update password
      await updateStudentPassword(student.id, body.newPassword);
    }

    // Create session
    const session = await createStudentSession(student.id);

    return NextResponse.json({
      token: session.token,
      expiresAt: session.expiresAt,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
    });
  } catch (err) {
    console.error("Student login error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Login failed." },
      { status: 500 }
    );
  }
}
