import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { getQuestionById, updateQuestion } from "@/lib/server/placement-tests";

// GET /api/portal/admin/placement/questions/[id] - Get a question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    requireAdmin(token);
    const { id } = await params;

    const question = await getQuestionById(id);
    if (!question) {
      return NextResponse.json({ message: "Question not found." }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to get question." },
      { status }
    );
  }
}

// PATCH /api/portal/admin/placement/questions/[id] - Update a question
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    requireAdmin(token);
    const { id } = await params;

    const body = await request.json();

    const question = await updateQuestion(id, body);
    if (!question) {
      return NextResponse.json({ message: "Question not found." }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update question." },
      { status }
    );
  }
}
