# 最優先対応事項のベストプラクティス提案

**作成日**: 2025年10月2日  
**対象**: Auth0 × Supabase 認証実装の重大な問題に対する修正案  
**優先度**: 🔴 Critical

---

## 📋 目次

1. [Critical #1: Upsert失敗時のセッション確立を防止](#critical-1-upsert失敗時のセッション確立を防止)
2. [Critical #2: Middleware初期化失敗時の認証バイパスを防止](#critical-2-middleware初期化失敗時の認証バイパスを防止)
3. [High #3: JWT取得エンドポイントのセキュリティ強化](#high-3-jwt取得エンドポイントのセキュリティ強化)
4. [実装順序と影響範囲](#実装順序と影響範囲)
5. [テスト計画](#テスト計画)
6. [ロールバック計画](#ロールバック計画)

---

## 🔴 Critical #1: Upsert失敗時のセッション確立を防止

### 問題の詳細

**現在の実装**:
```javascript
// lib/auth0.js - onCallback
if (session?.user?.sub && session?.user?.email) {
  try {
    const { upsertUserToSupabase } = await import('./auth0-upsert');
    await upsertUserToSupabase(/* ... */);
  } catch (e) {
    console.error('[auth0] Failed to upsert user to Supabase:', e);
    // ⚠️ エラーでもセッション継続 → データ不整合
  }
}
return NextResponse.redirect(new URL(context.returnTo || '/', process.env.APP_BASE_URL));
```

**問題点**:
- Auth0ログイン成功 → Supabase upsert失敗 → セッション確立
- ユーザーはログインできるが、アプリ内で認証エラーが発生
- データベース接続エラー、制約違反などを検知できない

**影響範囲**:
- ユーザーエクスペリエンス低下（ログイン後にエラー表示）
- データ整合性の喪失
- デバッグが困難（ログインは成功したように見える）

---

### ベストプラクティス提案

#### Option A: リトライ付きエラーハンドリング（推奨⭐）

**設計方針**:
- Upsert失敗時は一定回数リトライ
- リトライ後も失敗した場合はエラーページにリダイレクト
- リトライ成功時のみセッション確立

**実装コード**:

```javascript
// lib/auth0.js

/**
 * リトライ付きでSupabaseにユーザーをupsert
 * @param {function} fn - 実行する非同期関数
 * @param {number} maxRetries - 最大リトライ回数
 * @param {number} delay - リトライ間隔（ミリ秒）
 */
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`[auth0] Attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error; // 最後のリトライでも失敗したら例外をスロー
      }
      
      // エクスポネンシャルバックオフ（指数関数的に待機時間を増やす）
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

const auth0Config = {
  // ... 既存の設定 ...
  
  async onCallback(error, context, session) {
    const { NextResponse } = await import('next/server');
    
    // Auth0認証エラー
    if (error) {
      console.error('[auth0] onCallback error:', error);
      return NextResponse.redirect(
        new URL(`/error?error=${encodeURIComponent(error.message)}`, process.env.APP_BASE_URL)
      );
    }
    
    // ユーザー情報の検証
    if (!session?.user?.sub || !session?.user?.email) {
      console.error('[auth0] Missing required user data in session');
      return NextResponse.redirect(
        new URL('/error?error=invalid_user_data', process.env.APP_BASE_URL)
      );
    }
    
    // Supabaseへのupsert（リトライ付き）
    try {
      const { upsertUserToSupabase } = await import('./auth0-upsert');
      
      await retryWithBackoff(
        () => upsertUserToSupabase(
          session.user.sub,
          session.user.email,
          session.user.name,
          session.user.picture
        ),
        3,  // 最大3回リトライ
        1000  // 初回1秒待機
      );
      
      console.log('[auth0] User successfully synced to Supabase:', session.user.sub);
      
      // ✅ Upsert成功時のみセッション確立してリダイレクト
      return NextResponse.redirect(
        new URL(context.returnTo || '/', process.env.APP_BASE_URL)
      );
      
    } catch (e) {
      // ⚠️ リトライ後も失敗した場合はエラーページへ
      console.error('[auth0] Failed to sync user to Supabase after retries:', {
        sub: session.user.sub,
        email: session.user.email,
        error: e,
        timestamp: new Date().toISOString(),
      });
      
      // TODO: 外部監視サービスに通知（Sentry, CloudWatch等）
      // await notifyError('auth0_sync_failed', { sub: session.user.sub, error: e });
      
      // エラーページにリダイレクト（セッションは確立しない）
      return NextResponse.redirect(
        new URL(
          '/error?error=database_sync_failed&retry=true', 
          process.env.APP_BASE_URL
        )
      );
    }
  }
};
```

**エラーページの実装例**:

```tsx
// app/error/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const retry = searchParams.get('retry');

  const errorMessages: Record<string, string> = {
    database_sync_failed: 'データベースの同期に失敗しました。もう一度ログインしてください。',
    invalid_user_data: 'ユーザー情報が不正です。',
    auth_unavailable: '認証サービスが利用できません。',
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="text-2xl font-bold">ログインエラー</h1>
        <p className="text-gray-600">
          {errorMessages[error || ''] || '予期しないエラーが発生しました。'}
        </p>
        
        {retry === 'true' && (
          <div className="space-y-2">
            <Button asChild className="w-full">
              <a href="/api/auth/login">再度ログインする</a>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/">ホームに戻る</a>
            </Button>
          </div>
        )}
        
        <p className="text-sm text-gray-500">
          問題が解決しない場合は、サポートまでお問い合わせください。
        </p>
      </div>
    </div>
  );
}
```

**メリット**:
- ✅ 一時的なネットワークエラーやDB接続エラーに対応
- ✅ ユーザーにわかりやすいエラーメッセージを表示
- ✅ データ整合性を保証
- ✅ デバッグが容易（ログが詳細）

**デメリット**:
- ⚠️ ログイン時間が最大で数秒延長される可能性
- ⚠️ リトライロジックの複雑性

---

#### Option B: キュー方式（非同期処理）

**設計方針**:
- Upsertを非同期キューに投入
- セッションは即座に確立
- バックグラウンドでupsert実行
- 失敗時は次回ログイン時に再試行

**実装コード**:

```javascript
// lib/auth0.js
async onCallback(error, context, session) {
  const { NextResponse } = await import('next/server');
  
  if (error) {
    console.error('[auth0] onCallback error:', error);
    return NextResponse.redirect(
      new URL(`/error?error=${error.message}`, process.env.APP_BASE_URL)
    );
  }
  
  // ユーザー情報をキューに投入（非同期）
  if (session?.user?.sub && session?.user?.email) {
    // キューに投入（失敗しても継続）
    import('./auth0-upsert')
      .then(({ upsertUserToSupabase }) => 
        upsertUserToSupabase(
          session.user.sub,
          session.user.email,
          session.user.name,
          session.user.picture
        )
      )
      .then(() => {
        console.log('[auth0] User queued for sync:', session.user.sub);
      })
      .catch((e) => {
        console.error('[auth0] Failed to queue user sync:', e);
        // TODO: キューサービス（Redis, AWS SQS等）にリトライ登録
      });
  }
  
  // ✅ 即座にセッション確立
  return NextResponse.redirect(
    new URL(context.returnTo || '/', process.env.APP_BASE_URL)
  );
}
```

**メリット**:
- ✅ ログイン速度が速い（ブロッキングなし）
- ✅ バックグラウンドでリトライ可能

**デメリット**:
- ⚠️ データ不整合の可能性が残る
- ⚠️ キューインフラが必要（Redis, AWS SQS等）
- ⚠️ 複雑性が増す

**推奨**: Option A（リトライ付きエラーハンドリング）

---

#### Option C: Middleware レベルでの検証

**設計方針**:
- onCallbackでは最小限の処理
- Middlewareで毎回Supabaseにユーザーが存在するか確認
- 存在しない場合は再度upsert試行

**実装コード**:

```typescript
// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const mod = await import("./lib/auth0");
    const { auth0 } = mod;
    
    // Auth0認証チェック
    const response = await auth0.middleware(request);
    
    // 認証が必要なパスの場合、Supabaseとの同期を確認
    if (isProtectedPath(request.nextUrl.pathname)) {
      const session = await auth0.getSession();
      
      if (session?.user?.sub) {
        const { verifyUserExistsInSupabase } = await import("./lib/auth0-upsert");
        const exists = await verifyUserExistsInSupabase(session.user.sub);
        
        if (!exists) {
          console.warn('[middleware] User not found in Supabase, redirecting to sync');
          return NextResponse.redirect(new URL('/api/auth/sync', request.url));
        }
      }
    }
    
    return response;
  } catch (err: unknown) {
    const errMsg = err && typeof err === 'object' && 'message' in err ? (err as any).message : String(err);
    console.error('[middleware] failed to initialize auth0:', errMsg);
    
    // ⚠️ エラー時は認証ページにリダイレクト
    return NextResponse.redirect(new URL('/error?error=auth_unavailable', request.url));
  }
}

function isProtectedPath(pathname: string): boolean {
  const protectedPaths = ['/user', '/favorites', '/applications'];
  return protectedPaths.some(path => pathname.startsWith(path));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth/(?!access-token|sync)).*)",
  ],
};
```

**メリット**:
- ✅ すべてのリクエストで整合性を保証
- ✅ onCallbackの複雑性を軽減

**デメリット**:
- ⚠️ すべてのリクエストでDB確認 → パフォーマンス低下
- ⚠️ Middlewareが重くなる

**推奨**: Option Aと組み合わせて部分的に採用

---

## 🔴 Critical #2: Middleware初期化失敗時の認証バイパスを防止

### 問題の詳細

**現在の実装**:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  try {
    const mod = await import("./lib/auth0");
    const { auth0 } = mod;
    return await auth0.middleware(request);
  } catch (err: unknown) {
    console.error('[middleware] failed to initialize auth0:', err);
    return NextResponse.next();  // ⚠️ エラー時も継続 → 認証バイパス
  }
}
```

