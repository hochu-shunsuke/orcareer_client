````markdown
# Auth0 × Supabase ベストプラクティス（2025/10 時点）

## 概要

- Next.js App Router（app/ ディレクトリ構成）
- @auth0/nextjs-auth0 v4
- Supabase（usersテーブル: id(uuid), sub(varchar, unique), email, last_login_at）
- **Pattern B: JWT統合方式** - Auth0のJWTをSupabaseで検証し、RLSを活用
- サーバー側 onCallback フックで supabase upsert（Service Role Key 利用）
- クライアント側は JWT をヘッダーに含めてSupabaseにアクセス

## 認証・ユーザー同期フロー

### 1. ログイン時（1回のみ）

```
ユーザー → Auth0 ログイン成功
          ↓
    onCallback フック発火（lib/auth0.js）
          ↓
    auth0-upsert.ts の関数呼び出し
          ↓
    Supabase users テーブルに upsert（Service Role Key使用）
    - sub, email, display_name, avatar_url, last_login_at
    - onConflict: 'sub'
```

### 2. 通常のリクエスト時（毎回）

```
クライアント → /api/auth/access-token でJWT取得
          ↓
    JWT付きSupabaseクライアント作成
          ↓
    Supabase API呼び出し（JWT in Authorization header）
          ↓
    SupabaseがJWT検証（Auth0のJWKSで署名確認）
          ↓
    RLSポリシーで認可チェック（jwt.claims.sub使用）
          ↓
    データ返却
```

## users テーブル設計

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id SERIAL UNIQUE NOT NULL,
  sub varchar(255) UNIQUE NOT NULL,  -- Auth0のsub
  email varchar(255) UNIQUE NOT NULL,
  display_name varchar(255),
  avatar_url text,
  user_type varchar(50) DEFAULT 'student',
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_users_sub ON users (sub);
```

## RLSポリシー設計

### ユーザーデータ（認証必須）

```sql
-- 自分のユーザー情報のみアクセス可能
CREATE POLICY users_self_select ON users
  FOR SELECT 
  USING (sub = current_auth0_sub());

-- 自分のお気に入りのみアクセス可能
CREATE POLICY favorites_owner ON favorites
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = favorites.user_id 
      AND u.sub = current_auth0_sub()
    )
  );
```

### 公開データ（認証不要）

```sql
-- 企業情報は全員が読み取り可能
CREATE POLICY companies_public_read ON companies
  FOR SELECT
  USING (deleted_at IS NULL);

-- 求人情報は全員が読み取り可能
CREATE POLICY internships_public_read ON internships
  FOR SELECT
  USING (deleted_at IS NULL);
```

## 実装パターン

### サーバーサイド（App Router）

```typescript
import { auth0 } from '@/lib/auth0';
import { createAuthenticatedServerClient } from '@/lib/supabase-server';

export default async function UserPage() {
  // Auth0セッションを取得
  const session = await auth0.getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }
  
  // JWT付きSupabaseクライアントでRLS適用
  const accessToken = session.accessToken || session.tokenSet?.accessToken;
  const supabase = createAuthenticatedServerClient(accessToken);
  
  // 自分のデータのみ取得（RLS適用）
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .single();
  
  return <div>...</div>;
}
```

### クライアントサイド（React Component）

```typescript
'use client';

import { getAuthenticatedSupabaseClient } from '@/lib/supabase-client';
import { useState, useEffect } from 'react';

