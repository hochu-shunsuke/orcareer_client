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
        {/* パンくずリスト */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/internships" className="hover:text-gray-900">
            インターン一覧
          </Link>
          <span>/</span>
          <Link 
            href={`/companies/${id}?tab=internship`} 
            className="hover:text-gray-900"
          >
            {internship.company.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {internship.title || 'インターン詳細'}
          </span>
        </nav>

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

                {/* タグ */}
                {internship.tags && internship.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {internship.tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="secondary" 
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
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
                  <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
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
          {internship.job_description && (
            <Card>
              <CardHeader>
                <CardTitle>仕事内容</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {internship.job_description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 身につくスキル */}
          {internship.skills_to_acquire && (
            <Card>
              <CardHeader>
                <CardTitle>身につくスキル</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {internship.skills_to_acquire}
                </p>
              </CardContent>
            </Card>
          )}

          {/* スキル要件 */}
          {(internship.required_skills || internship.preferred_skills) && (
            <Card>
              <CardHeader>
                <CardTitle>求めるスキル</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {internship.required_skills && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">必須スキル</h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {internship.required_skills}
                    </p>
                  </div>
                )}
                {internship.preferred_skills && (
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-600">歓迎スキル</h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {internship.preferred_skills}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 選考フロー */}
          {internship.selection_flow && (
            <Card>
              <CardHeader>
                <CardTitle>選考フロー</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {internship.selection_flow}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 応募セクション */}
          <Card id="application">
            <CardHeader>
              <CardTitle>応募について</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                このインターンシップにご興味をお持ちいただいた方は、以下のボタンから応募してください。
              </p>
              <Button size="lg" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
                このインターンに応募する
              </Button>
              <Separator />
              <div className="flex gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/companies/${id}?tab=internship`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    他のインターンを見る
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/companies/${id}?tab=company-info`}>
                    <Building2 className="w-4 h-4 mr-2" />
                    企業情報を見る
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
