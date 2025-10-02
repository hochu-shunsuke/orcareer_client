# Supabase Auth0 JWT 統合設定ガイド

このガイドでは、SupabaseでAuth0のJWTを検証できるようにする設定手順を説明します。

## 前提条件

- Auth0テナントが作成済み
- Supabaseプロジェクトが作成済み
- Auth0でAPIが設定済み（AUTH0_AUDIENCEが設定されている）

## 1. Auth0の設定

### 1.1 API（Audience）の作成

1. Auth0ダッシュボードで **Applications → APIs** に移動
2. **Create API** をクリック
3. 以下を設定:
   - **Name**: `Orcareer API` (任意)
   - **Identifier**: `https://api.orcareer.com` (これがAUDIENCEになります)
   - **Signing Algorithm**: `RS256` (推奨)

### 1.2 カスタムクレームの追加（オプション）

Auth0のActionsでカスタムクレームを追加できます:

1. **Actions → Flows → Login** に移動
2. **Custom** タブから **Create Action** を選択
3. 以下のコードを追加:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://orcareer.com'; // カスタムクレームの名前空間
  
  // ユーザー情報をトークンに追加
  if (event.authorization) {
    api.accessToken.setCustomClaim(`${namespace}/email`, event.user.email);
    api.accessToken.setCustomClaim(`${namespace}/email_verified`, event.user.email_verified);
  }
};
```

4. **Deploy** をクリック
5. Flowに戻り、作成したActionをドラッグ&ドロップで追加
6. **Apply** をクリック

## 2. Supabaseの設定

### 2.1 JWT秘密鍵の設定

Supabase DashboardでAuth0のJWKS URLを設定します:

1. Supabaseダッシュボードで **Settings → API** に移動
2. **JWT Settings** セクションを見つける
3. 以下の設定を追加:

**方法A: SupabaseのCustom JWT Secrets（推奨）**

Supabase Dashboardの **Authentication → Providers → Custom** から設定:

- **JWT Secret Type**: `JWKS`
- **JWKS URL**: `https://YOUR_AUTH0_DOMAIN/.well-known/jwks.json`
  - 例: `https://dev-xxxxx.us.auth0.com/.well-known/jwks.json`

**方法B: PostgreSQL設定（手動）**

Supabase SQL Editorで以下を実行:

```sql
-- Auth0のJWT検証を有効化
ALTER DATABASE postgres SET "app.jwt.secret" = '{"jwks_uri": "https://YOUR_AUTH0_DOMAIN/.well-known/jwks.json"}';

-- 設定を再読み込み
SELECT pg_reload_conf();
```

### 2.2 JWT検証関数のテスト

SQL Editorで以下を実行してJWT検証をテストします:

```sql
-- JWT claimsからsubを取得できるかテスト
SELECT current_auth0_sub();

-- 自分のユーザーIDを取得できるかテスト
SELECT current_user_id();

-- RLSポリシーが機能しているかテスト
SELECT * FROM users WHERE auth0_user_id = current_auth0_sub();
```

## 3. 環境変数の設定

### 3.1 .env.local (ローカル開発)

```bash
# Auth0設定
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_SECRET=your_random_secret_32chars_or_more
AUTH0_AUDIENCE=https://api.orcareer.com  # ← Step 1.1で作成したAPI Identifier
AUTH0_SCOPE=openid profile email

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# アプリ設定
APP_BASE_URL=http://localhost:3000
```

### 3.2 Vercel (本番環境)

Vercel Dashboard → Settings → Environment Variables で同じ変数を設定してください。

## 4. マイグレーションの実行

### 4.1 ローカル開発環境

Supabase SQL Editorで以下のマイグレーションを実行:

```bash
# マイグレーションファイルの内容をコピー
cat db/migrations/0002_auth0_jwt_integration.sql

# Supabase SQL Editorに貼り付けて実行
```

### 4.2 本番環境

Supabase CLIを使用する場合:

```bash
# Supabase CLIのインストール
npm install -g supabase

# プロジェクトにリンク
supabase link --project-ref your-project-ref

# マイグレーションの適用
supabase db push
```

## 5. 動作確認

### 5.1 ローカルでテスト

```bash
# 開発サーバーを起動
pnpm dev

# ブラウザで http://localhost:3000 を開く
# ログインして、ブラウザの開発者ツールのNetworkタブで確認
```

### 5.2 JWTトークンの確認

ブラウザのコンソールで:

```javascript
// アクセストークンを取得
fetch('/api/auth/access-token')
  .then(r => r.json())
  .then(data => {
    console.log('Access Token:', data.accessToken);
    
    // JWTをデコード（jwt.io でも確認可能）
    const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
    console.log('JWT Payload:', payload);
  });
```

### 5.3 Supabase RLSのテスト

```javascript
// 認証付きクライアントでテスト
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-client';

const supabase = await getAuthenticatedSupabaseClient();

// 自分のユーザー情報を取得（RLS適用）
const { data, error } = await supabase
  .from('users')
  .select('*')
  .single();

console.log('User:', data);
console.log('Error:', error);

// お気に入りの追加（認証必須）
const { data: favorite, error: favError } = await supabase
  .from('favorites')
  .insert({ company_id: 'some-company-uuid' })
  .select()
  .single();

console.log('Favorite:', favorite);
```

## 6. トラブルシューティング

### JWT検証エラー

**症状**: `JWT verification failed` エラー

**解決策**:
1. Auth0のJWKS URLが正しいか確認
2. Auth0のAPI設定でRS256が使用されているか確認
3. AUDIENCEが正しく設定されているか確認
4. Supabaseの設定が反映されているか確認（`SELECT pg_reload_conf();`）

### RLSエラー

**症状**: `new row violates row-level security policy` エラー

**解決策**:
1. JWTがヘッダーに含まれているか確認
2. `current_auth0_sub()`関数が正しくsubを返すか確認
3. RLSポリシーが正しく設定されているか確認

### トークン取得エラー

**症状**: `/api/auth/access-token` が401を返す

**解決策**:
1. Auth0でログインしているか確認
2. セッションが有効か確認（`auth0.getSession()`）
3. AUDIENCEが設定されているか確認

## 7. セキュリティのベストプラクティス

1. **Service Role Key の管理**
   - 絶対にクライアント側に公開しない
   - 環境変数でのみ管理
   - Gitにコミットしない

2. **RLSポリシーの設計**
   - 最小権限の原則に従う
   - 公開データと認証が必要なデータを明確に分ける
   - テストで必ず確認する

3. **JWT の管理**
   - HTTPSを使用する
   - トークンをlocalStorageに保存しない
   - 短い有効期限を設定する（Auth0側で設定）

4. **監査ログ**
   - すべての重要な操作をログに記録
   - 定期的にログを確認
   - 異常なアクセスパターンを検知

## 参考リンク

- [Auth0 Documentation](https://auth0.com/docs)
- [Supabase JWT Documentation](https://supabase.com/docs/guides/auth/jwt)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [@auth0/nextjs-auth0 Documentation](https://github.com/auth0/nextjs-auth0)
