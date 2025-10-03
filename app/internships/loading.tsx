import { PageSkeleton, ListSkeleton } from "@/components/loading-skeleton"

export default function Loading() {
  return (
    <PageSkeleton>
      <ListSkeleton count={6} />
    </PageSkeleton>
  )
}