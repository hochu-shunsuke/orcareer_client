import { MapPin, Building2, Users, Calendar, Briefcase, DollarSign, Clock, MapPin as MapPinIcon, Phone, Mail, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import { NavigationBar } from "@/components/navigation-bar"
import { Footer } from "@/components/footer"
import { fetchInternshipsByCompanyId } from "@/lib/fetch-internships"
import { fetchCompanyById } from "@/lib/fetch-companies"
import { fetchRecruitmentsByCompanyId } from "@/lib/fetch-recruitments"
import { notFound } from "next/navigation"
import { InternshipCard } from "@/components/internship-card"
import { RecruitmentCard } from "@/components/recruitment-card"


interface CompanyDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function CompanyDetailPage({ params, searchParams }: CompanyDetailPageProps) {
  const { id } = await params
  const { tab } = await searchParams
  const defaultTab = tab || "company-info"
  const [company, internships, recruitments] = await Promise.all([
    fetchCompanyById(id),
    fetchInternshipsByCompanyId(id),
    fetchRecruitmentsByCompanyId(id)
  ])

  if (!company) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="companies" />

      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="relative w-full lg:w-48 h-32 lg:h-48 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {company.logo_url ? (
                  <Image
                    src={company.logo_url}
                    alt={`${company.name}のロゴ`}
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Building2 className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{company.name}</h1>
                    {company.name_kana && (
                      <p className="text-sm text-gray-500 mb-2">{company.name_kana}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  {company.company_overviews?.headquarters_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{company.company_overviews.headquarters_address}</span>
                    </div>
                  )}
                  {company.company_overviews?.employee_count && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>従業員数: {company.company_overviews.employee_count}名</span>
                    </div>
                  )}
                  {company.company_overviews?.established_year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>設立: {company.company_overviews.established_year}年</span>
                    </div>
                  )}
                  {company.website_url && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <a
                        href={company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        Webサイト
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="company-info" className="text-xs sm:text-sm">
              企業情報
            </TabsTrigger>
            <TabsTrigger value="internship" className="text-xs sm:text-sm">
              長期インターン
            </TabsTrigger>
            <TabsTrigger value="job" className="text-xs sm:text-sm">
              本選考
            </TabsTrigger>
            <TabsTrigger value="application" className="text-xs sm:text-sm">
              応募方法
            </TabsTrigger>
          </TabsList>

          {/* 企業情報タブ */}
          <TabsContent value="company-info">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>企業情報</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const cAny: any = company
                    const ov = cAny.company_overviews || {}
                    const data = cAny.company_data || {}
                    const mock: any = {
                      industry: ov.industry?.name || '未設定',
                      headquarters: ov.headquarters_address || data.headquarters || '未設定',
                      capital: ov.capital || data.capital || '未設定',
                      title: cAny.listing_title || cAny.name || '未設定',
                      revenue: ov.revenue || data.revenue || '未設定',
                      employees: ov.employee_count || data.employee_count || '未設定',
                      hiring_count: cAny.hiring_count || '未設定',
                      profile_short: data.profile || cAny.description || '未設定',
                      company_points: data.points || '未設定',
                      product_strength: data.product_strength || '未設定',
                      policies: data.policies || '未設定',
                      strategy: data.strategy || '未設定',
                      company_data_blob: JSON.stringify(data, null, 2),
                      profile: data.profile || '未設定',
                      business_content: data.business_content || '未設定',
                      postal_code: ov.postal_code || data.postal_code || '未設定',
                      headquarters_address: ov.headquarters_address || data.headquarters_address || '未設定',
                      established: ov.established_year || data.established_year || '未設定',
                      capital_dup: ov.capital || data.capital || '未設定',
                      employees_jp: ov.employee_count || data.employee_count || '未設定',
                      revenue_dup: ov.revenue || data.revenue || '未設定',
                      offices: data.offices || '未設定',
                      mission: data.mission || data.company_mission || '未設定',
                      average_age: data.average_age || ov.average_age || '未設定'
                    }

                    return (
                      <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm text-gray-700 border-collapse">
                          <tbody>
                            <tr className="border-b">
                              <th className="w-1/3 text-left align-top bg-neutral-100 p-3 font-semibold">業種</th>
                              <td className="p-3 text-neutral-700">{mock.industry}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">本社</th>
                              <td className="p-3 text-neutral-700">{mock.headquarters}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">資本金</th>
                              <td className="p-3 text-neutral-700">{mock.capital}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">掲載タイトル</th>
                              <td className="p-3 text-neutral-700">{mock.title}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">売上高</th>
                              <td className="p-3 text-neutral-700">{mock.revenue}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">従業員</th>
                              <td className="p-3 text-neutral-700">{mock.employees}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">募集人数</th>
                              <td className="p-3 text-neutral-700">{mock.hiring_count}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">プロフィール</th>
                              <td className="p-3 text-neutral-700 whitespace-pre-wrap">{mock.profile_short}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-center align-middle bg-neutral-200 p-3 font-semibold">企業のポイント</th>
                              <td className="p-3 text-neutral-700"></td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">製品・サービス力</th>
                              <td className="p-3 text-neutral-700">{mock.product_strength}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">制度・働き方</th>
                              <td className="p-3 text-neutral-700">{mock.policies}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">戦略・ビジョン</th>
                              <td className="p-3 text-neutral-700">{mock.strategy}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-center align-middle bg-neutral-200 p-3 font-semibold">会社データ</th>
                              <td className="p-3 text-neutral-700"></td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">事業内容</th>
                              <td className="p-3 text-neutral-700 whitespace-pre-wrap">{mock.business_content}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">郵便番号</th>
                              <td className="p-3 text-neutral-700">{mock.postal_code}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">本社所在地</th>
                              <td className="p-3 text-neutral-700">{mock.headquarters_address}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">設立</th>
                              <td className="p-3 text-neutral-700">{mock.established}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">資本金</th>
                              <td className="p-3 text-neutral-700">{mock.capital_dup}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">従業員（日本語入力）</th>
                              <td className="p-3 text-neutral-700">{mock.employees_jp}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">売上高</th>
                              <td className="p-3 text-neutral-700">{mock.revenue_dup}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">事業所（複数）</th>
                              <td className="p-3 text-neutral-700 whitespace-pre-wrap">{mock.offices}</td>
                            </tr>
                            <tr className="border-b">
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">企業理念</th>
                              <td className="p-3 text-neutral-700 whitespace-pre-wrap">{mock.mission}</td>
                            </tr>
                            <tr>
                              <th className="text-left align-top bg-neutral-100 p-3 font-semibold">平均年齢</th>
                              <td className="p-3 text-neutral-700">{mock.average_age}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 長期インターンタブ */}
          <TabsContent value="internship">
            {internships.length > 0 ? (
              <div className="grid gap-4">
                {internships.map((internship) => (
                  <InternshipCard 
                    key={internship.id} 
                    internship={internship}
                    tags={internship.tags || []}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  現在募集中のインターンシップはありません
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 本選考タブ */}
          <TabsContent value="job">
            {recruitments.length > 0 ? (
              <div className="grid gap-4">
                {recruitments.map((recruitment) => (
                  <RecruitmentCard 
                    key={recruitment.id} 
                    recruitment={recruitment}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  現在募集中の求人はありません
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 応募方法タブ */}
          <TabsContent value="application">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>応募フロー</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-neutral-700">
                    <li>
                      <strong>エントリー：</strong> 当ページの「応募する」ボタン、または会社の応募フォームからエントリーしてください。履歴書（任意）、ポートフォリオ（任意）を添付できます。
                    </li>
                    <li>
                      <strong>書類選考：</strong> エントリー後、3営業日以内に採用担当より結果連絡を行います。合否に関わらずメールで通知します。
                    </li>
                    <li>
                      <strong>一次面接（オンライン）：</strong> 書類通過者に対して、30〜45分程度のオンライン面接（チーム/人事）を行います。
                    </li>
                    <li>
                      <strong>最終面接（対面またはオンライン）：</strong> 最終選考は対面またはオンラインで行い、ビジネス理解やカルチャーフィットを確認します。
                    </li>
                    <li>
                      <strong>内定・手続き：</strong> 内定通知後、勤務開始日や条件をメールでご案内します。必要書類の提出をお願いします。
                    </li>
                  </ol>

                  <div className="text-sm text-neutral-600">
                    <p>※ 選考フローや日程は変更になる場合があります。応募前に最新情報をご確認ください。</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button>
                      なんとかボタン
                    </Button>
                    <Button variant="outline" disabled>
                      採用ページを見る
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}
