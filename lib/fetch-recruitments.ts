import { createSupabaseClient } from "@/lib/supabase-client";
import { Recruitment } from "@/types";
import { logDbError, measurePerformance } from "@/lib/logger";
import { unstable_cache } from 'next/cache';

/**
 * 全求人を会社情報付きで取得
 * キャッシュ: 5分間（求人データは中程度の頻度で更新）
 */
const _fetchRecruitmentsWithCompany = async (): Promise<Recruitment[]> => {
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
};

export const fetchRecruitmentsWithCompany = unstable_cache(
  _fetchRecruitmentsWithCompany,
  ['recruitments-with-company'],
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ['recruitments', 'companies']
  }
);

/**
 * 特定企業の求人を取得
 * キャッシュ: 5分間（企業毎の求人データ）
 */
const _fetchRecruitmentsByCompanyId = async (companyId: string): Promise<Recruitment[]> => {
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
};

export const fetchRecruitmentsByCompanyId = (companyId: string) => 
  unstable_cache(
    () => _fetchRecruitmentsByCompanyId(companyId),
    [`company-recruitments-${companyId}`],
    {
      revalidate: 300, // 5分間キャッシュ
      tags: ['recruitments', 'companies', `company-${companyId}`]
    }
  )();

/**
 * 求人IDで1件の求人情報を取得
 * キャッシュ: 10分間（個別詳細ページ用）
 */
const _fetchRecruitmentById = async (recruitmentId: string): Promise<Recruitment | null> => {
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
};

export const fetchRecruitmentById = (recruitmentId: string) => 
  unstable_cache(
    () => _fetchRecruitmentById(recruitmentId),
    [`recruitment-${recruitmentId}`],
    {
      revalidate: 600, // 10分間キャッシュ
      tags: ['recruitments', 'companies', `recruitment-${recruitmentId}`]
    }
  )();
