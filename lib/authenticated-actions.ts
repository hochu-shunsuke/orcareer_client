/**
 * 認証が必要な操作のサンプル実装
 * お気に入り機能を例に、JWT付きSupabaseクライアントの使用方法を示します
 */

import { getAuthenticatedSupabaseClient } from './supabase-client';

/**
 * ユーザーのお気に入り企業一覧を取得
 * RLSにより、自分のお気に入りのみ取得可能
 */
export async function getUserFavoriteCompanies() {
  try {
    const supabase = await getAuthenticatedSupabaseClient();
    
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        company_id,
        created_at,
        companies (
          id,
          name,
          logo_url,
          industry_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch favorites:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserFavoriteCompanies:', error);
    throw error;
  }
}

/**
 * 企業をお気に入りに追加
 * RLSにより、自分のuser_idのみ設定可能
 */
export async function addCompanyToFavorites(companyId: string) {
  try {
    const supabase = await getAuthenticatedSupabaseClient();
    
    // RLSがuser_idを自動的にチェック
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        company_id: companyId,
      })
      .select()
      .single();

    if (error) {
      // 重複エラーの場合
      if (error.code === '23505') {
        throw new Error('この企業は既にお気に入りに追加されています');
      }
      console.error('Failed to add favorite:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addCompanyToFavorites:', error);
    throw error;
  }
}

/**
 * 企業をお気に入りから削除
 * RLSにより、自分のお気に入りのみ削除可能
 */
export async function removeCompanyFromFavorites(favoriteId: string) {
  try {
    const supabase = await getAuthenticatedSupabaseClient();
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      console.error('Failed to remove favorite:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in removeCompanyFromFavorites:', error);
    throw error;
  }
}

/**
 * ユーザープロフィールを取得
 * RLSにより、自分のプロフィールのみ取得可能
 */
export async function getUserProfile() {
  try {
    const supabase = await getAuthenticatedSupabaseClient();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        users (
          email,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
}

/**
 * ユーザープロフィールを更新
 * RLSにより、自分のプロフィールのみ更新可能
 */
export async function updateUserProfile(profileData: {
  last_name?: string;
  first_name?: string;
  last_name_kana?: string;
  first_name_kana?: string;
  university?: string;
  faculty?: string;
  department?: string;
  graduation_year?: number;
  phone_number?: string;
}) {
  try {
    const supabase = await getAuthenticatedSupabaseClient();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .select()
      .single();

    if (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
}

/**
 * インターンシップに応募
 * RLSにより、自分のuser_idのみ設定可能
 */
export async function applyToInternship(internshipId: string) {
  try {
    const supabase = await getAuthenticatedSupabaseClient();
    
    const { data, error } = await supabase
      .from('applications')
      .insert({
        internship_id: internshipId,
        application_type: 'internship',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('このインターンシップには既に応募済みです');
      }
      console.error('Failed to apply to internship:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in applyToInternship:', error);
    throw error;
  }
}

/**
 * 自分の応募履歴を取得
 * RLSにより、自分の応募のみ取得可能
 */
export async function getUserApplications() {
  try {
    const supabase = await getAuthenticatedSupabaseClient();
    
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        application_type,
        status,
        created_at,
        internships (
          id,
          title,
          company_id,
          companies (
            name,
            logo_url
          )
        ),
        recruitments (
          id,
          title,
          company_id,
          companies (
            name,
            logo_url
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch applications:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserApplications:', error);
    throw error;
  }
}
