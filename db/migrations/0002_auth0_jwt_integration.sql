-- ================================================
-- Migration: Auth0 JWT統合とRLSポリシー有効化
-- Date: 2025-10-02
-- Purpose: 
--   1. Auth0 JWT検証のためのRLSポリシーを有効化
--   2. JWT claims からユーザーを識別する関数を追加
--   3. 公開データと認証が必要なデータのアクセス制御
-- Note: users.sub カラムはそのまま使用（リネーム不要）
-- ================================================

-- Step 1: JWT検証用のヘルパー関数
-- 既存の関数を削除して再作成
DROP FUNCTION IF EXISTS public.auth0_sub_to_user_id(text);

-- Auth0 sub から user_id を取得する関数（sub カラムを使用）
CREATE OR REPLACE FUNCTION public.auth0_sub_to_user_id(auth0_sub text) 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER 
STABLE
AS $$
  SELECT id FROM public.users WHERE sub = auth0_sub LIMIT 1;
$$;

-- 現在のJWTからAuth0 subを取得する関数
CREATE OR REPLACE FUNCTION public.current_auth0_sub()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('jwt.claims.sub', true)
  );
$$;

-- 現在のユーザーIDを取得する関数（JWT経由）
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth0_sub_to_user_id(current_auth0_sub());
$$;

-- Step 2: RLSポリシーの有効化

-- users テーブル: 自分のレコードのみアクセス可能
DROP POLICY IF EXISTS users_self_select ON public.users;
CREATE POLICY users_self_select ON public.users
  FOR SELECT 
  USING (sub = current_auth0_sub());

DROP POLICY IF EXISTS users_self_update ON public.users;
CREATE POLICY users_self_update ON public.users
  FOR UPDATE
  USING (sub = current_auth0_sub())
  WITH CHECK (sub = current_auth0_sub());

-- user_profiles テーブル: 自分のプロフィールのみアクセス可能
DROP POLICY IF EXISTS user_profiles_owner ON public.user_profiles;
CREATE POLICY user_profiles_owner ON public.user_profiles
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = user_profiles.user_id 
      AND u.sub = current_auth0_sub()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = user_profiles.user_id 
      AND u.sub = current_auth0_sub()
    )
  );

-- user_details テーブル: 自分の詳細情報のみアクセス可能
DROP POLICY IF EXISTS user_details_owner ON public.user_details;
CREATE POLICY user_details_owner ON public.user_details
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = user_details.user_id 
      AND u.sub = current_auth0_sub()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = user_details.user_id 
      AND u.sub = current_auth0_sub()
    )
  );

-- favorites テーブル: 自分のお気に入りのみアクセス可能
DROP POLICY IF EXISTS favorites_owner ON public.favorites;
CREATE POLICY favorites_owner ON public.favorites
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = favorites.user_id 
      AND u.sub = current_auth0_sub()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = favorites.user_id 
      AND u.sub = current_auth0_sub()
    )
  );

-- internship_favorites テーブル: 自分のお気に入りのみアクセス可能
DROP POLICY IF EXISTS internship_favorites_owner ON public.internship_favorites;
CREATE POLICY internship_favorites_owner ON public.internship_favorites
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = internship_favorites.user_id 
      AND u.sub = current_auth0_sub()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = internship_favorites.user_id 
      AND u.sub = current_auth0_sub()
    )
  );

-- recruitment_favorites テーブル: 自分のお気に入りのみアクセス可能
DROP POLICY IF EXISTS recruitment_favorites_owner ON public.recruitment_favorites;
CREATE POLICY recruitment_favorites_owner ON public.recruitment_favorites
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = recruitment_favorites.user_id 
      AND u.sub = current_auth0_sub()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = recruitment_favorites.user_id 
      AND u.sub = current_auth0_sub()
    )
  );

-- applications テーブル: 自分の応募履歴のみアクセス可能
DROP POLICY IF EXISTS applications_owner ON public.applications;
CREATE POLICY applications_owner ON public.applications
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = applications.user_id 
      AND u.sub = current_auth0_sub()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = applications.user_id 
      AND u.sub = current_auth0_sub()
    )
  );

-- Step 3: 監査ログのトリガー更新（subを使用）
-- audit_logs の actor フィールドに正しいsubを記録
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (table_name, operation, actor, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(current_auth0_sub(), 'service'),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Step 4: 公開データへのアクセスポリシー
-- 企業、求人、インターンシップなどの公開データは未認証でも読み取り可能

-- companies: 全員が読み取り可能
DROP POLICY IF EXISTS companies_public_read ON public.companies;
CREATE POLICY companies_public_read ON public.companies
  FOR SELECT
  USING (true);

-- internships: 全員が読み取り可能
DROP POLICY IF EXISTS internships_public_read ON public.internships;
CREATE POLICY internships_public_read ON public.internships
  FOR SELECT
  USING (true);

-- recruitments: 全員が読み取り可能
DROP POLICY IF EXISTS recruitments_public_read ON public.recruitments;
CREATE POLICY recruitments_public_read ON public.recruitments
  FOR SELECT
  USING (true);

-- マスターデータテーブル: 全員が読み取り可能
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'company_statuses', 'listing_classifications', 'industries', 
      'job_types', 'prefectures', 'areas', 'internship_tags'
    )
  LOOP
    -- RLSを有効化
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    -- 読み取りポリシーを追加
    EXECUTE format('DROP POLICY IF EXISTS %I_public_read ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_public_read ON public.%I FOR SELECT USING (true)', tbl, tbl);
  END LOOP;
END $$;

-- Step 5: 関連テーブルの読み取りポリシー（公開情報）
-- company_overviews, company_data, company_mvvs など
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'company_overviews', 'company_data', 'company_mvvs', 
      'company_contacts', 'company_areas', 'internship_areas',
      'internship_tag_relations', 'recruitment_areas'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_public_read ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_public_read ON public.%I FOR SELECT USING (true)', tbl, tbl);
  END LOOP;
END $$;

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ Created JWT verification functions';
  RAISE NOTICE '✓ Enabled RLS policies for user data';
  RAISE NOTICE '✓ Enabled public read policies for open data';
  RAISE NOTICE '========================================';
END $$;
