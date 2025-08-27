"use client"

import { useSearchParams } from "next/navigation"
import { MapPin, Building2, Users, Calendar, Phone, Mail, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { NavigationBar } from "@/components/navigation-bar"
import { Footer } from "@/components/footer"

export default function CompanyDetailPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "company-info"

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="companies" />

      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="w-full lg:w-48 h-32 lg:h-28 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">株式会社テックイノベーション</h1>
                    <Badge variant="secondary" className="mb-4">
                      IT・通信
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>愛知県名古屋市中区錦3-1-1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>従業員数: 85名</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>設立: 2015年</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>上場区分: 非上場</span>
                  </div>
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
                  <CardTitle>企業概要</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">業種</h4>
                      <p className="text-gray-600">ソフトウェア開発・ITコンサルティング</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">設立年</h4>
                      <p className="text-gray-600">2015年4月</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">住所</h4>
                      <p className="text-gray-600">愛知県名古屋市中区錦3-1-1</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">従業員数</h4>
                      <p className="text-gray-600">85名</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">上場区分</h4>
                      <p className="text-gray-600">非上場</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>会社データプロフィール</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">事業内容</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Webアプリケーション開発、モバイルアプリ開発、システムインテグレーション、
                      ITコンサルティング、クラウドソリューション提供など、
                      最新技術を活用したソフトウェア開発事業を展開しています。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">本社所在地</h4>
                    <p className="text-gray-600">〒460-0003 愛知県名古屋市中区錦3-1-1 名古屋錦ビル10F</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">事業所</h4>
                    <div className="text-gray-600 space-y-1">
                      <p>・本社: 愛知県名古屋市中区錦3-1-1</p>
                      <p>・東京支社: 東京都渋谷区恵比寿1-2-3</p>
                      <p>・大阪支社: 大阪府大阪市北区梅田2-4-5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>MVV（ミッション・ビジョン・バリュー）</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">ミッション</h4>
                    <p className="text-gray-600">テクノロジーで社会課題を解決し、より良い未来を創造する</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">ビジョン</h4>
                    <p className="text-gray-600">東海地区No.1のITソリューションプロバイダーになる</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">バリュー</h4>
                    <p className="text-gray-600">挑戦・成長・協働</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>会社紹介ページ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <a
                      href="https://www.techinnovation.co.jp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      https://www.techinnovation.co.jp
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>連絡先</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">担当者名</h4>
                    <p className="text-gray-600">人事部 田中 太郎</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-gray-600">052-123-4567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-gray-600 break-all">recruit@techinnovation.co.jp</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 長期インターンタブ */}
          <TabsContent value="internship">
            <Card>
              <CardHeader>
                <CardTitle>募集要項（長期インターン）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">職種：Webエンジニア</h3>
                  <p className="text-gray-600 mb-4">実際の開発プロジェクトに参加し、最新技術を学べる環境です。</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">仕事内容</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Webアプリケーションの開発・保守</li>
                    <li>データベース設計・構築</li>
                    <li>API開発</li>
                    <li>テスト設計・実行</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">身につくスキル</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>React・Next.jsを使ったモダンなフロントエンド開発</li>
                    <li>Node.js・TypeScriptによるバックエンド開発</li>
                    <li>AWS・Dockerを活用したクラウド開発</li>
                    <li>Git・GitHubを使ったチーム開発</li>
                    <li>アジャイル開発手法の実践</li>
                    <li>データベース設計・SQL最適化</li>
                    <li>API設計・RESTful開発</li>
                  </ul>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">勤務地</h4>
                    <p className="text-gray-600">愛知県名古屋市中区（リモート併用可）</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">勤務時間</h4>
                    <p className="text-gray-600">週20時間以上（応相談）</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">時給</h4>
                    <p className="text-gray-600">1,200円〜2,000円</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">必須スキル</h4>
                    <p className="text-gray-600">プログラミング経験（言語不問）</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">こだわり条件</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">未経験者歓迎</Badge>
                    <Badge variant="secondary">リモート可</Badge>
                    <Badge variant="secondary">1・2年生も歓迎</Badge>
                    <Badge variant="secondary">理系学生におすすめ</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">選考情報</h4>
                  <div>
                    <h5 className="font-medium mb-2">選考フロー</h5>
                    <ol className="list-decimal list-inside text-gray-600 space-y-1">
                      <li>書類選考</li>
                      <li>一次面接（オンライン）</li>
                      <li>技術面接</li>
                      <li>最終面接</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 本選考タブ */}
          <TabsContent value="job">
            <Card>
              <CardHeader>
                <CardTitle>募集要項（本選考）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">職種：ソフトウェアエンジニア</h3>
                  <p className="text-gray-600 mb-4">
                    最新技術を活用したWebアプリケーション開発に携わっていただきます。
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">仕事内容</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Webアプリケーションの設計・開発</li>
                    <li>システムアーキテクチャの検討</li>
                    <li>チームでの開発プロジェクト推進</li>
                    <li>技術選定・導入</li>
                  </ul>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">勤務地</h4>
                    <p className="text-gray-600">愛知県名古屋市中区</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">勤務時間</h4>
                    <p className="text-gray-600">9:00〜18:00（フレックス制度あり）</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">募集人数</h4>
                    <p className="text-gray-600">3名</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">給与・賞与</h4>
                    <p className="text-gray-600">年収400万円〜700万円</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">年間休日</h4>
                    <p className="text-gray-600">125日</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">休日休暇</h4>
                    <p className="text-gray-600">完全週休2日制、祝日、夏季・年末年始休暇</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">待遇・福利厚生・社内制度</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>社会保険完備</li>
                    <li>交通費支給</li>
                    <li>書籍購入費補助</li>
                    <li>技術カンファレンス参加費補助</li>
                    <li>リモートワーク制度</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">選考情報</h4>
                  <div>
                    <h5 className="font-medium mb-2">選考フロー</h5>
                    <ol className="list-decimal list-inside text-gray-600 space-y-1">
                      <li>書類選考</li>
                      <li>一次面接</li>
                      <li>技術面接・コーディングテスト</li>
                      <li>最終面接</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 応募方法タブ */}
          <TabsContent value="application">
            <Card>
              <CardHeader>
                <CardTitle>応募方法</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">応募について</h4>
                  <p className="text-gray-600 mb-4">ご興味をお持ちいただいた方は、以下の方法でご応募ください。</p>
                </div>

                <div className="grid gap-4">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                    長期インターンに応募する
                  </Button>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    本選考に応募する
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">お問い合わせ</h4>
                  <div className="space-y-2 text-gray-600">
                    <p>応募に関するご質問がございましたら、お気軽にお問い合わせください。</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="break-all">recruit@techinnovation.co.jp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>052-123-4567</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}
