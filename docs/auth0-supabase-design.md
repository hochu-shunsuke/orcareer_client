# Auth0 と Supabase 統合設計書

作成日: 2025-08-29

この設計書は、本プロジェクトでの Auth0 を IdP（認証基盤）として利用し、Supabase をアプリケーションのデータ層として用いる際の全体設計をまとめるものです。目的は安全で運用しやすい認証・ユーザ同期・認可フローを確立することです。

---

## 1. 目次

- 概要
- 要求事項（Goals）
- 高レベルアーキテクチャ
- データモデル（既存スキーマとの整合）
- 認証フロー詳細（コールバックでの upsert 等）
- API エンドポイント設計（契約）
- Supabase の RLS 方針と SQL 例
- 環境変数と鍵管理
- セキュリティ考慮事項
- テスト・CI の方針
- デプロイ / 運用時の監視とログ
- 未解決の設計選択肢（決定事項と質問）

---

## 2. 概要

目的：Auth0 によるユーザ認証を用いてログインを実現し、Auth0 のユーザ（`sub`）を Supabase の `users` テーブルに同期（upsert）する。アプリケーションの書き込み操作（例：お気に入り登録）はサーバー側で検証した上で Supabase の service role key を用いて実行する。クライアントは公開可能な anon key のみを使用して読み取りを行う。

成果指標：

- ユーザが Auth0 でログインすると、自動的に Supabase に user が作成／更新されること
- 認証済ユーザのみが favorites 等の書き込み操作を行えること
- service role key がクライアントに露出しないこと

---

## 3. 要求事項（Goals）

1. ユーザ認証は Auth0 に任せる。
2. 認証成功時に Supabase に `users` レコードを upsert する。
3. favorites 等の書き込みは認証済みユーザのみ行える。
4. クライアントに機密キーを渡さない設計。
5. 運用上の監査・ログを取りやすくする。

---

## 4. 高レベルアーキテクチャ

- ブラウザ（クライアント）
  - 読み取り: `supabase-client`（anon key）で companies / listings / internships を SELECT
  - 書き込み要求: サーバー API（例 `/api/favorites`）を呼ぶ
- Next.js サーバー（App Router / API routes）
  - `lib/auth0.js` を通じて Auth0 SDK を利用し `getSession()` で検証
  - `supabase-server`（service role key）を使って upsert / write を実行
  - 認証必須ルートは `auth0.getSession()` または `withApiAuthRequired` で保護
- Supabase（Postgres）
  - `users`, `user_profiles`, `companies`, `favorites` 等のテーブルを使用（`db/migrations/0001_init.sql` に準拠）
  - RLS は段階的に導入（初期はサーバー経由で書き込み）

図（概念）: Client -> Next.js API (auth0 check) -> Supabase (service role)

---

## 5. データモデル（既存スキーマ準拠）

このプロジェクトでは `db/migrations/0001_init.sql` の定義を尊重して `users` / `user_profiles` を利用します。

### users（既存）

- id: uuid PRIMARY KEY (gen_random_uuid())
- auth0_user_id: varchar(255) NOT NULL UNIQUE  ← Auth0 の `sub` を格納
- email: varchar(255) NOT NULL UNIQUE
- last_login_at: timestamptz
- created_at / updated_at

### user_profiles（既存）

- id: uuid PRIMARY KEY
- user_id: uuid UNIQUE REFERENCES users(id)
- last_name, first_name, university, graduation_year 等

### companies（既存）

- id: uuid PRIMARY KEY
- name, logo_url, website_url, status_id 等（`0001_init.sql` に準拠）

### favorites（既存）

- id: uuid PRIMARY KEY
- user_id: uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
- company_id: uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE
- created_at

UNIQUE(user_id, company_id) — 重複お気に入り防止

設計判断（確定）: 同一メールアドレスで別 `sub` が到来した場合は「別アカウント扱い」とします（将来的にユーザ主導でマージする UI を検討）。

### IDs: public_id と UUID v7（決定事項の配置）

