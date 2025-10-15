import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, DollarSign, Briefcase, Building2, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { NavigationBar } from "@/components/navigation-bar"
import { Footer } from "@/components/footer"
import { fetchRecruitmentById } from "@/lib/fetch-recruitments"


interface PageProps {
  params: Promise<{
    id: string
    recruitmentId: string
  }>
}

export default async function RecruitmentDetailPage({ params }: PageProps) {
  const { id, recruitmentId } = await params
  const recruitment = await fetchRecruitmentById(recruitmentId)

  if (!recruitment || !recruitment.company) {
    notFound()
  }

  // モック表示用のシンプルなデータ（表示専用、関数ロジックは使わない）
  const rAny: any = recruitment
  const mock: any = {
    course_name: rAny.job_type?.name || rAny.job_type_description || '未設定',
    employment_type: '正社員（想定）',
    assigned_role: rAny.job_type?.name || '配属部署未定',
    hiring_flow: (rAny.selection_flow || '書類選考\n一次面接\n最終面接').split(/\n|・|、|,|\r/).map((s: string) => s.trim()).filter(Boolean).slice(0,6).join(' → '),
    days_to_offer: '約14日',
    selection_methods: rAny.selection_flow || '書類選考・面接',
    target_applicants: rAny.application_requirements || '新卒（2026年卒）',
    number_of_hires: rAny.number_of_hires || '未設定',
    target_majors: '全学部・全学科',
    breakdown: '学歴・専攻問わず',
    features: rAny.tags || ['未設定'],
    starting_salary: rAny.salary_bonus || '非公開',
    univ_salary: rAny.salary_bonus || '非公開',
    college_salary: '非公開',
    allowances: rAny.allowance || '交通費支給',
    salary_increase: '年1回',
    bonus: '年2回',
    annual_holidays: rAny.annual_holidays ? `${rAny.annual_holidays}日` : '非公開',
    holidays: rAny.holidays_leave || '完全週休2日制',
    benefits: rAny.benefits || '社会保険、通勤手当、資格支援など',
    smoking_policy: '屋内原則禁煙（喫煙室あり）',
    locations: rAny.work_location || '名古屋市／東京（複数）',
    work_hours: rAny.work_hours || '9:00〜18:00（フレックスあり）',
    access: '最寄り駅：名古屋駅 徒歩10分'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="jobs" />

      <div className="container mx-auto px-4 py-8">

        {/* ヘッダーカード */}
        <Card className="mb-8">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
              {/* 企業ロゴ */}
              <div className="w-56 h-56 flex-shrink-0 bg-white flex items-center justify-center rounded mx-auto md:mx-0">
                {recruitment.company.logo_url ? (
                  <Image
                    src={recruitment.company.logo_url}
                    alt={`${recruitment.company.name}のロゴ`}
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
                    {recruitment.company.name}
                  </span>
                </div>

                {/* タイトル */}
                <h1 className="text-2xl lg:text-3xl font-bold mb-4">
                  {recruitment.job_type_description || '求人募集'}
                </h1>

                {/* 基本情報リスト */}
                <div className="space-y-2">
                  {recruitment.work_location && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span>勤務地: {recruitment.work_location}</span>
                    </div>
                  )}
                  
                  {recruitment.work_hours && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Clock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span>勤務時間: {recruitment.work_hours}</span>
                    </div>
                  )}
                  
                  {recruitment.salary_bonus && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <DollarSign className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span>給与・賞与: {recruitment.salary_bonus}</span>
                    </div>
                  )}
                  
                  {recruitment.number_of_hires && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Users className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span>募集人数: {recruitment.number_of_hires}</span>
                    </div>
                  )}
                  
                  {recruitment.annual_holidays && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Calendar className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span>年間休日: {recruitment.annual_holidays}日</span>
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {/* 主ボタン：企業カードと同じスタイル（asChildでリンクをラップ） */}
                  <Button asChild size="lg">
                    <Link href="#application">応募する</Link>
                  </Button>

                  {/* 補助ボタン：白背景＋黒ボーダーで企業カードと統一 */}
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
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>募集要項</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm text-gray-700 border-collapse">
                    <tbody>
                      {/** row helper: label on left with gray bg, value on right **/}
                      <tr className="border-b">
                        <th className="w-1/3 text-left align-top bg-neutral-100 p-3 font-bold">コース名</th>
                        <td className="p-3 text-neutral-700">{mock.course_name}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">雇用形態</th>
                        <td className="p-3 text-neutral-700">{mock.employment_type}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">配属職種</th>
                        <td className="p-3 text-neutral-700">{mock.assigned_role}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">採用フロー</th>
                        <td className="p-3 text-neutral-700">{mock.hiring_flow}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">内々定までの所要日数</th>
                        <td className="p-3 text-neutral-700">{mock.days_to_offer}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">選考方法</th>
                        <td className="p-3 text-neutral-700">{mock.selection_methods}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">募集対象</th>
                        <td className="p-3 text-neutral-700">{mock.target_applicants}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">募集人数</th>
                        <td className="p-3 text-neutral-700">{mock.number_of_hires}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">募集学部・学科</th>
                        <td className="p-3 text-neutral-700">{mock.target_majors}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">募集内訳</th>
                        <td className="p-3 text-neutral-700">{mock.breakdown}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">募集の特徴</th>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {mock.features.map((t: string, i: number) => (
                              <span key={i} className="inline-block bg-orange-600 text-white text-xs px-2 py-1 rounded">{t}</span>
                            ))}
                          </div>
                        </td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">初任給(大卒・大学院卒)</th>
                        <td className="p-3 text-neutral-700">{mock.univ_salary}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">初任給(短大・専門・高専卒)</th>
                        <td className="p-3 text-neutral-700">{mock.college_salary}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">諸手当（フリーワード）</th>
                        <td className="p-3 leading-relaxed text-neutral-700 whitespace-pre-wrap">{mock.allowances}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">昇給</th>
                        <td className="p-3 text-neutral-700">{mock.salary_increase}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">賞与</th>
                        <td className="p-3 text-neutral-700">{mock.bonus}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">年間休日数</th>
                        <td className="p-3 text-neutral-700">{mock.annual_holidays}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">休日休暇</th>
                        <td className="p-3 leading-relaxed text-neutral-700 whitespace-pre-wrap">{mock.holidays}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">待遇・福利厚生・社内制度（フリーワード）</th>
                        <td className="p-3 leading-relaxed text-neutral-700 whitespace-pre-wrap">{mock.benefits}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">受動喫煙防止の取組</th>
                        <td className="p-3 text-neutral-700">{mock.smoking_policy}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">勤務地（複数）</th>
                        <td className="p-3 text-neutral-700">{mock.locations}</td>
                      </tr>

                      <tr className="border-b">
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">勤務時間（フリーワード）</th>
                        <td className="p-3 leading-relaxed text-neutral-700 whitespace-pre-wrap">{mock.work_hours}</td>
                      </tr>

                      <tr>
                        <th className="text-left align-top bg-neutral-100 p-3 font-bold">アクセス</th>
                        <td className="p-3 text-neutral-700">{mock.access}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>

      <Footer />
    </div>
  )
}
