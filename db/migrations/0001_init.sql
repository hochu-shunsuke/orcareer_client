-- 新卒採用アプリケーション データベース設計 (オルキャリ)
-- Database: PostgreSQL (Supabase)

-- uuid-osspの代わりにpgcryptoを有効にしてgen_random_uuid()を使用
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- ユーザー関連テーブル
-- ========================================

-- users Table
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth0_user_id varchar(255) UNIQUE NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    last_login_at timestamptz,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE public.users IS 'ユーザーの基本認証情報テーブル';
COMMENT ON COLUMN public.users.auth0_user_id IS 'Auth0のユーザーID';
COMMENT ON COLUMN public.users.email IS 'メールアドレス';
COMMENT ON COLUMN public.users.last_login_at IS '最終ログイン日時';

-- user_profiles Table
CREATE TABLE public.user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL,
    last_name varchar(100) NOT NULL,
    first_name varchar(100) NOT NULL,
    last_name_kana varchar(100) NOT NULL,
    first_name_kana varchar(100) NOT NULL,
    university varchar(255) NOT NULL,
    faculty varchar(255),
    department varchar(255),
    graduation_year integer NOT NULL,
    phone_number varchar(20) NOT NULL,
    postal_code varchar(10) NOT NULL,
    address text NOT NULL,
    birthday date NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_profiles_user_id FOREIGN KEY (user_id) REFERENCES public.users(id)
);
COMMENT ON TABLE public.user_profiles IS 'ユーザーのプロフィール情報テーブル';
COMMENT ON COLUMN public.user_profiles.user_id IS 'ユーザーID';
COMMENT ON COLUMN public.user_profiles.last_name IS '姓';
COMMENT ON COLUMN public.user_profiles.first_name IS '名';
COMMENT ON COLUMN public.user_profiles.last_name_kana IS '姓（ふりがな）';
COMMENT ON COLUMN public.user_profiles.first_name_kana IS '名（ふりがな）';
COMMENT ON COLUMN public.user_profiles.university IS '大学名';
COMMENT ON COLUMN public.user_profiles.faculty IS '学部（NULL許容）';
COMMENT ON COLUMN public.user_profiles.department IS '学科（NULL許容）';
COMMENT ON COLUMN public.user_profiles.graduation_year IS '卒業年';
COMMENT ON COLUMN public.user_profiles.phone_number IS '電話番号';
COMMENT ON COLUMN public.user_profiles.postal_code IS '郵便番号';
COMMENT ON COLUMN public.user_profiles.address IS '住所';
COMMENT ON COLUMN public.user_profiles.birthday IS '生年月日';
CREATE INDEX idx_user_profiles_graduation_year ON public.user_profiles(graduation_year);
CREATE INDEX idx_user_profiles_university ON public.user_profiles(university);


-- user_details Table
CREATE TABLE public.user_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL,
    self_pr text,
    gakuchika text,
    skill text,
    qualification text,
    portfolio_url varchar(500),
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_details_user_id FOREIGN KEY (user_id) REFERENCES public.users(id)
);
COMMENT ON TABLE public.user_details IS 'ユーザーの詳細情報（自己PRなど）テーブル';
COMMENT ON COLUMN public.user_details.user_id IS 'ユーザーID';
COMMENT ON COLUMN public.user_details.self_pr IS '自己PR';
COMMENT ON COLUMN public.user_details.gakuchika IS '学生時代に力を入れたこと';
COMMENT ON COLUMN public.user_details.skill IS '保有スキル';
COMMENT ON COLUMN public.user_details.qualification IS '資格';
COMMENT ON COLUMN public.user_details.portfolio_url IS 'ポートフォリオURL';

-- ========================================
-- マスタデータテーブル
-- ========================================

-- company_statuses Table
CREATE TABLE public.company_statuses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(50) UNIQUE NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN public.company_statuses.name IS 'draft/published/archived';

-- listing_classifications Table
CREATE TABLE public.listing_classifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) UNIQUE NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN public.listing_classifications.name IS '上場区分名';

-- industries Table
CREATE TABLE public.industries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) UNIQUE NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN public.industries.name IS '業界名';

-- job_types Table
CREATE TABLE public.job_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) UNIQUE NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN public.job_types.name IS '職種名';

-- prefectures Table
CREATE TABLE public.prefectures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(20) UNIQUE NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN public.prefectures.name IS '都道府県名';

-- areas Table
CREATE TABLE public.areas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    prefecture_id uuid NOT NULL,
    name varchar(50) NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_areas_prefecture_id_name UNIQUE (prefecture_id, name),
    CONSTRAINT fk_areas_prefecture_id FOREIGN KEY (prefecture_id) REFERENCES public.prefectures(id)
);
COMMENT ON COLUMN public.areas.prefecture_id IS '都道府県ID';
COMMENT ON COLUMN public.areas.name IS 'エリア名';
CREATE INDEX idx_areas_prefecture_id ON public.areas(prefecture_id);


-- internship_tags Table
CREATE TABLE public.internship_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) UNIQUE NOT NULL,
    category varchar(50),
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN public.internship_tags.name IS 'タグ名';
COMMENT ON COLUMN public.internship_tags.category IS 'タグカテゴリ';
CREATE INDEX idx_internship_tags_category ON public.internship_tags(category);

