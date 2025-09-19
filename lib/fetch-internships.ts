
import { createSupabaseClient } from "@/lib/supabase-client";
import { Internship } from "@/types";

/**
 * internships + companies情報をJOINして取得するサーバー用関数
 */
export async function fetchInternshipsWithCompany(): Promise<import("@/types").Internship[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('internships')
    .select(`*, company:companies(*)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  // companyがnullのものは除外（念のため）
  return (data ?? []).filter((i: any) => i.company);
}
