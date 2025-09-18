// アプリ全体で使う型定義
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
}

// recruitmentsテーブルの全カラムに準拠したJob型
export interface Job {
  id: string;
  company_id: string;
  job_type_id: string | null;
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
  company?: {
    id: string;
    name: string;
    logo: string;
    location?: string;
    industry?: string;
    employeeCount?: number;
    capital?: number;
  };
}

// internshipsテーブルの全カラムに準拠したInternship型
export interface Internship {
  id: string;
  company_id: string;
  title: string | null;
  job_type_id: string | null;
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
  company?: {
    id: string;
    name: string;
    logo_url: string;
  };
}
