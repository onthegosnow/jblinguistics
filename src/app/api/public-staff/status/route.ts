import { NextResponse } from "next/server";
import { getPublicStaff, getPublicStaffStatus } from "@/lib/public-staff";

export async function GET() {
  const list = await getPublicStaff();
  const status = getPublicStaffStatus();
  return NextResponse.json({
    source: status.source,
    reason: status.reason,
    count: list.length,
    slugs: list.map((p) => p.slug).slice(0, 10),
  });
}
