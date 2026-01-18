import crypto from "crypto";
import { createSupabaseAdminClient } from "../supabase-server";

// ============================================
// TYPES
// ============================================

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type PlacementQuestion = {
  id: string;
  language: string;
  cefrLevel: CEFRLevel;
  questionText: string;
  questionType: "multiple_choice" | "fill_blank" | "true_false";
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  explanation?: string;
  skillArea?: "grammar" | "vocabulary" | "reading" | "listening" | "writing";
  topic?: string;
  difficultyWeight: number;
  active: boolean;
  timesShown: number;
  timesCorrect: number;
  source?: string;
  createdAt: string;
};

export type PlacementTest = {
  id: string;
  studentId?: string;
  guestName?: string;
  guestEmail?: string;
  language: string;
  questionCount: number;
  timeLimitMinutes: number;
  status: "not_started" | "in_progress" | "completed" | "abandoned" | "expired";
  startedAt?: string;
  completedAt?: string;
  lastActivityAt?: string;
  currentQuestionIndex: number;
  totalCorrect?: number;
  totalAnswered?: number;
  percentageScore?: number;
  scoreA1?: number;
  scoreA2?: number;
  scoreB1?: number;
  scoreB2?: number;
  scoreC1?: number;
  scoreC2?: number;
  recommendedLevel?: CEFRLevel;
  accessCode?: string;
  organizationId?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  finalLevel?: CEFRLevel;
  createdAt: string;
};

export type TestQuestion = {
  id: string;
  testId: string;
  questionId: string;
  questionOrder: number;
  selectedAnswer?: string;
  isCorrect?: boolean;
  answeredAt?: string;
  timeSpentSeconds?: number;
  flaggedForReview: boolean;
  // Joined question data
  question?: PlacementQuestion;
};

export type PlacementTestCode = {
  id: string;
  code: string;
  language: string;
  organizationId?: string;
  studentId?: string;
  maxUses: number;
  uses: number;
  active: boolean;
  expiresAt?: string;
  label?: string;
  notes?: string;
  createdAt: string;
};

export type QuestionStats = {
  cefrLevel: CEFRLevel;
  totalQuestions: number;
  activeQuestions: number;
  avgCorrectRate: number;
};

// ============================================
// QUESTION MANAGEMENT
// ============================================

