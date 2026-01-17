import { NextRequest, NextResponse } from "next/server";
import { checkAllHiveLinks } from "@/lib/server/link-checker";

export async function GET(request: NextRequest) {
  // Verify cron secret for Vercel cron jobs
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await checkAllHiveLinks();
    console.log(`[Hive Link Check] Checked ${results.total} links: ${results.valid} valid, ${results.dead} dead, ${results.errors} errors`);
    return NextResponse.json({
      success: true,
      results: {
        total: results.total,
        valid: results.valid,
        dead: results.dead,
        errors: results.errors,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Link check failed.";
    console.error(`[Hive Link Check] Error: ${message}`);
    return NextResponse.json({ message }, { status: 500 });
  }
}
