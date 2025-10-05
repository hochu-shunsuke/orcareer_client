// アプリ全体で使う型定義

// 企業情報の軽量版（リレーション用）
export interface CompanyBasicInfo {
  id: string;
  name: string;
  name_kana?: string | null;
  logo_url: string | null;
  company_overviews?: {
    industry?: {
      name: string;
    };
  };
}

// companiesテーブルの全カラムに準拠したCompany型
export interface Company {
  id: string;
  admin_id: number;
  name: string;
  name_kana: string | null;
  logo_url: string | null;
  website_url: string | null;
  status_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  // 企業に紐づく求人一覧
  recruitments?: Recruitment[];
  // 企業の業界・従業員数など（company_overviews）
  company_overviews?: {
    id: string;
    company_id: string;
    industry_id: string | null;
    industry?: {
      name: string;
    };
    established_year: number | null;
    headquarters_address: string | null;
    employee_count: number | null;
    listing_classification_id: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  // 企業の本社情報など（company_data）
  company_data?: {
    id: string;
    company_id: string;
    profile: string | null;
    business_content: string | null;
    headquarters_location: string | null;
    offices: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
}

// recruitmentsテーブルの全カラムに準拠したRecruitment型
export interface Recruitment {
  id: string;
  company_id: string;
  job_type_id: string | null;
  job_type?: {
    name: string;
  };
  job_type_description: string | null;
  job_description: string | null;
  work_location: string | null;
  work_hours: string | null;
  number_of_hires: string | null;
  salary_bonus: string | null;
  annual_holidays: number | null;
  holidays_leave: string | null;
  benefits: string | null;
  selection_flow: string | null;
  created_at: string | null;
  updated_at: string | null;
  // company情報は拡張で持つ
  company?: CompanyBasicInfo;
}

// 後方互換性のため、Job型をRecruitment型のエイリアスとして残す
/** @deprecated Recruitmentを使用してください */
export type Job = Recruitment;

// internshipsテーブルの全カラムに準拠したInternship型
export interface Internship {
  id: string;
  company_id: string;
  title: string | null;
  job_type_id: string | null;
  job_type?: {
    name: string;
  };
  job_type_description: string | null;
  job_description: string | null;
  skills_to_acquire: string | null;
  work_location: string | null;
  work_hours: string | null;
  hourly_wage: string | null;
  required_skills: string | null;
  preferred_skills: string | null;
  selection_flow: string | null;
  created_at: string | null;
  updated_at: string | null;
  // company情報は拡張で持つ
  company?: CompanyBasicInfo;
  // タグ情報（internship_tag_relationsから取得）
  tags?: InternshipTag[];
}

// internship_tagsテーブルに準拠したInternshipTag型
export interface InternshipTag {
  id: string;
  name: string;
  category?: string | null;
  created_at?: string | null;
}