export async function listQuestions(options?: {
  language?: string;
  cefrLevel?: CEFRLevel;
  skillArea?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ questions: PlacementQuestion[]; total: number }> {
  const supabase = createSupabaseAdminClient();

  let query = supabase.from("placement_questions").select("*", { count: "exact" });

  if (options?.language) query = query.eq("language", options.language);
  if (options?.cefrLevel) query = query.eq("cefr_level", options.cefrLevel);
  if (options?.skillArea) query = query.eq("skill_area", options.skillArea);
  if (options?.active !== undefined) query = query.eq("active", options.active);

  query = query.order("cefr_level").order("created_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    questions: (data || []).map(mapQuestionRow),
    total: count || 0,
  };
}

export async function getQuestionById(id: string): Promise<PlacementQuestion | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("placement_questions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapQuestionRow(data);
}

export async function createQuestion(input: {
  language: string;
  cefrLevel: CEFRLevel;
  questionText: string;
  questionType?: "multiple_choice" | "fill_blank" | "true_false";
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  explanation?: string;
  skillArea?: "grammar" | "vocabulary" | "reading" | "listening" | "writing";
  topic?: string;
  difficultyWeight?: number;
  source?: string;
  createdBy?: string;
}): Promise<PlacementQuestion> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("placement_questions")
    .insert({
      language: input.language.toLowerCase(),
      cefr_level: input.cefrLevel,
      question_text: input.questionText,
      question_type: input.questionType || "multiple_choice",
      option_a: input.optionA || null,
      option_b: input.optionB || null,
      option_c: input.optionC || null,
      option_d: input.optionD || null,
      correct_answer: input.correctAnswer,
      explanation: input.explanation || null,
      skill_area: input.skillArea || null,
      topic: input.topic || null,
      difficulty_weight: input.difficultyWeight || 1,
      source: input.source || "manual",
      created_by: input.createdBy || null,
      active: true,
      times_shown: 0,
      times_correct: 0,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapQuestionRow(data);
}

export async function updateQuestion(
  id: string,
  updates: Partial<Omit<PlacementQuestion, "id" | "createdAt">>
): Promise<PlacementQuestion | null> {
  const supabase = createSupabaseAdminClient();

  const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };

  if (updates.questionText !== undefined) dbUpdates.question_text = updates.questionText;
  if (updates.optionA !== undefined) dbUpdates.option_a = updates.optionA;
  if (updates.optionB !== undefined) dbUpdates.option_b = updates.optionB;
  if (updates.optionC !== undefined) dbUpdates.option_c = updates.optionC;
  if (updates.optionD !== undefined) dbUpdates.option_d = updates.optionD;
  if (updates.correctAnswer !== undefined) dbUpdates.correct_answer = updates.correctAnswer;
  if (updates.explanation !== undefined) dbUpdates.explanation = updates.explanation;
  if (updates.skillArea !== undefined) dbUpdates.skill_area = updates.skillArea;
  if (updates.topic !== undefined) dbUpdates.topic = updates.topic;
  if (updates.difficultyWeight !== undefined) dbUpdates.difficulty_weight = updates.difficultyWeight;
  if (updates.active !== undefined) dbUpdates.active = updates.active;

  const { data, error } = await supabase
    .from("placement_questions")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return mapQuestionRow(data);
}

export async function bulkImportQuestions(
  questions: Array<{
    language: string;
    cefrLevel: CEFRLevel;
    questionText: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer: string;
    explanation?: string;
    skillArea?: string;
    topic?: string;
  }>,
  createdBy?: string
): Promise<{ imported: number; errors: string[] }> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const errors: string[] = [];
  let imported = 0;

  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    const rows = batch.map((q, idx) => {
      try {
        return {
          language: q.language.toLowerCase(),
          cefr_level: q.cefrLevel,
          question_text: q.questionText,
          question_type: "multiple_choice",
          option_a: q.optionA || null,
          option_b: q.optionB || null,
          option_c: q.optionC || null,
          option_d: q.optionD || null,
          correct_answer: q.correctAnswer,
          explanation: q.explanation || null,
          skill_area: q.skillArea || null,
          topic: q.topic || null,
          difficulty_weight: 1,
          source: "imported",
          created_by: createdBy || null,
          active: true,
          times_shown: 0,
          times_correct: 0,
          created_at: now,
          updated_at: now,
        };
      } catch (err) {
        errors.push(`Row ${i + idx + 1}: ${err instanceof Error ? err.message : "Invalid data"}`);
        return null;
      }
    }).filter(Boolean);

    if (rows.length > 0) {
      const { error } = await supabase.from("placement_questions").insert(rows);
      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        imported += rows.length;
      }
    }
  }

  return { imported, errors };
}

export async function getQuestionStats(language: string): Promise<QuestionStats[]> {
  const supabase = createSupabaseAdminClient();

  // Use a higher limit since Supabase defaults to 1000 rows
  const { data, error } = await supabase
    .from("placement_questions")
    .select("cefr_level, active, times_shown, times_correct")
    .eq("language", language)
    .limit(10000);

  if (error || !data) return [];

  // Aggregate manually
  const stats: Record<string, { total: number; active: number; shown: number; correct: number }> = {};
  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  levels.forEach((level) => {
    stats[level] = { total: 0, active: 0, shown: 0, correct: 0 };
  });

  data.forEach((row: any) => {
    const level = row.cefr_level as CEFRLevel;
    if (stats[level]) {
      stats[level].total++;
      if (row.active) stats[level].active++;
      stats[level].shown += row.times_shown || 0;
      stats[level].correct += row.times_correct || 0;
    }
  });

  return levels.map((level) => ({
    cefrLevel: level,
    totalQuestions: stats[level].total,
    activeQuestions: stats[level].active,
    avgCorrectRate: stats[level].shown > 0
      ? Math.round((stats[level].correct / stats[level].shown) * 10000) / 100
      : 0,
  }));
}

