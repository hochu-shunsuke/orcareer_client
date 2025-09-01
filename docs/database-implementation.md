# データベース実装レポート

## 概要

orcareerプロジェクトのSupabase PostgreSQLデータベースとAuth0統合の実装詳細

## 実装ファイル

- `db/migrations/0001_complete_schema.sql` - 完全データベーススキーマ
- `lib/auth0-upsert.ts` - Auth0ユーザー同期機能
- `lib/supabase-server.ts` - サーバーサイドSupabaseクライアント

## スキーマ構成

### DBML準拠テーブル (25テーブル)

**マスターデータ**: `company_statuses`, `listing_classifications`, `industries`, `job_types`, `prefectures`, `areas`, `internship_tags`

**ユーザー関連**: `users`, `user_profiles`, `user_details`

**企業関連**: `companies`, `company_overviews`, `company_data`, `company_mvvs`, `company_contacts`, `company_areas`

**求人関連**: `internships`, `internship_tag_relations`, `internship_areas`, `recruitments`, `recruitment_areas`

**お気に入り**: `favorites` (企業のみ/DBML準拠)

### 機能拡張テーブル

**追加お気に入り**: `internship_favorites`, `recruitment_favorites` (機能要件対応)

**追加機能**: `applications` (応募ログ), `audit_logs` (監査ログ)

### DBML仕様からの拡張

**追加フィールド**:

- `users.public_id`, `display_name`, `avatar_url`, `deleted_at`
- `companies.public_id`, `deleted_at`

**データ検証**: CHECK制約 (email形式、電話番号、郵便番号、生年月日妥当性)

**パフォーマンス**: 検索用複合インデックス

## Auth0統合 (Pattern A)

### 実装方式

- **サーバーサイド書き込み専用** (service role key使用)
- **RLS有効化済み** (将来のJWT統合準備)

### ユーザー同期機能

```typescript
// lib/auth0-upsert.ts
upsertUserToSupabase(user) // Auth0→Supabase同期
syncCurrentUserToSupabase() // 現在ユーザー同期
```

### 主要機能

- Auth0 sub → public_id 変換
- 重複チェック (email, auth0_user_id)
- エラーハンドリング
- 監査ログ自動記録

## セキュリティ設定

### Row Level Security (RLS)

- 全ユーザー関連テーブルでRLS有効
- 機密テーブルの直接アクセス禁止
- 公開ビュー経由でのデータアクセス

### 権限管理

```sql
-- 機密テーブルへの直接アクセス拒否
REVOKE SELECT ON users, user_profiles, favorites FROM anon;

-- 公開ビュー経由でのアクセス許可
GRANT SELECT ON v_companies_public, v_users_public TO anon;
```

## 監査・ログ機能

### 自動監査トリガー

対象テーブル: `users`, `companies`, `favorites`, `user_profiles`, `applications`

### ログ内容

- 操作種別 (INSERT/UPDATE/DELETE)
- 実行ユーザー (JWT claims.sub or 'service')
- 変更データ (JSON形式)
- タイムスタンプ

## パフォーマンス最適化

### インデックス戦略

- 検索頻度の高いフィールドに個別インデックス
- 複合検索用の複合インデックス
- ソフトデリート考慮の部分インデックス

### 公開ビュー

```sql
v_companies_public     -- 企業一覧表示用
v_companies_with_details -- 企業詳細+関連データ
v_recruitments_public  -- 求人一覧表示用
v_internships_public   -- インターン一覧表示用
```

## 運用考慮事項

### 環境変数

- `SUPABASE_SERVICE_ROLE_KEY` - サーバーサイド操作用
- Auth0設定変数一式

### デプロイメント

- 本ファイルは新規DB向け完全スキーマ
- 既存環境では増分マイグレーション必要

### 監視ポイント

- Auth0同期エラー (`audit_logs`で確認)
- RLS設定状況
- インデックス使用率

## 今後の拡張予定

### Phase 2 機能

- 企業ユーザーアカウント (`company_users`テーブル)
- 管理者アカウント (`admin_users`テーブル)
- JWT統合による直接RLSアクセス

### 最適化

- 検索パフォーマンスの継続監視
- キャッシュ戦略の検討

---

実装日: 2025年9月2日
