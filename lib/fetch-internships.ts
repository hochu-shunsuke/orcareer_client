
import { createSupabaseClient } from "@/lib/supabase-client";
import { Internship, InternshipTag } from "@/types";

/**
 * 複数のインターンシップのタグを一括取得（N+1問題の解消）
 */
async function fetchInternshipTagsBulk(internshipIds: string[]): Promise<Map<string, InternshipTag[]>> {
  if (internshipIds.length === 0) {
    return new Map();
  }

  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('internship_tag_relations')
    .select(`
      internship_id,
      tag:internship_tags (
        id,
        name,
        category
      )
    `)
    .in('internship_id', internshipIds);
  
  if (error) {
    console.error('Error fetching internship tags in bulk:', error);
    return new Map();
  }

  // internship_id ごとにタグをグループ化
  const tagsByInternshipId = new Map<string, InternshipTag[]>();
  
  (data ?? []).forEach((item: any) => {
    if (item.tag && item.internship_id) {
      const tags = tagsByInternshipId.get(item.internship_id) || [];
      tags.push(item.tag);
      tagsByInternshipId.set(item.internship_id, tags);
    }
  });
  
  return tagsByInternshipId;
}

/**
 * internships + companies + tags情報をJOINして取得するサーバー用関数
 * タグは一括取得してN+1問題を解消
 */
export async function fetchInternshipsWithCompanyAndTags(): Promise<Internship[]> {
  const supabase = createSupabaseClient();
  
  // internships + companies
  const { data: internships, error } = await supabase
    .from('internships')
    .select(`*, company:companies(*)`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching internships with company and tags:', error);
    return [];
  }

  const validInternships = (internships ?? []).filter((i: any) => i.company);
  
  if (validInternships.length === 0) {
    return [];
  }

  // 全インターンシップのIDを抽出
  const internshipIds = validInternships.map((i: any) => i.id);
  
  // タグを一括取得
  const tagsByInternshipId = await fetchInternshipTagsBulk(internshipIds);
  
  // タグをマージ
  return validInternships.map((internship: any): Internship => ({
    ...internship,
    tags: tagsByInternshipId.get(internship.id) || []
  }));
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

/**
 * 特定のインターンシップ詳細を取得（会社情報・タグ付き）
 */
export async function fetchInternshipById(internshipId: string): Promise<Internship | null> {
  const supabase = createSupabaseClient();
  
  const { data: internship, error } = await supabase
    .from('internships')
    .select(`*, company:companies(*)`)
    .eq('id', internshipId)
    .single();
  
  if (error) {
    console.error('Error fetching internship:', error);
    return null;
  }
  
  if (!internship) return null;
  
  // タグを取得
  const tags = await fetchInternshipTags(internshipId);
  
  return {
    ...internship,
    tags
  };
}

/**
 * 特定企業のインターンシップ一覧を取得（タグ付き）
 * タグは一括取得してN+1問題を解消
 */
export async function fetchInternshipsByCompanyId(companyId: string): Promise<Internship[]> {
  const supabase = createSupabaseClient();
  
  const { data: internships, error } = await supabase
    .from('internships')
    .select(`*, company:companies(*)`)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching company internships:', error);
    return [];
  }

  if (!internships || internships.length === 0) {
    return [];
  }

  // 全インターンシップのIDを抽出
  const internshipIds = internships.map((i: any) => i.id);
  
  // タグを一括取得
  const tagsByInternshipId = await fetchInternshipTagsBulk(internshipIds);
  
  // タグをマージ
  return internships.map((internship: any): Internship => ({
    ...internship,
    tags: tagsByInternshipId.get(internship.id) || []
  }));
}
