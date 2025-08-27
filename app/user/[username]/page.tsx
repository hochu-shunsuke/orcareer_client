import { Metadata } from "next";
import { NavigationBar } from "@/components/navigation-bar";
import Link from "next/link";
import UserProfile from "@/components/user-profile";
import { User, Building2, Heart, Settings, FileText, Bell, MapPin, Calendar, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "ユーザーページ",
};

interface UserPageProps {
  params: { username: string };
}

export default function UserPage({ params }: UserPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 max-w-lg w-full mx-auto">
            <Card>
              <CardContent className="p-8">
                {/* client-side component shows auth0 profile when available */}
                {/* @ts-ignore */}
                <UserProfile usernameParam={params.username} />
              </CardContent>
            </Card>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="favorites" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="favorites">お気に入り</TabsTrigger>
                <TabsTrigger value="settings">設定</TabsTrigger>
              </TabsList>
              {/* Favorites Tab */}
              <TabsContent value="favorites" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-orange-600" />
                      お気に入り企業
                    </CardTitle>
                    <CardDescription>気になる企業をお気に入りに登録しています</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="w-full sm:w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-lg">株式会社テックイノベーション{i}</h3>
                              <Badge variant="secondary">IT系</Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>愛知県名古屋市</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>従業員数: {50 + i * 20}名</span>
                              </div>
                              <div>業界: ソフトウェア・通信</div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                                企業詳細
                              </Button>
                              <Button variant="outline" size="sm">
                                <Heart className="w-4 h-4 mr-1 fill-current text-red-500" />
                                お気に入り解除
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-orange-600" />
                      アカウント設定
                    </CardTitle>
                    <CardDescription>アカウントの設定を変更できます</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <h4 className="font-medium">メール通知</h4>
                          <p className="text-sm text-gray-600">新着求人や応募状況の通知を受け取る</p>
                        </div>
                        <Button variant="outline" size="sm">
                          設定
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <h4 className="font-medium">プライバシー設定</h4>
                          <p className="text-sm text-gray-600">プロフィールの公開範囲を設定</p>
                        </div>
                        <Button variant="outline" size="sm">
                          設定
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <h4 className="font-medium">パスワード変更</h4>
                          <p className="text-sm text-gray-600">アカウントのパスワードを変更</p>
                        </div>
                        <Button variant="outline" size="sm">
                          変更
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <h4 className="font-medium">ログアウト</h4>
                          <p className="text-sm text-gray-600">現在のセッションを終了します</p>
                        </div>
                        <a href="/auth/logout">
                          <Button variant="outline" size="sm">ログアウト</Button>
                        </a>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <h4 className="font-medium text-red-600">アカウント削除</h4>
                          <p className="text-sm text-gray-600">アカウントを完全に削除します</p>
                        </div>
                        <Button variant="destructive" size="sm">
                          削除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
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
  );
}
