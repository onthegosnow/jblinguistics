import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import {
  listQuestions,
  createQuestion,
  bulkImportQuestions,
  getQuestionStats,
  type CEFRLevel,
} from "@/lib/server/placement-tests";

// GET /api/portal/admin/placement/questions - List questions
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    requireAdmin(token);

    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") ?? undefined;
    const cefrLevel = searchParams.get("level") as CEFRLevel | undefined;
    const skillArea = searchParams.get("skill") ?? undefined;
    const active = searchParams.get("active");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    // If requesting stats only
    if (searchParams.get("stats") === "true" && language) {
      const stats = await getQuestionStats(language);
      return NextResponse.json({ stats });
    }

    const { questions, total } = await listQuestions({
      language,
      cefrLevel,
      skillArea,
      active: active !== null ? active === "true" : undefined,
      limit,
      offset,
    });

    return NextResponse.json({ questions, total, limit, offset });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to list questions." },
      { status }
    );
  }
}

// POST /api/portal/admin/placement/questions - Create or import questions
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    requireAdmin(token);

    const body = await request.json();

    // Bulk import
    if (Array.isArray(body.questions)) {
      const result = await bulkImportQuestions(body.questions);
      return NextResponse.json({
        imported: result.imported,
        errors: result.errors,
      });
    }

    // Single question creation
    const { language, cefrLevel, questionText, optionA, optionB, optionC, optionD, correctAnswer, explanation, skillArea, topic, difficultyWeight } = body;

    if (!language || !cefrLevel || !questionText || !correctAnswer) {
      return NextResponse.json(
        { message: "Language, level, question text, and correct answer are required." },
        { status: 400 }
      );
    }

    const question = await createQuestion({
      language,
      cefrLevel,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
      skillArea,
      topic,
      difficultyWeight,
      source: "manual",
    });

    return NextResponse.json({ question });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to create question." },
      { status }
    );
  }
}
