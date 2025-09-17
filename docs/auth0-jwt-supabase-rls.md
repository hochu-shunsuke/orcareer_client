# Auth0 JWT × Supabase RLS認証設計メモ

## 概要
Auth0で取得したJWT（accessToken）をNext.js API経由でSupabaseに渡し、SupabaseのRow Level Security（RLS）でユーザーごとのアクセス制御を行う構成の設計メモ。

---

## 全体フロー

1. **クライアント**
    - Auth0で認証し、`getAccessToken()`でJWTを取得
    - APIリクエスト時に `Authorization: Bearer <JWT>` を付与
2. **Next.js API Route**
    - AuthorizationヘッダーからJWTを受け取り、署名・audience等を検証
    - SupabaseクライアントをJWT認証で生成し、DB操作
3. **Supabase**
    - 外部JWTプロバイダーとしてAuth0を登録
    - RLSで `auth.uid()` などを使い、JWTのsubでアクセス制御

---

## 必要な設定

### Auth0
- API Audienceを設定し、accessToken(JWT)が取得できるようにする
- JWTのsubがSupabaseのユーザーIDと一致するように設計

### Supabase
- [外部JWTプロバイダー](https://supabase.com/docs/guides/auth/auth-helpers/auth-server-side#bring-your-own-jwt)としてAuth0を登録
- usersテーブルの主キーがAuth0のsubと一致していること
- RLS（Row Level Security）を有効化し、`auth.uid() = id` などのポリシーを設定

例：
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
```

### Next.js API Route
- JWT検証用ライブラリ（例: jose）を導入
- AuthorizationヘッダーからJWTを受け取り、検証
- SupabaseクライアントをJWT認証で生成

例：
```typescript
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${jwt}` } }
});
```

---

## メリット
- サーバーはService Role Keyを使わず、ユーザー権限でSupabaseにアクセス
- SupabaseのRLSで「ユーザー自身のデータしか見れない」などの制御が可能
- JWTの検証・SupabaseのJWT設定・RLS設計が必須

---

## 参考
- [Supabase公式: Bring your own JWT](https://supabase.com/docs/guides/auth/auth-helpers/auth-server-side#bring-your-own-jwt)
- [Auth0公式: Access Tokens](https://auth0.com/docs/secure/tokens/access-tokens)