// ============================================
// TEST MANAGEMENT
// ============================================

export async function createPlacementTest(input: {
  language: string;
  studentId?: string;
  guestName?: string;
  guestEmail?: string;
  questionCount?: number;
  timeLimitMinutes?: number;
  accessCode?: string;
  organizationId?: string;
}): Promise<PlacementTest> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const questionCount = input.questionCount || 100; // Default to 100 questions

  // Create the test record
  const { data: test, error: testError } = await supabase
    .from("placement_tests")
    .insert({
      language: input.language.toLowerCase(),
      student_id: input.studentId || null,
      guest_name: input.guestName || null,
      guest_email: input.guestEmail || null,
      question_count: questionCount,
      time_limit_minutes: input.timeLimitMinutes || 120,
      status: "not_started",
      current_question_index: 0,
      access_code: input.accessCode || null,
      organization_id: input.organizationId || null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (testError) throw new Error(testError.message);

  // Generate random questions for the test using weighted distribution
  // Distribution: 30% A1, 30% A2, 20% B1, 10% B2, 5% C1, 5% C2
  // This prioritizes lower levels for placement tests to establish a floor
  const levelDistribution: { level: CEFRLevel; percentage: number }[] = [
    { level: "A1", percentage: 30 },
    { level: "A2", percentage: 30 },
    { level: "B1", percentage: 20 },
    { level: "B2", percentage: 10 },
    { level: "C1", percentage: 5 },
    { level: "C2", percentage: 5 },
  ];

  const selectedQuestions: { questionId: string; order: number }[] = [];
  let currentOrder = 1;
  let remaining = questionCount;

  for (const { level, percentage } of levelDistribution) {
    const countForLevel = Math.round((questionCount * percentage) / 100);
    const actualCount = Math.min(countForLevel, remaining);

    if (actualCount > 0) {
      const { data: levelQuestions } = await supabase
        .from("placement_questions")
        .select("id")
        .eq("language", input.language.toLowerCase())
        .eq("cefr_level", level)
        .eq("active", true)
        .order("random()")
        .limit(actualCount);

      if (levelQuestions) {
        levelQuestions.forEach((q: any) => {
          selectedQuestions.push({ questionId: q.id, order: currentOrder++ });
        });
        remaining -= levelQuestions.length;
      }
    }
  }

  // Fill any remaining with random questions from any level
  if (remaining > 0) {
    const existingIds = selectedQuestions.map((q) => q.questionId);
    const notInClause = existingIds.length > 0 ? `(${existingIds.join(",")})` : "()";
    const { data: extraQuestions } = await supabase
      .from("placement_questions")
      .select("id")
      .eq("language", input.language.toLowerCase())
      .eq("active", true)
      .not("id", "in", notInClause)
      .order("random()")
      .limit(remaining);

    if (extraQuestions) {
      extraQuestions.forEach((q: any) => {
        selectedQuestions.push({ questionId: q.id, order: currentOrder++ });
      });
    }
  }

  // Shuffle the questions for randomized order
  for (let i = selectedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
  }

  // Re-assign order numbers after shuffle
  selectedQuestions.forEach((q, idx) => {
    q.order = idx + 1;
  });

  // Insert test questions
  const testQuestionRows = selectedQuestions.map((q) => ({
    test_id: test.id,
    question_id: q.questionId,
    question_order: q.order,
    flagged_for_review: false,
  }));

  const { error: questionsError } = await supabase
    .from("placement_test_questions")
    .insert(testQuestionRows);

  if (questionsError) {
    // Cleanup test if questions failed
    await supabase.from("placement_tests").delete().eq("id", test.id);
    throw new Error(questionsError.message);
  }

  return mapTestRow(test);
}

export async function getPlacementTest(testId: string): Promise<PlacementTest | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("placement_tests")
    .select("*")
    .eq("id", testId)
    .maybeSingle();

  if (error || !data) return null;
  return mapTestRow(data);
}

