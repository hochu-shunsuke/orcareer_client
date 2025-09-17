import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from 'next/server';

// normalizeDomain: AUTH0_DOMAIN の値を正規化します。
// - protocol (http://, https://) を削除
// - 末尾のスラッシュを削除
// null/undefined はそのまま返します
function normalizeDomain(domain) {
  if (!domain) return domain
  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
}


import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const auth0Config = {
  domain: normalizeDomain(process.env.AUTH0_DOMAIN),
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  appBaseUrl: process.env.APP_BASE_URL,
  secret: process.env.AUTH0_SECRET,
  authorizationParameters: {
    scope: process.env.AUTH0_SCOPE || 'openid profile email',
    ...(process.env.AUTH0_AUDIENCE ? { audience: process.env.AUTH0_AUDIENCE } : {}),
  },
  session: {
    cookie: {
      secure: (process.env.VERCEL_ENV === 'production') || (process.env.NODE_ENV === 'production'),
      httpOnly: true,
      sameSite: process.env.AUTH0_SAMESITE || 'lax',
      path: '/',
    },
    ...(process.env.AUTH0_SESSION_MAX_AGE ? { maxAge: Number(process.env.AUTH0_SESSION_MAX_AGE) } : {}),
  },
  async onCallback(error, context, session) {
    const { NextResponse } = await import('next/server');
    if (error) {
      console.error('[auth0] onCallback error:', error);
      return NextResponse.redirect(
        new URL(`/error?error=${error.message}`, process.env.APP_BASE_URL)
      );
    }
    if (session?.user?.sub && session?.user?.email) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { error: upsertError } = await supabase
          .from('users')
          .upsert(
            {
              sub: session.user.sub,
              email: session.user.email,
              last_login_at: new Date().toISOString(),
            },
            { onConflict: 'sub' }
          );
        if (upsertError) {
          console.error('[auth0] Supabase upsert error:', upsertError);
        } else {
          console.log('[auth0] Supabase upsert success:', session.user.sub);
        }
      } catch (e) {
        console.error('[auth0] Supabase upsert exception:', e);
      }
    }
    return NextResponse.redirect(
      new URL(context.returnTo || '/', process.env.APP_BASE_URL)
    );
  }
}

// 必須 env の存在確認。開発環境では警告にとどめ、本番または CI ではプロセスを終了させます。
const missing = []
if (!auth0Config.domain) missing.push('AUTH0_DOMAIN')
if (!auth0Config.clientId) missing.push('AUTH0_CLIENT_ID')
if (!auth0Config.clientSecret) missing.push('AUTH0_CLIENT_SECRET')
if (!auth0Config.secret) missing.push('AUTH0_SECRET')

if (missing.length) {
  const msg = `[auth0] Missing required environment variables: ${missing.join(', ')}`
  // 開発中は警告で済ませる
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(msg)
  } else {
    // CI / production 環境では即時エラーにして意図しない起動を防ぐ
    // eslint-disable-next-line no-console
    console.error(msg)
    throw new Error(msg)
  }
}

// Auth0クライアントを初期化します。
// 初期化に失敗した場合（環境変数の不足など）、ミドルウェアがEdgeの呼び出し全体を
// クラッシュさせないように、安全なスタブ実装をエクスポートします。
// これにより、アプリは利用可能な状態を維持でき、Vercelでのデバッグ用に
// より明確なログを提供します。
let _auth0 = null;
try {
  _auth0 = new Auth0Client(auth0Config);
} catch (err) {
  // デバッグ用に、機密情報ではない有用な情報をログに出力します。
  const errMsg = err && typeof err === 'object' && 'message' in err ? err.message : String(err);
  // eslint-disable-next-line no-console
  console.error('[auth0] failed to initialize Auth0Client:', errMsg);
  // フォールバック用のスタブ実装です。ミドルウェアとサーバーコードで必要とされるメソッドを保持します。
  _auth0 = {
    // middleware.tsから呼び出されます: リクエストを継続させるために NextResponse.next() を返します。
    async middleware(_req) {
      // eslint-disable-next-line no-console
      console.error('[auth0] middleware stub invoked — Auth0 is not initialized');
      return NextResponse.next();
    },
    // getSessionはセッションがないことを示すためにnullを返す必要があります。
    async getSession() {
      return null;
    },
    // アプリで使用される他のAPIのための最小限のプレースホルダーです。
    withApiAuthRequired(fn) {
      return fn;
    },
  };
}

export const auth0 = _auth0;