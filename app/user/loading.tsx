import { PageSkeleton } from "@/components/loading-skeleton"

export default function Loading() {
  return (
    <PageSkeleton>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-8 animate-pulse space-y-4">
            <div className="w-24 h-24 bg-orange-100 rounded-full mx-auto" />
            <div className="h-6 bg-orange-100 rounded w-2/3 mx-auto" />
            <div className="h-4 bg-orange-50 rounded w-1/2 mx-auto" />
          </div>
        </div>
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 animate-pulse space-y-6">
            <div className="h-8 bg-orange-100 rounded w-1/3" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="h-6 bg-orange-50 rounded w-3/4" />
                  <div className="h-4 bg-orange-50 rounded w-full" />
                  <div className="h-4 bg-orange-50 rounded w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageSkeleton>
  )
}
