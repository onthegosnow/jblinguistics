import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  listPortalAssignments,
  requirePortalUserFromToken,
  updatePortalAssignment,
} from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? process.env.SMTP_USER;

async function sendWelcomeEmailToStudents(params: {
  students: Array<{ id: string; name: string; email: string }>;
  teacherName: string;
  className: string;
  client: string;
  schedule: string;
  startDate: string;
  endDate: string;
  meetingUrl?: string;
}) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("SMTP not configured, skipping welcome emails");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  for (const student of params.students) {
    const firstName = student.name?.split(" ")[0] || "there";

    const text = `Hi ${firstName},

Welcome to your ${params.className} class with JB Linguistics!

We're excited to have you join us. Here are the details for your upcoming class:

Class: ${params.className}
Client/Organization: ${params.client}
Teacher: ${params.teacherName}
Schedule: ${params.schedule}
Start Date: ${new Date(params.startDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
End Date: ${new Date(params.endDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
${params.meetingUrl ? `\nMeeting Link: ${params.meetingUrl}\n(Save this link - you'll use it to join each class session)` : ""}

Important Information:
• Class materials will be uploaded to your student portal on the day of each class, right at the start of class time
• Please log in to your student portal at https://jblinguistics.com/student to access your materials and track your progress
• If you have any questions before class, please don't hesitate to reach out

We look forward to seeing you in class!

Best regards,
The JB Linguistics Team`;

    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to: student.email,
        subject: `Welcome to ${params.className} - JB Linguistics`,
        text,
      });
      console.log(`Welcome email sent to ${student.email}`);
    } catch (err) {
      console.error(`Failed to send welcome email to ${student.email}:`, err);
    }
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);

  const body = (await request.json().catch(() => ({}))) as {
    assignmentId?: string;
    action?: "accept" | "reject";
    rejectionNote?: string;
  };

  if (!body.assignmentId || !body.action) {
    return NextResponse.json(
      { message: "assignmentId and action are required." },
      { status: 400 }
    );
  }

  // Get assignment and verify it's assigned to this user
  const assignments = await listPortalAssignments();
  const assignment = assignments.find((a) => a.id === body.assignmentId);

  if (!assignment) {
    return NextResponse.json({ message: "Assignment not found." }, { status: 404 });
  }

  if (!assignment.assignedTo.includes(user.id)) {
    return NextResponse.json({ message: "You are not assigned to this class." }, { status: 403 });
  }

  if (assignment.status !== "assigned") {
    return NextResponse.json(
      { message: `Cannot ${body.action} an assignment that is already ${assignment.status}.` },
      { status: 400 }
    );
  }

  if (assignment.assignmentType !== "class") {
    return NextResponse.json(
      { message: "Only class assignments can be accepted or rejected." },
      { status: 400 }
    );
  }

  try {
    const now = new Date().toISOString();

    if (body.action === "reject") {
      if (!body.rejectionNote?.trim()) {
        return NextResponse.json(
          { message: "Please provide a reason for rejecting the assignment." },
          { status: 400 }
        );
      }

      await updatePortalAssignment(body.assignmentId, (existing) => ({
        ...existing,
        status: "rejected",
        rejectedAt: now,
        rejectionNote: body.rejectionNote?.trim(),
      }));

      return NextResponse.json({ success: true, status: "rejected" });
    }

    if (body.action === "accept") {
      // Update assignment status
      await updatePortalAssignment(body.assignmentId, (existing) => ({
        ...existing,
        status: "accepted",
        acceptedAt: now,
      }));

      // Get student details for welcome emails
      if (assignment.participants.length > 0) {
        const supabase = createSupabaseAdminClient();
        const { data: students } = await supabase
          .from("students")
          .select("id, name, email")
          .in("id", assignment.participants)
          .eq("active", true);

        if (students && students.length > 0) {
          // Send welcome emails to all students
          await sendWelcomeEmailToStudents({
            students: students.map((s) => ({
              id: s.id,
              name: s.name,
              email: s.email,
            })),
            teacherName: user.name,
            className: assignment.title,
            client: assignment.client || "TBD",
            schedule: assignment.schedule || "Schedule TBD",
            startDate: assignment.startDate || now,
            endDate: assignment.dueDate || "",
            meetingUrl: assignment.meetingUrl,
          });
        }
      }

      return NextResponse.json({
        success: true,
        status: "accepted",
        studentsNotified: assignment.participants.length,
      });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process response";
    return NextResponse.json({ message }, { status: 500 });
  }
}
