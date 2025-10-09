import { createAuthenticatedServerClient } from './supabase-server';
import { logger } from './logger';

/**
 * JWT認証を使用してユーザーをSupabaseにUPSERTする
 * 
 * @param accessToken - Auth0から取得したJWT access token
 * 
 * この関数は:
 * 1. JWTをAuthorizationヘッダーでSupabaseに送信
 * 2. Supabase側でJWT検証とクレーム抽出を実行
 * 3. SECURITY DEFINERでRLS制約を回避してUPSERT
 * 4. 新規ユーザーと既存ユーザー両方に対応
 * 
 * 利点:
 * - Next.js側ではJWT送信のみ（シンプル）
 * - ユーザー情報抽出はSupabase側で実行（セキュア）
 * - 単一のRPC呼び出しで完結（高速）
 */
export async function upsertUserToSupabaseWithJWT(accessToken: string): Promise<void> {
  if (!accessToken) {
    logger.warn('Missing access token', 'auth0-upsert');
    return;
  }

  try {
    // JWT認証を使用してSupabaseクライアントを作成
    const supabase = createAuthenticatedServerClient(accessToken);
    
    // RPC関数を呼び出し（JWT検証とUPSERTはSupabase側で実行）
    const { data, error } = await supabase.rpc('upsert_user_from_jwt');

    if (error) {
      logger.error('Failed to upsert user via RPC', error as Error, 'auth0-upsert');
      throw error;
    }

    // 結果をログに記録
    if (data) {
      const { user_id, is_new_user, auth0_sub, email } = data;
      logger.info(
        `User ${is_new_user ? 'created' : 'updated'}: ${email} (${auth0_sub})`,
        'auth0-upsert',
        { user_id, is_new_user }
      );
    }
  } catch (error) {
    logger.error('Error during user upsert', error as Error, 'auth0-upsert');
    throw error; // エラーを上位に伝播
  }
}
