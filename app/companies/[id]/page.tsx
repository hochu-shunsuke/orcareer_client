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

// Next.js ISR設定: 12時間キャッシュ
export const revalidate = 43200;

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
              {(company.company_overviews || company.company_data) && (
                <Card>
                  <CardHeader>
                    <CardTitle>企業概要</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {company.company_overviews?.established_year && (
                        <div>
                          <h4 className="font-semibold mb-2">設立年</h4>
                          <p className="text-gray-600">{company.company_overviews.established_year}年</p>
                        </div>
                      )}
                      {company.company_overviews?.headquarters_address && (
                        <div>
                          <h4 className="font-semibold mb-2">本社所在地</h4>
                          <p className="text-gray-600">{company.company_overviews.headquarters_address}</p>
                        </div>
                      )}
                      {company.company_overviews?.employee_count && (
                        <div>
                          <h4 className="font-semibold mb-2">従業員数</h4>
                          <p className="text-gray-600">{company.company_overviews.employee_count}名</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {company.company_data && (
                <>
                  {company.company_data.business_content && (
                    <Card>
                      <CardHeader>
                        <CardTitle>事業内容</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {company.company_data.business_content}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {company.company_data.profile && (
                    <Card>
                      <CardHeader>
                        <CardTitle>会社プロフィール</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {company.company_data.profile}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {company.company_data.offices && (
                    <Card>
                      <CardHeader>
                        <CardTitle>事業所</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {company.company_data.offices}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {company.website_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>会社紹介ページ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <a
                        href={company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {company.website_url}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}
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

          {/* 応募方法タブ - デバッグ用データ表示 */}
          <TabsContent value="application">
            <div className="space-y-4">
              {/* 企業データ */}
              <Card>
                <CardHeader>
                  <CardTitle>企業データ（デバッグ用）</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
                    {JSON.stringify(company, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* インターンシップデータ */}
              <Card>
                <CardHeader>
                  <CardTitle>インターンシップデータ（デバッグ用）</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(internships, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* 求人データ */}
              <Card>
                <CardHeader>
                  <CardTitle>求人データ（デバッグ用）</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(recruitments, null, 2)}
                  </pre>
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
