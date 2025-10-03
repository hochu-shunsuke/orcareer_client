import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Internship, InternshipTag } from "@/types";
import Link from "next/link";
import { MapPin, Clock, DollarSign, Briefcase } from "lucide-react";

interface InternshipCardProps {
  internship: Internship;
  tags?: InternshipTag[];
}

export function InternshipCard({ internship, tags = [] }: InternshipCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 relative">
      <CardContent className="p-6 pb-20">
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* 最終更新：右上 */}
          <div className="absolute right-6 top-2 text-xs text-neutral-400 md:block hidden">
            最終更新: {internship.updated_at ? new Date(internship.updated_at).toLocaleDateString() : '不明'}
          </div>
          
          {/* 左カラム：企業ロゴ */}
          <div className="w-56 h-56 flex-shrink-0 bg-white flex items-center justify-center rounded mx-auto md:mx-0">
            {internship.company && internship.company.logo_url ? (
              <img
                src={internship.company.logo_url}
                alt={`${internship.company.name}のロゴ`}
                width={224}
                height={224}
                className="object-contain"
              />
            ) : (
              <img
                src={"/placeholder-logo.svg"}
                alt="No Logo"
                width={224}
                height={224}
                className="object-contain opacity-60"
              />
            )}
          </div>
          
          {/* 右カラム：情報・アクション */}
          <div className="flex-1 w-full">
            {/* 会社名（小さく、トップ） */}
            {internship.company?.name && (
              <div className="mb-2">
                <span className="text-sm text-neutral-500 font-medium">
                  {internship.company.name}
                </span>
              </div>
            )}
            
            {/* title（メインタイトル） */}
            <div className="mb-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {internship.title || internship.job_description || 'インターン募集'}
              </h2>
            </div>
            
            {/* タグセクション */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <Badge 
                    key={tag.id} 
                    variant="secondary" 
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* 詳細リスト（アイコン付き） */}
            <div className="space-y-2 mb-4">
              {/* job_type_description */}
              {internship.job_type_description && (
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Briefcase className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span>{internship.job_type_description}</span>
                </div>
              )}
              
              {/* hourly_wage */}
              {internship.hourly_wage && (
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <DollarSign className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span>時給: {internship.hourly_wage}</span>
                </div>
              )}
              
              {/* work_hours */}
              {internship.work_hours && (
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Clock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span>勤務時間: {internship.work_hours}</span>
                </div>
              )}
              
              {/* work_location */}
              {internship.work_location && (
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span>勤務地: {internship.work_location}</span>
                </div>
              )}
            </div>
            
            {/* スマホ時のみ下部に最終更新 */}
            <div className="text-xs text-neutral-400 mt-2 text-right md:hidden">
              最終更新: {internship.updated_at ? new Date(internship.updated_at).toLocaleDateString() : '不明'}
            </div>
          </div>
        </div>
        
        {/* 右下ボタン配置 */}
        <div className="absolute right-6 bottom-4 flex gap-3">
          <Button asChild size="sm">
            <Link href={internship.company_id ? `/companies/${internship.company_id}` : '#'}>
              企業詳細
            </Link>
          </Button>
          <Button size="sm" className="border-2 border-black text-black bg-white hover:bg-neutral-100 focus:ring-black">
            お気に入り登録
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
