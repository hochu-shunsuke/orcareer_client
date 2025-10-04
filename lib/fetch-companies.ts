import { createSupabaseClient } from "@/lib/supabase-client";
import { Company } from "@/types";
import { logDbError, measurePerformance } from "@/lib/logger";
import { unstable_cache } from 'next/cache';

/**
 * companiesテーブル＋recruitments（求人）をJOINして取得
 * キャッシュ: unstable_cache + ページレベルのrevalidateで管理
 */
async function _fetchCompaniesWithRecruitments(): Promise<Company[]> {
  return measurePerformance('fetchCompaniesWithRecruitments', async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('companies')
      .select(`*, recruitments(*), company_overviews(*), company_data(*)`)
      .order('created_at', { ascending: false });
    
    if (error) {
      logDbError('fetchCompaniesWithRecruitments', error, 'SELECT companies with JOIN recruitments');
      return [];
    }
    
    return data ?? [];
  });
}

export const fetchCompaniesWithRecruitments = unstable_cache(
  _fetchCompaniesWithRecruitments,
  ['companies-with-recruitments'],
  { revalidate: 43200 } // 12時間キャッシュ
);

/**
 * 企業IDで1件の企業情報を取得
 * キャッシュ: unstable_cache + ページレベルのrevalidateで管理
 */
async function _fetchCompanyById(companyId: string): Promise<Company | null> {
  return measurePerformance(`fetchCompanyById-${companyId}`, async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('companies')
      .select(`*, company_overviews(*), company_data(*)`)
      .eq('id', companyId)
      .single();
    
    if (error) {
      logDbError('fetchCompanyById', error, `SELECT company WHERE id=${companyId}`);
      return null;
    }
    
    return data;
  });
}

export const fetchCompanyById = (companyId: string) =>
  unstable_cache(
    () => _fetchCompanyById(companyId),
    [`company-${companyId}`],
    { revalidate: 43200 } // 12時間キャッシュ
  )();
