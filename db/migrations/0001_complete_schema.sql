begin;

-- 0001_complete_schema.sql
-- Complete, idempotent schema for orcareer project.
-- This migration is intended to be run against a fresh database.
-- It includes: extensions, master tables, domain tables, audit, helpers, RLS policies,
-- public views and grants suitable for the frontend anon role.
-- NOTE: If you already have earlier migrations applied, do NOT run this file as-is.
-- Instead, extract the missing parts or run in a test DB first.
-- === Extensions ===
create extension IF not exists "pgcrypto";

-- === Helper functions (must be defined before usage) ===
-- Note: generate_public_id function removed as we now use SERIAL admin_id for admin searches

-- === Master / lookup tables ===
create table if not exists public.company_statuses (
  id uuid primary key default gen_random_uuid (),
  name varchar(50) unique not null,
  created_at timestamptz default now()
);

create table if not exists public.listing_classifications (
  id uuid primary key default gen_random_uuid (),
  name varchar(100) unique not null,
  created_at timestamptz default now()
);

create table if not exists public.industries (
  id uuid primary key default gen_random_uuid (),
  name varchar(100) unique not null,
  created_at timestamptz default now()
);

create table if not exists public.job_types (
  id uuid primary key default gen_random_uuid (),
  name varchar(100) unique not null,
  created_at timestamptz default now()
);

create table if not exists public.prefectures (
  id uuid primary key default gen_random_uuid (),
  name varchar(20) unique not null,
  created_at timestamptz default now()
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid (),
  prefecture_id uuid not null references public.prefectures (id) on delete RESTRICT,
  name varchar(50) not null,
  created_at timestamptz default now(),
  constraint areas_prefecture_name_unique unique (prefecture_id, name)
);

create index IF not exists idx_areas_prefecture_id on public.areas (prefecture_id);

create table if not exists public.internship_tags (
  id uuid primary key default gen_random_uuid (),
  name varchar(100) unique not null,
  category varchar(50),
  created_at timestamptz default now()
);

create index IF not exists idx_internship_tags_category on public.internship_tags (category);

