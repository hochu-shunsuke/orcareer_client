import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Users, Banknote, Home } from "lucide-react";
import { Internship } from "@/data/types";
import Link from "next/link";
import Image from "next/image";

interface InternshipCardProps {
  internship: Internship & {
    company: {
      id: string;
      name: string;
      logo: string;
      location: string;
      industry: string;
    };
  };
}

export function InternshipCard({ internship }: InternshipCardProps) {
  const formatCompensation = (compensation: Internship['compensation']) => {
    if (compensation.type === 'none') {
      return '無給';
    }
    
    const typeMap = {
      daily: '日',
      monthly: '月',
      total: '総額'
    };
    
    return `${compensation.amount.toLocaleString()}円/${typeMap[compensation.type]}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const applicationRate = Math.round((internship.applicationCount / internship.capacity) * 100);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* 左カラム：企業ロゴ（白背景＋最大幅固定） */}
          <div className="sm:w-1/3 w-full h-48 flex-shrink-0 bg-white flex items-center justify-center rounded">
            <Image
              src={internship.company.logo}
              alt={`${internship.company.name}のロゴ`}
              width={200}
              height={200}
              className="object-contain"
            />
          </div>

          {/* 右カラム */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* 企業名とインターンタイトル、タグ */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-xl font-bold">{internship.title}</h2>
                <Badge variant="secondary">{internship.duration}</Badge>
                <Badge variant="outline">{internship.program}</Badge>
                {internship.targetGraduationYears.map((year) => (
                  <Badge key={year} variant="default" className="text-xs bg-black text-white">
                    {year}
                  </Badge>
                ))}
                {internship.tags.slice(0, 1).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {internship.isRemoteOk && (
                  <Badge variant="outline" className="text-xs">
                    リモート可
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {internship.company.name}
              </p>

              {/* 説明 */}
              <p className="text-sm text-muted-foreground mb-4">
                {internship.description}
              </p>

              {/* アイコン付き情報 */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{internship.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  <span>{formatCompensation(internship.compensation)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatDate(internship.startDate)} ～ {formatDate(internship.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>締切: {formatDate(internship.applicationDeadline)}</span>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3">
              <Button asChild>
                <Link href={`/companies/${internship.companyId}`}>詳細を見る</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
