import { MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { InternshipCard } from "@/components/internship-card";
import { StudentArticles } from "@/components/student-articles";
import { EventInfo } from "@/components/event-info";
import { SearchHero } from "@/components/search-hero";
import { NavigationBar } from "@/components/navigation-bar";
import { Footer } from "@/components/footer";
import { fetchInternshipsWithCompany } from "@/lib/fetch-internships";

// 💡 修正: 非同期コンポーネントとして export default を追加
export default async function InternshipPage() {
  let internships: any[] = [];
  try {
    // 💡 修正: try-catchブロック内で await を使用
    internships = await fetchInternshipsWithCompany();
  } catch (error) {
    console.error("[internships/page] fetchInternshipsWithCompany error:", error);
    return (
      <div className="container mx-auto py-12 text-red-600">
        インターンデータの取得に失敗しました
      </div>
    );
  }

  const durationField = {
    label: "期間",
    placeholder: "期間を選択",
    type: "select" as const,
    options: [
      { value: "1week", label: "1週間" },
      { value: "2weeks", label: "2週間" },
      { value: "1month", label: "1ヶ月" },
      { value: "3months", label: "3ヶ月" },
      { value: "6months", label: "6ヶ月以上" },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="internships" />

      <SearchHero
        title="東海地方のインターンシップを探す"
        subtitle="実践的な経験で将来のキャリアを築こう"
        searchTitle="インターンシップを検索"
        keywordPlaceholder="職種、企業名など"
        fields={[durationField]}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 order-1 lg:order-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">インターンシップ一覧</h1>
                <p className="text-gray-600">検索結果: {internships.length}件</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-600">並び替え:</span>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">新着順</SelectItem>
                    <SelectItem value="company">企業名順</SelectItem>
                    <SelectItem value="duration">期間順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {internships.length > 0 ? (
              <div className="space-y-6">
                {internships.map((internship) => (
                  <InternshipCard key={internship.id} internship={internship} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">インターンシップデータが見つかりません</p>
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
                  <label className="text-sm font-medium mb-2 block">給与</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="paid" />
                      <label htmlFor="paid" className="text-sm">有給</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="unpaid" />
                      <label htmlFor="unpaid" className="text-sm">無給</label>
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