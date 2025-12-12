const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const root = process.env.JB_STORAGE_DIR || path.join(process.cwd(), 'tmp');
const files = {
  time: path.join(root, 'portal-time-entries.json'),
  attendance: path.join(root, 'portal-attendance-records.json'),
  uploads: path.join(root, 'portal-assignment-uploads.json'),
  results: path.join(root, 'assessment-results.json'),
  access: path.join(root, 'assessment-access-codes.json'),
};

function readJson(file, fallback = []) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE envs');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function upsertTimeEntries() {
  const items = readJson(files.time, []);
  if (!items.length) return;
  const rows = items.map((t) => ({
    id: t.id,
    assignment_id: t.assignmentId,
    user_id: t.userId,
    hours: t.hours,
    notes: t.notes ?? null,
    logged_at: t.date ?? t.createdAt ?? new Date().toISOString(),
  }));
  await supabase.from('portal_time_entries').upsert(rows, { onConflict: 'id' });
  console.log(`Upserted time entries: ${rows.length}`);
}

async function upsertAttendance() {
  const items = readJson(files.attendance, []);
  if (!items.length) return;
  const rows = items.map((a) => ({
    id: a.id,
    assignment_id: a.assignmentId,
    user_id: a.userId,
    session_date: a.sessionDate ?? a.createdAt ?? new Date().toISOString(),
    attended: a.participants?.[0]?.attended ?? true,
    notes: a.participants?.[0]?.notes ?? null,
  }));
  await supabase.from('portal_attendance').upsert(rows, { onConflict: 'id' });
  console.log(`Upserted attendance: ${rows.length}`);
}

async function upsertUploads() {
  const items = readJson(files.uploads, []);
  if (!items.length) return;
  const rows = items.map((u) => ({
    id: u.id,
    assignment_id: u.assignmentId,
    user_id: u.userId,
    category: u.category ?? 'support',
    filename: u.filename,
    mime_type: u.mimeType ?? null,
    size: u.size ?? null,
    data: u.data ?? null,
    uploaded_at: u.uploadedAt ?? new Date().toISOString(),
  }));
  await supabase.from('portal_assignment_uploads').upsert(rows, { onConflict: 'id' });
  console.log(`Upserted uploads: ${rows.length}`);
}

async function upsertResults() {
  const items = readJson(files.results, []);
  if (!items.length) return;
  const rows = items.map((r) => ({
    id: r.id,
    submitted_at: r.submittedAt ?? new Date().toISOString(),
    candidate_name: r.candidateName ?? null,
    candidate_email: r.candidateEmail ?? null,
    proctor_email: r.proctorEmail ?? null,
    test_language: r.testLanguage ?? null,
    summary: r.summary ?? null,
    access_meta: r.accessMeta ?? r.access ?? null,
  }));
  await supabase.from('assessment_results').upsert(rows, { onConflict: 'id' });
  console.log(`Upserted assessment results: ${rows.length}`);
}

async function upsertAccessCodes() {
  const items = readJson(files.access, []);
  if (!items.length) return;
  const rows = items.map((c) => ({
    code: c.code,
    label: c.label ?? null,
    candidate_name: c.candidateName ?? null,
    candidate_email: c.candidateEmail ?? null,
    max_uses: c.maxUses ?? c.max_uses ?? 1,
    uses: c.uses ?? 0,
    active: c.active ?? true,
    created_at: c.createdAt ?? new Date().toISOString(),
    expires_at: c.expiresAt ?? null,
    last_used_at: c.lastUsedAt ?? null,
    notes: c.notes ?? null,
  }));
  await supabase.from('assessment_access_codes').upsert(rows, { onConflict: 'code' });
  console.log(`Upserted access codes: ${rows.length}`);
}

(async () => {
  await upsertTimeEntries();
  await upsertAttendance();
  await upsertUploads();
  await upsertResults();
  await upsertAccessCodes();
  console.log('Migration complete.');
})();
