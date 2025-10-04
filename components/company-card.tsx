"use client"

import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClickableCard } from "@/components/common/clickable-card";
import { EntityLogo } from "@/components/common/entity-logo";
import { UpdatedAtBadge } from "@/components/common/updated-at-badge";

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/companies/${company.id}`);
  };

  return (
    <ClickableCard
      onClick={handleCardClick}
      ariaLabel={`${company.name}の詳細を見る`}
    >
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* 最終更新：右上 */}
        <UpdatedAtBadge 
          updatedAt={company.updated_at} 
          className="absolute right-6 top-2 md:block hidden"
        />
        {/* 左カラム：企業ロゴ */}
        <EntityLogo 
          logoUrl={company.logo_url} 
          entityName={company.name}
        />
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
              <UpdatedAtBadge 
                updatedAt={company.updated_at} 
                className="mt-2 text-right md:hidden"
              />
            </div>

            {/* 求人リスト表示 */}
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2 border-b border-neutral-100 pb-1">求人一覧</h3>
              {company.recruitments && company.recruitments.length > 0 ? (
                <ul className="space-y-2">
                  {company.recruitments.map((job) => (
                    <li key={job.id}>
                      <Link 
                        href={`/companies/${company.id}/recruitments/${job.id}`}
                        className="block border border-neutral-200 rounded-lg p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
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
            <Link href={`/companies/${company.id}`} onClick={(e) => e.stopPropagation()}>
              企業詳細
            </Link>
          </Button>
          <Button 
            size="sm" 
            className="border-2 border-black text-black bg-white hover:bg-neutral-100 focus:ring-black"
            onClick={(e) => e.stopPropagation()}
          >
            お気に入り登録
          </Button>
        </div>
    </ClickableCard>
  );
}