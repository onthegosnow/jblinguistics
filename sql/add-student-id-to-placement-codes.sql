-- Add student_id column to placement_test_codes for linking codes to specific students
-- Run this migration to enable student portal integration

-- Add student_id column
ALTER TABLE placement_test_codes
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE CASCADE;

-- Create index for faster lookups by student
CREATE INDEX IF NOT EXISTS idx_placement_test_codes_student ON placement_test_codes(student_id);

-- Comment for documentation
COMMENT ON COLUMN placement_test_codes.student_id IS 'Links the access code to a specific student account for portal integration';
