# JB Linguistics · Admin & Portal

Next.js app with:
- Admin panel at `/assessments/admin` (token-protected).
- Teacher/Translator portal at `/portal`.
- Supabase for data/storage (applicants, portal users, Hive resources, assignments, etc.).
- SMTP for portal emails; DocuSign webhook; OCR API.

## Requirements
- Node 18+ (project builds with Next 16 / Turbopack).
- Supabase project (schema below).
- SMTP creds for portal emails.
- DocuSign keys if using webhooks.

## Environment variables
Create `.env.local` (or set in Vercel):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ASSESSMENT_ADMIN_SECRET=  # admin token for /assessments/admin

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CAREER_APPLICATION_EMAIL=

HIVE_BUCKET=hive-mind      # Supabase storage bucket for Hive (default)

OCR_API_URL=
OCR_API_KEY=

DOCUSIGN_USER_ID=
DOCUSIGN_BASE_URL=
DOCUSIGN_ACCOUNT_ID=
DOCUSIGN_INTEGRATION_KEY=
DOCUSIGN_PRIVATE_KEY=
DOCUSIGN_HMAC_SECRET=
```

## Supabase schema (run in SQL editor)
```sql
-- Portal users
alter table portal_users add column if not exists must_reset boolean default false;

-- Hive files
create table if not exists hive_files (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  display_name text not null,
  language text,
  level text,
  skill text,
  topic text,
  file_type text,
  teacher_name text,
  teacher_initials text,
  date text,
  size numeric,
  mime_type text,
  uploaded_by uuid,
  uploaded_by_email text,
  uploaded_at timestamptz default now(),
  approved_at timestamptz,
  status text default 'pending',
  notes text
);

alter table hive_files enable row level security;
drop policy if exists hive_files_service_role on hive_files;
create policy hive_files_service_role on hive_files for all using (true) with check (true);

-- Career applicants (keep rejected separate from deletes)
alter table career_applications add column if not exists status text default 'active';
alter table career_applications add column if not exists rejected_at timestamptz;
```

Storage:
- Create bucket `hive-mind` (or set `HIVE_BUCKET`).
- Files upload to `06 - Teacher Submissions/Pending Review/...`; admin approval moves them to curriculum folders.

## Scripts
```
npm run dev     # local dev
npm run build   # prod build
npm run lint    # lint (if configured)
```

## Admin panel (/assessments/admin)
- Enter `ASSESSMENT_ADMIN_SECRET` to access.
- Tabs: Results, Access codes, Applicants, Onboarding, Assignments, Portal users, Inquiries, CRM, Active employees, Hive.

## Portal (/portal)
- Teachers/translators sign in; must reset on first login if flagged.
- Assignments tracking (hours, attendance, uploads).
- Hive section with dropdowns (language/level/skill/topic/file type) and uploads; auto-naming uses `[LEVEL]_[SKILL]_[TOPIC]_[FILETYPE]_[INITIALS]_[YYYYMMDD]`.
- Pending uploads visible to the uploader; admins approve in the Hive tab.

## Notes / TODO
- Tests are not set up. Consider adding Jest/Vitest for API smoke tests.
- Keep secrets only in env; `.env.local` is gitignored.
- If setting portal passwords via SQL, hash with SHA-256 to match app verification:
  `update portal_users set password_hash = encode(digest('TempPass123!'::text,'sha256'),'hex') ...;`
