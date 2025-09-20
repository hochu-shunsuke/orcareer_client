
import { createSupabaseClient } from "@/lib/supabase-client";

/**
 * recruitments（求人）＋companies（企業）情報を結合して取得するサーバー用関数
 * 公開求人のみ取得（View: v_recruitments_public, v_companies_public）
 */
export async function fetchRecruitmentsWithCompany() {
  const supabase = createSupabaseClient();
  // v_recruitments_public から全求人を取得し、company_idでv_companies_publicをjoin
  const { data, error } = await supabase
    .from('v_recruitments_public')
    .select(`
      *,
      company:v_companies_public(*)
    `)
    .order('id', { ascending: false });
  if (error) throw error;
  // companyがnullのものは除外
  return (data ?? []).filter((r: any) => r.company);
}
