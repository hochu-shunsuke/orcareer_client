import { auth0 } from './auth0';
import { createServerSupabaseClient } from './supabase-server';
import { logger } from './logger';

/**
 * Auth0ユーザーをSupabaseにupsertする最小実装
 */
export async function upsertUserToSupabase(auth0Sub: string, email: string, name?: string, picture?: string): Promise<void> {
  if (!auth0Sub || !email) {
    logger.warn('Missing required user data, skipping upsert', 'auth0-upsert', { auth0Sub: !!auth0Sub, email: !!email });
    return;
  }

  try {
    const supabase = createServerSupabaseClient();
    
    // 既存ユーザーをチェック（sub カラムを使用）
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('sub', auth0Sub)
      .maybeSingle();

    if (existingUser) {
      // 既存ユーザーの更新
      const { error } = await supabase
        .from('users')
        .update({
          email,
          display_name: name,
          avatar_url: picture,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id);

      if (error) {
        logger.dbError('updateExistingUser', error, `UPDATE users WHERE id=${existingUser.id}`);
        return; // エラーでもセッション継続のためthrowしない
      }
    } else {
      // 新規ユーザーの作成（sub カラムを使用）
      const { error } = await supabase
        .from('users')
        .insert({
          sub: auth0Sub,
          email,
          display_name: name,
          avatar_url: picture,
          last_login_at: new Date().toISOString(),
        });

      if (error) {
        logger.dbError('createNewUser', error, 'INSERT INTO users');
        return; // エラーでもセッション継続のためthrowしない
      }
    }
  } catch (error) {
    logger.error('Error during user upsert', error as Error, 'auth0-upsert', { auth0Sub, email });
    // セッション継続のためthrowしない
  }
}

/**
 * 現在のセッションからユーザーをSupabaseに同期する関数
 */
export async function syncCurrentUserToSupabase(): Promise<void> {
  const session = await auth0.getSession();
  
  if (!session?.user) {
    logger.warn('No active Auth0 session found', 'auth0-sync');
    return;
  }

  const { sub, email, name, picture } = session.user;
  
  if (!sub || !email) {
    logger.warn('Auth0 user missing required fields', 'auth0-sync', { sub: !!sub, email: !!email });
    return;
  }

  await upsertUserToSupabase(sub, email, name, picture);
}
