import { createSupabaseClient } from "@/lib/supabase-client";
import { Internship, InternshipTag } from "@/types";
import { logDbError, measurePerformance } from "@/lib/logger";
import { unstable_cache } from 'next/cache';

/**
 * internships + companies + tags情報をJOINして取得
 * タグは一括取得してN+1問題を解消
 * キャッシュ: unstable_cache + ページレベルのrevalidateで管理
 */
async function _fetchInternshipsWithCompanyAndTags(): Promise<Internship[]> {
  return measurePerformance('fetchInternshipsWithCompanyAndTags', async () => {
    const supabase = createSupabaseClient();
    
    // internships + companies + company_overviews.industry + job_types
    const { data: internships, error } = await supabase
      .from('internships')
      .select(`
        *,
        company:companies(
          id,
          name,
          name_kana,
          logo_url,
          company_overviews(
            industry:industries(name)
          )
        ),
        job_type:job_types(name)
      `)
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
    const { data: tagData, error: tagError } = await supabase
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
    
    if (tagError) {
      logDbError('fetchInternshipTagsBulk', tagError, `SELECT internship_tag_relations WHERE internship_id IN (${internshipIds.length} items)`);
    }

    // internship_id ごとにタグをグループ化
    const tagsByInternshipId = new Map<string, InternshipTag[]>();
    
    (tagData ?? []).forEach((item: any) => {
      if (item.tag && item.internship_id) {
        const tags = tagsByInternshipId.get(item.internship_id) || [];
        tags.push(item.tag);
        tagsByInternshipId.set(item.internship_id, tags);
      }
    });
    
    // タグをマージ
    return validInternships.map((internship: any): Internship => ({
      ...internship,
      tags: tagsByInternshipId.get(internship.id) || []
    }));
  });
}

export const fetchInternshipsWithCompanyAndTags = unstable_cache(
  _fetchInternshipsWithCompanyAndTags,
  ['internships-with-company-tags'],
  { revalidate: 43200 } // 12時間キャッシュ
);

/**
 * 特定のインターンシップ詳細を取得（会社情報・タグ付き）
 * キャッシュ: unstable_cache + ページレベルのrevalidateで管理
 */
async function _fetchInternshipById(internshipId: string): Promise<Internship | null> {
  return measurePerformance(`fetchInternshipById-${internshipId}`, async () => {
    const supabase = createSupabaseClient();
    
    const { data: internship, error } = await supabase
      .from('internships')
      .select(`
        *,
        company:companies(
          id,
          name,
          name_kana,
          logo_url,
          company_overviews(
            industry:industries(name)
          )
        ),
        job_type:job_types(name)
      `)
      .eq('id', internshipId)
      .single();
    
    if (error) {
      logDbError('fetchInternshipById', error, `SELECT internship WHERE id=${internshipId}`);
      return null;
    }
    
    if (!internship) return null;
    
    // タグを取得
    const { data: tagData, error: tagError } = await supabase
      .from('internship_tag_relations')
      .select(`
        tag:internship_tags (
          id,
          name,
          category
        )
      `)
      .eq('internship_id', internshipId);
    
    if (tagError) {
      logDbError('fetchInternshipTags', tagError, `SELECT internship_tag_relations WHERE internship_id=${internshipId}`);
    }
    
    // tag情報を展開
    const tags = (tagData ?? []).map((item: any) => item.tag).filter(Boolean);
    
    return {
      ...internship,
      tags
    };
  });
}

export const fetchInternshipById = (internshipId: string) =>
  unstable_cache(
    () => _fetchInternshipById(internshipId),
    [`internship-${internshipId}`],
    { revalidate: 43200 } // 12時間キャッシュ
  )();

/**
 * 特定企業のインターンシップ一覧を取得（タグ付き）
 * タグは一括取得してN+1問題を解消
 * キャッシュ: unstable_cache + ページレベルのrevalidateで管理
 */
async function _fetchInternshipsByCompanyId(companyId: string): Promise<Internship[]> {
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
    const { data: tagData, error: tagError } = await supabase
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
    
    if (tagError) {
      logDbError('fetchInternshipTagsBulk', tagError, `SELECT internship_tag_relations WHERE internship_id IN (${internshipIds.length} items)`);
    }

    // internship_id ごとにタグをグループ化
    const tagsByInternshipId = new Map<string, InternshipTag[]>();
    
    (tagData ?? []).forEach((item: any) => {
      if (item.tag && item.internship_id) {
        const tags = tagsByInternshipId.get(item.internship_id) || [];
        tags.push(item.tag);
        tagsByInternshipId.set(item.internship_id, tags);
      }
    });
    
    // タグをマージ
    return internships.map((internship: any): Internship => ({
      ...internship,
      tags: tagsByInternshipId.get(internship.id) || []
    }));
  });
}

export const fetchInternshipsByCompanyId = (companyId: string) =>
  unstable_cache(
    () => _fetchInternshipsByCompanyId(companyId),
    [`company-internships-${companyId}`],
    { revalidate: 43200 } // 12時間キャッシュ
  )();