- public_id
  - 決定: NanoID（ランダム、10 文字、base62 想定）を採用。
  - 理由: 短く URL に適し、可読性が高い。ユーザ向けパブリック ID として扱う。
  - 実装影響: `users` テーブルに `public_id` カラムを追加。新規はサーバー側で付与。既存データの backfill はバッチで実施。
  - 次のアクション: マイグレーション SQL（カラム + UNIQUE 制約）、挿入時の NanoID 生成ユーティリティ作成。

- UUID v7
  - 決定: サーバー側（Next.js）で UUID v7 を生成する。
  - 理由: 時系列性を確保し、外部で ID 管理しやすくするため。
  - 実装影響: サーバー内で生成するユーティリティを用意。DB 側の `gen_random_uuid()` と混在しない運用ルールをドキュメントに明記。
  - 次のアクション: UUID v7 ライブラリの採用とユーティリティ実装。

---

## 6. 認証フロー詳細（確定仕様）

1. ユーザがログインを開始 → Auth0 Hosted Login を経て、Auth0 SDK が提供するエンドポイント（通常 `/auth/login`, `/auth/callback`, `/auth/logout` 等）で処理されます。Auth0 SDK はこれらのエンドポイントを自動で提供するため、アプリ側で login/logout を再実装する必要はありません。
2. コールバック処理後に Supabase へユーザ同期（upsert）を行いたい場合は、SDK のフック（例: `afterCallback` など）を使うか、既存のコールバックエンドポイントをラップして追加処理（upsert）を差し込んでください。直接 `/auth/callback` をゼロから実装する必要はありません。
3. サーバー側で `auth0.getSession(req)` を呼び、`session.user` を取得して `sub, email, name, picture` 等を読取ります。
4. 抽出した `sub` をキーに `users` テーブルへ upsert（`auth0_user_id = sub` をキー）を行います。
5. `user_profiles` は初回に自動作成しない（プロフィールは別エンドポイントでユーザが編集）。
6. upsert 後、既定の returnTo にリダイレクト（必要に応じて）。

注: `sub` は Auth0 の一意識別子として利用します。SDK の提供するコールバック実装を活用することで、認証フローの安定性とアップデート互換性を確保できます。

---

## 6.1 Auth0 → Supabase の連携パターンと JWT の扱い（明確化）

このプロジェクトで考慮すべき主要な連携パターンは下記の2通りです。どちらを採るかで実装・運用が変わります。

パターンA（推奨・初期実装） — サーバー経由の書き込み（JWT を Supabase に直接渡さない）

- フロー: クライアントは Auth0 でログインし、認証済セッションは Next.js サーバー側で `auth0.getSession()` により確認する。サーバーは SUPABASE_SERVICE_ROLE_KEY を使って Supabase に対して upsert/書き込みを行う。
- JWT: クライアントから Supabase へ JWT を渡す必要はない（Supabase 側で外部 JWT を受け入れる設定を行わない）。サーバーが責任を持って書き込みを実行するため、Secrets 管理が単純になる。
- 利点: 実装が単純、セキュリティ管理が容易、Supabase の標準的なサービスロールで確実に操作可能。
- 欠点: クライアントから直接書き込みを許可したい場合（RLS を用いる場合）は将来的に設計変更が必要。

パターンB（上級・将来拡張） — クライアント直接書き込み（Auth0 JWT / Supabase で RLS を有効にする）

- フロー例1: Supabase を外部 JWT を検証するように設定し、Auth0 の発行する JWT（sub を含む）をそのまま用いてクライアントが直接 Supabase に書き込みする。
- フロー例2（代替）: サーバー側で Auth0 の session を確認し、Supabase のセッション（JWT）を発行してクライアントに渡す（トークン交換）。
- JWT: このパターンではクライアントが Supabase に JWT を送ることで RLS のオーナー判定ができる。だが Supabase が受け取る JWT のフォーマット（署名アルゴリズム、issuer、claim 名）を合わせる必要がある。
- 利点: クライアントが直接 DB 操作できるためレスポンスが速い、RLS による細かい権限管理が可能。
- 欠点: 設定と運用が複雑（Auth0 の RS256 と Supabase の期待アルゴリズムの差分、管理する秘密鍵/issuer 設定の整備、脆弱性リスクの増加）。マネージド Supabase では外部 JWT の受け入れに制限がある場合があるため、事前確認が必須。

