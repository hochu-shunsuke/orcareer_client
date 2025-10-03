import { createSupabaseClient } from "@/lib/supabase-client";
import { Recruitment } from "@/types";

/**
 * 全求人を会社情報付きで取得
 */
export async function fetchRecruitmentsWithCompany(): Promise<Recruitment[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('recruitments')
    .select(`
      *,
      company:companies(id, name, logo_url)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recruitments:', error);
    return [];
  }

  return data ?? [];
}

/**
 * 特定企業の求人を取得
 */
export async function fetchRecruitmentsByCompanyId(companyId: string): Promise<Recruitment[]> {
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
    console.error('Error fetching recruitments by company:', error);
    return [];
  }

  return data ?? [];
}

/**
 * 求人IDで1件の求人情報を取得
 */
export async function fetchRecruitmentById(recruitmentId: string): Promise<Recruitment | null> {
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
    console.error('Error fetching recruitment:', error);
    return null;
  }

  return data;
}
