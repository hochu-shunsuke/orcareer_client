// データ型定義
export interface Company {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  location: string;
  prefecture: string; // 愛知、岐阜、三重、静岡
  industry: string;
  employees: number;
  established: number;
  capital: number; // 資本金（万円）
  jobs: Job[];
  internships: Internship[];
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract';
  salary: {
    min: number;
    max: number;
    type: 'monthly' | 'annual';
  };
  benefits: string[];
  workingHours: string;
  holidays: string;
  applicationDeadline: string;
  startDate: string;
  tags: string[];
  isRemoteOk: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior';
  createdAt: string;
  updatedAt: string;
}

export interface Internship {
  id: string;
  companyId: string;
  title: string;
  description: string;
  program: string;
  duration: string; // "1週間", "1ヶ月", "3ヶ月"
  location: string;
  compensation: {
    amount: number;
    type: 'daily' | 'monthly' | 'total' | 'none';
  };
  requirements: string[];
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  tags: string[];
  targetGraduationYears: string[]; // "27卒", "28卒"など
  isRemoteOk: boolean;
  capacity: number; // 定員
  applicationCount: number; // 現在の応募者数
  createdAt: string;
  updatedAt: string;
}
