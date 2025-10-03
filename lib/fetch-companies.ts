import { createSupabaseClient } from "@/lib/supabase-client";
import { Company } from "@/types";

/**
 * companiesテーブル＋recruitments（求人）をJOINして取得するサーバー用関数
 */
export async function fetchCompaniesWithRecruitments(): Promise<Company[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .select(`*, recruitments(*), company_overviews(*), company_data(*)`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching companies with recruitments:', error);
    return [];
  }
  
  return data ?? [];
}

/**
 * 企業IDで1件の企業情報を取得
 */
export async function fetchCompanyById(companyId: string): Promise<Company | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .select(`*, company_overviews(*), company_data(*)`)
    .eq('id', companyId)
    .single();
  
  if (error) {
    console.error('Error fetching company:', error);
    return null;
  }
  
  return data;
}
