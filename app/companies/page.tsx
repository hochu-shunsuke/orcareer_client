import { MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CompanyCard } from "@/components/company-card"
import { StudentArticles } from "@/components/student-articles";
import { EventInfo } from "@/components/event-info";
import { SearchHero } from "@/components/search-hero"
import { NavigationBar } from "@/components/navigation-bar"
import { Footer } from "@/components/footer"
import { fetchCompaniesWithRecruitments } from "@/lib/fetch-companies"
import { Company } from "@/types"

// export default async を追加して、コンポーネント関数を定義
export default async function CompaniesPage() {
  let companies: Company[] = [];
  try {
    companies = await fetchCompaniesWithRecruitments();
  } catch (error) {
    console.error('[companies/page] fetchCompaniesWithRecruitments error:', error);
    return <div className="container mx-auto py-12 text-red-600">企業データの取得に失敗しました</div>;
  }

  const industryField = {
    label: "業界",
    placeholder: "業界を選択",
    type: 'select' as const,
    options: [
      { value: "manufacturer", label: "メーカー" },
      { value: "trading", label: "商社" },
      { value: "retail", label: "小売・流通" },
      { value: "finance", label: "金融" },
      { value: "service", label: "サービス・インフラ" },
      { value: "software", label: "ソフトウェア・通信" },
      { value: "media", label: "広告・出版・マスコミ" }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="companies" />

      <SearchHero
        title="東海地方の企業を探す"
        subtitle="理想の企業と出会って未来を築こう"
        searchTitle="企業を検索"
        keywordPlaceholder="企業名、業界など"
        fields={[industryField]}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 order-1 lg:order-1">
            {/* Sort Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">企業一覧</h1>
                <p className="text-gray-600">検索結果: {companies.length}件</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-600">並び替え:</span>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">新着順</SelectItem>
                    <SelectItem value="name">企業名順</SelectItem>
                    <SelectItem value="employees">従業員数順</SelectItem>
                    <SelectItem value="jobs">求人数順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm">
                  前へ
                </Button>
                <Button variant="outline" size="sm">
                  1
                </Button>
                <Button className="bg-orange-600" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  4
                </Button>
                <Button variant="outline" size="sm">
                  5
                </Button>
                <Button variant="outline" size="sm">
                  次へ
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar - Student Articles */}
          <div className="w-full lg:w-80 order-2 lg:order-2">
            <div className="space-y-6">
              <StudentArticles />
              <EventInfo />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}