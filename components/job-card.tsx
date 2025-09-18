import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Banknote, Star } from "lucide-react";
import { Job } from "@/data/types";
import Link from "next/link";
import Image from "next/image";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const formatCapital = (capital?: number) => {
    if (!capital) return "-";
    return `${(capital / 1000000).toLocaleString()}百万円`;
  };

  const company = job.company;
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* 左カラム：企業画像 */}
          <div className="sm:w-1/3 w-full h-48 flex-shrink-0 bg-white flex items-center justify-center">
            {company ? (
              <Image
                src={company.logo && company.logo.trim() !== '' ? company.logo : '/placeholder-logo.svg'}
                alt={`${company.name}のロゴ`}
                width={200}
                height={200}
                className="object-contain"
              />
            ) : (
              <Image
                src={'/placeholder-logo.svg'}
                alt="No Image"
                width={200}
                height={200}
                className="object-contain"
              />
            )}
          </div>

          {/* 右カラム：情報ブロック */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* 企業名 */}
              <h2 className="text-xl font-bold mb-2">{company ? company.name : '不明な企業'}</h2>

              {/* 職種・雇用形態 */}
              <div className="mb-2 flex flex-wrap gap-2">
                {job.job_type_description && (
                  <Badge variant="secondary">{job.job_type_description}</Badge>
                )}
                {job.number_of_hires && (
                  <Badge variant="outline">募集人数: {job.number_of_hires}</Badge>
                )}
              </div>

              {/* 説明 */}
              <p className="text-sm text-muted-foreground mb-2">
                {job.job_description ?? '求人内容の記載なし'}
              </p>

              {/* 詳細情報 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                {job.work_location && (
                  <div><span className="font-semibold">勤務地:</span> {job.work_location}</div>
                )}
                {job.work_hours && (
                  <div><span className="font-semibold">勤務時間:</span> {job.work_hours}</div>
                )}
                {job.salary_bonus && (
                  <div><span className="font-semibold">給与・賞与:</span> {job.salary_bonus}</div>
                )}
                {job.annual_holidays !== null && job.annual_holidays !== undefined && (
                  <div><span className="font-semibold">年間休日:</span> {job.annual_holidays}日</div>
                )}
                {job.holidays_leave && (
                  <div><span className="font-semibold">休暇・休業:</span> {job.holidays_leave}</div>
                )}
                {job.benefits && (
                  <div><span className="font-semibold">福利厚生:</span> {job.benefits}</div>
                )}
              </div>

              {/* 選考フロー */}
              {job.selection_flow && (
                <div className="mb-2">
                  <p className="font-semibold mb-1">選考フロー</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{job.selection_flow}</p>
                </div>
              )}

              {/* アイコン付き情報 */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{company?.employeeCount ?? "不明"}人</span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  <span>{formatCapital(company?.capital)}</span>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3 mb-4">
              <Button asChild>
                <Link href={company ? `/companies/${company.id}` : "#"}>詳細を見る</Link>
              </Button>
            </div>

            {/* デバッグ用: Job型の全プロパティを表示 */}
            <div className="bg-gray-100 text-xs p-2 rounded break-all">
              <strong>Jobオブジェクト全体:</strong>
              <pre>{JSON.stringify(job, null, 2)}</pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
