import { PageSkeleton, DetailSkeleton } from "@/components/loading-skeleton"

export default function Loading() {
  return (
    <PageSkeleton>
      <DetailSkeleton />
    </PageSkeleton>
  )
}