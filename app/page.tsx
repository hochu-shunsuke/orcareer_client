import Link from "next/link"
import { Search, Building2, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NavigationBar } from "@/components/navigation-bar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">東海地方の新卒就活は、オルキャリ。</h1>
          <p className="text-xl mb-8 opacity-90">あなたに合った企業・求人・インターンを見つけよう</p>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/companies">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Building2 className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <CardTitle>企業一覧</CardTitle>
                  <CardDescription>企業情報を詳しく確認できます</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/jobs">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <CardTitle>求人検索</CardTitle>
                  <CardDescription>本選考の募集要項を確認できます</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/internships">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Search className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <CardTitle>インターンシップ</CardTitle>
                  <CardDescription>長期インターンの募集要項を確認できます</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">オルキャリの特徴</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">豊富な企業情報</h3>
              <p className="text-gray-600">地域密着型の企業から大手企業まで幅広い企業情報を掲載</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">地元企業の情報</h3>
              <p className="text-gray-600">愛知県の企業を中心とした地域特化型の求人情報を提供</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">就活イベント</h3>
              <p className="text-gray-600">企業説明会やセミナーなどのイベント情報も充実</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">オルキャリ</h3>
              <p className="text-gray-400">愛知県を中心とした求人・企業情報サイト</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">求人を探す</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/jobs">求人検索</Link>
                </li>
                <li>
                  <Link href="/internships">インターンシップ</Link>
                </li>
                <li>
                  <Link href="/companies">企業一覧</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">企業の方へ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/recruit">採用掲載</Link>
                </li>
                <li>
                  <Link href="/contact">お問い合わせ</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サイト情報</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about">オルキャリについて</Link>
                </li>
                <li>
                  <Link href="/privacy">プライバシーポリシー</Link>
                </li>
                <li>
                  <Link href="/terms">利用規約</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 オルキャリ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
