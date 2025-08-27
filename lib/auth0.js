import { Auth0Client } from "@auth0/nextjs-auth0/server";

// 環境変数から明示的に設定を構築します。
const auth0Config = {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  appBaseUrl: process.env.APP_BASE_URL,
  secret: process.env.AUTH0_SECRET,
  authorizationParameters: {
    scope: process.env.AUTH0_SCOPE,
  // プレースホルダを送信しないよう、AUTH0_AUDIENCE が明示的に設定されている場合のみ audience を含めます
  ...(process.env.AUTH0_AUDIENCE ? { audience: process.env.AUTH0_AUDIENCE } : {}),
  },
};

// 必須の環境変数が不足している場合は早めに警告を出します。致命的ではありませんがデバッグに役立ちます。
if (!auth0Config.domain || !auth0Config.clientId || !auth0Config.clientSecret || !auth0Config.secret) {
  // eslint-disable-next-line no-console
  console.warn('[auth0] 必要な環境変数が不足しています: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET');
}

// Initialize the Auth0 client
export const auth0 = new Auth0Client(auth0Config);