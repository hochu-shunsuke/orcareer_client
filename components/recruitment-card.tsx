'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Recruitment } from "@/types";
import { useRouter } from "next/navigation";
import { ClickableCard } from "@/components/common/clickable-card";
import { EntityLogo } from "@/components/common/entity-logo";

interface RecruitmentCardProps {
  recruitment: Recruitment;
}

export function RecruitmentCard({ recruitment }: RecruitmentCardProps) {
  const router = useRouter();
  const company = recruitment.company;

  const handleCardClick = () => {
    if (company?.id && recruitment.id) {
      router.push(`/companies/${company.id}/recruitments/${recruitment.id}`);
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (company?.id && recruitment.id) {
      router.push(`/companies/${company.id}/recruitments/${recruitment.id}`);
    }
  };

  return (
    <ClickableCard
      onClick={handleCardClick}
      ariaLabel={`${company?.name || '企業'}の${recruitment.job_type_description || '求人'}の詳細を見る`}
    >
      <div className="flex flex-col sm:flex-row gap-6">
        {/* 左カラム：企業画像 */}
        <div className="sm:w-1/3 w-full">
          <EntityLogo 
            logoUrl={company?.logo_url} 
            entityName={company?.name || '求人'}
            size={200}
          />
        </div>

          {/* 右カラム：情報ブロック */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* 企業名 */}
              <h2 className="text-xl font-bold mb-2">{company?.name ?? '不明な企業'}</h2>

              {/* 職種・雇用形態 */}
              <div className="mb-2 flex flex-wrap gap-2">
                {recruitment.job_type_description && (
                  <Badge variant="secondary">{recruitment.job_type_description}</Badge>
                )}
                {recruitment.number_of_hires && (
                  <Badge variant="outline">募集人数: {recruitment.number_of_hires}</Badge>
                )}
              </div>

              {/* 説明 */}
              <p className="text-sm text-muted-foreground mb-2">
                {recruitment.job_description ?? '求人内容の記載なし'}
              </p>

              {/* 詳細情報 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                {recruitment.work_location && (
                  <div><span className="font-semibold">勤務地:</span> {recruitment.work_location}</div>
                )}
                {recruitment.work_hours && (
                  <div><span className="font-semibold">勤務時間:</span> {recruitment.work_hours}</div>
                )}
                {recruitment.salary_bonus && (
                  <div><span className="font-semibold">給与・賞与:</span> {recruitment.salary_bonus}</div>
                )}
                {recruitment.annual_holidays !== null && recruitment.annual_holidays !== undefined && (
                  <div><span className="font-semibold">年間休日:</span> {recruitment.annual_holidays}日</div>
                )}
                {recruitment.holidays_leave && (
                  <div><span className="font-semibold">休暇・休業:</span> {recruitment.holidays_leave}</div>
                )}
                {recruitment.benefits && (
                  <div><span className="font-semibold">福利厚生:</span> {recruitment.benefits}</div>
                )}
              </div>

              {/* 選考フロー */}
              {recruitment.selection_flow && (
                <div className="mb-2">
                  <p className="font-semibold mb-1">選考フロー</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{recruitment.selection_flow}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleDetailsClick}>詳細を見る</Button>
            </div>
          </div>
        </div>
    </ClickableCard>
  );
}
