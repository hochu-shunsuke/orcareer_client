import { Metadata } from "next";
import { NavigationBar } from "@/components/navigation-bar";
import Link from "next/link";
// UserProfileの内容をこのファイルに統合
import { User, Building2, Heart, Settings, FileText, Bell, MapPin, Calendar, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { auth0 } from '@/lib/auth0';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "マイページ - オルキャリ",
};


export default async function UserPage() {
  // サーバー側でAuth0セッション取得
  const session = await auth0.getSession();
  if (!session || !session.user) {
    redirect('/auth/login');
  }

  // Supabaseからユーザーデータ取得
  const supabase = createServerSupabaseClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('sub', session.user.sub)
    .maybeSingle();

  // userデータをUserProfileに渡す
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 max-w-lg w-full mx-auto">
            <Card>
              <CardContent className="p-8">
                {/* UserProfile統合: supabaseユーザー情報を直接表示 */}
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    {user?.avatar_url ? (
                      <AvatarImage src={user.avatar_url} />
                    ) : (
                      <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">
                        {(user?.display_name || user?.name || user?.email || user?.sub || 'U')[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.display_name || user?.name || user?.email || user?.sub}</h2>
                  <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                  {user?.last_login_at && (
                    <div className="text-xs text-gray-400 mt-2">最終ログイン: {new Date(user.last_login_at).toLocaleString()}</div>
                  )}
                </div>
                <div className="mt-6">
                  {/* プロフィール編集ボタン例（必要に応じて表示制御） */}
                  {/* <Link href={`/user/${encodeURIComponent(user?.sub)}`}> */}
                  {/*   <Button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700">プロフィール編集</Button> */}
                  {/* </Link> */}
                </div>
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
                          <Button variant="outline" size="sm">
                            ログアウト
                          </Button>
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
      <Footer />
    </div>
  );
}