export async function getTestQuestion(
  testId: string,
  questionOrder: number
): Promise<TestQuestion | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("placement_test_questions")
    .select(`
      *,
      placement_questions!question_id (*)
    `)
    .eq("test_id", testId)
    .eq("question_order", questionOrder)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    testId: data.test_id,
    questionId: data.question_id,
    questionOrder: data.question_order,
    selectedAnswer: data.selected_answer ?? undefined,
    isCorrect: data.is_correct ?? undefined,
    answeredAt: data.answered_at ?? undefined,
    timeSpentSeconds: data.time_spent_seconds ?? undefined,
    flaggedForReview: data.flagged_for_review ?? false,
    question: data.placement_questions ? mapQuestionRow(data.placement_questions) : undefined,
  };
}

export async function startTest(testId: string): Promise<PlacementTest> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("placement_tests")
    .update({
      status: "in_progress",
      started_at: now,
      last_activity_at: now,
      current_question_index: 1,
      updated_at: now,
    })
    .eq("id", testId)
    .eq("status", "not_started")
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapTestRow(data);
}

export async function answerQuestion(input: {
  testId: string;
  questionOrder: number;
  answer: string;
  timeSpentSeconds?: number;
}): Promise<{ isCorrect: boolean; nextQuestion: number | null }> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  // Get the test question with correct answer
  const { data: testQuestion } = await supabase
    .from("placement_test_questions")
    .select(`
      id,
      question_id,
      placement_questions!question_id (correct_answer)
    `)
    .eq("test_id", input.testId)
    .eq("question_order", input.questionOrder)
    .maybeSingle();

  if (!testQuestion) throw new Error("Question not found");

  const correctAnswer = (testQuestion as any).placement_questions?.correct_answer;
  const isCorrect = input.answer.toUpperCase() === correctAnswer?.toUpperCase();

  // Update the answer
  await supabase
    .from("placement_test_questions")
    .update({
      selected_answer: input.answer,
      is_correct: isCorrect,
      answered_at: now,
      time_spent_seconds: input.timeSpentSeconds || null,
    })
    .eq("id", testQuestion.id);

  // Update question statistics (best effort, don't block on this)
  try {
    await supabase.rpc("increment_question_stats", {
      p_question_id: testQuestion.question_id,
      p_is_correct: isCorrect,
    });
  } catch {
    // RPC doesn't exist yet, skip stats update
  }

  // Get test info for next question
  const { data: test } = await supabase
    .from("placement_tests")
    .select("question_count, current_question_index")
    .eq("id", input.testId)
    .single();

  const nextQuestion = input.questionOrder < (test?.question_count || 200)
    ? input.questionOrder + 1
    : null;

  // Update test progress
  await supabase
    .from("placement_tests")
    .update({
      current_question_index: nextQuestion || test?.question_count,
      last_activity_at: now,
      updated_at: now,
    })
    .eq("id", input.testId);

  return { isCorrect, nextQuestion };
}

