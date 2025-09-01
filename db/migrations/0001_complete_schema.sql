BEGIN;

-- 0001_complete_schema.sql
-- Complete, idempotent schema for orcareer project.
-- This migration is intended to be run against a fresh database.
-- It includes: extensions, master tables, domain tables, audit, helpers, RLS policies,
-- public views and grants suitable for the frontend anon role.

-- NOTE: If you already have earlier migrations applied, do NOT run this file as-is.
-- Instead, extract the missing parts or run in a test DB first.

-- === Extensions ===
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- === Helper functions (must be defined before usage) ===
CREATE OR REPLACE FUNCTION public.generate_public_id(length integer DEFAULT 10)
RETURNS text AS $$
DECLARE
  chars text := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  res text := '';
  rnd bytea;
  b int;
BEGIN
  IF length <= 0 THEN
    RETURN '';
  END IF;
  rnd := gen_random_bytes(length);
  FOR i IN 0..(length - 1) LOOP
    b := get_byte(rnd, i) % 62;
    res := res || substr(chars, b + 1, 1);
  END LOOP;
  RETURN res;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- === Master / lookup tables ===
CREATE TABLE IF NOT EXISTS public.company_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listing_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prefectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prefecture_id uuid NOT NULL REFERENCES public.prefectures(id) ON DELETE RESTRICT,
  name varchar(50) NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT areas_prefecture_name_unique UNIQUE (prefecture_id, name)
);
CREATE INDEX IF NOT EXISTS idx_areas_prefecture_id ON public.areas (prefecture_id);

CREATE TABLE IF NOT EXISTS public.internship_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) UNIQUE NOT NULL,
  category varchar(50),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_internship_tags_category ON public.internship_tags (category);

