import { NavigationBar } from "@/components/navigation-bar"
import { Footer } from "@/components/footer"

/**
 * シンプルなカードSkeleton（オレンジアニメーション）
 */
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="animate-pulse space-y-4">
        {/* ヘッダー部分 */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-orange-100 rounded-lg" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-orange-100 rounded w-3/4" />
            <div className="h-4 bg-orange-50 rounded w-1/2" />
          </div>
        </div>
        {/* コンテンツ部分 */}
        <div className="space-y-2">
          <div className="h-4 bg-orange-50 rounded w-full" />
          <div className="h-4 bg-orange-50 rounded w-5/6" />
        </div>
      </div>
    </div>
  )
}

/**
 * リストSkeleton（複数のカード）
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 詳細ページSkeleton
 */
export function DetailSkeleton() {
  return (
    <div className="bg-white rounded-lg p-8">
      <div className="animate-pulse space-y-6">
        {/* ヘッダー */}
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 bg-orange-100 rounded-lg" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-orange-100 rounded w-2/3" />
            <div className="h-5 bg-orange-50 rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-orange-50 rounded-full" />
              <div className="h-6 w-20 bg-orange-50 rounded-full" />
            </div>
          </div>
        </div>
        {/* セパレータ */}
        <div className="h-px bg-gray-200" />
        {/* コンテンツ */}
        <div className="space-y-4">
          <div className="h-6 bg-orange-100 rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-4 bg-orange-50 rounded w-full" />
            <div className="h-4 bg-orange-50 rounded w-full" />
            <div className="h-4 bg-orange-50 rounded w-4/5" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-orange-100 rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-4 bg-orange-50 rounded w-full" />
            <div className="h-4 bg-orange-50 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 完全なページレイアウトSkeleton（ヘッダー・フッター付き）
 */
export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
      <Footer />
    </div>
  )
}
