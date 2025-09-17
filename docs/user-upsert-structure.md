
# ユーザー自動upsert機構のファイル構成・命名指針（2025/09時点 最新）

## 1. クライアント自動upsert（本番・通常運用）
- `hooks/use-user-auto-upsert.ts`
  - ログイン時に自動で `/api/user/profile` へupsertリクエストを送る副作用hook
  - グローバルレイアウト層（例: `app/layout.tsx`）で `useUserAutoUpsert()` を呼び出すことで、どのページでも自動upsertが保証される
  - UI表示は不要、hookのみ

## 2. 手動・バッチupsert（管理・検証・一括処理用）
- `scripts/manual-user-upsert.ts`
  - Node.jsスクリプトとして、accessToken取得→API POSTを自動化
  - 本体アプリとは分離し、バッチ・検証・一括処理用途で利用

## 3. ページ・レイアウト側の使い方
- `app/layout.tsx` で `import { useUserAutoUpsert } from "@/hooks/use-user-auto-upsert";` とし、
  `useUserAutoUpsert();` をコンポーネント内で呼び出す

---

- 本番・通常運用は「useUserAutoUpsert」hook＋グローバルレイアウト呼び出しで十分
- バッチ・検証用途は「manual-user-upsert」スクリプトで分離
- 命名・配置を明確に分けることで、責務と運用が整理されます