**問題点**:
- Auth0初期化失敗時、すべてのリクエストが認証なしで通過
- 環境変数未設定、ネットワークエラー時に保護されたページにアクセス可能
- セキュリティホール

---

### ベストプラクティス提案

#### Option A: フェイルセーフ実装（推奨⭐）

**設計方針**:
- 初期化失敗時は安全側に倒す（Fail-Safe）
- 保護されたパスへのアクセスは拒否
- 公開パス（/, /companies, /jobs等）のみ許可

**実装コード**:

```typescript
// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * 公開パスのリスト（認証不要）
 */
const PUBLIC_PATHS = [
  '/',
  '/companies',
  '/internships',
  '/jobs',
  '/about',
  '/contact',
  '/error',
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
];

/**
 * パスが公開パスか判定
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  });
}

/**
 * 静的アセットか判定
 */
function isStaticAsset(pathname: string): boolean {
  return pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|json|xml|txt)$/i) !== null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 静的アセットは認証チェックをスキップ
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }
  
  // 公開パスは認証チェックをスキップ
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Auth0初期化と認証チェック
  try {
    const mod = await import("./lib/auth0");
    const { auth0 } = mod;
    
    const response = await auth0.middleware(request);
    
    // 認証成功時のロギング（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('[middleware] Auth check passed for:', pathname);
    }
    
    return response;
    
  } catch (err: unknown) {
    const errMsg = err && typeof err === 'object' && 'message' in err 
      ? (err as any).message 
      : String(err);
    
    // 構造化ログでエラー記録
    console.error('[middleware] Auth0 initialization failed:', {
      error: errMsg,
      pathname,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    });
    
    // TODO: 外部監視サービスに通知（Sentry, CloudWatch等）
    // await notifyError('middleware_auth_failure', { pathname, error: errMsg });
    
    // ✅ Fail-Safe: 認証失敗時は保護されたパスへのアクセスを拒否
    const errorUrl = new URL('/error', request.url);
    errorUrl.searchParams.set('error', 'auth_unavailable');
    errorUrl.searchParams.set('from', pathname);
    
    return NextResponse.redirect(errorUrl);
  }
}

export const config = {
  matcher: [
    // Next.jsの内部パス以外すべてマッチ
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

**エラーページの拡張**:

```tsx
// app/error/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');
  const fromPath = searchParams.get('from');
  const [countdown, setCountdown] = useState(5);

  const errorMessages: Record<string, { title: string; message: string; actions: string[] }> = {
    auth_unavailable: {
      title: '認証サービスが利用できません',
      message: 'システムの認証サービスに接続できません。しばらく経ってから再度お試しください。',
      actions: ['retry', 'home'],
    },
    database_sync_failed: {
      title: 'データベース同期エラー',
      message: 'ユーザー情報の同期に失敗しました。もう一度ログインしてください。',
      actions: ['login', 'home'],
    },
    invalid_user_data: {
      title: 'ユーザー情報エラー',
      message: 'ユーザー情報が不正です。再度ログインしてください。',
      actions: ['login', 'home'],
    },
  };

  const errorInfo = errorMessages[error || ''] || {
    title: '予期しないエラー',
    message: '予期しないエラーが発生しました。',
    actions: ['home'],
  };

  // auth_unavailable の場合は自動リトライカウントダウン
  useEffect(() => {
    if (error === 'auth_unavailable' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (error === 'auth_unavailable' && countdown === 0) {
      router.push(fromPath || '/');
    }
  }, [countdown, error, fromPath, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">{errorInfo.title}</h1>
          <p className="text-gray-600">{errorInfo.message}</p>
        </div>

        {error === 'auth_unavailable' && countdown > 0 && (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {countdown}秒後に自動的に再試行します...
            </p>
          </div>
        )}

        <div className="space-y-2">
          {errorInfo.actions.includes('retry') && (
            <Button 
              onClick={() => router.push(fromPath || '/')} 
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              再試行
            </Button>
          )}
          
          {errorInfo.actions.includes('login') && (
            <Button asChild className="w-full">
              <a href="/api/auth/login">
                <RefreshCw className="mr-2 h-4 w-4" />
                再度ログイン
              </a>
            </Button>
          )}
          
          {errorInfo.actions.includes('home') && (
            <Button 
              variant="outline" 
              onClick={() => router.push('/')} 
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Button>
          )}
        </div>

        {fromPath && (
          <div className="text-sm text-gray-500 text-center">
            アクセスしようとしたページ: <code className="bg-gray-100 px-2 py-1 rounded">{fromPath}</code>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          問題が解決しない場合は、<a href="/contact" className="text-blue-600 hover:underline">サポート</a>までお問い合わせください。
        </p>
      </div>
    </div>
  );
}
```

**メリット**:
- ✅ セキュリティが最優先（Fail-Safe設計）
- ✅ 公開パスは正常動作（SEO、マーケティングページに影響なし）
- ✅ ユーザーにわかりやすいエラー表示と自動リトライ

**デメリット**:
- ⚠️ Auth0障害時、保護されたページが一切アクセス不可

**推奨**: Option A（フェイルセーフ実装）

---

#### Option B: ヘルスチェック機能

**設計方針**:
- 起動時にAuth0接続をヘルスチェック
- 失敗時はアプリケーション起動を停止
- KubernetesのlivenessProbe/readinessProbeに対応

**実装コード**:

```typescript
// lib/auth0-health-check.ts
import { auth0 } from './auth0';

export async function checkAuth0Health(): Promise<boolean> {
  try {
    // Auth0クライアントが正しく初期化されているか確認
    if (!auth0) {
      console.error('[health-check] Auth0 client not initialized');
      return false;
    }
    
    // 簡易的な接続確認（セッション取得を試みる）
    // ※ これはサーバー起動時に実行され、リクエストコンテキストがないため
    // 実際にはAuth0の設定が正しいかのみを確認
    const config = process.env.AUTH0_DOMAIN && 
                   process.env.AUTH0_CLIENT_ID && 
                   process.env.AUTH0_CLIENT_SECRET &&
                   process.env.AUTH0_SECRET;
    
    if (!config) {
      console.error('[health-check] Missing Auth0 configuration');
      return false;
    }
    
    console.log('[health-check] Auth0 configuration validated');
    return true;
    
  } catch (error) {
    console.error('[health-check] Auth0 health check failed:', error);
    return false;
  }
}

// Next.js起動時に実行
if (process.env.NODE_ENV !== 'test') {
  checkAuth0Health().then(isHealthy => {
    if (!isHealthy && process.env.NODE_ENV === 'production') {
      console.error('[health-check] Auth0 is not healthy, exiting process');
      process.exit(1);  // プロダクション環境では起動を中断
    }
  });
}
```

**Kubernetes設定例**:

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orcareer-client
spec:
  template:
    spec:
      containers:
      - name: app
        image: orcareer-client:latest
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { checkAuth0Health } from '@/lib/auth0-health-check';

export async function GET() {
  const isHealthy = await checkAuth0Health();
  
  if (isHealthy) {
    return NextResponse.json({ status: 'ok', auth0: 'connected' }, { status: 200 });
  } else {
    return NextResponse.json({ status: 'error', auth0: 'disconnected' }, { status: 503 });
  }
}
```

**メリット**:
- ✅ 問題のある状態でアプリが起動しない
- ✅ Kubernetes環境で自動復旧

**デメリット**:
- ⚠️ デプロイが複雑化

---

## 🟡 High #3: JWT取得エンドポイントのセキュリティ強化

### 問題の詳細

**現在の実装**:
```typescript
// app/api/auth/access-token/route.ts
export async function GET(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  const accessToken = session.accessToken || session.tokenSet?.accessToken;
  
  if (!accessToken) {
    // ⚠️ セッション情報を400エラーで返却 → 機密情報漏洩
    return new Response(
      JSON.stringify({ error: 'No accessToken in session', session }), 
      { status: 400 }
    );
  }
  
  return new Response(JSON.stringify({ accessToken }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

**問題点**:
1. セッション情報を400エラーで返却 → 機密情報漏洩リスク
2. レート制限なし → DoS攻撃、トークン窃取の可能性
3. トークンの有効期限チェックなし
4. CSRF対策なし

---

### ベストプラクティス提案

#### 完全版セキュリティ強化実装（推奨⭐）

**実装コード**:

```typescript
// app/api/auth/access-token/route.ts
import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * レート制限用のシンプルなメモリストア
 * 本番環境ではRedis等を使用すること
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * レート制限チェック
 * @param identifier - IPアドレスまたはユーザーID
 * @param maxRequests - 最大リクエスト数
 * @param windowMs - 時間窓（ミリ秒）
 */
function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  // レコードが存在しない、または期限切れ
  if (!record || record.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }
  
  // リクエスト数が上限を超えている
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  // カウントをインクリメント
  record.count++;
  rateLimitStore.set(identifier, record);
  
  return { 
    allowed: true, 
    remaining: maxRequests - record.count, 
    resetAt: record.resetAt 
  };
}

/**
 * クライアントのIPアドレスを取得
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  return ip;
}

/**
 * JWTの有効期限をチェック
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    
    if (!payload.exp) {
      return false; // expがない場合は期限なし
    }
    
    const expiresAt = payload.exp * 1000; // 秒 → ミリ秒
    return Date.now() >= expiresAt;
    
  } catch (error) {
    console.error('[access-token] Failed to parse token:', error);
    return true; // パースエラーの場合は期限切れとみなす
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // セッションチェック
    const session = await auth0.getSession();
    
    if (!session) {
      console.warn('[access-token] No session found', {
        timestamp: new Date().toISOString(),
        ip: getClientIp(request),
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // レート制限チェック（ユーザーIDベース）
    const identifier = session.user?.sub || getClientIp(request);
    const rateLimit = checkRateLimit(identifier, 10, 60000); // 1分間に10リクエストまで
    
    if (!rateLimit.allowed) {
      console.warn('[access-token] Rate limit exceeded', {
        identifier,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { 
          error: 'Too many requests',
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    // アクセストークン取得
    const accessToken = session.accessToken || session.tokenSet?.accessToken;
    
    if (!accessToken) {
      console.error('[access-token] No accessToken in session', {
        sub: session.user?.sub,
        timestamp: new Date().toISOString(),
        // ⚠️ セッション情報は記録しない（機密情報保護）
      });
      
      // ⚠️ 詳細情報を返却しない
      return NextResponse.json(
        { error: 'Access token not available' }, 
        { status: 500 }
      );
    }
    
    // トークンの有効期限チェック
    if (isTokenExpired(accessToken)) {
      console.warn('[access-token] Token expired', {
        sub: session.user?.sub,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { error: 'Token expired' }, 
        { status: 401 }
      );
    }
    
    // 成功ログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('[access-token] Token issued', {
        sub: session.user?.sub,
        duration: Date.now() - startTime,
      });
    }
    
    // トークン返却
    return NextResponse.json(
      { accessToken },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetAt.toString(),
        },
      }
    );
    
  } catch (error) {
    console.error('[access-token] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// OPTIONS リクエスト対応（CORS preflight）
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'GET, OPTIONS',
      },
    }
  );
}
```

**Redisを使用したレート制限実装（本番環境推奨）**:

```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimitRedis(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const resetAt = now + windowMs;
  
  try {
    // Redis にカウンターを保存（TTL付き）
    const count = await redis.incr(key);
    
    if (count === 1) {
      // 新規キーの場合、TTLを設定
      await redis.pexpire(key, windowMs);
    }
    
    if (count > maxRequests) {
      const ttl = await redis.pttl(key);
      return { 
        allowed: false, 
        remaining: 0, 
        resetAt: now + (ttl > 0 ? ttl : windowMs) 
      };
    }
    
    return { 
      allowed: true, 
      remaining: maxRequests - count, 
      resetAt 
    };
    
  } catch (error) {
    console.error('[rate-limit] Redis error:', error);
    // Redisエラー時はレート制限をバイパス（可用性優先）
    return { allowed: true, remaining: maxRequests, resetAt };
  }
}
```

**メリット**:
- ✅ 機密情報漏洩を防止
- ✅ DoS攻撃対策（レート制限）
- ✅ トークン有効期限チェック
- ✅ 詳細なロギングとモニタリング
- ✅ Cache-Control ヘッダーでキャッシュ防止

**デメリット**:
- ⚠️ 実装が複雑化
- ⚠️ Redis等の外部サービスが必要（本番環境）

---

## 📋 実装順序と影響範囲

### 推奨実装順序

1. **Phase 1: Critical #2（Middleware修正）** - 最優先
   - 影響範囲: 全ページ
   - 所要時間: 2-3時間
   - リスク: 低（公開パスは影響なし）

2. **Phase 2: High #3（JWT エンドポイント）** - 次優先
   - 影響範囲: 認証が必要な機能のみ
   - 所要時間: 3-4時間
   - リスク: 中（レート制限によるUX影響の可能性）

3. **Phase 3: Critical #1（Upsert修正）** - 最後
   - 影響範囲: ログインフロー
   - 所要時間: 4-6時間
   - リスク: 高（ログイン時間延長の可能性）

### 影響範囲マトリクス

| 修正項目 | ユーザー影響 | 開発者影響 | インフラ影響 |
|---------|------------|-----------|------------|
| Middleware修正 | 低（エラーページ表示のみ） | 中（テスト必要） | なし |
| JWT エンドポイント | 中（レート制限） | 低 | 中（Redis導入推奨） |
| Upsert修正 | 高（ログイン時間） | 高（エラーハンドリング） | なし |

---

## 🧪 テスト計画

### Unit Tests

```typescript
// __tests__/auth0-upsert.test.ts
import { upsertUserToSupabase } from '@/lib/auth0-upsert';
import { createServerSupabaseClient } from '@/lib/supabase-server';

jest.mock('@/lib/supabase-server');

describe('upsertUserToSupabase with retry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    await expect(
      upsertUserToSupabase('auth0|123', 'test@example.com', 'Test User', 'https://avatar.url')
    ).resolves.not.toThrow();
  });

  it('should retry on failure', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn()
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockResolvedValueOnce({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    await expect(
      upsertUserToSupabase('auth0|123', 'test@example.com')
    ).resolves.not.toThrow();

    expect(mockSupabase.maybeSingle).toHaveBeenCalledTimes(2);
  });

  it('should throw after max retries', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockRejectedValue(new Error('Connection timeout')),
    };

    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    await expect(
      upsertUserToSupabase('auth0|123', 'test@example.com')
    ).rejects.toThrow('Connection timeout');

    expect(mockSupabase.maybeSingle).toHaveBeenCalledTimes(3); // 3回試行
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/auth-flow.test.ts
import { testApiHandler } from 'next-test-api-route-handler';
import * as accessTokenHandler from '@/app/api/auth/access-token/route';

describe('POST /api/auth/access-token', () => {
  it('should return 401 when not authenticated', async () => {
    await testApiHandler({
      handler: accessTokenHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(401);
      },
    });
  });

  it('should return 429 when rate limit exceeded', async () => {
    // テスト実装
  });
});
```

### E2E Tests

```typescript
// e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test('should redirect to error page on auth failure', async ({ page }) => {
  // Auth0のモックを設定してエラーを発生させる
  await page.route('**/api/auth/callback', route => route.abort());

  await page.goto('/api/auth/login');
  
  // エラーページにリダイレクトされることを確認
  await expect(page).toHaveURL(/\/error/);
  await expect(page.locator('h1')).toContainText('認証サービスが利用できません');
});

