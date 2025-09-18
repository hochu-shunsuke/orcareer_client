import { createSupabaseClient } from "@/lib/supabase-client";
import { Internship } from "@/data/types";

/**
 * internshipsテーブルの全件を取得するサーバー用関数
 */
export async function fetchInternships(): Promise<Internship[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('internships')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
