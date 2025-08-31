-- 0005_verify_and_examples.sql
-- Verification scripts and examples for RLS, audit, and server-side upsert.

-- Example: create a test user (service role)
-- INSERT INTO public.users (public_id, auth0_user_id, email, display_name) VALUES (public.generate_public_id(10), 'auth0|test-sub', 't@example.com', 'Test User');

-- Emulate JWT claims in SQL editor
-- SELECT set_config('jwt.claims.sub', 'auth0|test-sub', true);

-- As that user, try to SELECT own profile
-- SELECT * FROM public.user_profiles;

-- As that user, try to INSERT a favorite (will use RLS policies)
-- INSERT INTO public.favorites (user_id, company_id) VALUES ((SELECT id FROM public.users WHERE auth0_user_id = 'auth0|test-sub'), (SELECT id FROM public.companies LIMIT 1));

-- Reset
-- SELECT set_config('jwt.claims.sub', null, true);

-- Server-side upsert pattern (example pseudocode):
-- DO NOT RUN IN SQL; shown for API implementation reference
--
-- -- Node.js example
-- // const supabase = createServerSupabaseClient();
-- // const session = getSession(req);
-- // await supabase.from('users').upsert({ auth0_user_id: session.user.sub, public_id: generate_public_id(10), email: session.user.email }, { onConflict: 'auth0_user_id' });
