import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment');
}

/**
 * Service Role Key を使用したサーバー専用クライアント
 * RLSをバイパスし、全てのデータにアクセス可能
 * 用途: onCallback でのユーザーupsert、管理者操作など
 */
export const supabaseServerClient: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { headers: { 'x-orcareer-server': '1' } },
  }
);

export function createServerSupabaseClient(): SupabaseClient {
  return supabaseServerClient;
}

/**
 * Auth0 JWT を使用した認証付きサーバークライアント
 * RLSポリシーが適用される
 * 用途: ユーザー固有のデータアクセス（サーバーサイド）
 * 
 * @param accessToken - Auth0から取得したJWTアクセストークン
 */
export function createAuthenticatedServerClient(accessToken: string): SupabaseClient {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_ANON_KEY in server environment');
  }
  
  // SUPABASE_URLは上でチェック済みなので、ここでは安全にキャスト
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY, {
    auth: { 
      autoRefreshToken: false, 
      persistSession: false, 
      detectSessionInUrl: false 
    },
    global: { 
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'x-orcareer-authenticated': '1'
      } 
    },
  });
}

/**
 * Lightweight helper: select user id by auth0 sub
 * Returns { data, error } from supabase-js
 */
export async function selectUserIdByAuth0Sub(auth0Sub: string) {
  return supabaseServerClient
    .from('users')
    .select('id')
    .eq('sub', auth0Sub)
    .limit(1)
    .maybeSingle();
}
