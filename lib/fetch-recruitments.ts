import { createSupabaseClient } from "@/lib/supabase-client";
import { Recruitment } from "@/types";
import { logDbError, measurePerformance } from "@/lib/logger";
import { unstable_cache } from 'next/cache';

/**
 * 全求人を会社情報付きで取得
 * キャッシュ: unstable_cache + ページレベルのrevalidateで管理
 */
async function _fetchRecruitmentsWithCompany(): Promise<Recruitment[]> {
  return measurePerformance('fetchRecruitmentsWithCompany', async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('recruitments')
      .select(`
        *,
        company:companies(id, name, logo_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logDbError('fetchRecruitmentsWithCompany', error, 'SELECT recruitments with JOIN companies');
      return [];
    }

    return data ?? [];
  });
}

export const fetchRecruitmentsWithCompany = unstable_cache(
  _fetchRecruitmentsWithCompany,
  ['recruitments-with-company'],
  { revalidate: 43200 } // 12時間キャッシュ
);

/**
 * 特定企業の求人を取得
 * キャッシュ: unstable_cache + ページレベルのrevalidateで管理
 */
async function _fetchRecruitmentsByCompanyId(companyId: string): Promise<Recruitment[]> {
  return measurePerformance(`fetchRecruitmentsByCompanyId-${companyId}`, async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('recruitments')
      .select(`
        *,
        company:companies(id, name, logo_url)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      logDbError('fetchRecruitmentsByCompanyId', error, `SELECT recruitments WHERE company_id=${companyId}`);
      return [];
    }

    return data ?? [];
  });
}

export const fetchRecruitmentsByCompanyId = (companyId: string) =>
  unstable_cache(
    () => _fetchRecruitmentsByCompanyId(companyId),
    [`company-recruitments-${companyId}`],
    { revalidate: 43200 } // 12時間キャッシュ
  )();

/**
 * 求人IDで1件の求人情報を取得
 * キャッシュ: unstable_cache + ページレベルのrevalidateで管理
 */
async function _fetchRecruitmentById(recruitmentId: string): Promise<Recruitment | null> {
  return measurePerformance(`fetchRecruitmentById-${recruitmentId}`, async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('recruitments')
      .select(`
        *,
        company:companies(id, name, logo_url)
      `)
      .eq('id', recruitmentId)
      .single();

    if (error) {
      logDbError('fetchRecruitmentById', error, `SELECT recruitment WHERE id=${recruitmentId}`);
      return null;
    }

    return data;
  });
}

export const fetchRecruitmentById = (recruitmentId: string) =>
  unstable_cache(
    () => _fetchRecruitmentById(recruitmentId),
    [`recruitment-${recruitmentId}`],
    { revalidate: 43200 } // 12時間キャッシュ
  )();
