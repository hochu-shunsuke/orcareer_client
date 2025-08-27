import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Banknote, Star } from "lucide-react";
import { Job } from "@/data/types";
import Link from "next/link";
import Image from "next/image";

interface JobCardProps {
  job: Job & {
    company: {
      id: string;
      name: string;
      logo: string;
      location: string;
      industry: string;
      employeeCount?: number;
      capital?: number;
    };
  };
}

export function JobCard({ job }: JobCardProps) {
  const formatCapital = (capital?: number) => {
    if (!capital) return "-";
    return `${(capital / 1000000).toLocaleString()}百万円`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* 左カラム：企業画像 */}
          <div className="sm:w-1/3 w-full h-48 flex-shrink-0 bg-white flex items-center justify-center">
            <Image
              src={job.company.logo}
              alt={`${job.company.name}のロゴ`}
              width={200} // 最大幅を指定
              height={200}
              className="object-contain"
            />
          </div>

          {/* 右カラム：情報ブロック */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* 企業名 */}
              <h2 className="text-xl font-bold mb-2">{job.company.name}</h2>

              {/* 説明 */}
              <p className="text-sm text-muted-foreground mb-4">
                {job.description}
              </p>

              {/* アイコン付き情報 */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{job.company.employeeCount ?? "不明"}人</span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  <span>{formatCapital(job.company.capital)}</span>
                </div>
              </div>

              {/* 主なポイント */}
              <div className="mb-4">
                <p className="font-semibold mb-1">主なポイント</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {job.requirements.slice(0, 3).map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3">
              <Button asChild>
                <Link href={`/companies/${job.company.id}`}>詳細を見る</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
