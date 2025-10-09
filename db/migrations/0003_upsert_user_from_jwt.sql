-- ================================================
-- Migration: JWT認証による安全なユーザーUPSERT関数
-- Date: 2025-10-09
-- Purpose: 
--   1. JWTのみを受け取り、Supabase側でクレーム抽出してUPSERT
--   2. SECURITY DEFINERでRLS制約を回避しつつ安全に処理
--   3. 新規ユーザーと既存ユーザー両方に対応
-- ================================================

-- Step 1: JWT認証によるユーザーUPSERT関数
CREATE OR REPLACE FUNCTION public.upsert_user_from_jwt()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_claims jsonb;
  auth0_sub text;
  user_email text;
  user_name text;
  user_picture text;
  result_user_id uuid;
  result_is_new_user boolean;
BEGIN
  -- JWTクレームを取得
  BEGIN
    jwt_claims := current_setting('request.jwt.claims', true)::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'JWT claims not found. Make sure JWT is properly set in Authorization header.';
  END;

  -- 必須フィールドの抽出
  auth0_sub := jwt_claims->>'sub';
  IF auth0_sub IS NULL OR auth0_sub = '' THEN
    RAISE EXCEPTION 'sub claim not found in JWT';
  END IF;

  -- カスタムクレームからemailを取得（Auth0カスタムネームスペース対応）
  user_email := COALESCE(
    jwt_claims->>'https://orcareerclient.vercel.app/email',
    jwt_claims->>'email'
  );
  IF user_email IS NULL OR user_email = '' THEN
    RAISE EXCEPTION 'email claim not found in JWT';
  END IF;

  -- オプションフィールドの抽出
  user_name := COALESCE(
    jwt_claims->>'https://orcareerclient.vercel.app/name',
    jwt_claims->>'name',
    jwt_claims->>'nickname',
    split_part(user_email, '@', 1) -- デフォルト: emailのローカル部分
  );

  user_picture := COALESCE(
    jwt_claims->>'https://orcareerclient.vercel.app/picture',
    jwt_claims->>'picture'
  );

  -- UPSERT実行（INSERTまたはUPDATE）
  INSERT INTO public.users (
    sub,
    email,
    display_name,
    avatar_url,
    last_login_at,
    updated_at
  )
  VALUES (
    auth0_sub,
    user_email,
    user_name,
    user_picture,
    NOW(),
    NOW()
  )
  ON CONFLICT (sub) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    last_login_at = NOW(),
    updated_at = NOW()
  RETURNING id, (xmax = 0) INTO result_user_id, result_is_new_user;

  -- 結果を返す
  RETURN json_build_object(
    'user_id', result_user_id,
    'is_new_user', result_is_new_user,
    'auth0_sub', auth0_sub,
    'email', user_email
  );
END;
$$;

-- Step 2: 関数の実行権限を設定
-- 認証済みユーザー（anon/authenticatedロール）からの実行を許可
GRANT EXECUTE ON FUNCTION public.upsert_user_from_jwt() TO anon, authenticated;

-- Step 3: コメント追加（ドキュメント）
COMMENT ON FUNCTION public.upsert_user_from_jwt() IS 
'JWT認証によるユーザーUPSERT関数。
JWTのAuthorization headerから自動的にクレームを抽出し、
新規ユーザーはINSERT、既存ユーザーはUPDATEを実行。
SECURITY DEFINERによりRLS制約を回避し、安全にUPSERTを実行。
戻り値: { user_id, is_new_user, auth0_sub, email }';