test('should show retry countdown on auth_unavailable error', async ({ page }) => {
  await page.goto('/error?error=auth_unavailable&from=/user');
  
  // カウントダウンが表示されることを確認
  await expect(page.locator('text=/秒後に自動的に再試行します/')).toBeVisible();
});
```

---

## 🔄 ロールバック計画

### 各修正のロールバック手順

#### Phase 1: Middleware修正のロールバック

```bash
# Git で元のmiddleware.tsに戻す
git checkout HEAD~1 -- middleware.ts

# または特定のコミットに戻す
git revert <commit-hash>

# デプロイ
npm run build
npm run deploy
```

#### Phase 2: JWT エンドポイント修正のロールバック

```bash
# app/api/auth/access-token/route.ts を元に戻す
git checkout HEAD~1 -- app/api/auth/access-token/route.ts

# Redis関連の環境変数を削除（必要に応じて）
# UPSTASH_REDIS_REST_URL
# UPSTASH_REDIS_REST_TOKEN

npm run build
npm run deploy
```

#### Phase 3: Upsert修正のロールバック

```bash
# lib/auth0.js と lib/auth0-upsert.ts を元に戻す
git checkout HEAD~1 -- lib/auth0.js lib/auth0-upsert.ts

npm run build
npm run deploy
```

### ロールバック判断基準

| メトリクス | 閾値 | アクション |
|----------|------|----------|
| ログインエラー率 | > 5% | 即座にロールバック |
| レート制限超過率 | > 20% | レート制限緩和 or ロールバック |
| ページ応答時間 | > 3秒 | パフォーマンス調査、必要に応じてロールバック |
| エラーページ訪問数 | 急増 | 原因調査、ロールバック検討 |

---

## 📊 モニタリング推奨項目

### ダッシュボードメトリクス

```yaml
metrics:
  - name: auth_login_success_rate
    type: gauge
    description: ログイン成功率
    alert_threshold: < 95%
    
  - name: auth_upsert_retry_count
    type: counter
    description: Upsertリトライ回数
    alert_threshold: > 100/hour
    
  - name: auth_middleware_error_count
    type: counter
    description: Middleware初期化エラー回数
    alert_threshold: > 0
    
  - name: jwt_endpoint_rate_limit_exceeded
    type: counter
    description: レート制限超過回数
    alert_threshold: > 500/hour
    
  - name: auth_error_page_views
    type: counter
    description: エラーページ表示回数
    alert_threshold: > 100/hour
