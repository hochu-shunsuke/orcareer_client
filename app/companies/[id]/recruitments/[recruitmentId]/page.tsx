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

// Next.js ISR設定: 12時間キャッシュ
export const revalidate = 43200;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="jobs" />

      <div className="container mx-auto px-4 py-8">
        {/* パンくずリスト */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link 
            href={`/companies/${id}`} 
            className="hover:text-gray-900"
          >
            {recruitment.company.name}
          </Link>
          <span>/</span>
          <Link 
            href={`/companies/${id}?tab=job`} 
            className="hover:text-gray-900"
          >
            本選考
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {recruitment.job_type_description || '求人詳細'}
          </span>
        </nav>

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
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link href="#application">応募する</Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    variant="outline"
                    className="border-2"
                  >
                    <Link href={`/companies/${id}?tab=company-info`}>
                      <Building2 className="w-4 h-4 mr-2" />
                      この企業について
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 詳細情報 */}
        <div className="grid gap-6">
          {/* 仕事内容 */}
          {recruitment.job_description && (
            <Card>
              <CardHeader>
                <CardTitle>仕事内容</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {recruitment.job_description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 勤務条件 */}
          <Card>
            <CardHeader>
              <CardTitle>勤務条件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recruitment.work_location && (
                  <div>
                    <h4 className="font-semibold mb-2">勤務地</h4>
                    <p className="text-neutral-700">{recruitment.work_location}</p>
                  </div>
                )}
                
                {recruitment.work_hours && (
                  <div>
                    <h4 className="font-semibold mb-2">勤務時間</h4>
                    <p className="text-neutral-700">{recruitment.work_hours}</p>
                  </div>
                )}
                
                {recruitment.salary_bonus && (
                  <div>
                    <h4 className="font-semibold mb-2">給与・賞与</h4>
                    <p className="text-neutral-700">{recruitment.salary_bonus}</p>
                  </div>
                )}
                
                {recruitment.number_of_hires && (
                  <div>
                    <h4 className="font-semibold mb-2">募集人数</h4>
                    <p className="text-neutral-700">{recruitment.number_of_hires}</p>
                  </div>
                )}
                
                {recruitment.annual_holidays && (
                  <div>
                    <h4 className="font-semibold mb-2">年間休日</h4>
                    <p className="text-neutral-700">{recruitment.annual_holidays}日</p>
                  </div>
                )}
                
                {recruitment.holidays_leave && (
                  <div>
                    <h4 className="font-semibold mb-2">休日・休暇</h4>
                    <p className="text-neutral-700 whitespace-pre-wrap">{recruitment.holidays_leave}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 待遇・福利厚生 */}
          {recruitment.benefits && (
            <Card>
              <CardHeader>
                <CardTitle>待遇・福利厚生</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {recruitment.benefits}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 選考フロー */}
          {recruitment.selection_flow && (
            <Card>
              <CardHeader>
                <CardTitle>選考フロー</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {recruitment.selection_flow}
                </p>
              </CardContent>
            </Card>
          )}

          {/* デバッグ用：全データ表示 */}
          <Card>
            <CardHeader>
              <CardTitle>求人データ（デバッグ用）</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
                {JSON.stringify(recruitment, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* 応募セクション */}
          <Card id="application">
            <CardHeader>
              <CardTitle>応募する</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-700">
                この求人に興味をお持ちの方は、以下のボタンから応募してください。
              </p>
              <Button size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                応募フォームへ進む
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