-- === Users and profiles ===
create table if not exists public.users (
  id uuid primary key default gen_random_uuid (),
  admin_id SERIAL UNIQUE NOT NULL,
  sub varchar(255) unique not null,
  email varchar(255) unique not null check (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  display_name varchar(255),
  avatar_url text,
  user_type varchar(50) DEFAULT 'student',
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index IF not exists idx_users_sub on public.users (sub);
create index IF not exists idx_users_user_type on public.users (user_type);
create index IF not exists idx_users_admin_id on public.users (admin_id);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid (),
  user_id uuid unique not null references public.users (id) on delete CASCADE,
  last_name varchar(100) not null,
  first_name varchar(100) not null,
  last_name_kana varchar(100) not null,
  first_name_kana varchar(100) not null,
  university varchar(255) not null,
  faculty varchar(255),
  department varchar(255),
  graduation_year integer not null check (
    graduation_year >= 2020
    and graduation_year <= 2040
  ),
  phone_number varchar(20) not null check (phone_number ~ '^[0-9\-+()]+$'),
  postal_code varchar(10) not null check (postal_code ~ '^\d{3}-?\d{4}$'),
  address text not null,
  birthday date not null check (
    birthday >= '1900-01-01'
    and birthday <= CURRENT_DATE
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index IF not exists idx_user_profiles_university on public.user_profiles (university);

create index IF not exists idx_user_profiles_graduation_year on public.user_profiles (graduation_year);

create table if not exists public.user_details (
  id uuid primary key default gen_random_uuid (),
  user_id uuid unique not null references public.users (id) on delete CASCADE,
  self_pr text,
  gakuchika text,
  skill text,
  qualification text,
  portfolio_url varchar(500),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- === Companies and related tables ===
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid (),
  admin_id SERIAL UNIQUE NOT NULL,
  name varchar(255) not null,
  name_kana varchar(255),
  logo_url varchar(500),
  website_url varchar(500),
  status_id uuid references public.company_statuses (id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index IF not exists idx_companies_status_id on public.companies (status_id);

-- Additional performance indexes for search functionality
create index IF not exists idx_companies_name_status on public.companies (name, status_id)
where
  deleted_at is null;

create index IF not exists idx_companies_created_at on public.companies (created_at)
where
  deleted_at is null;

create table if not exists public.company_overviews (
  id uuid primary key default gen_random_uuid (),
  company_id uuid unique not null references public.companies (id) on delete CASCADE,
  industry_id uuid references public.industries (id),
  established_year integer,
  headquarters_address text,
  employee_count integer,
  listing_classification_id uuid references public.listing_classifications (id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index IF not exists idx_company_overviews_industry_id on public.company_overviews (industry_id);

create index IF not exists idx_company_overviews_listing_classification_id on public.company_overviews (listing_classification_id);

create table if not exists public.company_data (
  id uuid primary key default gen_random_uuid (),
  company_id uuid unique not null references public.companies (id) on delete CASCADE,
  profile text,
  business_content text,
  headquarters_location text,
  offices text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.company_mvvs (
  id uuid primary key default gen_random_uuid (),
  company_id uuid unique not null references public.companies (id) on delete CASCADE,
  mission text,
  vision text,
  company_value text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.company_contacts (
  id uuid primary key default gen_random_uuid (),
  company_id uuid not null references public.companies (id) on delete CASCADE,
  contact_name varchar(100),
  phone_number varchar(20),
  email varchar(255),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index IF not exists idx_company_contacts_company_id on public.company_contacts (company_id);

create table if not exists public.company_areas (
  id uuid primary key default gen_random_uuid (),
  company_id uuid not null references public.companies (id) on delete CASCADE,
  area_id uuid not null references public.areas (id) on delete RESTRICT,
  created_at timestamptz default now(),
  constraint company_areas_company_area_unique unique (company_id, area_id)
);

create index IF not exists idx_company_areas_company_id on public.company_areas (company_id);

create index IF not exists idx_company_areas_area_id on public.company_areas (area_id);

-- === Internships / recruitments ===
create table if not exists public.internships (
  id uuid primary key default gen_random_uuid (),
  company_id uuid not null references public.companies (id) on delete CASCADE,
  title varchar(255),
  job_type_id uuid references public.job_types (id),
  job_type_description text,
  job_description text,
  skills_to_acquire text,
  work_location varchar(255),
  work_hours varchar(255),
  hourly_wage varchar(100),
  required_skills text,
  preferred_skills text,
  selection_flow text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index IF not exists idx_internships_company_id on public.internships (company_id);

create index IF not exists idx_internships_job_type_id on public.internships (job_type_id);

create table if not exists public.internship_tag_relations (
  id uuid primary key default gen_random_uuid (),
  internship_id uuid not null references public.internships (id) on delete CASCADE,
  tag_id uuid not null references public.internship_tags (id) on delete CASCADE,
  created_at timestamptz default now(),
  constraint internship_tag_relations_unique unique (internship_id, tag_id)
);

create index IF not exists idx_internship_tag_relations_internship_id on public.internship_tag_relations (internship_id);

create index IF not exists idx_internship_tag_relations_tag_id on public.internship_tag_relations (tag_id);

create table if not exists public.internship_areas (
  id uuid primary key default gen_random_uuid (),
  internship_id uuid not null references public.internships (id) on delete CASCADE,
  area_id uuid not null references public.areas (id) on delete RESTRICT,
  created_at timestamptz default now(),
  constraint internship_areas_unique unique (internship_id, area_id)
);

create index IF not exists idx_internship_areas_internship_id on public.internship_areas (internship_id);

create index IF not exists idx_internship_areas_area_id on public.internship_areas (area_id);

create table if not exists public.recruitments (
  id uuid primary key default gen_random_uuid (),
  company_id uuid not null references public.companies (id) on delete CASCADE,
  job_type_id uuid references public.job_types (id),
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index IF not exists idx_recruitments_company_id on public.recruitments (company_id);

create index IF not exists idx_recruitments_job_type_id on public.recruitments (job_type_id);

create table if not exists public.recruitment_areas (
  id uuid primary key default gen_random_uuid (),
  recruitment_id uuid not null references public.recruitments (id) on delete CASCADE,
  area_id uuid not null references public.areas (id) on delete RESTRICT,
  created_at timestamptz default now(),
  constraint recruitment_areas_unique unique (recruitment_id, area_id)
);

create index IF not exists idx_recruitment_areas_recruitment_id on public.recruitment_areas (recruitment_id);

create index IF not exists idx_recruitment_areas_area_id on public.recruitment_areas (area_id);

-- === Favorites (DBML準拠: 企業のお気に入りのみ) ===
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete CASCADE,
  company_id uuid not null references public.companies (id) on delete CASCADE,
  created_at timestamptz default now(),
  constraint favorites_user_company_unique unique (user_id, company_id)
);

create index IF not exists idx_favorites_user_id on public.favorites (user_id);

create index IF not exists idx_favorites_company_id on public.favorites (company_id);

-- === 求人・インターンお気に入り (機能要件追加) ===
create table if not exists public.internship_favorites (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete CASCADE,
  internship_id uuid not null references public.internships (id) on delete CASCADE,
  created_at timestamptz default now(),
  constraint internship_favorites_user_internship_unique unique (user_id, internship_id)
);

create index IF not exists idx_internship_favorites_user_id on public.internship_favorites (user_id);

create index IF not exists idx_internship_favorites_internship_id on public.internship_favorites (internship_id);

create table if not exists public.recruitment_favorites (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete CASCADE,
  recruitment_id uuid not null references public.recruitments (id) on delete CASCADE,
  created_at timestamptz default now(),
  constraint recruitment_favorites_user_recruitment_unique unique (user_id, recruitment_id)
);

create index IF not exists idx_recruitment_favorites_user_id on public.recruitment_favorites (user_id);

create index IF not exists idx_recruitment_favorites_recruitment_id on public.recruitment_favorites (recruitment_id);

-- === Applications (応募ログ) ===
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete CASCADE,
  company_id uuid references public.companies (id) on delete set null,
  internship_id uuid references public.internships (id) on delete set null,
  recruitment_id uuid references public.recruitments (id) on delete set null,
  source text, -- e.g. LINE URL or external redirect
  method varchar(50), -- e.g. 'LINE', 'WEB'
  metadata jsonb, -- free-form: which link, utm, etc.
  status varchar(50) default 'initiated',
  created_at timestamptz default now()
);

create index IF not exists idx_applications_user_id on public.applications (user_id);

create index IF not exists idx_applications_company_id on public.applications (company_id);

create index IF not exists idx_applications_internship_id on public.applications (internship_id);

create index IF not exists idx_applications_recruitment_id on public.applications (recruitment_id);

-- === Audit logs ===
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid (),
  table_name text not null,
  operation text not null,
  record_id uuid,
  performed_by text,
  performed_at timestamptz default now(),
  payload jsonb
);

create or replace function public.audit_changes () RETURNS trigger LANGUAGE plpgsql as $$
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
do $$
DECLARE
  tbl text;
  tables_to_watch text[] := ARRAY['users','companies','favorites','internship_favorites','recruitment_favorites','user_profiles','user_details','applications'];
BEGIN
  FOREACH tbl IN ARRAY tables_to_watch LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%s_trigger ON public.%s;', tbl, tbl);
    EXECUTE format('CREATE TRIGGER audit_%s_trigger AFTER INSERT OR UPDATE OR DELETE ON public.%s FOR EACH ROW EXECUTE FUNCTION public.audit_changes();', tbl, tbl);
  END LOOP;
END;
$$;

-- === Auth0 helper ===
create or replace function public.auth0_sub_to_user_id (auth0_sub text) RETURNS uuid LANGUAGE sql SECURITY DEFINER as $$
  SELECT id FROM public.users WHERE sub = auth0_sub LIMIT 1;
$$;

-- === updated_at helper ===
create or replace function public.update_timestamp () RETURNS trigger as $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- attach update_timestamp trigger to common tables
do $$
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
alter table public.users ENABLE row LEVEL SECURITY;

-- Allow service role to bypass RLS automatically
-- Only add policy if JWT integration is needed in future
-- CREATE POLICY IF NOT EXISTS users_self_select ON public.users
--   FOR SELECT USING (sub = current_setting('jwt.claims.sub', true));
-- User profiles: Enable RLS for future JWT support
alter table public.user_profiles ENABLE row LEVEL SECURITY;

-- CREATE POLICY IF NOT EXISTS user_profiles_owner ON public.user_profiles
--   FOR ALL USING (
--     EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_profiles.user_id AND u.sub = current_setting('jwt.claims.sub', true))
--   );
-- User details: Enable RLS for future JWT support
alter table public.user_details ENABLE row LEVEL SECURITY;

-- Favorites: Enable RLS for future JWT support
alter table public.favorites ENABLE row LEVEL SECURITY;

-- Internship/Recruitment favorites: Enable RLS for future JWT support  
alter table public.internship_favorites ENABLE row LEVEL SECURITY;

alter table public.recruitment_favorites ENABLE row LEVEL SECURITY;

-- Applications: Enable RLS for future JWT support
alter table public.applications ENABLE row LEVEL SECURITY;

-- === Public views and grants ===
-- Companies and main content
create or replace view public.v_companies_public as
select
  id,
  admin_id,
  name,
  name_kana,
  logo_url,
  website_url
from
  public.companies
where
  deleted_at is null;

create or replace view public.v_recruitments_public as
select
  id,
  company_id,
  job_type_id,
  job_type_description,
  job_description,
  work_location,
  work_hours,
  number_of_hires
from
  public.recruitments
where
  true;

create or replace view public.v_internships_public as
select
  id,
  company_id,
  title,
  job_type_id,
  job_type_description,
  job_description,
  work_location
from
  public.internships
where
  true;

create or replace view public.v_users_public as
select
  admin_id,
  display_name,
  avatar_url
from
  public.users
where
  deleted_at is null;

-- Master data views for search functionality
create or replace view public.v_industries_public as
select
  id,
  name
from
  public.industries;

create or replace view public.v_job_types_public as
select
  id,
  name
from
  public.job_types;

create or replace view public.v_prefectures_public as
select
  id,
  name
from
  public.prefectures;

create or replace view public.v_areas_public as
select
  a.id,
  a.name,
  a.prefecture_id,
  p.name as prefecture_name
from
  public.areas a
  join public.prefectures p on a.prefecture_id = p.id;

create or replace view public.v_company_statuses_public as
select
  id,
  name
from
  public.company_statuses;

create or replace view public.v_internship_tags_public as
select
  id,
  name,
  category
from
  public.internship_tags;

-- Enhanced company view with related data
create or replace view public.v_companies_with_details as
select
  c.id,
  c.admin_id,
  c.name,
  c.name_kana,
  c.logo_url,
  c.website_url,
  co.industry_id,
  i.name as industry_name,
  co.employee_count,
  co.established_year,
  cs.name as status_name
from
  public.companies c
  left join public.company_overviews co on c.id = co.company_id
  left join public.industries i on co.industry_id = i.id
  left join public.company_statuses cs on c.status_id = cs.id
where
  c.deleted_at is null;

-- Revoke direct access to sensitive tables
revoke
select
  on public.users
from
  anon;

revoke
select
  on public.user_profiles
from
  anon;

revoke
select
  on public.user_details
from
  anon;

revoke
select
  on public.favorites
from
  anon;

revoke
select
  on public.internship_favorites
from
  anon;

revoke
select
  on public.recruitment_favorites
from
  anon;

revoke
select
  on public.applications
from
  anon;

revoke
select
  on public.audit_logs
from
  anon;

-- Grant access to public views
grant
select
  on public.v_companies_public to anon;

grant
select
  on public.v_companies_with_details to anon;

grant
select
  on public.v_recruitments_public to anon;

grant
select
  on public.v_users_public to anon;

grant
select
  on public.v_internships_public to anon;

grant
select
  on public.v_industries_public to anon;

grant
select
  on public.v_job_types_public to anon;

grant
select
  on public.v_prefectures_public to anon;

grant
select
  on public.v_areas_public to anon;

grant
select
  on public.v_company_statuses_public to anon;

grant
select
  on public.v_internship_tags_public to anon;

-- === Basic master data initialization ===
-- Company statuses
insert into
  public.company_statuses (name)
values
  ('公開中'),
  ('非公開'),
  ('審査中'),
  ('停止中')
on conflict (name) do nothing;

-- Basic prefectures (東海地方中心)
insert into
  public.prefectures (name)
values
  ('愛知県'),
  ('静岡県'),
  ('岐阜県'),
  ('三重県')
on conflict (name) do nothing;

-- Basic areas for 愛知県
insert into
  public.areas (prefecture_id, name)
select
  p.id,
  area_name
from
  public.prefectures p,
  (
    values
      ('名古屋'),
      ('東三河'),
      ('西三河'),
      ('尾張')
  ) as areas (area_name)
where
  p.name = '愛知県'
on conflict (prefecture_id, name) do nothing;

-- Basic industries
insert into
  public.industries (name)
values
  ('メーカー'),
  ('商社'),
  ('小売'),
  ('金融'),
  ('IT'),
  ('サービス'),
  ('インフラ'),
  ('官公庁')
on conflict (name) do nothing;

-- Basic job types
insert into
  public.job_types (name)
values
  ('事務'),
  ('営業'),
  ('技術'),
  ('企画'),
  ('マーケティング'),
  ('人事'),
  ('経理'),
  ('総務')
on conflict (name) do nothing;

-- Basic internship tags
insert into
  public.internship_tags (name, category)
values
  ('27卒', '学年'),
  ('28卒', '学年'),
  ('29卒', '学年'),
  ('長期インターン', '期間'),
  ('短期インターン', '期間'),
  ('リモート可', '勤務形態'),
  ('フレックス制', '勤務形態')
on conflict (name) do nothing;

commit;

-- Helpful notes (not executed):
-- - Service role (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS and can be used by backend for upserts.
-- - For local testing in psql you can emulate a logged-in user with:
--   SELECT set_config('jwt.claims.sub', 'auth0|example-sub', true);
-- - If your environment already has earlier migrations applied, extract the missing pieces from this file instead of running it unchanged.