**決定**: 当面はパターンA（サーバー経由）を採用します。理由: コストと運用の単純さ、セキュリティリスク低減のためです。パターンB（クライアント直接書き込み＝JWT を用いる運用）は将来の拡張として保留します。パターンB を検討する場合は下記を計画してください:

- Auth0 の JWT を Supabase が検証できるように設定する方法の確定（Supabase 管理設定 or トークン発行パイプライン）
- RLS ポリシーの設計（どの claim を使ってユーザ判定するか、current_setting の使用可否）
- トークンの失効/ローテーション戦略、及び発行と検証の監査ログ

## 6.2 実装手順（具体） — Pattern A を前提にした現実的な作業手順

以下は当面推奨する Pattern A（サーバー経由書き込み）の実装手順です。各ステップは小さく分けてデプロイ可能にしてください。

### サーバー側 Supabase クライアントを用意

- 作成: `lib/supabase-server.ts`（SUPABASE_SERVICE_ROLE_KEY を使う）。サーバー専用で環境変数からロードし、クライアントをエクスポートする。

### Auth0 のコールバック後 upsert 実装

- 方法A: `@auth0/nextjs-auth0` の `afterCallback`（または SDK の同等フック）に upsert 処理を入れる。
- 方法B: SDK 提供の `/api/auth/callback` をラップして、コールバック完了直後に `auth0.getSession()` を読み取り `users` を upsert する。
- upsert の実装要点: サーバーで UUID v7 を生成、`auth0_user_id` で on-conflict upsert、最後に必要な public_id（NanoID）を付与。

### favorites API 実装（サーバー経由）

- `app/api/favorites` を実装し、`auth0.getSession()` でセッションを検証。ユーザの `id` を `users` テーブルから取得し、`favorites` を insert/delete する。
- エラーや race 条件を考慮してトランザクション or ON CONFLICT を利用する。

### RLS は段階的に導入

- 初期: サーバー経由で書き込み。RLS は維持せずに運用しても良い（管理が楽）。
- 拡張時: Supabase が外部 JWT を受け入れる前提で RLS ポリシーを作る。ポリシーは `jwt.claims.sub` を参照して所有者判定する想定。

### JWT の扱い（決定）

- 決定: クライアントから Supabase に JWT を渡さない（Pattern A を採用）。理由はコスト低下、運用の単純化、安全性の確保のため。
- 将来にクライアント直接書き込みを検討する場合は、Auth0/JWT の検証フローと RLS 設計を別途計画する（現時点では未採用）。

### 移行・バックフィル計画

- public_id カラム追加のマイグレーション SQL を用意し、新規インサートはアプリ側で public_id を付与。既存レコードはバッチで backfill（安全ロジック: 競合判定と再試行）。

エッジケースと注意点:

- 同一 email / 別 sub: 別アカウント扱いのまま進める。必要ならユーザ主導のマージ UI を後で用意。
- upsert の競合: 同時ログインで race が起き得るのでトランザクション or DB 側のユニーク制約と再試行ロジックを入れる。
- UUID v7 生成: 既存の `gen_random_uuid()` と混在させない運用に注意。クライアント側ではなくサーバーで生成。

---

## 7. API エンドポイント設計（詳細）

以下は推奨する最小セットと契約。

### `POST /api/favorites`

- 説明: 指定した company を現在のログインユーザの favorites に追加。
- 認証: 必須（`auth0.getSession(req)`）。
- 入力 (JSON): { companyId: string }
- 処理:
  1. session = await auth0.getSession(req) -> if (!session) 401
  2. supabase = createServerSupabaseClient()
  3. find user: SELECT id FROM users WHERE auth0_user_id = session.user.sub
  4. INSERT INTO favorites (user_id, company_id) ON CONFLICT DO NOTHING
- 出力: 200 { ok: true, favoriteId?: uuid } / 401 / 5xx

### `DELETE /api/favorites/:companyId`

- 説明: 指定した company の favorite を削除。
- 認証: 必須
- 処理: session -> user_id -> DELETE FROM favorites WHERE user_id = ? AND company_id = ?
- 出力: 200 { ok: true } / 401 / 404 / 5xx

### 検討: `GET /api/companies` はクライアントが anon key で直接読むことを許可（認証不要）

