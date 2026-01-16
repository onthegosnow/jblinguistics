-- Corporate Client Portal Schema for JBLinguistics
-- Run this in Supabase SQL Editor to create the corporate client management tables

-- ============================================
-- ORGANIZATIONS (Corporate Clients/Companies)
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier

  -- Contact info
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  billing_email TEXT,

  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,

  -- Contract details
  contract_start_date DATE,
  contract_end_date DATE,
  contracted_hours_per_month INTEGER, -- Total hours contracted
  contracted_services TEXT[], -- Array of service types: 'language_training', 'translation', 'interpretation', 'localization'

  -- Billing
  billing_rate_hourly DECIMAL(10,2), -- Rate per hour for training
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  payment_terms_days INTEGER DEFAULT 30,

  -- Settings
  require_attendance_approval BOOLEAN DEFAULT false,
  allow_employee_self_register BOOLEAN DEFAULT false,
  logo_url TEXT,

  -- Status
  active BOOLEAN DEFAULT true,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORGANIZATION ADMINS (Company portal users)
-- ============================================
CREATE TABLE IF NOT EXISTS organization_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'viewer')),
  -- admin: full access
  -- manager: can manage employees, view reports
  -- viewer: read-only access to reports

  phone TEXT,
  active BOOLEAN DEFAULT true,
  must_reset BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, email)
);

-- ============================================
-- ORGANIZATION ADMIN SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS organization_admin_sessions (
  token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES organization_admins(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ============================================
-- ORGANIZATION EMPLOYEES (Students linked to company)
-- ============================================
-- Links students table to organizations
CREATE TABLE IF NOT EXISTS organization_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,

  -- Employee info (company's internal tracking)
  employee_id TEXT, -- Company's internal employee ID
  department TEXT,
  job_title TEXT,
  manager_name TEXT,
  manager_email TEXT,

  -- Training allocation
  allocated_hours_per_month INTEGER, -- Hours this employee is allocated

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, student_id)
);

-- ============================================
-- TRAINING SESSIONS (Hours tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES student_enrollments(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,

  -- Session details
  session_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER NOT NULL,

  -- Type
  session_type TEXT DEFAULT 'individual' CHECK (session_type IN ('individual', 'group', 'self_study', 'assessment')),

  -- Content
  topics_covered TEXT,
  materials_used TEXT,
  homework_assigned TEXT,

  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  cancellation_reason TEXT,

  -- Approval workflow (for corporate audit)
  approved_by_teacher BOOLEAN DEFAULT false,
  teacher_approved_at TIMESTAMP WITH TIME ZONE,
  approved_by_org BOOLEAN, -- NULL = pending, true = approved, false = disputed
  org_approved_at TIMESTAMP WITH TIME ZONE,
  org_approved_by UUID REFERENCES organization_admins(id),
  dispute_reason TEXT,

  -- Billing
  billable BOOLEAN DEFAULT true,
  billed BOOLEAN DEFAULT false,
  invoice_id UUID, -- Link to future invoices table

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORGANIZATION SERVICES (Non-training services)
-- ============================================
CREATE TABLE IF NOT EXISTS organization_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Service type
  service_type TEXT NOT NULL CHECK (service_type IN ('translation', 'interpretation', 'localization', 'transcription', 'proofreading', 'other')),

  -- Request details
  title TEXT NOT NULL,
  description TEXT,
  source_language TEXT,
  target_language TEXT,

  -- Files (paths to encrypted storage)
  source_files TEXT[], -- Array of file paths
  delivered_files TEXT[],

  -- Timeline
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deadline DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'quoted', 'approved', 'in_progress', 'review', 'delivered', 'completed', 'cancelled')),

  -- Pricing
  quoted_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  word_count INTEGER,

  -- Assignment
  assigned_to UUID REFERENCES portal_users(id),

  -- Approval
  approved_by UUID REFERENCES organization_admins(id),
  approved_at TIMESTAMP WITH TIME ZONE,

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORGANIZATION INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS organization_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  invoice_number TEXT UNIQUE NOT NULL, -- JBL-INV-2025-000001

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Amounts
  training_hours DECIMAL(10,2) DEFAULT 0,
  training_amount DECIMAL(10,2) DEFAULT 0,
  services_amount DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'disputed')),

  -- Dates
  issued_date DATE,
  due_date DATE,
  paid_date DATE,

  -- Payment
  payment_method TEXT,
  payment_reference TEXT,

  pdf_path TEXT, -- Generated invoice PDF

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG (For compliance)
-- ============================================
CREATE TABLE IF NOT EXISTS organization_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Actor
  actor_type TEXT NOT NULL CHECK (actor_type IN ('org_admin', 'jbl_admin', 'teacher', 'student', 'system')),
  actor_id UUID,
  actor_name TEXT,

  -- Action
  action TEXT NOT NULL, -- e.g., 'session_logged', 'session_approved', 'invoice_generated', 'document_uploaded'
  resource_type TEXT, -- e.g., 'training_session', 'invoice', 'employee'
  resource_id UUID,

  -- Details
  details JSONB, -- Flexible JSON for action-specific data
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(active);

CREATE INDEX IF NOT EXISTS idx_org_admins_org ON organization_admins(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_admins_email ON organization_admins(email);

CREATE INDEX IF NOT EXISTS idx_org_admin_sessions_admin ON organization_admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_org_admin_sessions_expires ON organization_admin_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_org_employees_org ON organization_employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_employees_student ON organization_employees(student_id);
CREATE INDEX IF NOT EXISTS idx_org_employees_status ON organization_employees(status);

CREATE INDEX IF NOT EXISTS idx_training_sessions_org ON training_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_student ON training_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_teacher ON training_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_training_sessions_billing ON training_sessions(billable, billed);

CREATE INDEX IF NOT EXISTS idx_org_services_org ON organization_services(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_services_status ON organization_services(status);
CREATE INDEX IF NOT EXISTS idx_org_services_type ON organization_services(service_type);

CREATE INDEX IF NOT EXISTS idx_org_invoices_org ON organization_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invoices_status ON organization_invoices(status);
CREATE INDEX IF NOT EXISTS idx_org_invoices_number ON organization_invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_org_audit_org ON organization_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_audit_created ON organization_audit_log(created_at);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_admins_updated_at
  BEFORE UPDATE ON organization_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_employees_updated_at
  BEFORE UPDATE ON organization_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_services_updated_at
  BEFORE UPDATE ON organization_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_invoices_updated_at
  BEFORE UPDATE ON organization_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role policies (for API routes)
CREATE POLICY "Service role has full access to organizations" ON organizations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to organization_admins" ON organization_admins
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to organization_admin_sessions" ON organization_admin_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to organization_employees" ON organization_employees
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to training_sessions" ON training_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to organization_services" ON organization_services
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to organization_invoices" ON organization_invoices
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to organization_audit_log" ON organization_audit_log
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
  new_number TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0')
  INTO seq_part
  FROM organization_invoices
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

  new_number := 'JBL-INV-' || year_part || '-' || seq_part;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Calculate total training hours for a period
CREATE OR REPLACE FUNCTION get_org_training_hours(
  p_org_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
  total_minutes INTEGER;
BEGIN
  SELECT COALESCE(SUM(duration_minutes), 0)
  INTO total_minutes
  FROM training_sessions
  WHERE organization_id = p_org_id
    AND session_date BETWEEN p_start_date AND p_end_date
    AND status = 'completed'
    AND billable = true;

  RETURN ROUND(total_minutes / 60.0, 2);
END;
$$ LANGUAGE plpgsql;
