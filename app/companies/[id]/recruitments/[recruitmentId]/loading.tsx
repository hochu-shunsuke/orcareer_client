import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { NavigationBar } from "@/components/navigation-bar"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="jobs" />
      
      <div className="container mx-auto px-4 py-8">
        {/* パンくずリストのスケルトン */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <span>/</span>
          <Skeleton className="h-4 w-32" />
          <span>/</span>
          <Skeleton className="h-4 w-24" />
        </div>

        {/* ヘッダーカードのスケルトン */}
        <Card className="mb-8">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
              <Skeleton className="w-56 h-56 flex-shrink-0 mx-auto md:mx-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full max-w-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full max-w-sm" />
                  <Skeleton className="h-4 w-full max-w-xs" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
                <div className="flex gap-3 mt-6">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* コンテンツのスケルトン */}
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
