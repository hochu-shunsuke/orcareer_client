import { Card, CardContent } from "@/components/ui/card";
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Star } from "lucide-react";

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* 左カラム：企業ロゴ */}
          <div className="w-32 h-32 flex-shrink-0 bg-white flex items-center justify-center rounded">
            {company.logo_url && company.logo_url.trim() !== '' ? (
              <img
                src={company.logo_url}
                alt={`${company.name}のロゴ`}
                width={128}
                height={128}
                className="object-contain"
              />
            ) : (
              <img
                src={"/placeholder-logo.svg"}
                alt="No Logo"
                width={128}
                height={128}
                className="object-contain opacity-60"
              />
            )}
          </div>
          {/* 右カラム：情報・アクション */}
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold mb-2">{company.name}</h2>
            <div className="text-sm text-gray-700 mb-2">
              業界: {company.company_overviews?.industry_id ?? '未設定'} ／
              本社: {company.company_data?.headquarters_location ?? company.company_overviews?.headquarters_address ?? '未設定'} ／
              従業員数: {company.company_overviews?.employee_count ?? '未設定'}
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button asChild>
                <Link href={`/companies/${company.id}`}>詳細を見る</Link>
              </Button>
              <Button variant="secondary">
                <Star className="w-4 h-4 mr-1" />
                お気に入り
              </Button>
            </div>
            {/* デバッグ用: 企業オブジェクト全体 */}
            <div className="bg-gray-100 text-xs p-2 rounded break-all mt-4">
              <strong>Companyオブジェクト全体:</strong>
              <pre>{JSON.stringify(company, null, 2)}</pre>
            </div>

            {/* 求人リスト表示＋デバッグ */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">求人一覧</h3>
              {company.recruitments && company.recruitments.length > 0 ? (
                <ul className="space-y-2">
                  {company.recruitments.map((job) => (
                    <li key={job.id} className="border rounded p-3 bg-gray-50">
                      <div className="font-bold text-base">{job.job_type_description ?? '職種未設定'}</div>
                      <div className="text-sm text-gray-600 mb-1">{job.job_description ?? '求人内容なし'}</div>
                      <div className="text-xs text-gray-500">勤務地: {job.work_location ?? '未設定'} / 勤務時間: {job.work_hours ?? '未設定'}</div>
                      <div className="mt-1">
                        <Link href={"/jobs/" + job.id} className="text-blue-600 hover:underline text-xs">詳細を見る</Link>
                      </div>
                      {/* デバッグ用: 求人オブジェクト全体 */}
                      <pre className="text-xs bg-gray-200 rounded p-2 mt-2 overflow-x-auto">{JSON.stringify(job, null, 2)}</pre>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-400">この企業の公開求人はありません</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}