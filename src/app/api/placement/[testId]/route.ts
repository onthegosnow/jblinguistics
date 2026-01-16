import { NextRequest, NextResponse } from "next/server";
import {
  getPlacementTest,
  startTest,
  completeTest,
} from "@/lib/server/placement-tests";

// GET /api/placement/[testId] - Get test status and results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params;

    const test = await getPlacementTest(testId);
    if (!test) {
      return NextResponse.json({ message: "Test not found." }, { status: 404 });
    }

    // Don't expose correct answers in the response
    return NextResponse.json({
      id: test.id,
      language: test.language,
      status: test.status,
      questionCount: test.questionCount,
      timeLimitMinutes: test.timeLimitMinutes,
      currentQuestionIndex: test.currentQuestionIndex,
      startedAt: test.startedAt,
      completedAt: test.completedAt,
      // Only include results if completed
      ...(test.status === "completed" && {
        totalCorrect: test.totalCorrect,
        totalAnswered: test.totalAnswered,
        percentageScore: test.percentageScore,
        scoreA1: test.scoreA1,
        scoreA2: test.scoreA2,
        scoreB1: test.scoreB1,
        scoreB2: test.scoreB2,
        scoreC1: test.scoreC1,
        scoreC2: test.scoreC2,
        recommendedLevel: test.recommendedLevel,
        finalLevel: test.finalLevel,
      }),
    });
  } catch (err) {
    console.error("Get placement test error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to get test." },
      { status: 500 }
    );
  }
}

// POST /api/placement/[testId] - Start or complete the test
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params;
    const body = await request.json();
    const { action } = body;

    const test = await getPlacementTest(testId);
    if (!test) {
      return NextResponse.json({ message: "Test not found." }, { status: 404 });
    }

    if (action === "start") {
      if (test.status !== "not_started") {
        return NextResponse.json({ message: "Test has already been started." }, { status: 400 });
      }

      const updatedTest = await startTest(testId);
      return NextResponse.json({
        status: updatedTest.status,
        startedAt: updatedTest.startedAt,
        currentQuestionIndex: updatedTest.currentQuestionIndex,
      });
    }

    if (action === "complete") {
      if (test.status !== "in_progress") {
        return NextResponse.json({ message: "Test is not in progress." }, { status: 400 });
      }

      const completedTest = await completeTest(testId);
      return NextResponse.json({
        status: completedTest.status,
        completedAt: completedTest.completedAt,
        totalCorrect: completedTest.totalCorrect,
        totalAnswered: completedTest.totalAnswered,
        percentageScore: completedTest.percentageScore,
        scoreA1: completedTest.scoreA1,
        scoreA2: completedTest.scoreA2,
        scoreB1: completedTest.scoreB1,
        scoreB2: completedTest.scoreB2,
        scoreC1: completedTest.scoreC1,
        scoreC2: completedTest.scoreC2,
        recommendedLevel: completedTest.recommendedLevel,
      });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("Placement test action error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to process action." },
      { status: 500 }
    );
  }
}
