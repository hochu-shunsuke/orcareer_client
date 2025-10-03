import { createSupabaseClient } from "@/lib/supabase-client";
import { Company } from "@/types";
import { logDbError, measurePerformance } from "@/lib/logger";
import { unstable_cache } from 'next/cache';

/**
 * companiesテーブル＋recruitments（求人）をJOINして取得するサーバー用関数
 * キャッシュ: 5分間（企業データは頻繁に変更されない）
 */
const _fetchCompaniesWithRecruitments = async (): Promise<Company[]> => {
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
};

export const fetchCompaniesWithRecruitments = unstable_cache(
  _fetchCompaniesWithRecruitments,
  ['companies-with-recruitments'],
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ['companies', 'recruitments']
  }
);

/**
 * 企業IDで1件の企業情報を取得
 * キャッシュ: 10分間（個別企業データはより安定）
 */
const _fetchCompanyById = async (companyId: string): Promise<Company | null> => {
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
};

export const fetchCompanyById = (companyId: string) => 
  unstable_cache(
    () => _fetchCompanyById(companyId),
    [`company-${companyId}`],
    {
      revalidate: 600, // 10分間キャッシュ
      tags: ['companies', `company-${companyId}`]
    }
  )();
