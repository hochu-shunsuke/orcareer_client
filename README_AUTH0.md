# Auth0 / Supabase 開発者向けガイド（このリポジトリ用）

このファイルはプライベートな開発者向けドキュメントです。機密情報（クライアントシークレットや service role key 等）は絶対にこのファイルやリポジトリに直接書かないでください。

## 目的
- このプロジェクトでの Auth0 の使い方と設定手順をまとめる
- ローカル開発、Vercel デプロイ、環境変数、Cookie／セッションの挙動、Supabase 連携（読み取りは未認証可、書き込みは認証必須）についてのハンドブックを提供する

---

## 重要: 秘匿情報の扱い
- 絶対に `.env.local` をコミットしない（リポジトリの .gitignore を確認）。
- Auth0 の client secret、client id、Supabase の service role key 等は Vercel の Environment Variables に登録するか、安全なシークレットマネージャを使う。

---

## 環境変数（必要事項）
ローカルに `.env.local` を置く場合は以下を設定してください（値は実際のシークレットに置き換え）。

```
# アプリケーション基本
APP_BASE_URL=http://localhost:3000

# Auth0
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=xxxx
AUTH0_CLIENT_SECRET=xxxx
AUTH0_SECRET=（ランダムな長い文字列、セッション暗号化用）
# オプション
AUTH0_AUDIENCE=（API を使う場合にのみ設定）
AUTH0_SCOPE=openid profile email
AUTH0_SAMESITE=lax
AUTH0_SESSION_MAX_AGE=（秒、オプション）

# Supabase（サーバー側で書き込みを行う場合は service role key を環境変数に）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=（読み取り用、ローカルでは可）
SUPABASE_SERVICE_ROLE_KEY=（書き込み/管理用。サーバー外に出さない）
```

- `AUTH0_AUDIENCE` は API を利用する（access token を取得する）必要があるときだけ設定してください。不要に設定すると不要な access token が発行され、管理が複雑になります。

---

## ローカル開発手順（推奨）
1. 上の必要な環境変数を `.env.local` に書く（このファイルはコミットしない）。
2. 依存をインストール

```bash
pnpm install
```

3. 開発サーバを起動

```bash
pnpm dev
```

4. ブラウザで http://localhost:3000 を開き、ログインボタンから Auth0 ログインを確認してください。

### 環境チェック
リポジトリに `scripts/check-env.js` があり、必須 env の確認ができます（ローカル実行時は `.env.local` を自動でロードします）。

```bash
pnpm check-env
```

- CI では同じスクリプトを使ってデプロイ前に環境変数が揃っているか検証することを推奨します。

---

## Vercel デプロイ時（本番／プレビュー）
- `.env.local` をアップロードする必要はありません。代わりに Vercel の Project > Settings > Environment Variables に必要なキーを追加してください。
  - `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL` など
- Vercel は `VERCEL_ENV`（production/preview/development）を提供します。プロダクション判定に `VERCEL_ENV === 'production'` を使っています。
- デプロイの Build Command に環境チェックを入れる場合は以下のように設定できます（任意）：

```
node ./scripts/check-env.js && pnpm build
```

---

## Cookie / セッション方針
- 本番（Vercel の production）では次を推奨：
  - `secure: true`
  - `httpOnly: true`
  - `sameSite: 'lax'`（特殊要件なら 'none' + secure:true）
  - `path: '/'`
- Auth0 のセッション TTL は Auth0 側の設定を優先します。アプリ側で `maxAge` を任意に指定する必要は基本的にありません（このプロジェクトは `AUTH0_SESSION_MAX_AGE` を指定した場合のみ使用する設計です）。
- ログアウトは Auth0 の `/auth/logout` 経路を使って Auth0 側のセッションを破棄してください。

---

## Supabase と連携する設計（このプロジェクトの方針）
目的: 未認証でも企業検索（読み取り）は可能。応募などの書き込みは認証済みのみ。

- 認証後ユーザの永続化
  - 推奨: Auth0 のコールバック（Next.js のサーバー側。Auth0 SDK の after callback または `/api/auth/callback` 実装）で Supabase に `upsert` を行う（キーは Auth0 の `sub` を使う）。
  - これにより初回ログイン時にユーザレコードを作成できます。

- 読み取り（企業検索）
  - 簡易版: クライアントから Supabase の `anon` key を使って直接 SELECT（読み取り）を行う。素早く動かせますが、乱用対策が必要。
  - 推奨（商用）: 検索 API をサーバー経由にしてレート制限／キャッシュを入れる。RLS（Row Level Security）やポリシー設定を検討する。

- 書き込み（応募など）
  - フロントは `/api/apply` へ POST。
  - サーバー側で `auth0.getSession()` を呼んでユーザの検証を行い、Supabase の service role key を用いて書き込みを行う。
  - 直接クライアントに service role key を渡してはいけません。

---

## 実装概要: Auth0 をこのプロジェクトに組み込んだ方法
ここでは実装上の要点だけを簡潔にまとめます。詳細は該当ファイルを参照してください。

- Provider（クライアント側）
  - `app/layout.tsx` のルートレイアウトで `Auth0Provider` にアプリをラップしています。
  - サーバー側で取得した session があれば `Auth0Provider` に `user={session.user}` を渡して初期状態を埋めています（これによりクライアントでの余分なプロファイルフェッチを防げます）。

