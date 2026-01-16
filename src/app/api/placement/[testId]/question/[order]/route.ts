import { NextRequest, NextResponse } from "next/server";
import {
  getPlacementTest,
  getTestQuestion,
  answerQuestion,
} from "@/lib/server/placement-tests";

// GET /api/placement/[testId]/question/[order] - Get a specific question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string; order: string }> }
) {
  try {
    const { testId, order } = await params;
    const questionOrder = parseInt(order, 10);

    if (isNaN(questionOrder) || questionOrder < 1) {
      return NextResponse.json({ message: "Invalid question order." }, { status: 400 });
    }

    const test = await getPlacementTest(testId);
    if (!test) {
      return NextResponse.json({ message: "Test not found." }, { status: 404 });
    }

    if (test.status !== "in_progress") {
      return NextResponse.json({ message: "Test is not in progress." }, { status: 400 });
    }

    // Check time limit
    if (test.startedAt) {
      const startTime = new Date(test.startedAt).getTime();
      const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
      if (elapsed > test.timeLimitMinutes) {
        return NextResponse.json({ message: "Time limit exceeded." }, { status: 400 });
      }
    }

    const testQuestion = await getTestQuestion(testId, questionOrder);
    if (!testQuestion || !testQuestion.question) {
      return NextResponse.json({ message: "Question not found." }, { status: 404 });
    }

    const q = testQuestion.question;

    // Return question without correct answer
    return NextResponse.json({
      questionOrder: testQuestion.questionOrder,
      totalQuestions: test.questionCount,
      question: {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        cefrLevel: q.cefrLevel, // Optionally hide this
      },
      selectedAnswer: testQuestion.selectedAnswer,
      flaggedForReview: testQuestion.flaggedForReview,
      // Time remaining
      timeRemainingMinutes: test.startedAt
        ? Math.max(0, test.timeLimitMinutes - (Date.now() - new Date(test.startedAt).getTime()) / 1000 / 60)
        : test.timeLimitMinutes,
    });
  } catch (err) {
    console.error("Get question error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to get question." },
      { status: 500 }
    );
  }
}

// POST /api/placement/[testId]/question/[order] - Answer a question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string; order: string }> }
) {
  try {
    const { testId, order } = await params;
    const questionOrder = parseInt(order, 10);

    if (isNaN(questionOrder) || questionOrder < 1) {
      return NextResponse.json({ message: "Invalid question order." }, { status: 400 });
    }

    const body = await request.json();
    const { answer, timeSpentSeconds } = body;

    if (!answer) {
      return NextResponse.json({ message: "Answer is required." }, { status: 400 });
    }

    const test = await getPlacementTest(testId);
    if (!test) {
      return NextResponse.json({ message: "Test not found." }, { status: 404 });
    }

    if (test.status !== "in_progress") {
      return NextResponse.json({ message: "Test is not in progress." }, { status: 400 });
    }

    // Check time limit
    if (test.startedAt) {
      const startTime = new Date(test.startedAt).getTime();
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      if (elapsed > test.timeLimitMinutes) {
        return NextResponse.json({ message: "Time limit exceeded." }, { status: 400 });
      }
    }

    const result = await answerQuestion({
      testId,
      questionOrder,
      answer,
      timeSpentSeconds,
    });

    return NextResponse.json({
      recorded: true,
      nextQuestion: result.nextQuestion,
      // Don't reveal if correct until test is complete
    });
  } catch (err) {
    console.error("Answer question error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to record answer." },
      { status: 500 }
    );
  }
}
