/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // 画像最適化を有効化（パフォーマンス向上）
    unoptimized: false,
    // 外部画像ドメインを許可（企業ロゴなど）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    // 画像キャッシュ設定
    minimumCacheTTL: 3600, // 1時間
  },
  // ISR用の実験的機能を有効化
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
}

export default nextConfig
