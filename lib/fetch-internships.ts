
import { createSupabaseClient } from "@/lib/supabase-client";
import { Internship, InternshipTag } from "@/types";
import { logDbError, measurePerformance } from "@/lib/logger";
import { unstable_cache } from 'next/cache';

/**
 * 複数のインターンシップのタグを一括取得（N+1問題の解消）
 * 内部ヘルパー関数 - 親関数がキャッシュを管理するため、ここではキャッシュしない
 */
export async function fetchInternshipTagsBulk(internshipIds: string[]): Promise<Map<string, InternshipTag[]>> {
  if (internshipIds.length === 0) return new Map();

  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('internship_tag_relations')
    .select(`
      internship_id,
      tag:internship_tags (
        id,
        name,
        category
      )
    `)
    .in('internship_id', internshipIds);
  
  if (error) {
    logDbError('fetchInternshipTagsBulk', error, `SELECT internship_tag_relations WHERE internship_id IN (${internshipIds.length} items)`);
    return new Map();
  }

  // internship_id ごとにタグをグループ化
  const tagsByInternshipId = new Map<string, InternshipTag[]>();
  
  (data ?? []).forEach((item: any) => {
    if (item.tag && item.internship_id) {
      const tags = tagsByInternshipId.get(item.internship_id) || [];
      tags.push(item.tag);
      tagsByInternshipId.set(item.internship_id, tags);
    }
  });

  return tagsByInternshipId;
}

/**
 * internships + companies + tags情報をJOINして取得するサーバー用関数
 * タグは一括取得してN+1問題を解消
 * キャッシュ: 3分間（インターンデータは比較的頻繁に更新）
 */
const _fetchInternshipsWithCompanyAndTags = async (): Promise<Internship[]> => {
  return measurePerformance('fetchInternshipsWithCompanyAndTags', async () => {
    const supabase = createSupabaseClient();
    
    // internships + companies
    const { data: internships, error } = await supabase
      .from('internships')
      .select(`*, company:companies(*)`)
      .order('created_at', { ascending: false });
    
    if (error) {
      logDbError('fetchInternshipsWithCompanyAndTags', error, 'SELECT internships with JOIN companies');
      return [];
    }

    const validInternships = (internships ?? []).filter((i: any) => i.company);
    
    if (validInternships.length === 0) {
      return [];
    }

    // 全インターンシップのIDを抽出
    const internshipIds = validInternships.map((i: any) => i.id);
    
    // タグを一括取得
    const tagsByInternshipId = await fetchInternshipTagsBulk(internshipIds);
    
    // タグをマージ
    return validInternships.map((internship: any): Internship => ({
      ...internship,
      tags: tagsByInternshipId.get(internship.id) || []
    }));
  });
};

export const fetchInternshipsWithCompanyAndTags = unstable_cache(
  _fetchInternshipsWithCompanyAndTags,
  ['internships-with-company-tags'],
  {
    revalidate: 180, // 3分間キャッシュ
    tags: ['internships', 'companies', 'internship-tags']
  }
);

/**
 * 特定のインターンシップのタグを取得
 * Note: This function does NOT have its own cache layer to avoid double-caching.
 * Parent functions (fetchInternshipById, fetchInternshipsWithCompanyAndTags) handle caching.
 */
export async function fetchInternshipTags(internshipId: string): Promise<InternshipTag[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('internship_tag_relations')
    .select(`
      tag:internship_tags (
        id,
        name,
        category
      )
    `)
    .eq('internship_id', internshipId);
  
  if (error) {
    logDbError('fetchInternshipTags', error, `SELECT internship_tag_relations WHERE internship_id=${internshipId}`);
    return [];
  }
  
  // tag情報を展開
  return (data ?? []).map((item: any) => item.tag).filter(Boolean);
}

/**
 * 特定のインターンシップ詳細を取得（会社情報・タグ付き）
 * キャッシュ: 10分間（個別詳細ページ用）
 */
const _fetchInternshipById = async (internshipId: string): Promise<Internship | null> => {
  return measurePerformance(`fetchInternshipById-${internshipId}`, async () => {
    const supabase = createSupabaseClient();
    
    const { data: internship, error } = await supabase
      .from('internships')
      .select(`*, company:companies(*)`)
      .eq('id', internshipId)
      .single();
    
    if (error) {
      logDbError('fetchInternshipById', error, `SELECT internship WHERE id=${internshipId}`);
      return null;
    }
    
    if (!internship) return null;
    
    // タグを取得
    const tags = await fetchInternshipTags(internshipId);
    
    return {
      ...internship,
      tags
    };
  });
};

export const fetchInternshipById = (internshipId: string) => 
  unstable_cache(
    () => _fetchInternshipById(internshipId),
    [`internship-${internshipId}`],
    {
      revalidate: 600, // 10分間キャッシュ
      tags: ['internships', 'companies', `internship-${internshipId}`]
    }
  )();

/**
 * 特定企業のインターンシップ一覧を取得（タグ付き）
 * タグは一括取得してN+1問題を解消
 * キャッシュ: 5分間（企業毎のインターンデータ）
 */
const _fetchInternshipsByCompanyId = async (companyId: string): Promise<Internship[]> => {
  return measurePerformance(`fetchInternshipsByCompanyId-${companyId}`, async () => {
    const supabase = createSupabaseClient();
    
    const { data: internships, error } = await supabase
      .from('internships')
      .select(`*, company:companies(*)`)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) {
      logDbError('fetchInternshipsByCompanyId', error, `SELECT internships WHERE company_id=${companyId}`);
      return [];
    }

    if (!internships || internships.length === 0) {
      return [];
    }

    // 全インターンシップのIDを抽出
    const internshipIds = internships.map((i: any) => i.id);
    
    // タグを一括取得
    const tagsByInternshipId = await fetchInternshipTagsBulk(internshipIds);
    
    // タグをマージ
    return internships.map((internship: any): Internship => ({
      ...internship,
      tags: tagsByInternshipId.get(internship.id) || []
    }));
  });
};

export const fetchInternshipsByCompanyId = (companyId: string) => 
  unstable_cache(
    () => _fetchInternshipsByCompanyId(companyId),
    [`company-internships-${companyId}`],
    {
      revalidate: 300, // 5分間キャッシュ
      tags: ['internships', 'companies', `company-${companyId}`]
    }
  )();