-- ========================================
-- 企業関連テーブル
-- ========================================

-- companies Table
CREATE TABLE public.companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    name_kana varchar(255),
    logo_url varchar(500),
    website_url varchar(500),
    status_id uuid,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_companies_status_id FOREIGN KEY (status_id) REFERENCES public.company_statuses(id)
);
COMMENT ON COLUMN public.companies.name IS '企業名';
COMMENT ON COLUMN public.companies.name_kana IS '企業名（ふりがな）';
COMMENT ON COLUMN public.companies.logo_url IS 'ロゴ画像URL';
COMMENT ON COLUMN public.companies.website_url IS '会社紹介ページURL';
COMMENT ON COLUMN public.companies.status_id IS 'ステータスID';
CREATE INDEX idx_companies_status_id ON public.companies(status_id);

-- company_overviews Table
CREATE TABLE public.company_overviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid UNIQUE NOT NULL,
    industry_id uuid,
    established_year integer,
    headquarters_address text,
    employee_count integer,
    listing_classification_id uuid,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_company_overviews_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id),
    CONSTRAINT fk_company_overviews_industry_id FOREIGN KEY (industry_id) REFERENCES public.industries(id),
    CONSTRAINT fk_company_overviews_listing_id FOREIGN KEY (listing_classification_id) REFERENCES public.listing_classifications(id)
);
COMMENT ON COLUMN public.company_overviews.company_id IS '企業ID';
COMMENT ON COLUMN public.company_overviews.industry_id IS '業界ID';
COMMENT ON COLUMN public.company_overviews.established_year IS '設立年';
COMMENT ON COLUMN public.company_overviews.headquarters_address IS '本社住所';
COMMENT ON COLUMN public.company_overviews.employee_count IS '従業員数';
COMMENT ON COLUMN public.company_overviews.listing_classification_id IS '上場区分ID';
CREATE INDEX idx_company_overviews_industry_id ON public.company_overviews(industry_id);
CREATE INDEX idx_company_overviews_listing_id ON public.company_overviews(listing_classification_id);


-- company_data Table
CREATE TABLE public.company_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid UNIQUE NOT NULL,
    profile text,
    business_content text,
    headquarters_location text,
    offices text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_company_data_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
COMMENT ON COLUMN public.company_data.company_id IS '企業ID';
COMMENT ON COLUMN public.company_data.profile IS 'プロフィール';
COMMENT ON COLUMN public.company_data.business_content IS '事業内容';
COMMENT ON COLUMN public.company_data.headquarters_location IS '本社所在地';
COMMENT ON COLUMN public.company_data.offices IS '事業所';

-- company_mvvs Table
CREATE TABLE public.company_mvvs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid UNIQUE NOT NULL,
    mission text,
    vision text,
    company_value text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_company_mvvs_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
COMMENT ON COLUMN public.company_mvvs.company_id IS '企業ID';
COMMENT ON COLUMN public.company_mvvs.mission IS 'ミッション';
COMMENT ON COLUMN public.company_mvvs.vision IS 'ビジョン';
COMMENT ON COLUMN public.company_mvvs.company_value IS 'バリュー';

-- company_contacts Table
CREATE TABLE public.company_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    contact_name varchar(100),
    phone_number varchar(20),
    email varchar(255),
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_company_contacts_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
COMMENT ON COLUMN public.company_contacts.company_id IS '企業ID';
COMMENT ON COLUMN public.company_contacts.contact_name IS '担当者名';
COMMENT ON COLUMN public.company_contacts.phone_number IS '電話番号';
COMMENT ON COLUMN public.company_contacts.email IS 'メールアドレス';
CREATE INDEX idx_company_contacts_company_id ON public.company_contacts(company_id);

-- company_areas Table
CREATE TABLE public.company_areas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    area_id uuid NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_company_areas_company_id_area_id UNIQUE (company_id, area_id),
    CONSTRAINT fk_company_areas_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id),
    CONSTRAINT fk_company_areas_area_id FOREIGN KEY (area_id) REFERENCES public.areas(id)
);
COMMENT ON COLUMN public.company_areas.company_id IS '企業ID';
COMMENT ON COLUMN public.company_areas.area_id IS 'エリアID';

-- ========================================
-- インターンシップ関連テーブル
-- ========================================

