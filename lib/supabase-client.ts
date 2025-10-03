import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // In non-browser (server) environments this may be undefined; avoid throwing during build
  if (typeof window !== 'undefined') {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment');
  }
}

/**
 * 未認証用のSupabaseクライアント（読み取り専用）
 * 用途: 企業一覧、求人一覧など公開データの取得
 */
export function createSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase client env not configured');
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { 'x-orcareer-client': '1' } },
  });
}

/**
 * Auth0 JWT を使用した認証付きクライアント
 * RLSポリシーが適用される
 * 用途: お気に入り、応募など認証が必要な操作（クライアントサイド）
 * 
 * Note: クライアント側では /api/auth/access-token からトークンを取得してください
 * 
 * @param accessToken - Auth0から取得したJWTアクセストークン
 */
export function createAuthenticatedSupabaseClient(accessToken: string): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase client env not configured');
  }
  
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { 
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'x-orcareer-client-authenticated': '1'
      } 
    },
  });
}

/**
 * クライアント側でAuth0トークンを取得してSupabaseクライアントを作成する
 * 使用例:
 * ```typescript
 * const supabase = await getAuthenticatedSupabaseClient();
 * const { data } = await supabase.from('favorites').select();
 * ```
 */
export async function getAuthenticatedSupabaseClient(): Promise<SupabaseClient> {
  try {
    const response = await fetch('/api/auth/access-token');
    if (!response.ok) {
      throw new Error('Failed to get access token');
    }
    const { accessToken } = await response.json();
    return createAuthenticatedSupabaseClient(accessToken);
  } catch (error) {
    logger.error('Failed to create authenticated Supabase client', error as Error, 'supabase-client');
    throw error;
  }
}

export default createSupabaseClient;
