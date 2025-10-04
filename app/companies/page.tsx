import { NavigationBar } from "@/components/navigation-bar"
import { Footer } from "@/components/footer"
import { fetchCompaniesWithRecruitments } from "@/lib/fetch-companies"
import { CompaniesClient } from "@/components/companies-client"
import { logger } from "@/lib/logger"

export default async function CompaniesPage() {
  let companies = []
  
  try {
    companies = await fetchCompaniesWithRecruitments()
  } catch (error) {
    logger.error('Failed to fetch companies with recruitments', error as Error, 'companies-page')
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar currentPage="companies" />
        <div className="container mx-auto py-12 text-red-600">
          企業データの取得に失敗しました
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="companies" />
      <CompaniesClient initialCompanies={companies} />
      <Footer />
    </div>
  )
}