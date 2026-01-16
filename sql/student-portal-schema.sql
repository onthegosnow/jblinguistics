-- Student Portal Schema for JBLinguistics
-- Run this in Supabase SQL Editor to create the student management tables

-- Students table (student accounts)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  timezone TEXT,
  preferred_language TEXT,
  active BOOLEAN DEFAULT true,
  must_reset BOOLEAN DEFAULT false,
  google_classroom_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student sessions (auth tokens)
CREATE TABLE IF NOT EXISTS student_sessions (
  token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Student enrollments (course enrollments linking students to teachers)
CREATE TABLE IF NOT EXISTS student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  language TEXT NOT NULL,
  current_level TEXT DEFAULT 'A1' CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  target_level TEXT CHECK (target_level IS NULL OR target_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  start_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  google_classroom_course_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student progress (track level completions)
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES student_enrollments(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  completed_at TIMESTAMP WITH TIME ZONE,
  assessed_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  assessment_score INTEGER CHECK (assessment_score IS NULL OR (assessment_score >= 0 AND assessment_score <= 100)),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student certificates (issued CEFR certificates)
CREATE TABLE IF NOT EXISTS student_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES student_enrollments(id) ON DELETE SET NULL,
  language TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  certificate_number TEXT UNIQUE NOT NULL,
  issued_date DATE DEFAULT CURRENT_DATE,
  issued_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  pdf_path TEXT,
  valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student class attendance (track attendance in classes)
CREATE TABLE IF NOT EXISTS student_class_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES student_enrollments(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES portal_assignments(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  attended BOOLEAN DEFAULT false,
  duration_minutes INTEGER,
  notes TEXT,
  recorded_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_student_sessions_student ON student_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_sessions_expires ON student_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_teacher ON student_enrollments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_status ON student_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_enrollment ON student_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_student_certificates_student ON student_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_student_certificates_number ON student_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_student_attendance_student ON student_class_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_enrollment ON student_class_attendance(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_date ON student_class_attendance(session_date);

-- Function to generate certificate numbers
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
  new_number TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  -- Get count of certificates this year + 1
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0')
  INTO seq_part
  FROM student_certificates
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

  new_number := 'JBL-' || year_part || '-' || seq_part;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_enrollments_updated_at
  BEFORE UPDATE ON student_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (enable Row Level Security)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_class_attendance ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for API routes)
CREATE POLICY "Service role has full access to students" ON students
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to student_sessions" ON student_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to student_enrollments" ON student_enrollments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to student_progress" ON student_progress
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to student_certificates" ON student_certificates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to student_class_attendance" ON student_class_attendance
  FOR ALL USING (auth.role() = 'service_role');
