-- 0001_schema.sql
-- 完全スキーマ: users, profiles, companies, listings, favorites, master tables
-- 適用: 空の DB に対して最初に実行

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== masters =====
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

-- ===== users =====
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id varchar(32) UNIQUE NOT NULL,
  auth0_user_id varchar(255) UNIQUE,
  email varchar(255),
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
  last_name varchar(100),
  first_name varchar(100),
  last_name_kana varchar(100),
  first_name_kana varchar(100),
  university varchar(255),
  faculty varchar(255),
  department varchar(255),
  graduation_year integer,
  phone_number varchar(20),
  postal_code varchar(10),
  address text,
  birthday date,
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

-- ===== companies =====
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id varchar(32) UNIQUE NOT NULL,
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

-- ===== internships =====
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

-- ===== recruitments =====
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

-- ===== favorites =====
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT favorites_user_company_unique UNIQUE (user_id, company_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_company_id ON public.favorites (company_id);

-- end
