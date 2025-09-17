import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 仮のダミーユーザー情報（本番は /api/auth/me などで取得してpropsで渡す）
const dummyProfile = {
  email: "dummy@example.com",
  auth0_user_id: "auth0|dummyid",
  created_at: "2025-09-18T00:00:00Z",
  last_login_at: "2025-09-18T12:00:00Z",
};

export default function UserPage() {
  const profile = dummyProfile;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ユーザープロファイル</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{profile.email}</CardTitle>
          <CardDescription>Auth0 ID: {profile.auth0_user_id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div>作成日: {profile.created_at}</div>
            <div>最終ログイン: {profile.last_login_at || "-"}</div>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites">お気に入り</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>
        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>お気に入り企業</CardTitle>
              <CardDescription>気になる企業をお気に入りに登録しています</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ダミー表示 */}
              <div className="border rounded-lg p-4">お気に入り企業はまだありません</div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>アカウント設定</CardTitle>
              <CardDescription>アカウントの設定を変更できます</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium">メール通知</h4>
                  <p className="text-sm text-gray-600">新着求人や応募状況の通知を受け取る</p>
                </div>
                <Button variant="outline" size="sm">設定</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium">プライバシー設定</h4>
                  <p className="text-sm text-gray-600">プロフィールの公開範囲を設定</p>
                </div>
                <Button variant="outline" size="sm">設定</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium">パスワード変更</h4>
                  <p className="text-sm text-gray-600">アカウントのパスワードを変更</p>
                </div>
                <Button variant="outline" size="sm">変更</Button>
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
                <Button variant="destructive" size="sm">削除</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
