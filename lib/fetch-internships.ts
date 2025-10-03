
import { createSupabaseClient } from "@/lib/supabase-client";
import { Internship, InternshipTag } from "@/types";

/**
 * internships + companies + tags情報をJOINして取得するサーバー用関数
 */
export async function fetchInternshipsWithCompanyAndTags(): Promise<Internship[]> {
  const supabase = createSupabaseClient();
  
  // internships + companies
  const { data: internships, error } = await supabase
    .from('internships')
    .select(`*, company:companies(*)`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // 各internshipに対してタグを取得
  const internshipsWithTags = await Promise.all(
    (internships ?? [])
      .filter((i: any) => i.company)
      .map(async (internship: any): Promise<Internship> => {
        const tags = await fetchInternshipTags(internship.id);
        return {
          ...internship,
          tags
        };
      })
  );
  
  return internshipsWithTags;
}

/**
 * 特定のインターンシップのタグを取得
 */
export async function fetchInternshipTags(internshipId: string): Promise<InternshipTag[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('internship_tag_relations')
    .select(`
      tag:internship_tags (
        id,
        name,
        category
      )
    `)
    .eq('internship_id', internshipId);
  
  if (error) {
    console.error('Error fetching internship tags:', error);
    return [];
  }
  
  // tag情報を展開
  return (data ?? []).map((item: any) => item.tag).filter(Boolean);
}
