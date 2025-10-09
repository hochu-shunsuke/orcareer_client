# JWT認証実装ガイド

## 概要

Auth0とSupabaseを使用したJWT認証フローの実装。
Next.js側はJWTを送信するのみで、Supabase側でJWT検証・クレーム抽出・ユーザーUPSERTを実行する。

**実装日**: 2025-10-09  
**ステータス**: ✅ 実装完了・動作確認済み

---

## アーキテクチャ

```txt
Auth0ログイン
  ↓
Next.js: session.tokenSet.accessToken 取得
  ↓
Next.js: supabase.rpc('upsert_user_from_jwt')
  ↓ Authorization: Bearer <JWT>
Supabase RPC関数:
  1. JWT検証 (Auth0ドメイン)
  2. クレーム抽出 (sub, email, name, picture)
  3. UPSERT実行 (SECURITY DEFINER)
  ↓
以降: RLSでアクセス制御
```

---

## 実装ファイル

### 1. Next.js側

#### `lib/auth0.js`

- Auth0ログイン後のコールバック処理
- `session.tokenSet.accessToken` からJWTを取得
- `upsertUserToSupabaseWithJWT(accessToken)` を呼び出し

#### `lib/auth0-upsert.ts`

```typescript
export async function upsertUserToSupabaseWithJWT(accessToken: string): Promise<void>
```

- JWT認証済みSupabaseクライアントを作成
- `supabase.rpc('upsert_user_from_jwt')` を呼び出し
- **JWTのデコードなし、送信のみ**

#### `lib/supabase-server.ts`

```typescript
export function createAuthenticatedServerClient(accessToken: string): SupabaseClient
```

- Anon Keyを使用してクライアント作成
- `Authorization: Bearer ${accessToken}` ヘッダーを設定
- RLS適用済みのクライアントを返却

---

### 2. Supabase側

#### `db/migrations/0003_upsert_user_from_jwt.sql`

```sql
CREATE OR REPLACE FUNCTION public.upsert_user_from_jwt()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
```

**処理内容:**

1. `current_setting('request.jwt.claims', true)::jsonb` でJWTクレーム取得
2. カスタムネームスペース対応: `https://orcareerclient.vercel.app/*`
3. 必須フィールド検証: `sub`, `email`
4. UPSERT実行: `ON CONFLICT (sub) DO UPDATE`
5. 結果返却: `{ user_id, is_new_user, auth0_sub, email }`

**権限:**

- `GRANT EXECUTE ON FUNCTION public.upsert_user_from_jwt() TO anon, authenticated;`
- SECURITY DEFINERでRLS制約を回避

---

## 環境変数

### Auth0

```env
AUTH0_DOMAIN=xxx.auth0.com
AUTH0_CLIENT_ID=xxx
AUTH0_CLIENT_SECRET=xxx
AUTH0_AUDIENCE=https://vinxumrallzgnbhqgonu.supabase.co
AUTH0_SCOPE=openid profile email
```

### Supabase

```env
SUPABASE_URL=https://vinxumrallzgnbhqgonu.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (RPC関数では不使用)
```

---

## セキュリティ特性

### ✅ 利点

1. **改ざん防止**: ユーザー情報はJWTから抽出、Next.js経由での改ざん不可能
2. **シンプル**: Next.js側はJWT送信のみ、3行で完結
3. **単一呼び出し**: RPC 1回でUPSERT完了、高速
4. **RLS適用**: 以降のクエリは自動的に行レベルセキュリティ適用
5. **監査可能**: JWT内のsubで全操作をトレース可能

### 🔒 SECURITY DEFINER の使用

- RPC関数はSECURITY DEFINERで実行
- 新規ユーザーINSERT時のRLS制約を回避
- 関数内で厳密なJWT検証を実行
- 実行権限を`anon`と`authenticated`ロールのみに制限

---

## カスタムクレーム対応

Auth0のカスタムネームスペース `https://orcareerclient.vercel.app/*` に対応:

```typescript
// 優先順位付きで抽出
user_email := COALESCE(
  jwt_claims->>'https://orcareerclient.vercel.app/email',
  jwt_claims->>'email'
);
```

対応クレーム:

- `sub` (必須)
- `email` (必須)
- `name` (オプション)
- `picture` (オプション)

---

## テスト方法

### 1. 新規ユーザー

```bash
# ログアウト状態から
1. /api/auth/login にアクセス
2. Auth0でログイン
3. Supabase users テーブルに新規レコード作成を確認
```

### 2. 既存ユーザー

```bash
# 既にusersテーブルにレコードがある状態で
1. /api/auth/login にアクセス
2. Auth0でログイン
3. last_login_at が更新されることを確認
```

### 3. ログ確認

```typescript
// 成功時のログ
[INFO] User created: user@example.com (auth0|123456)
[INFO] User updated: user@example.com (auth0|123456)

// エラー時のログ
[ERROR] Failed to upsert user via RPC: ...
```

---

## トラブルシューティング

### JWT claims not found

**原因**: JWTがAuthorizationヘッダーに設定されていない  
**解決**: `createAuthenticatedServerClient(accessToken)` を使用

### sub claim not found in JWT

**原因**: JWTに`sub`クレームが含まれていない  
**解決**: Auth0のAudience設定を確認 (`AUTH0_AUDIENCE`)

### permission denied for function

**原因**: RPC関数の実行権限がない  
**解決**: `GRANT EXECUTE ... TO anon, authenticated;` を実行

---

## 関連ドキュメント

- [Auth0 JWT Setup](./supabase-auth0-jwt-setup.md)
- [Database Implementation](./database-implementation.md)
- [API Documentation](./api.md)
- [Best Practices](./CRITICAL_FIXES_BEST_PRACTICES.md)

---

## 今後の拡張

### ロール管理

```sql
-- JWTのroleクレームを使用
user_role := jwt_claims->>'https://orcareerclient.vercel.app/role';
```

### マルチテナント対応

```sql
-- 企業IDをクレームに追加
company_id := jwt_claims->>'https://orcareerclient.vercel.app/company_id';
```

### 監査ログ

```sql
-- RPC関数内で監査ログテーブルにINSERT
INSERT INTO audit_logs (user_id, action, timestamp) VALUES (...);
```