---

## 8. anon 読み取りに関する方針（確定）

- 方針: companies / listings / internships はクライアントが `anon` key で直接取得して問題ありません（読み取り専用）。
- ただし以下の追加対策を必須とします:
  - API レート制限（クライアント経由での頻発リクエストを防ぐため、Edge CDN や API Gateway で throttle）
  - フロントのキャッシュ（SWR / React Query）とサーバー側キャッシュ（CDN / ISR）を併用
  - 公開するカラムは最小限に限定（連絡先や内部管理情報は含めない）

理由: パフォーマンスとコストを抑えつつ UX を良くするため。

---

## 9. Supabase の RLS（方針と例）

方針: 初期はサーバー経由での書き込みを前提にして RLS は段階的に導入します。将来クライアント書き込みを許可する場合は Auth0 JWT を Supabase が受け入れる設定とポリシー設計が必要です。

概念的な SQL 例（favorites の RLS を示す）:

```sql
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- (例) JWT の sub を profiles の auth0_user_id と照合してオーナー判定するポリシー
CREATE POLICY user_can_modify_own_favorites
  ON favorites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = favorites.user_id AND u.auth0_user_id = current_setting('jwt.claims.sub', true)
    )
  );
```

注: 上記は概念例です。Supabase が受け取る JWT のクレーム名や current_setting の利用可否に合わせて調整が必要です。

---

## 10. 環境変数と鍵管理

必須:

- AUTH0_DOMAIN
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET
- AUTH0_SECRET
- APP_BASE_URL
- SUPABASE_URL
- SUPABASE_ANON_KEY (クライアント用)
- SUPABASE_SERVICE_ROLE_KEY (サーバー専用)

運用ルール:

- `SUPABASE_SERVICE_ROLE_KEY` と `AUTH0_CLIENT_SECRET` は Vercel の環境変数（Production/Preview）にのみ設定し、クライアントに露出しない。
- ログやエラーメッセージに秘密情報を出力しない。

---

## 11. セキュリティ考慮事項（要約）

- service role key をクライアントに渡さない。
- `auth0.getSession()` によるサーバー側検証を必須化。
- OAuth2 の `error` / `error_description` はユーザ入力を含む可能性があるため、そのまま表示しない。
- セッション cookie は `secure`, `httpOnly`, `sameSite` を適切に設定する（`lib/auth0.js` が既に対応）。
- DB 側は unique 制約とトランザクションで upsert の衝突を処理する。

---

## 12. Refresh token の扱い（推奨）

- 既定: 当面は `@auth0/nextjs-auth0` のセッション管理（cookie）に任せる。短期運用で十分な場合はこれで進める。
- 保存が必要な場合の選択肢:
  - DB に暗号化して保存（KMS や環境変数で鍵を管理）
  - Refresh Token Rotation を有効にする（Auth0 の設定）
- 推奨: 初期は保存しないか SDK に任せ、要件が出たら rotation + 暗号保存を実装する。

---

## 13. アカウント削除・データ保持ポリシー（推奨）

- ソフト削除: `deleted_at` を主要テーブルに導入し、ユーザ申請でまずソフト削除を行う。
- 保持期間: デフォルト 30 日の猶予を置き、その後バッチで完全削除（ハード削除）を実施。
- エクスポート: ユーザのデータエクスポート API を提供。
- 完全削除: 要求に応じて関連データ（favorites 等）を cascade で削除。ログ等は個人情報を除いた形で保持可能。

---

## 14. テスト・CI（推奨構成）

- 単体テスト: API ロジック（upsert, favorites）のユニットテスト。Supabase 呼び出しはモック。
- 統合テスト: `generateSessionCookie` を使いサーバーの保護ルートをテスト。テスト用 Supabase プロジェクトと Auth0 テナントを用意。
- E2E: Playwright/Cypress でログイン→favorite 操作を検証（可能なら Auth0 をモック）。
- CI: integration/E2E を走らせる場合は CI にテスト用シークレットを安全に登録。シークレットがない場合は integration をスキップ。

---

## 15. 未解決の設計選択肢 / 決定

確定事項:

