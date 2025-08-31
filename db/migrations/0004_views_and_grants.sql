-- 0004_views_and_grants.sql
-- Create public views for frontend and adjust grants. Run after 0001-0003.

-- Companies public view
CREATE OR REPLACE VIEW public.v_companies_public AS
SELECT id, public_id, name, name_kana, logo_url, website_url
FROM public.companies
WHERE deleted_at IS NULL;

-- Jobs/Recruiments public view
CREATE OR REPLACE VIEW public.v_recruitments_public AS
SELECT id, company_id, job_type_id, job_type_description, job_description, work_location, work_hours, number_of_hires
FROM public.recruitments
WHERE true;

-- Users public view (minimal)
CREATE OR REPLACE VIEW public.v_users_public AS
SELECT public_id, display_name, avatar_url
FROM public.users
WHERE deleted_at IS NULL;

-- Revoke direct table SELECT for anon on sensitive tables
REVOKE SELECT ON public.users FROM anon;
REVOKE SELECT ON public.user_profiles FROM anon;
REVOKE SELECT ON public.user_details FROM anon;

-- Grant SELECT on views to anon
GRANT SELECT ON public.v_companies_public TO anon;
GRANT SELECT ON public.v_recruitments_public TO anon;
GRANT SELECT ON public.v_users_public TO anon;