-- === Users and profiles ===
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id varchar(32) UNIQUE NOT NULL DEFAULT public.generate_public_id(10),
  auth0_user_id varchar(255) UNIQUE NOT NULL,
  email varchar(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  display_name varchar(255),
  avatar_url text,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_users_auth0_user_id ON public.users (auth0_user_id);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  last_name varchar(100) NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name_kana varchar(100) NOT NULL,
  first_name_kana varchar(100) NOT NULL,
  university varchar(255) NOT NULL,
  faculty varchar(255),
  department varchar(255),
  graduation_year integer NOT NULL CHECK (graduation_year >= 2020 AND graduation_year <= 2040),
  phone_number varchar(20) NOT NULL CHECK (phone_number ~ '^[0-9\-+()]+$'),
  postal_code varchar(10) NOT NULL CHECK (postal_code ~ '^\d{3}-?\d{4}$'),
  address text NOT NULL,
  birthday date NOT NULL CHECK (birthday >= '1900-01-01' AND birthday <= CURRENT_DATE),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_profiles_university ON public.user_profiles (university);
CREATE INDEX IF NOT EXISTS idx_user_profiles_graduation_year ON public.user_profiles (graduation_year);

CREATE TABLE IF NOT EXISTS public.user_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  self_pr text,
  gakuchika text,
  skill text,
  qualification text,
  portfolio_url varchar(500),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- === Companies and related tables ===
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id varchar(32) UNIQUE NOT NULL DEFAULT public.generate_public_id(10),
  name varchar(255) NOT NULL,
  name_kana varchar(255),
  logo_url varchar(500),
  website_url varchar(500),
  status_id uuid REFERENCES public.company_statuses(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_companies_status_id ON public.companies (status_id);
-- Additional performance indexes for search functionality
CREATE INDEX IF NOT EXISTS idx_companies_name_status ON public.companies (name, status_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies (created_at) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.company_overviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid UNIQUE NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  industry_id uuid REFERENCES public.industries(id),
  established_year integer,
  headquarters_address text,
  employee_count integer,
  listing_classification_id uuid REFERENCES public.listing_classifications(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_company_overviews_industry_id ON public.company_overviews (industry_id);
CREATE INDEX IF NOT EXISTS idx_company_overviews_listing_classification_id ON public.company_overviews (listing_classification_id);

CREATE TABLE IF NOT EXISTS public.company_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid UNIQUE NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  profile text,
  business_content text,
  headquarters_location text,
  offices text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_mvvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid UNIQUE NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  mission text,
  vision text,
  company_value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_name varchar(100),
  phone_number varchar(20),
  email varchar(255),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_company_contacts_company_id ON public.company_contacts (company_id);

CREATE TABLE IF NOT EXISTS public.company_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  area_id uuid NOT NULL REFERENCES public.areas(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT company_areas_company_area_unique UNIQUE (company_id, area_id)
);
CREATE INDEX IF NOT EXISTS idx_company_areas_company_id ON public.company_areas (company_id);
CREATE INDEX IF NOT EXISTS idx_company_areas_area_id ON public.company_areas (area_id);

-- === Internships / recruitments ===
CREATE TABLE IF NOT EXISTS public.internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title varchar(255),
  job_type_id uuid REFERENCES public.job_types(id),
  job_type_description text,
  job_description text,
  skills_to_acquire text,
  work_location varchar(255),
  work_hours varchar(255),
  hourly_wage varchar(100),
  required_skills text,
  preferred_skills text,
  selection_flow text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_internships_company_id ON public.internships (company_id);
CREATE INDEX IF NOT EXISTS idx_internships_job_type_id ON public.internships (job_type_id);

CREATE TABLE IF NOT EXISTS public.internship_tag_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.internship_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT internship_tag_relations_unique UNIQUE (internship_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_internship_tag_relations_internship_id ON public.internship_tag_relations (internship_id);
CREATE INDEX IF NOT EXISTS idx_internship_tag_relations_tag_id ON public.internship_tag_relations (tag_id);

CREATE TABLE IF NOT EXISTS public.internship_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  area_id uuid NOT NULL REFERENCES public.areas(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT internship_areas_unique UNIQUE (internship_id, area_id)
);
CREATE INDEX IF NOT EXISTS idx_internship_areas_internship_id ON public.internship_areas (internship_id);
CREATE INDEX IF NOT EXISTS idx_internship_areas_area_id ON public.internship_areas (area_id);

CREATE TABLE IF NOT EXISTS public.recruitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_type_id uuid REFERENCES public.job_types(id),
  job_type_description text,
  job_description text,
  work_location varchar(255),
  work_hours varchar(255),
  number_of_hires varchar(100),
  salary_bonus text,
  annual_holidays integer,
  holidays_leave text,
  benefits text,
  selection_flow text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recruitments_company_id ON public.recruitments (company_id);
CREATE INDEX IF NOT EXISTS idx_recruitments_job_type_id ON public.recruitments (job_type_id);

CREATE TABLE IF NOT EXISTS public.recruitment_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES public.recruitments(id) ON DELETE CASCADE,
  area_id uuid NOT NULL REFERENCES public.areas(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT recruitment_areas_unique UNIQUE (recruitment_id, area_id)
);
CREATE INDEX IF NOT EXISTS idx_recruitment_areas_recruitment_id ON public.recruitment_areas (recruitment_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_areas_area_id ON public.recruitment_areas (area_id);

-- === Favorites (企業・求人・インターン対応) ===
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  internship_id uuid REFERENCES public.internships(id) ON DELETE CASCADE,
  recruitment_id uuid REFERENCES public.recruitments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  -- 各ユーザーは同じ対象を重複してお気に入りできない
  CONSTRAINT favorites_user_company_unique UNIQUE (user_id, company_id),
  CONSTRAINT favorites_user_internship_unique UNIQUE (user_id, internship_id),
  CONSTRAINT favorites_user_recruitment_unique UNIQUE (user_id, recruitment_id),
  -- 必ず1つの対象が指定されている必要がある
  CONSTRAINT favorites_single_target CHECK (
    (company_id IS NOT NULL AND internship_id IS NULL AND recruitment_id IS NULL) OR
    (company_id IS NULL AND internship_id IS NOT NULL AND recruitment_id IS NULL) OR
    (company_id IS NULL AND internship_id IS NULL AND recruitment_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_company_id ON public.favorites (company_id);
CREATE INDEX IF NOT EXISTS idx_favorites_internship_id ON public.favorites (internship_id);
CREATE INDEX IF NOT EXISTS idx_favorites_recruitment_id ON public.favorites (recruitment_id);

-- === Applications (応募ログ) ===
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  internship_id uuid REFERENCES public.internships(id) ON DELETE SET NULL,
  recruitment_id uuid REFERENCES public.recruitments(id) ON DELETE SET NULL,
  source text, -- e.g. LINE URL or external redirect
  method varchar(50), -- e.g. 'LINE', 'WEB'
  metadata jsonb, -- free-form: which link, utm, etc.
  status varchar(50) DEFAULT 'initiated',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_company_id ON public.applications (company_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON public.applications (internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_recruitment_id ON public.applications (recruitment_id);

-- === Audit logs ===
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  record_id uuid,
  performed_by text,
  performed_at timestamptz DEFAULT now(),
  payload jsonb
);

CREATE OR REPLACE FUNCTION public.audit_changes() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.audit_logs(table_name, operation, record_id, performed_by, payload)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    COALESCE(current_setting('jwt.claims.sub', true), 'service'),
    row_to_json(COALESCE(NEW, OLD))::jsonb
  );
  RETURN NEW;
END;
$$;

-- Attach audit triggers for tables we want to monitor
DO $$
DECLARE
  tbl text;
  tables_to_watch text[] := ARRAY['users','companies','favorites','user_profiles','user_details','applications'];
BEGIN
  FOREACH tbl IN ARRAY tables_to_watch LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%s_trigger ON public.%s;', tbl, tbl);
    EXECUTE format('CREATE TRIGGER audit_%s_trigger AFTER INSERT OR UPDATE OR DELETE ON public.%s FOR EACH ROW EXECUTE FUNCTION public.audit_changes();', tbl, tbl);
  END LOOP;
END;
$$;

-- === Auth0 helper ===
CREATE OR REPLACE FUNCTION public.auth0_sub_to_user_id(auth0_sub text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM public.users WHERE auth0_user_id = auth0_sub LIMIT 1;
$$;

-- === updated_at helper ===
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- attach update_timestamp trigger to common tables
DO $$
BEGIN
  -- users
  EXECUTE 'DROP TRIGGER IF EXISTS trg_update_timestamp_on_users ON public.users';
  EXECUTE 'CREATE TRIGGER trg_update_timestamp_on_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_timestamp()';
  -- companies
  EXECUTE 'DROP TRIGGER IF EXISTS trg_update_timestamp_on_companies ON public.companies';
  EXECUTE 'CREATE TRIGGER trg_update_timestamp_on_companies BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_timestamp()';
  -- company_overviews
  EXECUTE 'DROP TRIGGER IF EXISTS trg_update_timestamp_on_company_overviews ON public.company_overviews';
  EXECUTE 'CREATE TRIGGER trg_update_timestamp_on_company_overviews BEFORE UPDATE ON public.company_overviews FOR EACH ROW EXECUTE FUNCTION public.update_timestamp()';
  -- internships
  EXECUTE 'DROP TRIGGER IF EXISTS trg_update_timestamp_on_internships ON public.internships';
  EXECUTE 'CREATE TRIGGER trg_update_timestamp_on_internships BEFORE UPDATE ON public.internships FOR EACH ROW EXECUTE FUNCTION public.update_timestamp()';
  -- recruitments
  EXECUTE 'DROP TRIGGER IF EXISTS trg_update_timestamp_on_recruitments ON public.recruitments';
  EXECUTE 'CREATE TRIGGER trg_update_timestamp_on_recruitments BEFORE UPDATE ON public.recruitments FOR EACH ROW EXECUTE FUNCTION public.update_timestamp()';
END;
$$;

-- === RLS policies (Pattern A: simplified for server-side writes) ===
-- Note: Pattern A uses server-side writes via service role key
-- RLS is mainly for additional security and future JWT integration

-- Users table: Enable RLS but allow service role full access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Allow service role to bypass RLS automatically
-- Only add policy if JWT integration is needed in future
-- CREATE POLICY IF NOT EXISTS users_self_select ON public.users
--   FOR SELECT USING (auth0_user_id = current_setting('jwt.claims.sub', true));

-- User profiles: Enable RLS for future JWT support
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY IF NOT EXISTS user_profiles_owner ON public.user_profiles
--   FOR ALL USING (
--     EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_profiles.user_id AND u.auth0_user_id = current_setting('jwt.claims.sub', true))
--   );

-- User details: Enable RLS for future JWT support
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

-- Favorites: Enable RLS for future JWT support
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Applications: Enable RLS for future JWT support
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- === Public views and grants ===
-- Companies and main content
CREATE OR REPLACE VIEW public.v_companies_public AS
SELECT id, public_id, name, name_kana, logo_url, website_url
FROM public.companies
WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.v_recruitments_public AS
SELECT id, company_id, job_type_id, job_type_description, job_description, work_location, work_hours, number_of_hires
FROM public.recruitments
WHERE true;

CREATE OR REPLACE VIEW public.v_internships_public AS
SELECT id, company_id, title, job_type_id, job_type_description, job_description, work_location
FROM public.internships
WHERE true;

CREATE OR REPLACE VIEW public.v_users_public AS
SELECT public_id, display_name, avatar_url
FROM public.users
WHERE deleted_at IS NULL;

-- Master data views for search functionality
CREATE OR REPLACE VIEW public.v_industries_public AS
SELECT id, name FROM public.industries;

CREATE OR REPLACE VIEW public.v_job_types_public AS
SELECT id, name FROM public.job_types;

CREATE OR REPLACE VIEW public.v_prefectures_public AS
SELECT id, name FROM public.prefectures;

CREATE OR REPLACE VIEW public.v_areas_public AS
SELECT a.id, a.name, a.prefecture_id, p.name as prefecture_name
FROM public.areas a
JOIN public.prefectures p ON a.prefecture_id = p.id;

CREATE OR REPLACE VIEW public.v_company_statuses_public AS
SELECT id, name FROM public.company_statuses;

CREATE OR REPLACE VIEW public.v_internship_tags_public AS
SELECT id, name, category FROM public.internship_tags;

-- Enhanced company view with related data
CREATE OR REPLACE VIEW public.v_companies_with_details AS
SELECT 
  c.id, c.public_id, c.name, c.name_kana, c.logo_url, c.website_url,
  co.industry_id, i.name as industry_name,
  co.employee_count, co.established_year,
  cs.name as status_name
FROM public.companies c
LEFT JOIN public.company_overviews co ON c.id = co.company_id
LEFT JOIN public.industries i ON co.industry_id = i.id
LEFT JOIN public.company_statuses cs ON c.status_id = cs.id
WHERE c.deleted_at IS NULL;

-- Revoke direct access to sensitive tables
REVOKE SELECT ON public.users FROM anon;
REVOKE SELECT ON public.user_profiles FROM anon;
REVOKE SELECT ON public.user_details FROM anon;
REVOKE SELECT ON public.favorites FROM anon;
REVOKE SELECT ON public.applications FROM anon;
REVOKE SELECT ON public.audit_logs FROM anon;

-- Grant access to public views
GRANT SELECT ON public.v_companies_public TO anon;
GRANT SELECT ON public.v_companies_with_details TO anon;
GRANT SELECT ON public.v_recruitments_public TO anon;
GRANT SELECT ON public.v_users_public TO anon;
GRANT SELECT ON public.v_internships_public TO anon;
GRANT SELECT ON public.v_industries_public TO anon;
GRANT SELECT ON public.v_job_types_public TO anon;
GRANT SELECT ON public.v_prefectures_public TO anon;
GRANT SELECT ON public.v_areas_public TO anon;
GRANT SELECT ON public.v_company_statuses_public TO anon;
GRANT SELECT ON public.v_internship_tags_public TO anon;

-- === Basic master data initialization ===
-- Company statuses
INSERT INTO public.company_statuses (name) VALUES 
('公開中'), ('非公開'), ('審査中'), ('停止中')
ON CONFLICT (name) DO NOTHING;

-- Basic prefectures (東海地方中心)
INSERT INTO public.prefectures (name) VALUES 
('愛知県'), ('静岡県'), ('岐阜県'), ('三重県')
ON CONFLICT (name) DO NOTHING;

-- Basic areas for 愛知県
INSERT INTO public.areas (prefecture_id, name) 
SELECT p.id, area_name 
FROM public.prefectures p, 
(VALUES ('名古屋'), ('東三河'), ('西三河'), ('尾張')) AS areas(area_name)
WHERE p.name = '愛知県'
ON CONFLICT (prefecture_id, name) DO NOTHING;

-- Basic industries
INSERT INTO public.industries (name) VALUES 
('メーカー'), ('商社'), ('小売'), ('金融'), ('IT'), ('サービス'), ('インフラ'), ('官公庁')
ON CONFLICT (name) DO NOTHING;

-- Basic job types
INSERT INTO public.job_types (name) VALUES 
('事務'), ('営業'), ('技術'), ('企画'), ('マーケティング'), ('人事'), ('経理'), ('総務')
ON CONFLICT (name) DO NOTHING;

-- Basic internship tags
INSERT INTO public.internship_tags (name, category) VALUES 
('27卒', '学年'), ('28卒', '学年'), ('29卒', '学年'),
('長期インターン', '期間'), ('短期インターン', '期間'),
('リモート可', '勤務形態'), ('フレックス制', '勤務形態')
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- Helpful notes (not executed):
-- - Service role (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS and can be used by backend for upserts.
-- - For local testing in psql you can emulate a logged-in user with:
--   SELECT set_config('jwt.claims.sub', 'auth0|example-sub', true);
-- - If your environment already has earlier migrations applied, extract the missing pieces from this file instead of running it unchanged.
