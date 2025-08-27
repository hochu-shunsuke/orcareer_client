import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Calendar, ExternalLink, Star } from "lucide-react";
import { Company } from "@/data/types";
import Link from "next/link";
import Image from "next/image";

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* 左カラム：企業画像（白背景＋最大幅固定） */}
          <div className="sm:w-1/3 w-full h-48 flex-shrink-0 bg-white flex items-center justify-center rounded">
            <Image
              src={company.logo}
              alt={`${company.name}のロゴ`}
              width={200}
              height={200}
              className="object-contain"
            />
          </div>

          {/* 右カラム */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* 企業名とタグ */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-xl font-bold">{company.name}</h2>
                <Badge variant="secondary">{company.industry}</Badge>
                <Badge variant="outline">{company.prefecture}</Badge>
              </div>

              {/* 説明 */}
              <p className="text-sm text-muted-foreground mb-4">
                {company.description}
              </p>

              {/* アイコン付き情報 */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{company.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{company.employees.toLocaleString()}名</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>設立 {company.established}年</span>
                </div>
              </div>

              {/* 募集情報 */}
              <div className="mb-4 text-sm">
                <span className="text-muted-foreground">募集中：</span>
                <span className="font-medium text-blue-600">
                  求人{company.jobs.length}件
                </span>
                {company.internships.length > 0 && (
                  <>
                    <span className="text-muted-foreground mx-2">・</span>
                    <span className="font-medium text-green-600">
                      インターン{company.internships.length}件
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3">
              <Button asChild>
                <Link href={`/companies/${company.id}`}>詳細を見る</Link>
              </Button>
              <Button variant="secondary">
                <Star className="w-4 h-4 mr-1" />
                お気に入り
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
