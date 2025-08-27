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
  } catch (err: unknown) {
    // Log error for Vercel logs so we can inspect cause of middleware failure.
    // Avoid printing secrets — print only message/stack if available.
    const errMsg = err && typeof err === 'object' && 'message' in err ? (err as any).message : String(err);
    const errStack = err && typeof err === 'object' && 'stack' in err ? (err as any).stack : undefined;
    // eslint-disable-next-line no-console
    console.error('[middleware] failed to initialize auth0:', errMsg, errStack ? `\n${errStack}` : '');
    // Allow request to continue instead of returning a generic 500 so the site
    // stays reachable while debugging. This means protected routes may not
    // enforce auth until the root cause is fixed.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
  // Next.js の内部アセットおよび Auth0 の API ルートをミドルウェアの対象から除外します
  "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth).*)",
  ],
};