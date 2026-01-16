-- Placement Test Schema for JBLinguistics
-- Run this in Supabase SQL Editor to create the placement test system tables
-- Features: 2000 questions per language, random 200-question tests, CEFR levels (A1-C2)

-- ============================================
-- PLACEMENT QUESTION BANK
-- ============================================
-- Stores all questions for placement tests (2000 per language, ~333 per level)
CREATE TABLE IF NOT EXISTS placement_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Language and Level
  language TEXT NOT NULL, -- e.g., 'english', 'german', 'spanish'
  cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),

  -- Question content
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'fill_blank', 'true_false')),

  -- Answer options (for multiple choice)
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL, -- 'A', 'B', 'C', 'D' or actual text for fill_blank

  -- Explanation (shown after test)
  explanation TEXT,

  -- Categorization
  skill_area TEXT CHECK (skill_area IN ('grammar', 'vocabulary', 'reading', 'listening', 'writing')),
  topic TEXT, -- e.g., 'verb_tenses', 'articles', 'pronouns', 'business', 'travel'

  -- Metadata
  difficulty_weight INTEGER DEFAULT 1 CHECK (difficulty_weight BETWEEN 1 AND 3), -- 1=easy, 2=medium, 3=hard within level
  active BOOLEAN DEFAULT true,
  times_shown INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,

  -- Source tracking
  source TEXT, -- e.g., 'imported', 'manual', 'ai_generated'
  created_by UUID REFERENCES portal_users(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PLACEMENT TESTS (Test instances)
-- ============================================
CREATE TABLE IF NOT EXISTS placement_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Test taker
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  -- For anonymous/pre-registration tests:
  guest_name TEXT,
  guest_email TEXT,

  -- Test configuration
  language TEXT NOT NULL,
  question_count INTEGER DEFAULT 200,
  time_limit_minutes INTEGER DEFAULT 120, -- 2 hours default

  -- Test state
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,

  -- Progress tracking
  current_question_index INTEGER DEFAULT 0,

  -- Results (populated on completion)
  total_correct INTEGER,
  total_answered INTEGER,
  percentage_score DECIMAL(5,2),

  -- Level breakdown scores
  score_a1 DECIMAL(5,2),
  score_a2 DECIMAL(5,2),
  score_b1 DECIMAL(5,2),
  score_b2 DECIMAL(5,2),
  score_c1 DECIMAL(5,2),
  score_c2 DECIMAL(5,2),

  -- Final placement
  recommended_level TEXT CHECK (recommended_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),

  -- Access control
  access_code TEXT, -- Optional access code for corporate tests
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Review
  reviewed_by UUID REFERENCES portal_users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  final_level TEXT CHECK (final_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')), -- Can override recommended

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PLACEMENT TEST QUESTIONS (Questions in a specific test)
-- ============================================
-- Links questions to a test instance with randomized order
CREATE TABLE IF NOT EXISTS placement_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES placement_tests(id) ON DELETE CASCADE,
  question_id UUID REFERENCES placement_questions(id) ON DELETE CASCADE,

  -- Order in test
  question_order INTEGER NOT NULL,

  -- Student's answer
  selected_answer TEXT, -- NULL if not answered
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER, -- Time spent on this question

  -- For review
  flagged_for_review BOOLEAN DEFAULT false,

  UNIQUE(test_id, question_order)
);

-- ============================================
-- PLACEMENT TEST ACCESS CODES
-- ============================================
-- For corporate or controlled test access
CREATE TABLE IF NOT EXISTS placement_test_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,

  -- Configuration
  language TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Limits
  max_uses INTEGER DEFAULT 1,
  uses INTEGER DEFAULT 0,

  -- Validity
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  label TEXT, -- e.g., "Acme Corp Batch 1"
  notes TEXT,
  created_by UUID REFERENCES portal_users(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_placement_questions_language ON placement_questions(language);
CREATE INDEX IF NOT EXISTS idx_placement_questions_level ON placement_questions(cefr_level);
CREATE INDEX IF NOT EXISTS idx_placement_questions_language_level ON placement_questions(language, cefr_level);
CREATE INDEX IF NOT EXISTS idx_placement_questions_active ON placement_questions(active);
CREATE INDEX IF NOT EXISTS idx_placement_questions_skill ON placement_questions(skill_area);

CREATE INDEX IF NOT EXISTS idx_placement_tests_student ON placement_tests(student_id);
CREATE INDEX IF NOT EXISTS idx_placement_tests_status ON placement_tests(status);
CREATE INDEX IF NOT EXISTS idx_placement_tests_language ON placement_tests(language);
CREATE INDEX IF NOT EXISTS idx_placement_tests_org ON placement_tests(organization_id);
CREATE INDEX IF NOT EXISTS idx_placement_tests_created ON placement_tests(created_at);

CREATE INDEX IF NOT EXISTS idx_placement_test_questions_test ON placement_test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_placement_test_questions_question ON placement_test_questions(question_id);

CREATE INDEX IF NOT EXISTS idx_placement_test_codes_code ON placement_test_codes(code);
CREATE INDEX IF NOT EXISTS idx_placement_test_codes_org ON placement_test_codes(organization_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_placement_questions_updated_at
  BEFORE UPDATE ON placement_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_placement_tests_updated_at
  BEFORE UPDATE ON placement_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE placement_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_test_codes ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "Service role has full access to placement_questions" ON placement_questions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to placement_tests" ON placement_tests
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to placement_test_questions" ON placement_test_questions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to placement_test_codes" ON placement_test_codes
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate a random test with 200 questions distributed across levels
-- Distribution: ~33 questions per level (A1-C2) = 198, plus 2 random = 200
CREATE OR REPLACE FUNCTION generate_placement_test(
  p_language TEXT,
  p_question_count INTEGER DEFAULT 200
)
RETURNS TABLE (question_id UUID, question_order INTEGER) AS $$
DECLARE
  questions_per_level INTEGER;
  remainder INTEGER;
  current_order INTEGER := 1;
  level_record RECORD;
  levels TEXT[] := ARRAY['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  level TEXT;
BEGIN
  -- Calculate distribution
  questions_per_level := p_question_count / 6; -- 33 per level for 200 questions
  remainder := p_question_count % 6; -- 2 extra questions

  -- Get questions for each level
  FOREACH level IN ARRAY levels LOOP
    FOR level_record IN
      SELECT pq.id
      FROM placement_questions pq
      WHERE pq.language = p_language
        AND pq.cefr_level = level
        AND pq.active = true
      ORDER BY RANDOM()
      LIMIT questions_per_level
    LOOP
      question_id := level_record.id;
      question_order := current_order;
      current_order := current_order + 1;
      RETURN NEXT;
    END LOOP;
  END LOOP;

  -- Add remainder questions randomly from any level
  IF remainder > 0 THEN
    FOR level_record IN
      SELECT pq.id
      FROM placement_questions pq
      WHERE pq.language = p_language
        AND pq.active = true
        AND pq.id NOT IN (
          SELECT q.question_id FROM generate_placement_test(p_language, p_question_count - remainder) q
        )
      ORDER BY RANDOM()
      LIMIT remainder
    LOOP
      question_id := level_record.id;
      question_order := current_order;
      current_order := current_order + 1;
      RETURN NEXT;
    END LOOP;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate placement level based on scores
CREATE OR REPLACE FUNCTION calculate_placement_level(
  p_score_a1 DECIMAL,
  p_score_a2 DECIMAL,
  p_score_b1 DECIMAL,
  p_score_b2 DECIMAL,
  p_score_c1 DECIMAL,
  p_score_c2 DECIMAL
)
RETURNS TEXT AS $$
DECLARE
  passing_threshold DECIMAL := 70.0; -- 70% to pass a level
BEGIN
  -- Work backwards from highest level
  IF p_score_c2 >= passing_threshold THEN
    RETURN 'C2';
  ELSIF p_score_c1 >= passing_threshold THEN
    RETURN 'C1';
  ELSIF p_score_b2 >= passing_threshold THEN
    RETURN 'B2';
  ELSIF p_score_b1 >= passing_threshold THEN
    RETURN 'B1';
  ELSIF p_score_a2 >= passing_threshold THEN
    RETURN 'A2';
  ELSE
    RETURN 'A1';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get question statistics
CREATE OR REPLACE FUNCTION get_question_stats(p_language TEXT)
RETURNS TABLE (
  cefr_level TEXT,
  total_questions BIGINT,
  active_questions BIGINT,
  avg_correct_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pq.cefr_level,
    COUNT(*) as total_questions,
    COUNT(*) FILTER (WHERE pq.active = true) as active_questions,
    CASE
      WHEN SUM(pq.times_shown) > 0
      THEN ROUND(SUM(pq.times_correct)::DECIMAL / SUM(pq.times_shown) * 100, 2)
      ELSE 0
    END as avg_correct_rate
  FROM placement_questions pq
  WHERE pq.language = p_language
  GROUP BY pq.cefr_level
  ORDER BY
    CASE pq.cefr_level
      WHEN 'A1' THEN 1
      WHEN 'A2' THEN 2
      WHEN 'B1' THEN 3
      WHEN 'B2' THEN 4
      WHEN 'C1' THEN 5
      WHEN 'C2' THEN 6
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA STRUCTURE
-- ============================================
-- Example of how questions should be structured:
/*
INSERT INTO placement_questions (language, cefr_level, question_text, option_a, option_b, option_c, option_d, correct_answer, skill_area, topic)
VALUES
-- A1 Grammar Examples
('english', 'A1', 'She ___ a student.', 'am', 'is', 'are', 'be', 'B', 'grammar', 'verb_to_be'),
('english', 'A1', 'They ___ from Germany.', 'is', 'am', 'are', 'be', 'C', 'grammar', 'verb_to_be'),
('english', 'A1', 'I ___ a book.', 'has', 'have', 'having', 'had', 'B', 'grammar', 'have_has'),

-- A2 Grammar Examples
('english', 'A2', 'She ___ to work every day.', 'go', 'goes', 'going', 'went', 'B', 'grammar', 'present_simple'),
('english', 'A2', 'I ___ my homework yesterday.', 'do', 'did', 'done', 'doing', 'B', 'grammar', 'past_simple'),

-- B1 Grammar Examples
('english', 'B1', 'If I ___ rich, I would travel the world.', 'am', 'was', 'were', 'be', 'C', 'grammar', 'conditionals'),
('english', 'B1', 'The book ___ by millions of people.', 'has read', 'has been read', 'is reading', 'reads', 'B', 'grammar', 'passive_voice'),

-- B2 Grammar Examples
('english', 'B2', 'Had I known about the meeting, I ___ attended.', 'would', 'would have', 'will have', 'had', 'B', 'grammar', 'third_conditional'),
('english', 'B2', 'She suggested that he ___ the doctor.', 'sees', 'see', 'saw', 'seeing', 'B', 'grammar', 'subjunctive'),

-- C1 Grammar Examples
('english', 'C1', 'Hardly ___ arrived when the phone rang.', 'I had', 'had I', 'I have', 'have I', 'B', 'grammar', 'inversion'),
('english', 'C1', 'The proposal, ___ merits are undeniable, was rejected.', 'which', 'whose', 'that', 'whom', 'B', 'grammar', 'relative_clauses'),

-- C2 Grammar Examples
('english', 'C2', 'Were it not for his intervention, the situation ___ deteriorated further.', 'would', 'would have', 'will have', 'might', 'B', 'grammar', 'subjunctive_inversion'),
('english', 'C2', 'The committee''s decision, notwithstanding ___ protestations to the contrary, was final.', 'their', 'its', 'his', 'her', 'A', 'grammar', 'formal_register');
*/
