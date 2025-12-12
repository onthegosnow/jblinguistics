import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { addInteraction, listInteractions } from "@/lib/server/crm-supabase";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const interactions = await listInteractions(id);
  return NextResponse.json({ interactions });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const body = (await request.json().catch(() => ({}))) as { kind?: string; summary?: string; nextFollowupAt?: string | null };
  if (!id) return NextResponse.json({ message: "Missing contact id" }, { status: 400 });
  const interaction = await addInteraction({
    contactId: id,
    kind: body.kind,
    summary: body.summary,
    nextFollowupAt: body.nextFollowupAt ?? null,
  });
  return NextResponse.json({ interaction });
}
