import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { listCareerApplicantsFromSupabase } from "@/lib/server/careers-supabase";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("x-admin-token") ?? undefined;
    requireAdmin(token);
    const { active, rejected } = await listCareerApplicantsFromSupabase();
    return NextResponse.json({ applicants: active, rejectedApplicants: rejected });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to load applicants." }, { status });
  }
}