-- internships Table
CREATE TABLE public.internships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    title varchar(255),
    job_type_id uuid,
    job_type_description text,
    job_description text,
    skills_to_acquire text,
    work_location varchar(255),
    work_hours varchar(255),
    hourly_wage varchar(100),
    required_skills text,
    preferred_skills text,
    selection_flow text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_internships_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id),
    CONSTRAINT fk_internships_job_type_id FOREIGN KEY (job_type_id) REFERENCES public.job_types(id)
);
COMMENT ON COLUMN public.internships.company_id IS '企業ID';
COMMENT ON COLUMN public.internships.title IS 'インターンシップタイトル（NULL許容）';
COMMENT ON COLUMN public.internships.job_type_id IS '職種ID';
COMMENT ON COLUMN public.internships.job_type_description IS '職種の説明';
COMMENT ON COLUMN public.internships.job_description IS '仕事内容';
COMMENT ON COLUMN public.internships.skills_to_acquire IS '身につくスキル';
COMMENT ON COLUMN public.internships.work_location IS '勤務地';
COMMENT ON COLUMN public.internships.work_hours IS '勤務時間';
COMMENT ON COLUMN public.internships.hourly_wage IS '時給';
COMMENT ON COLUMN public.internships.required_skills IS '必須スキル';
COMMENT ON COLUMN public.internships.preferred_skills IS '歓迎スキル';
COMMENT ON COLUMN public.internships.selection_flow IS '選考フロー';
CREATE INDEX idx_internships_company_id ON public.internships(company_id);
CREATE INDEX idx_internships_job_type_id ON public.internships(job_type_id);

-- internship_tag_relations Table
CREATE TABLE public.internship_tag_relations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_internship_tag_relations_internship_id_tag_id UNIQUE (internship_id, tag_id),
    CONSTRAINT fk_relations_internship_id FOREIGN KEY (internship_id) REFERENCES public.internships(id),
    CONSTRAINT fk_relations_tag_id FOREIGN KEY (tag_id) REFERENCES public.internship_tags(id)
);
COMMENT ON COLUMN public.internship_tag_relations.internship_id IS 'インターンシップID';
COMMENT ON COLUMN public.internship_tag_relations.tag_id IS 'タグID';

-- internship_areas Table
CREATE TABLE public.internship_areas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id uuid NOT NULL,
    area_id uuid NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_internship_areas_internship_id_area_id UNIQUE (internship_id, area_id),
    CONSTRAINT fk_internship_areas_internship_id FOREIGN KEY (internship_id) REFERENCES public.internships(id),
    CONSTRAINT fk_internship_areas_area_id FOREIGN KEY (area_id) REFERENCES public.areas(id)
);
COMMENT ON COLUMN public.internship_areas.internship_id IS 'インターンシップID';
COMMENT ON COLUMN public.internship_areas.area_id IS 'エリアID';


-- ========================================
-- 本選考関連テーブル
-- ========================================

-- recruitments Table
CREATE TABLE public.recruitments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    job_type_id uuid,
    job_type_description text,
    job_description text,
    work_location varchar(255),
    work_hours varchar(255),
    number_of_hires varchar(100),
    salary_bonus text,
    annual_holidays integer,
    holidays_leave text,
    benefits text,
    selection_flow text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recruitments_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id),
    CONSTRAINT fk_recruitments_job_type_id FOREIGN KEY (job_type_id) REFERENCES public.job_types(id)
);
COMMENT ON COLUMN public.recruitments.company_id IS '企業ID';
COMMENT ON COLUMN public.recruitments.job_type_id IS '職種ID';
COMMENT ON COLUMN public.recruitments.job_type_description IS '職種の説明';
COMMENT ON COLUMN public.recruitments.job_description IS '仕事内容';
COMMENT ON COLUMN public.recruitments.work_location IS '勤務地';
COMMENT ON COLUMN public.recruitments.work_hours IS '勤務時間';
COMMENT ON COLUMN public.recruitments.number_of_hires IS '募集人数';
COMMENT ON COLUMN public.recruitments.salary_bonus IS '給与・賞与';
COMMENT ON COLUMN public.recruitments.annual_holidays IS '年間休日数';
COMMENT ON COLUMN public.recruitments.holidays_leave IS '休日休暇';
COMMENT ON COLUMN public.recruitments.benefits IS '待遇・福利厚生・社内制度';
COMMENT ON COLUMN public.recruitments.selection_flow IS '選考フロー';
CREATE INDEX idx_recruitments_company_id ON public.recruitments(company_id);
CREATE INDEX idx_recruitments_job_type_id ON public.recruitments(job_type_id);

-- recruitment_areas Table
CREATE TABLE public.recruitment_areas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recruitment_id uuid NOT NULL,
    area_id uuid NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_recruitment_areas_recruitment_id_area_id UNIQUE (recruitment_id, area_id),
    CONSTRAINT fk_recruitment_areas_recruitment_id FOREIGN KEY (recruitment_id) REFERENCES public.recruitments(id),
    CONSTRAINT fk_recruitment_areas_area_id FOREIGN KEY (area_id) REFERENCES public.areas(id)
);
COMMENT ON COLUMN public.recruitment_areas.recruitment_id IS '本選考ID';
COMMENT ON COLUMN public.recruitment_areas.area_id IS 'エリアID';

-- ========================================
-- お気に入り機能テーブル
-- ========================================

-- favorites Table
CREATE TABLE public.favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_favorites_user_id_company_id UNIQUE (user_id, company_id),
    CONSTRAINT fk_favorites_user_id FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT fk_favorites_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
COMMENT ON COLUMN public.favorites.user_id IS 'ユーザーID';
COMMENT ON COLUMN public.favorites.company_id IS '企業ID';
COMMENT ON COLUMN public.favorites.created_at IS 'お気に入り登録日時';