- 同一メール別 `sub` は別アカウント扱い（短期の安全優先）。
- anon 読み取りは許可するが、API 側でレート制限／キャッシュ等の対策を必須とする。

残課題（将来検討）:

- ユーザ主導のアカウントマージ UI
- JWT+RLS を使ったクライアント書き込み（要設計）

---

## 16. 追加: favorites API の擬似実装例（Node/Next.js）

```ts
// app/api/favorites/route.ts
import { auth0 } from '../../../lib/auth0';
import { createServerSupabaseClient } from '../../../lib/supabase-server';

export async function POST(req) {
  const session = await auth0.getSession(req);
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await req.json();
  const companyId = body.companyId;
  if (!companyId) return new Response(JSON.stringify({ error: 'companyId required' }), { status: 400 });

  const supabase = createServerSupabaseClient();
  const userRes = await supabase.from('users').select('id').eq('auth0_user_id', session.user.sub).single();
  if (userRes.error || !userRes.data) return new Response(JSON.stringify({ error: 'User not found' }), { status: 403 });

  const insert = await supabase.from('favorites').insert({ user_id: userRes.data.id, company_id: companyId }).onConflict('user_id,company_id').ignore();
  if (insert.error) return new Response(JSON.stringify({ error: 'DB error' }), { status: 500 });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
```

---

## 17. 次のアクション

1. `lib/supabase-server.js` / `lib/supabase-client.js` を作成
2. コールバック後の upsert ロジックを実装（推奨: Auth0 SDK のフック（例: `afterCallback`）に実装するか、SDK 提供の `/api/auth/callback` をラップして upsert を差し込む）
3. `app/api/favorites` を実装し、ユニット＋統合テストで確認
4. `db/migrations` に RLS ポリシー（試験用）を追加して検証

---

## 18. 決定事項（要約と実装インパクト）

以下は本プロジェクトで確定した主要な設計決定を、理由と実装への影響、次の具体アクションまで含めて整理したものです。実装チームが瞬時に判断できる形式にしています。

### 決定: public_id の方式

- 決定: NanoID（ランダム）を採用（10 文字、base62 想定）。
- 理由: 短く可読で URL に適しており、衝突確率が十分低い。ユーザ向け URL を簡潔に保つため。
- 実装影響: `users` テーブルに `public_id` カラムを追加。新規レコードはアプリ側で生成して挿入。
- 次のアクション: マイグレーション SQL 作成（カラム + UNIQUE インデックス）、挿入時の NanoID 生成関数を `lib` に追加。

### 決定: public_id の付与タイミング

- 決定: 新規作成時にアプリ（サーバー側）で付与。既存データの backfill は後回し。
- 理由: DB 変更負荷を最小化し、運用リスクを抑えるため。
- 実装影響: マイグレーションは直ちに追加するが、backfill スクリプトは別コミットで実行。
- 次のアクション: backfill 用スクリプトのテンプレート（衝突回避ロジック含む）を用意。

### 決定: public_id の長さ

- 決定: 10 文字から開始（必要なら後で 12 に伸ばす）。
- 理由: 短さと安全性のバランス。運用でヒット率を確認して調整可能。
- 実装影響: NanoID の長さを固定するユーティリティを作成。検査用のユニットテストを追加。

### 決定: anon（公開）読み取りポリシー

- 決定: companies/listings/internships 等の公開データはクライアントが `anon` key で直接取得可能。
- 理由: パフォーマンスとコスト効率を優先。CDN キャッシュとクライアントキャッシュでスケールを稼ぐ。
- 実装影響: API の Cache-Control 設定、Edge レートリミット、公開カラムの限定が必須。
- 次のアクション: CDN キャッシュ設定と Edge レートリミットの初期パラメータ案を作成。

### 決定: OpenAPI / Zod の導入方針

- 決定: 方針は保留（現状は code-first（Zod）を優先検討）。
- 理由: 初期は開発効率を優先し、Types の自動生成をまず整備するため。
- 実装影響: Zod を用いたバリデーション→型生成のワークフローを試験的に導入。OpenAPI は必要に応じて later.
- 次のアクション: `zod` を使った API schema の雛形を 1 つ作る（favorites API を候補）。

### 決定: 型生成の範囲

