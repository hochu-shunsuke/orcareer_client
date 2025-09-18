import { MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { JobCard } from "@/components/job-card";
import { StudentArticles } from "@/components/student-articles";
import { EventInfo } from "@/components/event-info";
import { SearchHero } from "@/components/search-hero";
import { NavigationBar } from "@/components/navigation-bar";
import { Footer } from "@/components/footer";
import { fetchRecruitmentsWithCompany } from "@/lib/fetch-jobs";
import { Job } from "@/data/types";

export default async function JobsPage() {
  let recruitments: Job[] = [];
  try {
    recruitments = await fetchRecruitmentsWithCompany();
  } catch (error) {
    console.error('[jobs/page] fetchRecruitmentsWithCompany error:', error);
    return <div className="container mx-auto py-12 text-red-600">求人データの取得に失敗しました（詳細はサーバーログ参照）</div>;
  }

  const jobTypeField = {
    label: "職種",
    placeholder: "職種を選択",
    type: 'select' as const,
    options: [
      { value: "engineer", label: "エンジニア" },
      { value: "sales", label: "営業" },
      { value: "marketing", label: "マーケティング" },
      { value: "design", label: "デザイン" },
      { value: "management", label: "管理・企画" },
      { value: "finance", label: "経理・財務" }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="jobs" />

      <SearchHero
        title="東海地方の求人を探す"
        subtitle="あなたの理想のキャリアを見つけよう"
        searchTitle="求人を検索"
        keywordPlaceholder="職種、企業名など"
        fields={[jobTypeField]}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 order-1 lg:order-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <p className="text-gray-600">検索結果: {recruitments.length}件</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-600">並び替え:</span>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">新着順</SelectItem>
                    <SelectItem value="salary">給与順</SelectItem>
                    <SelectItem value="company">企業名順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {recruitments.length > 0 ? (
              <div className="space-y-6">
                {recruitments.map((rec) => (
                  <JobCard key={rec.id} job={rec} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">求人データが見つかりません</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 order-2 lg:order-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>詳細検索</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">雇用形態</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fulltime" />
                      <label htmlFor="fulltime" className="text-sm">正社員</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="parttime" />
                      <label htmlFor="parttime" className="text-sm">契約社員</label>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">絞り込む</Button>
              </CardContent>
            </Card>

            <StudentArticles />
            <EventInfo />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}