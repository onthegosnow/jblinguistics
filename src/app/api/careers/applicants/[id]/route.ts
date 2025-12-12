import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { deleteCareerApplicantFromSupabase } from "@/lib/server/careers-supabase";
import { sendRejectionEmail } from "@/lib/server/portal-supabase";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ message: "Missing applicant id" }, { status: 400 });
    }
    const removed = await deleteCareerApplicantFromSupabase(id);
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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ message: "Missing applicant id" }, { status: 400 });
    }
    const body = (await request.json().catch(() => ({}))) as { action?: string; interviewNotes?: string };

    if (body.action === "note") {
      const supabase = createSupabaseAdminClient();
      const { error } = await supabase
        .from("career_applications")
        .update({ interview_notes: body.interviewNotes ?? null })
        .eq("id", id);
      if (error) {
        const msg = error.message.includes("column") ? "Add column interview_notes to career_applications" : error.message;
        return NextResponse.json({ message: msg }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (body.action !== "reject") {
      return NextResponse.json({ message: "Unsupported action" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("career_applications")
      .select("id, name, email, roles")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      return NextResponse.json({ message: error?.message || "Applicant not found" }, { status: 404 });
    }

    const firstRole = Array.isArray(data.roles) && data.roles.length ? data.roles[0] : "Teacher/Translator";
    await sendRejectionEmail(data.email ?? "", data.name ?? "", firstRole);
    // Remove the record after sending rejection
    await deleteCareerApplicantFromSupabase(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to reject applicant." }, { status });
  }
}
