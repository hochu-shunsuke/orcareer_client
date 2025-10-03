import { Card, CardContent } from "@/components/ui/card";
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 relative">
      <CardContent className="p-6 pb-20">
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* 最終更新：右上 */}
          <div className="absolute right-6 top-2 text-xs text-neutral-400 md:block hidden">最終更新: {company.updated_at ? new Date(company.updated_at).toLocaleDateString() : '不明'}</div>
          {/* 左カラム：企業ロゴ */}
          <div className="w-48 h-48 flex-shrink-0 bg-white flex items-center justify-center rounded mx-auto md:mx-0">
            {company.logo_url && company.logo_url.trim() !== '' ? (
              <img
                src={company.logo_url}
                alt={`${company.name}のロゴ`}
                width={192}
                height={192}
                className="object-contain"
              />
            ) : (
              <img
                src={"/placeholder-logo.svg"}
                alt="No Logo"
                width={192}
                height={192}
                className="object-contain opacity-60"
              />
            )}
          </div>
          {/* 右カラム：情報・アクション */}
          <div className="flex-1 w-full">
            <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <h2 className="text-2xl font-bold tracking-tight inline-block align-middle">{company.name}</h2>
              {company.name_kana && (
                <span className="ml-2 align-middle text-xs text-neutral-500 rounded-full px-2 py-0.5 bg-neutral-100 inline-block w-auto max-w-full whitespace-nowrap">{company.name_kana}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-block border border-neutral-200 rounded-full px-3 py-0.5 text-xs font-medium bg-white">本社: {company.company_data?.headquarters_location ?? '未設定'}</span>
              <span className="inline-block border border-neutral-200 rounded-full px-3 py-0.5 text-xs font-medium bg-white">オフィス: {company.company_data?.offices ?? '未設定'}</span>
              <span className="inline-block border border-neutral-200 rounded-full px-3 py-0.5 text-xs font-medium bg-white">従業員数: {company.company_overviews?.employee_count ?? '未設定'}</span>
            </div>
            <div className="mb-4">
              <div className="text-sm text-neutral-800 leading-relaxed">{company.company_data?.profile ?? 'プロフィール未設定'}</div>
              {/* スマホ時のみ下部に最終更新 */}
              <div className="text-xs text-neutral-400 mt-2 text-right md:hidden">最終更新: {company.updated_at ? new Date(company.updated_at).toLocaleDateString() : '不明'}</div>
            </div>

            {/* 求人リスト表示 */}
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2 border-b border-neutral-100 pb-1">求人一覧</h3>
              {company.recruitments && company.recruitments.length > 0 ? (
                <ul className="space-y-2">
                  {company.recruitments.map((job, idx) => (
                    <li key={idx}>
                      <Link href={`/companies/${idx}`} className="block border border-neutral-200 rounded-lg p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors">
                        <div className="text-lg font-bold mb-1 text-neutral-900">{job.job_type_description ?? '職種未設定'}</div>
                        <div className="flex flex-wrap gap-2 mb-1">
                          <span className="inline-block border border-neutral-200 rounded-full px-3 py-0.5 text-xs font-medium bg-white">募集人数: {job.number_of_hires ?? '未設定'}</span>
                        </div>
                        <div className="text-sm text-neutral-800">{job.job_description ?? '求人内容なし'}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-neutral-400">この企業の公開求人はありません</div>
              )}
            </div>
          </div>
        </div>
        {/* 右下ボタン配置 */}
        <div className="absolute right-6 bottom-4 flex gap-3">
          <Button asChild size="sm">
            <Link href={`/companies/${company.id}`}>企業詳細</Link>
          </Button>
          <Button size="sm" className="border-2 border-black text-black bg-white hover:bg-neutral-100 focus:ring-black">
            お気に入り登録
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}