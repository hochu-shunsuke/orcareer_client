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

const industryOptions = [
  { value: "all", label: "すべて" },
  { value: "manufacturer", label: "メーカー（未実装）" },
  { value: "trading", label: "商社（未実装）" },
  { value: "retail", label: "小売・流通（未実装）" },
  { value: "finance", label: "金融（未実装）" },
  { value: "service", label: "サービス・インフラ（未実装）" },
  { value: "software", label: "ソフトウェア・通信（未実装）" },
  { value: "media", label: "広告・出版・マスコミ（未実装）" }
]

const jobTypeOptions = [
  { value: "all", label: "すべて" },
  { value: "engineer", label: "エンジニア（未実装）" },
  { value: "sales", label: "営業（未実装）" },
  { value: "planning", label: "企画（未実装）" },
  { value: "marketing", label: "マーケティング（未実装）" },
  { value: "consulting", label: "コンサルタント（未実装）" },
  { value: "design", label: "デザイナー（未実装）" },
  { value: "hr", label: "人事（未実装）" },
  { value: "accounting", label: "経理・財務（未実装）" }
]

export function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    area: 'all',
    industry: 'all',
    jobType: 'all',
    sortBy: 'created_at'
  })

  const handleSearchChange = (params: SearchParams) => {
    setSearchParams(params)
  }

  // フィルタリング・ソートロジック
  const filteredCompanies = useMemo(() => {
    let result = [...initialCompanies]

    // キーワード検索（企業名、カナ、プロフィール、事業内容で検索）
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase()
      result = result.filter(company => 
        company.name.toLowerCase().includes(keyword) ||
        company.name_kana?.toLowerCase().includes(keyword) ||
        company.company_data?.profile?.toLowerCase().includes(keyword) ||
        company.company_data?.business_content?.toLowerCase().includes(keyword)
      )
    }

    // エリアフィルタ（本社所在地で絞り込み）
    if (searchParams.area && searchParams.area !== 'all') {
      result = result.filter(company => {
        const headquarters = company.company_overviews?.headquarters_address || 
                           company.company_data?.headquarters_location || ''
        return headquarters.includes(searchParams.area)
      })
    }

    // 業界フィルタ（TODO: industry_idのマッピングが必要）
    if (searchParams.industry && searchParams.industry !== 'all') {
      // 現在はスキップ（industry_idとの対応が必要）
    }

    // 業種フィルタ（TODO: job_type_idのマッピングが必要）
    if (searchParams.jobType && searchParams.jobType !== 'all') {
      // 現在はスキップ（recruitmentsのjob_type_idとの対応が必要）
    }

    // ソート
    if (searchParams.sortBy === 'created_at') {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA // 新しい順
      })
    } else if (searchParams.sortBy === 'favorites') {
      // TODO: お気に入り数のフィールドが必要
      // 現在はスキップ
    }

    return result
  }, [initialCompanies, searchParams])

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
                filteredCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))
              )}
            </div>

            {/* Pagination (TODO: 実装) */}
            {filteredCompanies.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm">
                    前へ
                  </Button>
                  <Button className="bg-orange-600" size="sm">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
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
