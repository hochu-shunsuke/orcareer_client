# Auth0 + Supabase JWT統合 実装完了

## 🎉 実装内容

このブランチ（`ex/jwt`）では、Auth0とSupabaseをJWT統合し、ベストプラクティスに従った認証フローを実装しました。

## 📋 変更ファイル一覧

### 🔧 コア実装

1. **`lib/auth0.js`** - リファクタリング
   - `onCallback`を`auth0-upsert.ts`の関数を使用するように変更
   - `sub` vs `auth0_user_id`の不整合を解消

2. **`lib/supabase-server.ts`** - 拡張
   - `createAuthenticatedServerClient()` - JWT付きサーバークライアント追加

3. **`lib/supabase-client.ts`** - 拡張
   - `createAuthenticatedSupabaseClient()` - JWT付きクライアント作成関数
   - `getAuthenticatedSupabaseClient()` - 自動的にトークン取得してクライアント作成

4. **`lib/authenticated-actions.ts`** - 新規作成
   - 認証が必要な操作のサンプル実装（お気に入り、プロフィール、応募など）

### 📊 データベース

5. **`db/migrations/0002_auth0_jwt_integration.sql`** - 新規作成
   - `sub` → `auth0_user_id` へのカラム名変更
   - JWT検証用ヘルパー関数（`current_auth0_sub()`, `current_user_id()`）
   - RLSポリシーの有効化（ユーザーデータ、お気に入り、応募など）
   - 公開データへのアクセスポリシー

### 📚 ドキュメント

6. **`docs/auth0-supabase-best-practice.md`** - 大幅更新
   - Pattern B（JWT統合方式）への移行説明
   - 実装パターンとサンプルコード
   - セキュリティベストプラクティス
   - トラブルシューティング

7. **`docs/supabase-auth0-jwt-setup.md`** - 新規作成
   - Auth0とSupabaseの設定手順
   - 環境変数の設定方法
   - マイグレーション実行方法
   - 動作確認とテスト方法

## 🚀 セットアップ手順

### 1. 環境変数の設定

`.env.local`に以下を追加してください：

```bash
# 既存の設定に追加
AUTH0_AUDIENCE=https://api.orcareer.com  # ← 重要！これがないとJWT統合できません
```

### 2. Auth0の設定

詳細は[docs/supabase-auth0-jwt-setup.md](./docs/supabase-auth0-jwt-setup.md)を参照してください。

1. Auth0ダッシュボードで **Applications → APIs** からAPIを作成
2. Identifier（Audience）を`https://api.orcareer.com`に設定
3. Signing Algorithmを`RS256`に設定

### 3. Supabaseの設定

1. Supabaseダッシュボードで **Authentication → Providers → Custom**
2. JWKS URLを設定: `https://YOUR_AUTH0_DOMAIN/.well-known/jwks.json`

### 4. マイグレーションの実行

Supabase SQL Editorで以下を実行：

```sql
-- db/migrations/0002_auth0_jwt_integration.sql の内容をコピー＆実行
```

## 🎯 主な改善点

### Before（Pattern A）

```typescript
// ❌ 問題：subをそのまま送信、RLS未使用
const supabase = createClient(url, anonKey);
await supabase.from('users').insert({ sub: user.sub, email: user.email });
```

### After（Pattern B）

```typescript
// ✅ 改善：JWT検証、RLS適用
const supabase = await getAuthenticatedSupabaseClient();
await supabase.from('favorites').insert({ company_id: id });
// → RLSが自動的にuser_idをチェック、JWT署名を検証
```

## 🔒 セキュリティ向上

1. **JWT署名検証** - Auth0のJWKSで署名を検証、改ざん不可能
2. **RLS適用** - 行レベルセキュリティで自分のデータのみアクセス可能
3. **監査ログ** - すべての操作にユーザー情報が自動記録
4. **Service Role Key分離** - ログイン時のupsertのみ使用、通常操作では使用しない

## 📖 使用例

### 公開データの取得（認証不要）

```typescript
import { createSupabaseClient } from '@/lib/supabase-client';

const supabase = createSupabaseClient();
const { data } = await supabase.from('companies').select('*');
```

### 認証が必要な操作

```typescript
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-client';

const supabase = await getAuthenticatedSupabaseClient();

// お気に入り追加（RLSで自分のuser_idのみ設定可能）
await supabase.from('favorites').insert({ company_id: 'xxx' });

// 自分のお気に入り一覧（RLSで自分のデータのみ取得）
const { data } = await supabase.from('favorites').select('*');
```

または、サンプル関数を使用：

```typescript
import { addCompanyToFavorites, getUserFavoriteCompanies } from '@/lib/authenticated-actions';

// お気に入り追加
await addCompanyToFavorites('company-uuid');

// お気に入り一覧取得
const favorites = await getUserFavoriteCompanies();
```

## 🧪 動作確認

### ローカルでテスト

```bash
pnpm dev
```

ブラウザで:
1. http://localhost:3000 を開く
2. ログイン
3. ブラウザの開発者ツールでJWTを確認:

```javascript
fetch('/api/auth/access-token')
  .then(r => r.json())
  .then(data => console.log('JWT:', data.accessToken));
```

### RLSのテスト

Supabase SQL Editorで:

```sql
-- JWT claimsからsubを取得（認証状態で実行）
SELECT current_auth0_sub();

-- 自分のユーザーIDを取得
SELECT current_user_id();

-- 自分のユーザー情報を取得
SELECT * FROM users WHERE auth0_user_id = current_auth0_sub();
```

## ⚠️ 注意事項

### マイグレーション前の確認

1. **バックアップ**: 本番環境で実行する前に必ずバックアップを取ってください
2. **ダウンタイム**: カラム名変更により一時的にダウンタイムが発生する可能性があります
3. **既存データ**: `sub`カラムのデータは`auth0_user_id`に移行されます

### 既存コードの影響

- `sub`カラムを直接参照しているコードは動作しなくなります
- `auth0_user_id`に変更する必要があります
- マイグレーションが自動的にカラム名を変更します

## 🔄 ロールバック手順

問題が発生した場合：

```sql
-- カラム名を戻す
ALTER TABLE users RENAME COLUMN auth0_user_id TO sub;
ALTER INDEX idx_users_auth0_user_id RENAME TO idx_users_sub;

-- RLSポリシーを無効化
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
-- （他のテーブルも同様）
```

## 📚 関連ドキュメント

- [ベストプラクティス](./docs/auth0-supabase-best-practice.md)
- [セットアップガイド](./docs/supabase-auth0-jwt-setup.md)
- [データベース実装](./docs/database-implementation.md)

## 🤝 コントリビューション

質問や問題がある場合は、Issueを作成するか、チームに連絡してください。

## 📝 次のステップ

1. ✅ Auth0でAPIを作成し、AUDIENCEを設定
2. ✅ SupabaseでJWKS URLを設定
3. ✅ マイグレーションを実行
4. ✅ 動作確認（ログイン→JWT取得→RLSテスト）
5. 🔜 本番環境へのデプロイ

---

実装日: 2025年10月2日
Branch: ex/jwt
