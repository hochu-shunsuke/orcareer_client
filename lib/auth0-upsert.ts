import { auth0 } from './auth0';
import { createServerSupabaseClient, generatePublicId } from './supabase-server';

/**
 * Auth0ユーザーをSupabaseにupsertする最小実装
 */
export async function upsertUserToSupabase(auth0Sub: string, email: string, name?: string, picture?: string): Promise<void> {
  if (!auth0Sub || !email) {
    console.warn('Missing required user data, skipping upsert');
    return;
  }

  try {
    const supabase = createServerSupabaseClient();
    
    // 既存ユーザーをチェック
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, public_id')
      .eq('auth0_user_id', auth0Sub)
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
        console.error('Failed to update existing user:', error);
        return; // エラーでもセッション継続のためthrowしない
      }
      
      console.log('Successfully updated user in Supabase:', auth0Sub);
    } else {
      // 新規ユーザーの作成
      const { error } = await supabase
        .from('users')
        .insert({
          auth0_user_id: auth0Sub,
          email,
          display_name: name,
          avatar_url: picture,
          public_id: generatePublicId(10), // サーバー側で生成
          last_login_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to create new user:', error);
        return; // エラーでもセッション継続のためthrowしない
      }
      
      console.log('Successfully created user in Supabase:', auth0Sub);
    }
  } catch (error) {
    console.error('Error during user upsert:', error);
    // セッション継続のためthrowしない
  }
}

/**
 * 現在のセッションからユーザーをSupabaseに同期する関数
 */
export async function syncCurrentUserToSupabase(): Promise<void> {
  const session = await auth0.getSession();
  
  if (!session?.user) {
    console.warn('No active Auth0 session found');
    return;
  }

  const { sub, email, name, picture } = session.user;
  
  if (!sub || !email) {
    console.warn('Auth0 user missing required fields');
    return;
  }

  await upsertUserToSupabase(sub, email, name, picture);
}
