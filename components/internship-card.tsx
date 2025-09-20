import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Internship } from "@/types";
import Link from "next/link";

interface InternshipCardProps {
  internship: Internship;
}

export function InternshipCard({ internship }: InternshipCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* 左カラム：企業ロゴ（白背景＋最大幅固定） */}
          <div className="sm:w-1/3 w-full h-48 flex-shrink-0 bg-white flex items-center justify-center rounded">
            {internship.company && internship.company.logo_url ? (
              <img
                src={internship.company.logo_url}
                alt={`${internship.company.name}のロゴ`}
                width={200}
                height={200}
                className="object-contain"
              />
            ) : (
              <img
                src={"/placeholder.svg"}
                alt="No Logo"
                width={128}
                height={128}
                className="object-contain opacity-60"
              />
            )}
            {internship.company?.name && (
              <h2 className="text-xl font-bold mb-2">{internship.company.name}</h2>
            )}
          </div>

          {/* 右カラム */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* インターンタイトル */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-xl font-bold">{internship.title ?? 'タイトル未設定'}</h2>
              </div>
              {/* 職種説明 */}
              <p className="text-sm text-muted-foreground mb-2">
                {internship.job_type_description ?? '職種説明なし'}
              </p>
              {/* 業務内容 */}
              <p className="text-sm text-muted-foreground mb-2">
                {internship.job_description ?? '業務内容なし'}
              </p>
              {/* 勤務地・勤務時間 */}
              <p className="text-sm text-muted-foreground mb-2">
                勤務地: {internship.work_location ?? '未設定'} / 勤務時間: {internship.work_hours ?? '未設定'}
              </p>
              {/* 時給 */}
              <p className="text-sm text-muted-foreground mb-2">
                時給: {internship.hourly_wage ?? '未設定'}
              </p>
              {/* スキル */}
              <p className="text-sm text-muted-foreground mb-2">
                必須スキル: {internship.required_skills ?? '未設定'} / 歓迎スキル: {internship.preferred_skills ?? '未設定'}
              </p>
              {/* 選考フロー */}
              <p className="text-sm text-muted-foreground mb-2">
                選考フロー: {internship.selection_flow ?? '未設定'}
              </p>
              {/* 作成日 */}
              <p className="text-xs text-gray-400 mb-2">
                登録日: {internship.created_at ? new Date(internship.created_at).toLocaleDateString() : '不明'}
              </p>
            </div>
            {/* アクションボタン */}
            <div className="flex gap-3 mt-4">
              <Button asChild>
                <Link href={internship.company_id ? `/companies/${internship.company_id}` : '#'}>企業詳細</Link>
              </Button>
            </div>
            {/* デバッグ用: 全プロパティJSON出力 */}
            <pre className="text-xs mt-4 bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(internship, null, 2)}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
