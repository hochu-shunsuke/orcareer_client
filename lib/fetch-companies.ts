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
  if (error) throw error;
  return data ?? [];
}
