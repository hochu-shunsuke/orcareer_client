# Auth0 × Supabase（2025/09 時点）

## 概要

- Next.js App Router（app/ ディレクトリ構成）
- @auth0/nextjs-auth0 v4
- Supabase（usersテーブル: id(uuid), sub(varchar, unique), email, last_login_at）
- サーバー側 onCallback フックで supabase upsert（Service Role Key 利用）
- クライアント副作用・API Routeでの upsert は一切なし

## 認証・ユーザー同期フロー

1. ユーザーが Auth0 でログイン
2. Auth0 の onCallback フック（lib/auth0.js）で supabase.users へ upsert
    - Service Role Key を利用（RLS不要・堅牢）
    - sub, email, last_login_at を upsert（onConflict: 'sub'）
    - last_login_at は必ず更新
3. クライアントや /user ページでの upsert 副作用は発生しない

## users テーブル設計例

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub varchar UNIQUE NOT NULL,
  email varchar NOT NULL,
  last_login_at timestamptz NOT NULL
);
```

## lib/auth0.js のポイント

- onCallback フックで supabase-js を Service Role Key で初期化
- sub, email, last_login_at を upsert
- エラー時はログ出力のみ
- クライアントやAPI Routeでの upsertは一切不要

## 不要なもの

- /app/auth/callback/route.ts など ANON KEY upsert の旧API Route
- クライアント副作用 hook
- /user ページでの upsert

## ベストプラクティス理由

- サーバー側のみで upsert することで副作用・二重登録・権限エラーを防止
- Service Role Key で supabase upsert するため RLS/Policy 設計が不要
- users テーブルは sub 一意制約で upsert 衝突を防止
- last_login_at も必ず更新される

## 参考

- @auth0/nextjs-auth0 v4 ドキュメント
- Supabase Service Role Key 公式ドキュメント
- Next.js App Router 公式ドキュメント
