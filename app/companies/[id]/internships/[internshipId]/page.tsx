import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, DollarSign, Briefcase, Building2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { NavigationBar } from "@/components/navigation-bar"
import { Footer } from "@/components/footer"
import { fetchInternshipById } from "@/lib/fetch-internships"


interface PageProps {
  params: Promise<{
    id: string
    internshipId: string
  }>
}

export default async function InternshipDetailPage({ params }: PageProps) {
  const { id, internshipId } = await params
  const internship = await fetchInternshipById(internshipId)

  if (!internship || !internship.company) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="internships" />

      <div className="container mx-auto px-4 py-8">

        {/* ヘッダーカード */}
        <Card className="mb-8">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
              {/* 企業ロゴ */}
              <div className="w-56 h-56 flex-shrink-0 bg-white flex items-center justify-center rounded mx-auto md:mx-0">
                {internship.company.logo_url ? (
                  <Image
                    src={internship.company.logo_url}
                    alt={`${internship.company.name}のロゴ`}
                    width={224}
                    height={224}
                    className="object-contain"
                  />
                ) : (
                  <Image
                    src="/placeholder-logo.svg"
                    alt="No Logo"
                    width={224}
                    height={224}
                    className="object-contain opacity-60"
                  />
                )}
              </div>

              {/* 基本情報 */}
              <div className="flex-1">
                {/* 企業名 */}
                <div className="mb-2">
                  <span className="text-sm text-neutral-500 font-medium">
                    {internship.company.name}
                  </span>
                </div>

                {/* タイトル */}
                <h1 className="text-2xl lg:text-3xl font-bold mb-4">
                  {internship.title || internship.job_description || 'インターン募集'}
                </h1>

                {/* タグ（インターンカードと表示を統一） */}
                {internship.tags && internship.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {internship.tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="default" 
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 基本情報リスト */}
                <div className="space-y-2">
                  {internship.job_type_description && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Briefcase className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span>{internship.job_type_description}</span>
                    </div>
                  )}
                  
                  {internship.hourly_wage && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <DollarSign className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span>時給: {internship.hourly_wage}</span>
                    </div>
                  )}
                  
                  {internship.work_hours && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Clock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span>勤務時間: {internship.work_hours}</span>
                    </div>
                  )}
                  
                  {internship.work_location && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span>勤務地: {internship.work_location}</span>
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button asChild size="lg">
                    <Link href="#application">応募する</Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    className="border-2 border-black text-black bg-white hover:bg-neutral-100 focus:ring-black"
                  >
                    <Link href={`/companies/${id}?tab=company-info`}>
                      <Building2 className="w-4 h-4 mr-2 inline-block align-middle" />
                      <span className="align-middle">この企業について</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 詳細情報（表形式） */}
        <div className="grid gap-6">
          {/** prepare mock data for display-only **/}
          {(() => {
            const iAny: any = internship
            const mock: any = {
              job: iAny.job_type?.name || iAny.job_type_description || '未設定',
              responsibilities: iAny.job_description || '仕事内容の詳細は未掲載',
              schedule: iAny.onboarding_schedule || '入社後はOJTで1週間の導入、その後プロジェクト配属',
              salary: iAny.hourly_wage || '非公開',
              probation: iAny.probation_period || 'なし',
              probation_pay: iAny.probation_pay || iAny.hourly_wage || '同額',
              transportation: iAny.transportation || '支給あり（上限あり）',
              qualifications: iAny.required_skills || '特になし（未経験可）',
              work_days: iAny.work_days || '月〜金',
              work_days_count: iAny.work_days_count || '週5日',
              work_hours: iAny.work_hours || '9:00〜18:00',
              other_conditions: iAny.other_work_conditions || '特になし',
              target_years: iAny.target_years || '全学年',
              selection_flow: iAny.selection_flow || '書類選考 → 面接',
              number_of_hires: iAny.number_of_hires || '未設定',
              employment_type: iAny.employment_type || 'インターン',
              locations: iAny.work_location || '名古屋市',
              nearest_station: iAny.nearest_station || '名古屋駅',
              skills_experience: iAny.skills_to_acquire || '実務スキル、チーム開発経験',
              features: (iAny.tags || []).length > 0 ? (iAny.tags.map((t: any) => t.name)) : ['未設定']
            }

            return (
              <Card>
                <CardHeader>
                  <CardTitle>インターン詳細</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm text-gray-700 border-collapse">
                      <tbody>
                        <tr className="border-b">
                          <th className="w-1/3 text-left align-top bg-neutral-100 p-3 font-semibold">職種</th>
                          <td className="p-3 text-neutral-700">{mock.job}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">任せたい仕事</th>
                          <td className="p-3 text-neutral-700 whitespace-pre-wrap">{mock.responsibilities}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">入社後の流れ（業務スケジュール例）</th>
                          <td className="p-3 text-neutral-700 whitespace-pre-wrap">{mock.schedule}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">給与</th>
                          <td className="p-3 text-neutral-700">{mock.salary}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">試用期間</th>
                          <td className="p-3 text-neutral-700">{mock.probation}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">試用期間中の給与</th>
                          <td className="p-3 text-neutral-700">{mock.probation_pay}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">交通費の支給</th>
                          <td className="p-3 text-neutral-700">{mock.transportation}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">応募資格</th>
                          <td className="p-3 text-neutral-700 whitespace-pre-wrap">{mock.qualifications}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">勤務曜日</th>
                          <td className="p-3 text-neutral-700">{mock.work_days}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">勤務日数</th>
                          <td className="p-3 text-neutral-700">{mock.work_days_count}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">勤務時間</th>
                          <td className="p-3 text-neutral-700">{mock.work_hours}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">その他勤務条件</th>
                          <td className="p-3 text-neutral-700 whitespace-pre-wrap">{mock.other_conditions}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">対象学年</th>
                          <td className="p-3 text-neutral-700">{mock.target_years}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">選考フロー</th>
                          <td className="p-3 text-neutral-700 whitespace-pre-wrap">{mock.selection_flow}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">募集人数</th>
                          <td className="p-3 text-neutral-700">{mock.number_of_hires}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">雇用形態</th>
                          <td className="p-3 text-neutral-700">{mock.employment_type}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">勤務地</th>
                          <td className="p-3 text-neutral-700">{mock.locations}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">最寄り駅</th>
                          <td className="p-3 text-neutral-700">{mock.nearest_station}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">この長期インターンで身につくスキル・経験</th>
                          <td className="p-3 text-neutral-700 whitespace-pre-wrap">{mock.skills_experience}</td>
                        </tr>
                        <tr>
                          <th className="text-left align-top bg-neutral-100 p-3 font-semibold">この長期インターンの特徴</th>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {mock.features.map((t: string, i: number) => (
                                <Badge key={i} variant="default" className="bg-orange-600 text-white text-xs px-2 py-1">{t}</Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )
          })()}
        </div>
      </div>

      <Footer />
    </div>
  )
}
