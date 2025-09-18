import { createSupabaseClient } from "@/lib/supabase-client";
import { Company } from "@/data/types";

/**
 * companiesテーブルの全件を取得するサーバー用関数
 */
export async function fetchCompanies(): Promise<Company[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