export function FavoritesButton({ companyId }: { companyId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const handleToggleFavorite = async () => {
    try {
      // JWT付きクライアント取得（自動的に/api/auth/access-tokenを呼び出す）
      const supabase = await getAuthenticatedSupabaseClient();
      
      if (isFavorite) {
        // 削除（RLSで自分のお気に入りのみ削除可能）
        await supabase
          .from('favorites')
          .delete()
          .eq('company_id', companyId);
      } else {
        // 追加（RLSで自分のuser_idのみ設定可能）
        await supabase
          .from('favorites')
          .insert({ company_id: companyId });
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };
  
  return (
    <button onClick={handleToggleFavorite}>
      {isFavorite ? '★' : '☆'}
    </button>
  );
}
```

### 公開データの取得（認証不要）

```typescript
import { createSupabaseClient } from '@/lib/supabase-client';

export async function getCompanies() {
  // ANON_KEY使用（認証不要）
  const supabase = createSupabaseClient();
  
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('deleted_at', null)
    .order('created_at', { ascending: false });
  
  return data;
}
```

## ファイル構成

```
lib/
  ├── auth0.js              # Auth0設定、onCallbackフック
  ├── auth0-upsert.ts       # ユーザーupsertロジック
  ├── supabase-server.ts    # サーバー用Supabaseクライアント
  ├── supabase-client.ts    # クライアント用Supabaseクライアント
  └── authenticated-actions.ts  # 認証が必要な操作のサンプル

app/api/auth/
  └── access-token/
      └── route.ts          # JWTトークン取得API

db/migrations/
  ├── 0001_complete_schema.sql       # 初期スキーマ
  └── 0002_auth0_jwt_integration.sql # JWT統合・RLS有効化
```

## 環境変数

```bash
# Auth0設定
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=xxx
AUTH0_CLIENT_SECRET=xxx
AUTH0_SECRET=xxx
AUTH0_AUDIENCE=https://api.orcareer.com  # ← JWT統合に必須！
AUTH0_SCOPE=openid profile email

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx  # クライアント側で使用
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx  # サーバー側のupsertで使用
SUPABASE_ANON_KEY=xxx          # JWT検証で使用
```

## セキュリティのベストプラクティス

### 1. Service Role Keyの使用場所

✅ **使用すべき場所:**
- `onCallback`フックでのユーザーupsert
- 管理者操作
- バッチ処理

❌ **使用してはいけない場所:**
- クライアントサイド
- 通常のユーザー操作

### 2. JWT の管理

✅ **正しい方法:**
- `/api/auth/access-token`でサーバーから取得
- HTTPSで通信
- メモリ内で保持（リクエストごとに取得）

❌ **やってはいけないこと:**
- localStorageに保存
- クッキーに保存（Auth0が管理するセッションクッキーは例外）

### 3. RLS ポリシーの設計原則

1. **最小権限の原則**: 必要最小限のアクセス権のみ付与
2. **明示的な許可**: デフォルトは拒否、必要なものだけ許可
3. **テストの徹底**: 各ポリシーが正しく機能することを確認

### 4. エラーハンドリング

```typescript
try {
  const supabase = await getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.from('favorites').select();
  
  if (error) {
    // SupabaseエラーをログとUIに反映
    console.error('Supabase error:', error);
    toast.error('データの取得に失敗しました');
    return;
  }
  
  // 成功時の処理
} catch (error) {
  // ネットワークエラーやJWT取得エラー
  console.error('Request failed:', error);
  toast.error('ネットワークエラーが発生しました');
}
```

## 不要なもの（削除またはアーカイブ）

- ❌ クライアント副作用でのupsert hook
- ❌ `/app/api/auth/callback/route.ts` など独自のcallback実装
- ❌ ANON KEYでのユーザーデータ書き込み

## Pattern A vs Pattern B の比較

### Pattern A（旧方式）: サーバーサイド書き込みのみ

- ✅ シンプル
- ❌ RLSが機能しない
- ❌ クライアント側から書き込みできない
- ❌ 監査ログにユーザー情報が記録されない

### Pattern B（現方式）: JWT統合

- ✅ RLSが完全に機能
- ✅ クライアント側から安全に書き込み可能
- ✅ 監査ログに自動的にユーザー情報が記録
- ✅ スケーラブル
- ⚠️ 初期設定がやや複雑

## トラブルシューティング

### JWT検証エラー

**症状**: `JWT verification failed`

**解決策**:
1. SupabaseでAuth0のJWKS URLが設定されているか確認
2. `AUTH0_AUDIENCE`が正しく設定されているか確認
3. Auth0のAPI設定でRS256が使用されているか確認

### RLSエラー

**症状**: `new row violates row-level security policy`

**解決策**:
1. JWTがヘッダーに含まれているか確認
2. `current_auth0_sub()`が正しく動作しているか確認
3. RLSポリシーの条件を確認

### アクセストークン取得エラー

**症状**: `/api/auth/access-token`が401を返す

**解決策**:
1. Auth0でログインしているか確認
2. `AUTH0_AUDIENCE`が設定されているか確認
3. セッションが有効か確認

## 参考資料

- [Supabase Auth0 JWT設定ガイド](./supabase-auth0-jwt-setup.md)
- [Auth0 Documentation](https://auth0.com/docs)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [@auth0/nextjs-auth0 v4 Documentation](https://github.com/auth0/nextjs-auth0)

## 更新履歴

- 2025/10/02: Pattern B（JWT統合）に移行、RLS有効化
- 2025/09/02: Pattern A（サーバーサイド書き込みのみ）で初期実装

````
