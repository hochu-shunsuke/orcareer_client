import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { NavigationBar } from "@/components/navigation-bar"
import { Footer } from "@/components/footer"
import { fetchCompaniesWithRecruitments } from "@/lib/fetch-companies"
import { fetchInternshipsWithCompanyAndTags } from "@/lib/fetch-internships"
import { InternshipCard } from "@/components/internship-card"
import { ArticleCard } from "@/components/article-card"
import { EventCard } from "@/components/event-card"
import { CompanyListItem } from "@/components/company-list-item"
import Image from "next/image"

// Next.js ISR設定: 12時間キャッシュ
export const revalidate = 43200

export default async function HomePage() {
  // 新着企業とインターンシップを取得（並列）
  const [companies, internships] = await Promise.all([
    fetchCompaniesWithRecruitments(),
    fetchInternshipsWithCompanyAndTags()
  ])

  // 新着企業（最新5件）
  const newCompanies = companies
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 5)

  // 新着のインターンシップ（最新３件）
  const featuredInternships = internships
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />

      {/* ヒーローセクション */}
      <section className="bg-white pt-24 pb-16 md:pt-28 md:pb-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-6xl font-bold mb-4 text-black">
              東海地方の新卒就活は、<br />
              <span className="text-orange-600">オルキャリ。</span>
            </h1>
          </div>
        </div>
      </section>

      {/* 新着企業 */}
      <section className="py-16 bg-orange-600">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white">新着企業</h2>
            <Link href="/companies">
              <Button className="bg-white hover:bg-gray-100 text-orange-600 shadow-sm font-bold">
                すべて見る
              </Button>
            </Link>
          </div>
          <div className="bg-white rounded-lg max-w-4xl mx-auto divide-y divide-gray-200">
            {newCompanies.map((company) => (
              <CompanyListItem key={company.id} company={company} />
            ))}
          </div>
        </div>
      </section>

      {/* 新着のインターンシップ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-black">新着のインターンシップ</h2>
            <Link href="/internships">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm font-bold">
                すべて見る
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {featuredInternships.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} />
            ))}
          </div>
        </div>
      </section>

      {/* イベント情報 */}
      <section className="py-16 bg-orange-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">イベント情報</h2>
            <Link href="https://student.orca-career.com/events">
              <Button variant="outline" className="bg-white text-orange-600 hover:bg-gray-100 border-white font-bold">すべて見る</Button>
            </Link>
          </div>
          <div className="bg-white rounded-lg max-w-4xl mx-auto divide-y divide-gray-200">
            <EventCard
              title="合同企業説明会2024"
              date="2024年12月15日"
              link="https://student.orca-career.com/events/career-fair-2024"
            />
            <EventCard
              title="ES添削ワークショップ"
              date="2024年12月20日"
              link="https://student.orca-career.com/events/es-workshop"
            />
            <EventCard
              title="模擬面接会"
              date="2025年1月10日"
              link="https://student.orca-career.com/events/mock-interview"
            />
            <EventCard
              title="業界研究セミナー"
              date="2025年1月15日"
              link="https://student.orca-career.com/events/industry-seminar"
            />
          </div>
        </div>
      </section>

      {/* 学生向け記事 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-black">学生向け記事</h2>
            <Link href="https://student.orca-career.com/column" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="font-bold">すべて見る</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <ArticleCard
              title="名古屋でおすすめの新卒就活エージェント7選！選ぶ際のポイントも解説"
              imageUrl="https://student.orca-career.com/wp-content/uploads/2025/09/orcr_student_icatch-12-768x403.png"
              link="https://student.orca-career.com/nagoya-job-hunting-agent/"
            />
            <ArticleCard
              title="名古屋の就活で人気の企業は？ホワイト企業15選【2025年版】"
              imageUrl="https://student.orca-career.com/wp-content/uploads/2025/09/orcr_student_icatch-11-768x403.png"
              link="https://student.orca-career.com/nagoya-popular-company-2025/"
            />
            <ArticleCard
              title="名古屋のおすすめ就活塾を紹介！選び方のポイントも解説"
              imageUrl="https://student.orca-career.com/wp-content/uploads/2025/09/orcr_student_icatch-768x403.png"
              link="https://student.orca-career.com/nagoya-shukatsu-juku/"
            />
          </div>
        </div>
      </section>

      {/* 統計情報 */}
      <section className="py-16 bg-orange-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">{companies.length}</p>
              <p className="text-white">掲載企業数</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">{internships.length}</p>
              <p className="text-white">インターン数</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">
                {companies.reduce((sum, c) => sum + (c.recruitments?.length || 0), 0)}
              </p>
              <p className="text-white">募集職種数</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">22</p>
              <p className="text-white">年間イベント数</p>
            </div>
          </div>
        </div>
      </section>

      {/* 企業向けリンクカード */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">採用担当者の方へ</h2>
                  <p className="text-gray-700 text-lg mb-4">
                    オルキャリで優秀な学生と出会いませんか？
                  </p>
                  <p className="text-gray-600">
                    求人掲載・インターンシップ募集・企業説明会の開催など、<br className="hidden md:block" />
                    採用活動を全面的にサポートいたします。
                  </p>
                </div>
                                <div className="flex-shrink-0">
                  <Link href="/for-companies">
                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg shadow-sm font-bold">
                      企業向けサービス
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LINE友だち追加 */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-2 border-gray-200 shadow-sm">
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 relative flex-shrink-0">
                  <Image
                    src="/LINE_Brand_icon.png"
                    alt="LINE"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="font-bold text-lg text-black">LINE公式アカウント</p>
                  <p className="text-sm text-gray-600">新着求人情報をお届け!</p>
                </div>
              </div>
              <Link href="https://lin.ee/zYiRlu5" target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-8 shadow-sm font-bold">
                  友だち追加
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
