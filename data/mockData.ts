import { Company } from './types';

export const mockCompanies: Company[] = [
  {
    id: 'company-001',
    name: 'トヨタ自動車株式会社',
    description: '世界をリードする自動車メーカーとして、モビリティ社会の未来を創造しています。次世代の自動車技術開発に挑戦する仲間を募集しています。',
    logo: '/placeholder-logo.svg',
    website: 'https://toyota.jp',
    location: '愛知県豊田市',
    prefecture: '愛知',
    industry: '自動車・輸送機器',
    employees: 70000,
    established: 1937,
    capital: 6354800, // 万円
    jobs: [
      {
        id: 'job-001',
        companyId: 'company-001',
        title: '自動車開発エンジニア（新卒）',
        description: '次世代自動車の開発に携わり、世界に革新をもたらすエンジニアを募集します。電動化、自動運転技術の最前線で活躍できます。',
        requirements: [
          '機械工学、電気電子工学、情報工学系学部卒業見込み',
          'C++、Python等のプログラミング経験',
          'チームワークを重視する方'
        ],
        responsibilities: [
          '自動車の設計・開発',
          '新技術の研究・実装',
          'テスト・評価業務',
          'チーム内でのコミュニケーション'
        ],
        location: '愛知県豊田市',
        employmentType: 'full-time',
        salary: {
          min: 250000,
          max: 300000,
          type: 'monthly'
        },
        benefits: [
          '社会保険完備',
          '賞与年2回',
          '研修制度充実',
          '社員食堂',
          '住宅手当'
        ],
        workingHours: '8:00-17:00（実働8時間）',
        holidays: '土日祝、夏季休暇、年末年始',
        applicationDeadline: '2025-03-31',
        startDate: '2025-04-01',
        tags: ['自動車', 'エンジニア', '新卒', '愛知'],
        isRemoteOk: false,
        experienceLevel: 'entry',
        createdAt: '2025-01-15T09:00:00Z',
        updatedAt: '2025-01-15T09:00:00Z'
      },
      {
        id: 'job-002',
        companyId: 'company-001',
        title: 'ITシステム開発（新卒）',
        description: '自動車製造におけるDX推進を担当するシステムエンジニアを募集。最新技術を活用した業務効率化に取り組みます。',
        requirements: [
          '情報工学、コンピューターサイエンス系学部卒業見込み',
          'Java、Python、JavaScript等の開発経験',
          '新しい技術への関心が高い方'
        ],
        responsibilities: [
          '社内システムの開発・保守',
          'データ分析システムの構築',
          'AI・IoT技術の活用検討',
          'プロジェクト管理'
        ],
        location: '愛知県豊田市',
        employmentType: 'full-time',
        salary: {
          min: 280000,
          max: 320000,
          type: 'monthly'
        },
        benefits: [
          '社会保険完備',
          '賞与年2回',
          '技術書購入補助',
          '資格取得支援',
          'リモートワーク可'
        ],
        workingHours: '9:00-18:00（実働8時間）',
        holidays: '土日祝、夏季休暇、年末年始',
        applicationDeadline: '2025-03-31',
        startDate: '2025-04-01',
        tags: ['IT', 'システム開発', '新卒', 'DX'],
        isRemoteOk: true,
        experienceLevel: 'entry',
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z'
      }
    ],
    internships: [
      {
        id: 'internship-001',
        companyId: 'company-001',
        title: '自動車開発インターンシップ',
        description: '実際の自動車開発現場で、最新技術に触れながら実践的な経験を積むことができるプログラムです。',
        program: '技術系インターンシップ',
        duration: '2週間',
        location: '愛知県豊田市',
        compensation: {
          amount: 10000,
          type: 'daily'
        },
        requirements: [
          '機械工学、電気工学系の学部生・大学院生',
          '自動車技術への関心',
          '基本的なプログラミング知識'
        ],
        applicationDeadline: '2025-05-31',
        startDate: '2025-08-01',
        endDate: '2025-08-14',
        tags: ['自動車', '技術', '開発', '愛知'],
        targetGraduationYears: ['27卒', '28卒'],
        isRemoteOk: false,
        capacity: 20,
        applicationCount: 12,
        createdAt: '2025-02-01T09:00:00Z',
        updatedAt: '2025-02-01T09:00:00Z'
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T09:00:00Z'
  },
  {
    id: 'company-002',
    name: '三菱重工業株式会社',
    description: '航空宇宙、エネルギー、インフラなど幅広い分野で社会基盤を支える技術を提供しています。未来の技術者を育成します。',
    logo: '/placeholder-logo.svg',
    website: 'https://mhi.co.jp',
    location: '愛知県名古屋市',
    prefecture: '愛知',
    industry: '重工業・機械',
    employees: 22000,
    established: 1950,
    capital: 265800,
    jobs: [
      {
        id: 'job-003',
        companyId: 'company-002',
        title: '航空宇宙エンジニア（新卒）',
        description: '次世代航空機・宇宙機の開発に携わり、人類の未来に貢献するエンジニアを募集します。',
        requirements: [
          '航空宇宙工学、機械工学系学部卒業見込み',
          'CAD操作経験',
          '英語での技術文書読解能力'
        ],
        responsibilities: [
          '航空機・宇宙機の設計開発',
          'シミュレーション解析',
          '試験・検証業務',
          '海外プロジェクトへの参画'
        ],
        location: '愛知県名古屋市',
        employmentType: 'full-time',
        salary: {
          min: 270000,
          max: 310000,
          type: 'monthly'
        },
        benefits: [
          '社会保険完備',
          '賞与年2回',
          '海外研修制度',
          '技術者表彰制度',
          '退職金制度'
        ],
        workingHours: '8:30-17:30（実働8時間）',
        holidays: '土日祝、GW、夏季休暇、年末年始',
        applicationDeadline: '2025-03-31',
        startDate: '2025-04-01',
        tags: ['航空宇宙', 'エンジニア', '新卒', '名古屋'],
        isRemoteOk: false,
        experienceLevel: 'entry',
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-10T09:00:00Z'
      }
    ],
    internships: [
      {
        id: 'internship-002',
        companyId: 'company-002',
        title: '航空宇宙技術体験インターンシップ',
        description: '最先端の航空宇宙技術に触れ、エンジニアとしての素養を身につけるプログラムです。',
        program: '技術体験プログラム',
        duration: '1週間',
        location: '愛知県名古屋市',
        compensation: {
          amount: 0,
          type: 'none'
        },
        requirements: [
          '理工系学部の学部生・大学院生',
          '航空宇宙分野への興味',
          '基礎的な数学・物理知識'
        ],
        applicationDeadline: '2025-06-30',
        startDate: '2025-09-02',
        endDate: '2025-09-06',
        tags: ['航空宇宙', '技術体験', '名古屋'],
        targetGraduationYears: ['27卒', '28卒'],
        isRemoteOk: false,
        capacity: 15,
        applicationCount: 8,
        createdAt: '2025-02-05T09:00:00Z',
        updatedAt: '2025-02-05T09:00:00Z'
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-10T09:00:00Z'
  },
  {
    id: 'company-003',
    name: '株式会社デンソー',
    description: '自動車部品のグローバルリーダーとして、モビリティの電動化・知能化を推進しています。技術で未来を創る仲間を募集します。',
    logo: '/placeholder-logo.svg',
    website: 'https://denso.com',
    location: '愛知県刈谷市',
    prefecture: '愛知',
    industry: '自動車部品・電子機器',
    employees: 45000,
    established: 1949,
    capital: 187457,
    jobs: [
      {
        id: 'job-004',
        companyId: 'company-003',
        title: '電子制御システム開発（新卒）',
        description: '自動車の電子制御システム開発において、次世代技術の研究・開発に携わります。',
        requirements: [
          '電気電子工学、情報工学系学部卒業見込み',
          'C言語、MATLAB/Simulinkの知識',
          '組み込みシステムへの興味'
        ],
        responsibilities: [
          '車載ECUの開発',
          '制御アルゴリズムの設計',
          'シミュレーション・評価',
          '品質保証業務'
        ],
        location: '愛知県刈谷市',
        employmentType: 'full-time',
        salary: {
          min: 260000,
          max: 300000,
          type: 'monthly'
        },
        benefits: [
          '社会保険完備',
          '賞与年2回',
          '持株会制度',
          '社内カフェテリア',
          '育児支援制度'
        ],
        workingHours: '8:00-16:45（実働7時間45分）',
        holidays: '土日祝、GW、夏季休暇、年末年始',
        applicationDeadline: '2025-03-31',
        startDate: '2025-04-01',
        tags: ['電子制御', '組み込み', '新卒', '愛知'],
        isRemoteOk: false,
        experienceLevel: 'entry',
        createdAt: '2025-01-12T09:00:00Z',
        updatedAt: '2025-01-12T09:00:00Z'
      }
    ],
    internships: [
      {
        id: 'internship-003',
        companyId: 'company-003',
        title: '組み込みシステム開発体験',
        description: '実際の車載システム開発現場で、組み込み技術の基礎から応用まで学べるプログラムです。',
        program: '技術系インターンシップ',
        duration: '3週間',
        location: '愛知県刈谷市',
        compensation: {
          amount: 150000,
          type: 'total'
        },
        requirements: [
          '電気・電子・情報系の学部生・大学院生',
          'プログラミング基礎知識',
          '車載システムへの関心'
        ],
        applicationDeadline: '2025-05-15',
        startDate: '2025-08-15',
        endDate: '2025-09-05',
        tags: ['組み込み', '車載システム', '愛知'],
        targetGraduationYears: ['27卒', '28卒'],
        isRemoteOk: false,
        capacity: 12,
        applicationCount: 7,
        createdAt: '2025-02-10T09:00:00Z',
        updatedAt: '2025-02-10T09:00:00Z'
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-12T09:00:00Z'
  },
  {
    id: 'company-004',
    name: '静岡銀行',
    description: '地域に根ざした金融サービスで、静岡県の発展を支える地方銀行です。デジタル変革とお客様サービス向上に取り組んでいます。',
    logo: '/placeholder-logo.svg',
    website: 'https://shizuokabank.co.jp',
    location: '静岡県静岡市',
    prefecture: '静岡',
    industry: '金融・銀行',
    employees: 2800,
    established: 1943,
    capital: 90210,
    jobs: [
      {
        id: 'job-005',
        companyId: 'company-004',
        title: '法人営業職（新卒）',
        description: '地域企業のパートナーとして、資金調達や経営課題解決をサポートする法人営業職を募集します。',
        requirements: [
          '大学卒業見込み（学部不問）',
          'コミュニケーション能力',
          '地域貢献への意欲'
        ],
        responsibilities: [
          '法人顧客への融資・金融商品提案',
          '経営相談・事業支援',
          '新規開拓営業',
          '顧客との長期的関係構築'
        ],
        location: '静岡県内各支店',
        employmentType: 'full-time',
        salary: {
          min: 210000,
          max: 250000,
          type: 'monthly'
        },
        benefits: [
          '社会保険完備',
          '賞与年2回',
          '退職金制度',
          '社内研修充実',
          '転勤手当'
        ],
        workingHours: '9:00-17:00（実働7時間）',
        holidays: '土日祝、夏季休暇、年末年始',
        applicationDeadline: '2025-03-31',
        startDate: '2025-04-01',
        tags: ['法人営業', '金融', '新卒', '静岡'],
        isRemoteOk: false,
        experienceLevel: 'entry',
        createdAt: '2025-01-08T09:00:00Z',
        updatedAt: '2025-01-08T09:00:00Z'
      },
      {
        id: 'job-006',
        companyId: 'company-004',
        title: 'システム企画職（新卒）',
        description: '銀行業務のデジタル化を推進するシステム企画・開発職。金融とITの融合領域で活躍できます。',
        requirements: [
          '情報系学部卒業見込み',
          'システム開発経験（学習レベル可）',
          '金融業界への興味'
        ],
        responsibilities: [
          '銀行システムの企画・設計',
          'デジタル化プロジェクト推進',
          'ベンダーとの調整・管理',
          '業務効率化の提案'
        ],
        location: '静岡県静岡市',
        employmentType: 'full-time',
        salary: {
          min: 240000,
          max: 280000,
          type: 'monthly'
        },
        benefits: [
          '社会保険完備',
          '賞与年2回',
          '技術研修制度',
          '資格取得支援',
          'リモートワーク一部可'
        ],
        workingHours: '9:00-17:00（実働7時間）',
        holidays: '土日祝、夏季休暇、年末年始',
        applicationDeadline: '2025-03-31',
        startDate: '2025-04-01',
        tags: ['システム企画', '金融IT', '新卒', '静岡'],
        isRemoteOk: true,
        experienceLevel: 'entry',
        createdAt: '2025-01-18T09:00:00Z',
        updatedAt: '2025-01-18T09:00:00Z'
      }
    ],
    internships: [
      {
        id: 'internship-004',
        companyId: 'company-004',
        title: '銀行業務体験プログラム',
        description: '銀行の様々な業務を体験し、金融業界への理解を深めるプログラムです。',
        program: '業務体験プログラム',
        duration: '5日間',
        location: '静岡県静岡市',
        compensation: {
          amount: 5000,
          type: 'daily'
        },
        requirements: [
          '大学生・大学院生（学部不問）',
          '金融業界への関心',
          '静岡県内での就職希望'
        ],
        applicationDeadline: '2025-07-31',
        startDate: '2025-09-10',
        endDate: '2025-09-14',
        tags: ['銀行業務', '金融', '静岡'],
        targetGraduationYears: ['26卒', '27卒', '28卒'],
        isRemoteOk: false,
        capacity: 25,
        applicationCount: 18,
        createdAt: '2025-02-15T09:00:00Z',
        updatedAt: '2025-02-15T09:00:00Z'
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-18T09:00:00Z'
  },
  {
    id: 'company-005',
    name: '岐阜プラスチック工業株式会社',
    description: '環境に配慮したプラスチック製品の開発・製造を行う企業です。持続可能な社会の実現に向けて技術革新を続けています。',
    logo: '/placeholder-logo.svg',
    website: 'https://gifuplastic.co.jp',
    location: '岐阜県岐阜市',
    prefecture: '岐阜',
    industry: '化学・素材',
    employees: 850,
    established: 1962,
    capital: 12000,
    jobs: [
      {
        id: 'job-007',
        companyId: 'company-005',
        title: '材料開発エンジニア（新卒）',
        description: 'リサイクル可能な新素材の開発に携わり、環境問題の解決に貢献するエンジニアを募集します。',
        requirements: [
          '化学工学、材料工学系学部卒業見込み',
          '実験・分析経験',
          '環境問題への関心'
        ],
        responsibilities: [
          '新素材の研究開発',
          '製品の性能評価・改良',
          '品質管理・品質改善',
          '技術文書作成'
        ],
        location: '岐阜県岐阜市',
        employmentType: 'full-time',
        salary: {
          min: 220000,
          max: 260000,
          type: 'monthly'
        },
        benefits: [
          '社会保険完備',
          '賞与年2回',
          '研究開発費支援',
          '学会参加支援',
          '社員寮完備'
        ],
        workingHours: '8:30-17:30（実働8時間）',
        holidays: '土日祝、GW、夏季休暇、年末年始',
        applicationDeadline: '2025-03-31',
        startDate: '2025-04-01',
        tags: ['材料開発', '環境', '新卒', '岐阜'],
        isRemoteOk: false,
        experienceLevel: 'entry',
        createdAt: '2025-01-22T09:00:00Z',
        updatedAt: '2025-01-22T09:00:00Z'
      }
    ],
    internships: [
      {
        id: 'internship-005',
        companyId: 'company-005',
        title: '環境材料研究体験',
        description: '環境に優しい材料の研究開発プロセスを実際に体験できるプログラムです。',
        program: '研究開発体験プログラム',
        duration: '2週間',
        location: '岐阜県岐阜市',
        compensation: {
          amount: 8000,
          type: 'daily'
        },
        requirements: [
          '化学、材料工学系の学部生・大学院生',
          '実験経験',
          '環境技術への関心'
        ],
        applicationDeadline: '2025-06-15',
        startDate: '2025-08-20',
        endDate: '2025-09-02',
        tags: ['材料研究', '環境', '岐阜'],
        targetGraduationYears: ['27卒', '28卒'],
        isRemoteOk: false,
        capacity: 8,
        applicationCount: 5,
        createdAt: '2025-02-20T09:00:00Z',
        updatedAt: '2025-02-20T09:00:00Z'
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-22T09:00:00Z'
  },
  {
    id: 'company-006',
    name: '三重交通グループホールディングス',
    description: '三重県を中心とした交通インフラを支える企業グループです。地域の移動を支え、観光・物流サービスも展開しています。',
    logo: '/placeholder-logo.svg',
    website: 'https://sanco.co.jp',
    location: '三重県津市',
    prefecture: '三重',
    industry: '運輸・物流',
    employees: 3200,
    established: 1944,
    capital: 19800,
    jobs: [
      {
        id: 'job-008',
        companyId: 'company-006',
        title: '運行管理職（新卒）',
        description: 'バス運行の安全管理と効率的な運営を担当する運行管理職を募集します。地域の足を支える重要な仕事です。',
        requirements: [
          '大学卒業見込み（学部不問）',
          '責任感と安全意識の高い方',
          '地域貢献への意欲'
        ],
        responsibilities: [
          'バス運行計画の策定',
          '乗務員の勤務管理',
          '安全運行の監督・指導',
          '運行データの分析・改善'
        ],
        location: '三重県内各営業所',
        employmentType: 'full-time',
        salary: {
          min: 200000,
          max: 240000,
          type: 'monthly'
        },
        benefits: [
          '社会保険完備',
          '賞与年2回',
          '交通費全額支給',
          '運行管理者資格取得支援',
          '福利厚生施設利用可'
        ],
        workingHours: 'シフト制（早番6:00-15:00、遅番13:00-22:00等）',
        holidays: '月8-9日休み、有給休暇',
        applicationDeadline: '2025-03-31',
        startDate: '2025-04-01',
        tags: ['運行管理', '交通', '新卒', '三重'],
        isRemoteOk: false,
        experienceLevel: 'entry',
        createdAt: '2025-01-25T09:00:00Z',
        updatedAt: '2025-01-25T09:00:00Z'
      }
    ],
    internships: [
      {
        id: 'internship-006',
        companyId: 'company-006',
        title: '交通業界体験プログラム',
        description: '公共交通の運営について学び、地域交通の重要性を理解するプログラムです。',
        program: '業界理解プログラム',
        duration: '3日間',
        location: '三重県津市',
        compensation: {
          amount: 0,
          type: 'none'
        },
        requirements: [
          '大学生・大学院生（学部不問）',
          '交通・物流業界への関心',
          '地域活性化への興味'
        ],
        applicationDeadline: '2025-08-15',
        startDate: '2025-09-25',
        endDate: '2025-09-27',
        tags: ['交通業界', '公共交通', '三重'],
        targetGraduationYears: ['26卒', '27卒'],
        isRemoteOk: false,
        capacity: 20,
        applicationCount: 11,
        createdAt: '2025-02-25T09:00:00Z',
        updatedAt: '2025-02-25T09:00:00Z'
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-25T09:00:00Z'
  }
];

// 企業データを取得する関数
export const getCompanies = (): Company[] => {
  return mockCompanies;
};

// 企業IDから企業データを取得
export const getCompanyById = (id: string): Company | undefined => {
  return mockCompanies.find(company => company.id === id);
};

// 全ての求人データを取得
export const getAllJobs = () => {
  return mockCompanies.flatMap(company => 
    company.jobs.map(job => ({
      ...job,
      company: {
        id: company.id,
        name: company.name,
        logo: company.logo,
        location: company.location,
        industry: company.industry
      }
    }))
  );
};

// 全てのインターンシップデータを取得
export const getAllInternships = () => {
  return mockCompanies.flatMap(company => 
    company.internships.map(internship => ({
      ...internship,
      company: {
        id: company.id,
        name: company.name,
        logo: company.logo,
        location: company.location,
        industry: company.industry
      }
    }))
  );
};

// 県別企業検索
export const getCompaniesByPrefecture = (prefecture: string): Company[] => {
  return mockCompanies.filter(company => company.prefecture === prefecture);
};

// 業界別企業検索
export const getCompaniesByIndustry = (industry: string): Company[] => {
  return mockCompanies.filter(company => company.industry === industry);
};