export async function completeTest(testId: string): Promise<PlacementTest> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  // Get all answers with their question levels
  const { data: answers } = await supabase
    .from("placement_test_questions")
    .select(`
      is_correct,
      selected_answer,
      placement_questions!question_id (cefr_level)
    `)
    .eq("test_id", testId);

  if (!answers) throw new Error("No answers found");

  // Calculate scores
  const levelScores: Record<CEFRLevel, { correct: number; total: number }> = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
    C2: { correct: 0, total: 0 },
  };

  let totalCorrect = 0;
  let totalAnswered = 0;

  answers.forEach((a: any) => {
    const level = a.placement_questions?.cefr_level as CEFRLevel;
    if (level && levelScores[level]) {
      levelScores[level].total++;
      if (a.selected_answer) {
        totalAnswered++;
        if (a.is_correct) {
          totalCorrect++;
          levelScores[level].correct++;
        }
      }
    }
  });

  // Calculate percentages
  const calcPercentage = (correct: number, total: number) =>
    total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;

  const scoreA1 = calcPercentage(levelScores.A1.correct, levelScores.A1.total);
  const scoreA2 = calcPercentage(levelScores.A2.correct, levelScores.A2.total);
  const scoreB1 = calcPercentage(levelScores.B1.correct, levelScores.B1.total);
  const scoreB2 = calcPercentage(levelScores.B2.correct, levelScores.B2.total);
  const scoreC1 = calcPercentage(levelScores.C1.correct, levelScores.C1.total);
  const scoreC2 = calcPercentage(levelScores.C2.correct, levelScores.C2.total);
  const percentageScore = calcPercentage(totalCorrect, totalAnswered);

  // Determine recommended level (70% threshold)
  const threshold = 70;
  let recommendedLevel: CEFRLevel = "A1";
  if (scoreC2 >= threshold) recommendedLevel = "C2";
  else if (scoreC1 >= threshold) recommendedLevel = "C1";
  else if (scoreB2 >= threshold) recommendedLevel = "B2";
  else if (scoreB1 >= threshold) recommendedLevel = "B1";
  else if (scoreA2 >= threshold) recommendedLevel = "A2";

  // Update test
  const { data, error } = await supabase
    .from("placement_tests")
    .update({
      status: "completed",
      completed_at: now,
      total_correct: totalCorrect,
      total_answered: totalAnswered,
      percentage_score: percentageScore,
      score_a1: scoreA1,
      score_a2: scoreA2,
      score_b1: scoreB1,
      score_b2: scoreB2,
      score_c1: scoreC1,
      score_c2: scoreC2,
      recommended_level: recommendedLevel,
      updated_at: now,
    })
    .eq("id", testId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapTestRow(data);
}

export async function listPlacementTests(options?: {
  studentId?: string;
  organizationId?: string;
  language?: string;
  status?: string;
  limit?: number;
}): Promise<PlacementTest[]> {
  const supabase = createSupabaseAdminClient();

  let query = supabase.from("placement_tests").select("*").order("created_at", { ascending: false });

  if (options?.studentId) query = query.eq("student_id", options.studentId);
  if (options?.organizationId) query = query.eq("organization_id", options.organizationId);
  if (options?.language) query = query.eq("language", options.language);
  if (options?.status) query = query.eq("status", options.status);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;

  if (error) return [];
  return (data || []).map(mapTestRow);
}

// Get pending placement test codes for a student (tests assigned but not started)
export async function getStudentPendingTests(studentId: string): Promise<Array<{
  code: string;
  language: string;
  expiresAt?: string;
  label?: string;
}>> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("placement_test_codes")
    .select("code, language, expires_at, label")
    .eq("student_id", studentId)
    .eq("active", true)
    .gt("max_uses", 0)
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  if (error || !data) return [];

  // Filter out codes that have reached their usage limit
  return data
    .filter((row: any) => (row.uses || 0) < (row.max_uses || 1))
    .map((row: any) => ({
      code: row.code,
      language: row.language,
      expiresAt: row.expires_at ?? undefined,
      label: row.label ?? undefined,
    }));
}

// Get student's placement test history (completed tests)
export async function getStudentPlacementHistory(studentId: string): Promise<PlacementTest[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("placement_tests")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapTestRow);
}

// ============================================
// ACCESS CODE MANAGEMENT
// ============================================

