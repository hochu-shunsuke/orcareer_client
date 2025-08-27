import { Auth0Client } from "@auth0/nextjs-auth0/server";

// normalizeDomain: AUTH0_DOMAIN の値を正規化します。
// - protocol (http://, https://) を削除
// - 末尾のスラッシュを削除
// null/undefined はそのまま返します
function normalizeDomain(domain) {
  if (!domain) return domain
  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

const auth0Config = {
  domain: normalizeDomain(process.env.AUTH0_DOMAIN),
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  appBaseUrl: process.env.APP_BASE_URL,
  secret: process.env.AUTH0_SECRET,
  authorizationParameters: {
    scope: process.env.AUTH0_SCOPE || 'openid profile email',
    // プレースホルダを送信しないよう、AUTH0_AUDIENCE が明示的に設定されている場合のみ audience を含めます
    ...(process.env.AUTH0_AUDIENCE ? { audience: process.env.AUTH0_AUDIENCE } : {}),
  },
  // cookie / session の挙動（Vercel を想定）。本番では secure/httpOnly を有効にします。
  session: {
    cookie: {
      // Vercel の production または NODE_ENV===production のとき secure を有効にする
      secure: (process.env.VERCEL_ENV === 'production') || (process.env.NODE_ENV === 'production'),
      httpOnly: true,
      sameSite: process.env.AUTH0_SAMESITE || 'lax',
      path: '/',
      // domain を明示する必要があれば環境変数で指定可能
      // domain: process.env.COOKIE_DOMAIN || undefined,
    },
    // maxAge は Auth0 側で管理することを想定。指定がある場合のみ数値を使用する。
    ...(process.env.AUTH0_SESSION_MAX_AGE ? { maxAge: Number(process.env.AUTH0_SESSION_MAX_AGE) } : {}),
  },
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

// Initialize the Auth0 client
export const auth0 = new Auth0Client(auth0Config)