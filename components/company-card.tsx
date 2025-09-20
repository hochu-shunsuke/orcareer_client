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
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button asChild>
                <Link href={`/companies/${company.id}`}>詳細を見る</Link>
              </Button>
              <Button variant="secondary">
                <Star className="w-4 h-4 mr-1" />
                お気に入り
              </Button>
            </div>
            {/* デバッグ用コード */}
            <div className="bg-gray-100 text-xs p-2 rounded break-all mt-4">
              <strong>Companyオブジェクト全体:</strong>
              <pre>{JSON.stringify(company, null, 2)}</pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}