```

---

## ✅ チェックリスト

### 実装前

- [ ] 環境変数の確認（AUTH0_*, SUPABASE_*）
- [ ] Redisインフラの準備（本番環境）
- [ ] エラーページの動作確認
- [ ] テストの作成

### 実装中

- [ ] Phase 1: Middleware修正
  - [ ] コード修正
  - [ ] ユニットテスト
  - [ ] 統合テスト
  - [ ] ステージング環境でテスト

- [ ] Phase 2: JWT エンドポイント修正
  - [ ] コード修正
  - [ ] レート制限テスト
  - [ ] ステージング環境でテスト

- [ ] Phase 3: Upsert修正
  - [ ] コード修正
  - [ ] リトライロジックテスト
  - [ ] エラーハンドリングテスト
  - [ ] ステージング環境でテスト

### 実装後

- [ ] 本番環境デプロイ
- [ ] モニタリングダッシュボード確認
- [ ] エラー率監視（24時間）
- [ ] ユーザーフィードバック収集
- [ ] ドキュメント更新

---

## 🎓 まとめ

この提案では、3つの最優先事項に対して以下のベストプラクティスを提案しました：

1. **Critical #1: Upsert失敗時の対策**
   - ✅ リトライロジック（エクスポネンシャルバックオフ）
   - ✅ エラーページへのリダイレクト
   - ✅ 詳細なロギング

2. **Critical #2: Middleware初期化失敗対策**
   - ✅ Fail-Safe設計（公開パスは許可、保護パスは拒否）
   - ✅ 自動リトライ機能付きエラーページ
   - ✅ ヘルスチェック機能

3. **High #3: JWT エンドポイントのセキュリティ強化**
   - ✅ レート制限（Redis推奨）
   - ✅ 機密情報漏洩防止
   - ✅ トークン有効期限チェック
   - ✅ 詳細なロギング

すべての修正は段階的に実装可能で、ロールバック計画も明確です。
