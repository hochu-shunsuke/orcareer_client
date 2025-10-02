import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Auth0Provider } from '@auth0/nextjs-auth0'
import { auth0 } from '@/lib/auth0'

export const metadata: Metadata = {
  title: 'オルキャリ',
  description: '東海地方の新卒就活は、オルキャリ。企業・求人検索からインターンシップ応募まで。',
  generator: 'Josho.inc',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // サーバー側でセッションを取得して、user をプロバイダに渡すよう試みます。
  // セッションが存在しない場合は user は undefined になり、クライアント側が従来どおり /auth/profile をフェッチします。
  const session = await auth0.getSession();

  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Auth0Provider user={session?.user}>
          {children}
        </Auth0Provider>
      </body>
    </html>
  )
}