export async function createTestCode(input: {
  language: string;
  organizationId?: string;
  studentId?: string;
  maxUses?: number;
  expiresAt?: string;
  label?: string;
  notes?: string;
  createdBy?: string;
}): Promise<PlacementTestCode> {
  const supabase = createSupabaseAdminClient();
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();

  const { data, error } = await supabase
    .from("placement_test_codes")
    .insert({
      code,
      language: input.language.toLowerCase(),
      organization_id: input.organizationId || null,
      student_id: input.studentId || null,
      max_uses: input.maxUses || 1,
      uses: 0,
      active: true,
      expires_at: input.expiresAt || null,
      label: input.label || null,
      notes: input.notes || null,
      created_by: input.createdBy || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapTestCodeRow(data);
}

export async function verifyTestCode(code: string): Promise<{
  valid: boolean;
  language?: string;
  organizationId?: string;
  studentId?: string;
  label?: string;
  message?: string;
}> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("placement_test_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error || !data) {
    return { valid: false, message: "Invalid access code." };
  }

  if (!data.active) {
    return { valid: false, message: "This access code has been deactivated." };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, message: "This access code has expired." };
  }

  if (data.uses >= data.max_uses) {
    return { valid: false, message: "This access code has reached its usage limit." };
  }

  return {
    valid: true,
    language: data.language,
    organizationId: data.organization_id,
    studentId: data.student_id,
    label: data.label,
  };
}

export async function useTestCode(code: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("placement_test_codes")
    .update({ uses: supabase.rpc("increment_uses", { p_code: code }) })
    .eq("code", code.toUpperCase());

  // Fallback increment
  const { data } = await supabase
    .from("placement_test_codes")
    .select("uses")
    .eq("code", code.toUpperCase())
    .single();

  if (data) {
    await supabase
      .from("placement_test_codes")
      .update({ uses: (data.uses || 0) + 1 })
      .eq("code", code.toUpperCase());
  }
}

// ============================================
// MAPPING HELPERS
// ============================================

function mapQuestionRow(row: any): PlacementQuestion {
  return {
    id: row.id,
    language: row.language,
    cefrLevel: row.cefr_level,
    questionText: row.question_text,
    questionType: row.question_type,
    optionA: row.option_a ?? undefined,
    optionB: row.option_b ?? undefined,
    optionC: row.option_c ?? undefined,
    optionD: row.option_d ?? undefined,
    correctAnswer: row.correct_answer,
    explanation: row.explanation ?? undefined,
    skillArea: row.skill_area ?? undefined,
    topic: row.topic ?? undefined,
    difficultyWeight: row.difficulty_weight ?? 1,
    active: row.active ?? true,
    timesShown: row.times_shown ?? 0,
    timesCorrect: row.times_correct ?? 0,
    source: row.source ?? undefined,
    createdAt: row.created_at,
  };
}

function mapTestRow(row: any): PlacementTest {
  return {
    id: row.id,
    studentId: row.student_id ?? undefined,
    guestName: row.guest_name ?? undefined,
    guestEmail: row.guest_email ?? undefined,
    language: row.language,
    questionCount: row.question_count,
    timeLimitMinutes: row.time_limit_minutes,
    status: row.status,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    lastActivityAt: row.last_activity_at ?? undefined,
    currentQuestionIndex: row.current_question_index ?? 0,
    totalCorrect: row.total_correct ?? undefined,
    totalAnswered: row.total_answered ?? undefined,
    percentageScore: row.percentage_score != null ? Number(row.percentage_score) : undefined,
    scoreA1: row.score_a1 != null ? Number(row.score_a1) : undefined,
    scoreA2: row.score_a2 != null ? Number(row.score_a2) : undefined,
    scoreB1: row.score_b1 != null ? Number(row.score_b1) : undefined,
    scoreB2: row.score_b2 != null ? Number(row.score_b2) : undefined,
    scoreC1: row.score_c1 != null ? Number(row.score_c1) : undefined,
    scoreC2: row.score_c2 != null ? Number(row.score_c2) : undefined,
    recommendedLevel: row.recommended_level ?? undefined,
    accessCode: row.access_code ?? undefined,
    organizationId: row.organization_id ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewerNotes: row.reviewer_notes ?? undefined,
    finalLevel: row.final_level ?? undefined,
    createdAt: row.created_at,
  };
}

function mapTestCodeRow(row: any): PlacementTestCode {
  return {
    id: row.id,
    code: row.code,
    language: row.language,
    organizationId: row.organization_id ?? undefined,
    studentId: row.student_id ?? undefined,
    maxUses: row.max_uses,
    uses: row.uses,
    active: row.active,
    expiresAt: row.expires_at ?? undefined,
    label: row.label ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}
