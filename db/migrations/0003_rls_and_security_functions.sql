-- 0003_rls_and_security_functions.sql
-- SECURITY DEFINER 関数と行レベルセキュリティの設定

-- SECURITY DEFINER: map auth0 sub to user id
CREATE OR REPLACE FUNCTION public.auth0_sub_to_user_id(auth0_sub text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM public.users WHERE auth0_user_id = auth0_sub LIMIT 1;
$$;

-- Enable RLS and policies
-- Users: strict RLS - user can read/update own row (based on auth0_user_id)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_self_select ON public.users
  FOR SELECT USING (auth0_user_id = current_setting('jwt.claims.sub', true));
CREATE POLICY users_self_update ON public.users
  FOR UPDATE USING (auth0_user_id = current_setting('jwt.claims.sub', true))
  WITH CHECK (auth0_user_id = current_setting('jwt.claims.sub', true));

-- Profiles/details: user owns their profile
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_profiles_owner ON public.user_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_profiles.user_id AND u.auth0_user_id = current_setting('jwt.claims.sub', true))
  ) WITH CHECK (
    user_id = (SELECT id FROM public.users WHERE auth0_user_id = current_setting('jwt.claims.sub', true))
  );

ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_details_owner ON public.user_details
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_details.user_id AND u.auth0_user_id = current_setting('jwt.claims.sub', true))
  ) WITH CHECK (
    user_id = (SELECT id FROM public.users WHERE auth0_user_id = current_setting('jwt.claims.sub', true))
  );

-- favorites: user can manage own favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY favorites_owner ON public.favorites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = favorites.user_id AND u.auth0_user_id = current_setting('jwt.claims.sub', true))
  ) WITH CHECK (
    user_id = (SELECT id FROM public.users WHERE auth0_user_id = current_setting('jwt.claims.sub', true))
  );

-- Note: service role (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS for administrative writes.