- サーバー側セッション取得
  - サーバー（レイアウトや API）からは `lib/auth0.js` で初期化した `auth0` クライアントの `getSession()` を使って現在のセッションを取得します。
  - 書き込み系 API（例: `/api/apply`）ではリクエスト受信側で `await auth0.getSession()` を呼び、セッションが無ければ 401 を返す実装にしてください。

- クライアント側フック
  - クライアント UI では `@auth0/nextjs-auth0` の `useUser()` を使ってユーザ情報を取得・表示しています（必ず `"use client"` を宣言したクライアントコンポーネントでのみ使用してください）。

- ミドルウェア
  - `middleware.ts` では Auth0 の middleware を利用していますが、SDK の `/api/auth` エンドポイントは保護対象から除外しています（SDK 内ハンドラが呼べなくなるため）。

---

## 認証／未認証状態での Supabase アクセス制御の提案
この項は運用方針と具体的な技術選択肢を示します。要件に合わせて調整してください。

1) 読み取り（企業検索）
  - 設計選択肢 A（シンプル・高速）: クライアントが Supabase の `anon` key を使って直接検索クエリを実行する。初期リリースに向くが、乱用（スクレイピング等）対策が必要。
    - 保護: クエリあたりのレート制限をフロント側で抑える（Debounce, UI 制約）と、Supabase 側での RLS は読み取りを許可する形にする。
  - 設計選択肢 B（堅牢）: 検索はサーバー経由の API（例: `/api/search`）にして、サーバーで Supabase に問合せを行う。サーバーでキャッシュ・レート制御・フィルタを実装できるため運用が楽。

2) 書き込み（応募など）
  - 常にサーバー経由で処理する。API は `auth0.getSession()` でユーザ認証を確認し、Supabase の service role key（サーバー側のみ保持）で書き込みを行う。
  - Supabase 側でも RLS を設定し、可能な限り書き込みはサーバー側の RPC に限定して権限を最小化する。

3) 利用制限（ジョブ検索の回数制限など）
  - 未認証ユーザ: ある程度緩めの制限（例: 1 分間に 10 クエリ、1 日に 500 クエリ）をサーバー側かエッジで実装。初期はクライアント側のレート制御＋サーバーで簡易カウントを推奨。
  - 認証済みユーザ: 基本的に無制限に近いアクセスを許可するが、不正利用対策として段階的に制限を設定（例: 1 秒間に 1 クエリのソフト制限、異常検知で一時ブロック）。
  - 実装案: Redis や in-memory cache（短時間のレート）と、日次カウントは DB にログしてポリシーを適用する。Vercel だけで完結させたい場合はサーバーレス関数に簡易キーでレートを記録する方法もある。

4) RLS（Row Level Security）の活用
  - 認証情報を Supabase が直接検証できる場合は、JWT を使って RLS を細かく設定できる（例: ユーザ固有の行のみ更新可）。ただしこの構成は Auth0 → Supabase JWT の紐付けが必要でやや複雑。
  - 単純化するなら、書き込みはサーバー側 RPC 経由にして RLS は読み取り保護や公開データの最小化に使う。

5) ユーザのアップサート（Auth0 登録後の同期）
  - 実装場所: `auth0` のコールバックハンドラ（サーバー側）で `upsert` を実行。
  - 格納候補フィールド: `auth0_sub`, `email`, `name`, `picture`, `created_at` など。`auth0_sub` を一意キーにする。

---

## セキュリティチェックリスト（デプロイ前）
- [ ] Vercel に上記の環境変数を設定した
- [ ] `.env.local` は git に含めていない
- [ ] Auth0 の Allowed Callback URLs と Allowed Logout URLs に `https://<your-domain>/api/auth/callback` と `https://<your-domain>/api/auth/logout` を登録した
- [ ] Supabase の service role key は公開リポジトリに含めていない
- [ ] Cookie 設定（secure/httpOnly/sameSite）を本番で確認した
- [ ] CI にて `pnpm check-env` を実行するワークフローを用意した（推奨）

---

## トラブルシューティング（よくある問題）
- エラー: "Service not found: your_auth_api_identifier" → `AUTH0_AUDIENCE` がプレースホルダのまま設定されている可能性あり。不要なら削除。
- コールバックでリダイレクトエラー → Auth0 の Allowed Callback URLs が正しく設定されているか確認。
- Cookie がブラウザに付与されない → secure/sameSite 設定を確認（localhost は secure:false、production は secure:true が必須）。

---

## 参考リンク
- Auth0 Next.js SDK: https://github.com/auth0/nextjs-auth0
- Auth0 ドキュメント（一般）: https://auth0.com/docs
- Supabase docs: https://supabase.com/docs

---

## 追加作業（必要なら私が代行します）
- `/api/auth/callback` に Supabase upsert を追加（実装と簡単なテスト）。
- `/api/apply` のサーバー実装（認証チェック + Supabase 書き込み）。
- CI（GitHub Actions）用ワークフロー雛形を作成して `pnpm check-env` を実行する。

必要な場合はどれを優先するか教えてください。