- 決定: 当面はフロント用 TypeScript 型のみ（types-only）を自動生成する。
- 理由: フロント開発の生産性向上が優先。
- 実装影響: 型生成スクリプト（openapi-typescript / zod-to-ts 等）を repo に追加する検討。

### 決定: API レスポンス形式

- 決定: 共通フォーマット `{ ok: boolean, data?: any, error?: string, code?: string }` を採用。
- 理由: エラーハンドリングとフロントの共通処理を簡潔にするため。
- 実装影響: 全 API に共通レスポンスヘルパーを用意（`lib/api-response.ts`）し、ユニットテストを追加。

### 決定: UUID v7 の生成場所

- 決定: サーバー側（Next.js）で生成する（DB の gen_random_uuid() は使用しない運用）。
- 理由: UUID v7（時系列性）を採用して外部で ID を制御しやすくするため。
- 実装影響: サーバー内で UUID v7 生成ユーティリティを用意。既存 SQL のデフォルトは維持するが新規はサーバー生成を推奨ドキュメントに明記。

### 決定: JWT の扱い（認証トークンの流れ）

- 決定: クライアントから Supabase に JWT を渡さない（Pattern A を正式採用）。
- 理由: コスト削減、運用単純化、セキュリティリスク低減。マネージド Supabase 側の設定差分を回避するため。
- 実装影響: 認証が必要な書き込みはすべて Next.js サーバー経由で実行。Supabase への書き込みは SUPABASE_SERVICE_ROLE_KEY を用いる。RLS を用いたクライアント直接書き込みは将来の課題として扱う。
- 次のアクション: ドキュメント（README）に JWT 非採用の理由と運用ガイドを追記。

### 決定: 同一メール／別 sub の扱い

- 決定: 別アカウントとして扱う（ユーザ主導のマージは将来機能）。
- 理由: 自動マージは誤マージのリスクが高いため保守的に行う。
- 実装影響: ユーザ管理 UI の将来的要件として記録。

---

## 19. CDN キャッシュ導入に必要な項目（要点）

目的: anon 読取を許可しつつコスト・乱用を抑え、UX を低レイテンシにする。

必須項目（実装タスク）:

### CDN 選定と設定

- Vercel の場合はデフォルトで Edge CDN を利用可能。Cloudflare や Fastly を使う場合はプロキシ設定を用意。

### レスポンスの Cache-Control 設定

- 企業一覧などの読み取り API は `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=60` のように設定。

### CDN キャッシュキー設計

- キャッシュキーはエンドポイント + クエリパラメータ（page/limit/filters）で一意化。不要に多くのバリエーションを作らない。

### Purge / Invalidation 戦略

- 企業データ更新時に CDN キャッシュを無効化する仕組み（サーバーサイドで surrogate-key を付与して purge / API 経由で invalidation）を用意。

### API サーバ側のレート制限

- IP/ユーザ単位のレート制限を API Gateway（Cloudflare、Vercel Edge Middleware、API Gateway 等）で実施。読み取りは高めの閾値、書き込みは低め。

### フロントのキャッシュ戦略

- SWR / React Query でクライアントキャッシュを実装。必要なら stale-while-revalidate を使って UX を良くする。

### Pagination と ETag

- 大量データはページネーションを必須化し、ETag を使って 304 を返す最適化を検討。

### 監視とメトリクス

- CDN ヒット率、API レートリミット違反数、Supabase のレート/課金指標を監視する。

運用と注意点:

- 認証ユーザ用データは CDN キャッシュから除外する（Set-Cookie 等で識別）。公開データのみキャッシュする。
- クエリの多様化（過度なフィルタ組み合わせ）を避けるため、フロントでのフィルタを限定し、必要ならサーバー側で precomputed view を作る。
- Supabase からのレスポンスに応じてキャッシュを細かくコントロールする（更新頻度が高いカラムは s-maxage を短くする）。

小さな導入例（順序）:

1. まず API のレスポンスに Cache-Control を追加（短めの max-age から開始）。
2. Vercel / Cloudflare のキャッシュ設定を適用し、ヒット率を観察。
3. レートリミット（Edge）を有効化。閾値を緩くして様子をみる。
4. 必要なら surrogate-key を付与して個別 purge を実装。

---
