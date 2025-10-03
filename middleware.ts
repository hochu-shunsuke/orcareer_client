import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// NOTE: `lib/auth0` may throw at module import time if required env vars are
// missing (lib/auth0 currently throws in production when envs are absent).
// Import it lazily inside the middleware so that we can catch initialization
// errors and log them (prevents the middleware from failing the whole request
// with MIDDLEWARE_INVOCATION_FAILED). In production you should still ensure
// all required env vars are configured in Vercel.
export async function middleware(request: NextRequest) {
  try {
    const mod = await import("./lib/auth0");
    const { auth0 } = mod;
    return await auth0.middleware(request);
    } catch (err) {
      const errMsg = err && typeof err === 'object' && 'message' in err ? err.message : String(err);
      const errStack = err && typeof err === 'object' && 'stack' in err ? err.stack : undefined;
      
      // Logger利用可能時は構造化ログ、失敗時はconsole.errorでフォールバック
      try {
        const { logger } = await import("./lib/logger");
        logger.error('[middleware] failed to initialize auth0:', err as Error);
      } catch {
        console.error('[middleware] failed to initialize auth0:', errMsg, errStack ? `\n${errStack}` : '');
      }
      // 認証失敗でもサイトアクセス可能に保つ（デバッグ用）
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // /api/auth/access-token だけはmiddlewareを通す
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth/(?!access-token)).*)",
  ],
};