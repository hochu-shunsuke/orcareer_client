"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { InternshipCard } from "@/components/internship-card"
import { StudentArticles } from "@/components/student-articles"
import { EventInfo } from "@/components/event-info"
import { SearchHero, SearchParams } from "@/components/search-hero"
import { Internship } from "@/types"

interface InternshipsClientProps {
  initialInternships: Internship[]
}

const industryOptions = [
  { value: "all", label: "すべて" },
  { value: "it", label: "IT・通信" },
  { value: "manufacturer", label: "メーカー" },
  { value: "trading", label: "商社" },
  { value: "finance", label: "金融" },
  { value: "consulting", label: "コンサルティング" },
  { value: "service", label: "サービス" },
  { value: "retail", label: "小売" }
]

const jobTypeOptions = [
  { value: "all", label: "すべて" },
  { value: "engineer", label: "エンジニア" },
  { value: "sales", label: "営業" },
  { value: "planning", label: "企画" },
  { value: "marketing", label: "マーケティング" },
  { value: "design", label: "デザイナー" },
  { value: "consulting", label: "コンサルタント" },
  { value: "hr", label: "人事" }
]

export function InternshipsClient({ initialInternships }: InternshipsClientProps) {
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
  const filteredInternships = useMemo(() => {
    let result = [...initialInternships]

    // キーワード検索（タイトル、企業名、職種説明、業務内容で検索）
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase()
      result = result.filter(internship => 
        internship.title?.toLowerCase().includes(keyword) ||
        internship.company?.name.toLowerCase().includes(keyword) ||
        internship.job_type_description?.toLowerCase().includes(keyword) ||
        internship.job_description?.toLowerCase().includes(keyword)
      )
    }

    // エリアフィルタ（勤務地で絞り込み）
    if (searchParams.area && searchParams.area !== 'all') {
      result = result.filter(internship => {
        const location = internship.work_location || ''
        return location.includes(searchParams.area)
      })
    }

    // 業界フィルタ（TODO: company.industry_idのマッピングが必要）
    if (searchParams.industry && searchParams.industry !== 'all') {
      // 現在はスキップ
    }

    // 業種フィルタ（TODO: job_type_idのマッピングが必要）
    if (searchParams.jobType && searchParams.jobType !== 'all') {
      // 現在はスキップ
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
  }, [initialInternships, searchParams])

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchHero
        keywordPlaceholder="職種、企業名など"
        industryOptions={industryOptions}
        jobTypeOptions={jobTypeOptions}
        searchParams={searchParams}
        onSearchChange={handleSearchChange}
        resultCount={filteredInternships.length}
      />

      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 order-1 lg:order-1">
            {/* Search Results Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">インターンシップ一覧</h1>
              <p className="text-gray-600">検索結果: {filteredInternships.length}件</p>
            </div>

            <div className="space-y-6">
              {filteredInternships.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>インターンシップが見つかりませんでした</p>
                  <p className="text-sm mt-2">検索条件を変更してお試しください</p>
                </div>
              ) : (
                filteredInternships.map((internship) => (
                  <InternshipCard 
                    key={internship.id} 
                    internship={internship} 
                    tags={internship.tags || []} 
                  />
                ))
              )}
            </div>

            {/* Pagination (TODO: 実装) */}
            {filteredInternships.length > 0 && (
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

          {/* Sidebar */}
          <div className="w-full lg:w-80 order-2 lg:order-2 space-y-6">
            <StudentArticles />
            <EventInfo />
          </div>
        </div>
      </div>
    </div>
  )
}
