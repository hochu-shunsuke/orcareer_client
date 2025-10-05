import { NavigationBar } from "@/components/navigation-bar"
import { Footer } from "@/components/footer"
import { fetchInternshipsWithCompanyAndTags } from "@/lib/fetch-internships"
import { InternshipsClient } from "@/components/internships-client"
import { logger } from "@/lib/logger"

export default async function InternshipPage() {
  let internships = []
  
  try {
    internships = await fetchInternshipsWithCompanyAndTags()
  } catch (error) {
    logger.error('Failed to fetch internships with company and tags', error as Error, 'internships-page')
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar currentPage="internships" />
        <div className="container mx-auto py-12 text-red-600">
          インターンデータの取得に失敗しました
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="internships" />
      <InternshipsClient initialInternships={internships} />
      <Footer />
    </div>
  )
}