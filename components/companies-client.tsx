"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { CompanyCard } from "@/components/company-card"
import { StudentArticles } from "@/components/student-articles"
import { EventInfo } from "@/components/event-info"
import { SearchHero, SearchParams } from "@/components/search-hero"
import { Company } from "@/types"

interface CompaniesClientProps {
  initialCompanies: Company[]
}

export function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
  // 業界オプションを動的生成（ソート済み）
  const industryOptions = useMemo(() => {
    const set = new Set<string>()
    initialCompanies.forEach((company: Company) => {
      const name = company.company_overviews?.industry?.name
      if (name) set.add(name)
    })
    const sorted = Array.from(set).sort()
    return [
      { value: "all", label: "すべて" },
      ...sorted.map(name => ({ value: name, label: name }))
    ]
  }, [initialCompanies])

  // 職種オプションを動的生成（ソート済み）
  const jobTypeOptions = useMemo(() => {
    const set = new Set<string>()
    initialCompanies.forEach((company: Company) => {
      company.recruitments?.forEach(rec => {
        const name = rec.job_type?.name
        if (name) set.add(name)
      })
    })
    const sorted = Array.from(set).sort()
    return [
      { value: "all", label: "すべて" },
      ...sorted.map(name => ({ value: name, label: name }))
    ]
  }, [initialCompanies])
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    area: 'all',
    industry: 'all',
    jobType: 'all',
    sortBy: 'created_at'
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const handleSearchChange = (params: SearchParams) => {
    setSearchParams(params)
    setCurrentPage(1) // 検索条件変更時はページをリセット
  }

  // フィルタリング・ソートロジック
  const filteredCompanies = useMemo(() => {
    let result = [...initialCompanies]

    // キーワード検索（企業名、カナ、プロフィール、事業内容で検索）
    if (searchParams.keyword.trim()) {
      const keyword = searchParams.keyword.trim().toLowerCase()
      result = result.filter(company => 
        company.name?.toLowerCase().includes(keyword) ||
        company.name_kana?.toLowerCase().includes(keyword) ||
        company.company_data?.profile?.toLowerCase().includes(keyword) ||
        company.company_data?.business_content?.toLowerCase().includes(keyword)
      )
    }

    // エリアフィルタ（本社所在地で絞り込み）
    if (searchParams.area && searchParams.area !== 'all') {
      result = result.filter(company => {
        const headquarters = company.company_overviews?.headquarters_address ?? 
                           company.company_data?.headquarters_location ?? ''
        const area = searchParams.area ?? ''
        return headquarters.includes(area)
      })
    }

    // 業界フィルタ（industry.nameで絞り込み）
    if (searchParams.industry && searchParams.industry !== 'all') {
      result = result.filter(company => {
        const industryName = company.company_overviews?.industry?.name ?? ''
        const selectedIndustry = searchParams.industry ?? ''
        return industryName === selectedIndustry
      })
    }

    // 業種フィルタ（recruitments[].job_type.nameで絞り込み）
    if (searchParams.jobType && searchParams.jobType !== 'all') {
      const selectedJobType = searchParams.jobType ?? ''
      result = result.filter(company => {
        // 1つでも該当する職種があれば表示
        return company.recruitments?.some(rec => rec.job_type?.name === selectedJobType) ?? false
      })
    }

    // ソート
    if (searchParams.sortBy === 'created_at') {
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA // 新しい順
      })
    } else if (searchParams.sortBy === 'favorites') {
      // TODO: お気に入り数のフィールドが必要
      // 現在はスキップ
    }

    return result
  }, [initialCompanies, searchParams])

  // ページネーション用のデータ計算
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchHero
        keywordPlaceholder="企業名、業界など"
        industryOptions={industryOptions}
        jobTypeOptions={jobTypeOptions}
        searchParams={searchParams}
        onSearchChange={handleSearchChange}
        resultCount={filteredCompanies.length}
      />

      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 order-1 lg:order-1">
            {/* Search Results Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">企業一覧</h1>
              <p className="text-gray-600">検索結果: {filteredCompanies.length}件</p>
            </div>

            <div className="space-y-6">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>企業が見つかりませんでした</p>
                  <p className="text-sm mt-2">検索条件を変更してお試しください</p>
                </div>
              ) : (
                currentCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))
              )}
            </div>

            {/* Pagination */}
            {filteredCompanies.length > 0 && totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-8">
                <div className="text-sm text-gray-600">
                  {startIndex + 1}〜{Math.min(endIndex, filteredCompanies.length)}件 / 全{filteredCompanies.length}件
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    前へ
                  </Button>
                  
                  {/* ページ番号ボタン */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // 現在のページ周辺と最初・最後のページのみ表示
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    
                    if (!showPage) {
                      // 省略記号を表示（重複しないように）
                      if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="px-2 text-gray-400">...</span>
                      }
                      return null
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        {page}
                      </Button>
                    )
                  })}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Student Articles */}
          <div className="w-full lg:w-80 order-2 lg:order-2">
            <div className="space-y-6">
              <StudentArticles />
              <EventInfo />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
