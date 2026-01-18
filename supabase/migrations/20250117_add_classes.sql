-- Classes table (groups students with a teacher)
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'English',
  level TEXT NOT NULL DEFAULT 'A1',
  max_students INTEGER DEFAULT 10,
  status TEXT DEFAULT 'active', -- active, archived, cancelled
  created_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class enrollments (students in classes)
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  enrolled_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active', -- active, dropped, completed
  UNIQUE(class_id, student_id)
);

-- Class sessions (scheduled meetings)
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  recurring_pattern TEXT, -- 'weekly', 'biweekly', 'monthly', null for one-time
  recurring_end_date DATE, -- When recurring pattern ends
  meeting_url TEXT, -- Teams/Zoom link
  meeting_id TEXT, -- External meeting ID for API integration
  meeting_provider TEXT, -- 'teams', 'zoom', 'google_meet', 'custom'
  location TEXT, -- Physical location if in-person
  session_type TEXT DEFAULT 'regular', -- regular, makeup, exam, orientation
  cancelled BOOLEAN DEFAULT false,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session attendance tracking
CREATE TABLE IF NOT EXISTS session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'scheduled', -- scheduled, present, absent, excused, late
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  notes TEXT,
  marked_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  marked_at TIMESTAMPTZ,
  UNIQUE(session_id, student_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_class_id ON class_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_start_time ON class_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_session_attendance_session_id ON session_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_session_attendance_student_id ON session_attendance(student_id);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Service role can manage classes" ON classes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage class_enrollments" ON class_enrollments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage class_sessions" ON class_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage session_attendance" ON session_attendance
  FOR ALL USING (true) WITH CHECK (true);
