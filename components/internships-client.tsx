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

export function InternshipsClient({ initialInternships }: InternshipsClientProps) {
  // 業界オプションを動的生成（company.company_overviews.industry.nameから、ソート済み）
  const industryOptions = useMemo(() => {
    const set = new Set<string>()
    initialInternships.forEach(internship => {
      const name = internship.company?.company_overviews?.industry?.name
      if (name) set.add(name)
    })
    const sorted = Array.from(set).sort()
    return [
      { value: "all", label: "すべて" },
      ...sorted.map(name => ({ value: name, label: name }))
    ]
  }, [initialInternships])

  // 職種オプションを動的生成（job_type.nameから、ソート済み）
  const jobTypeOptions = useMemo(() => {
    const set = new Set<string>()
    initialInternships.forEach(internship => {
      const name = internship.job_type?.name
      if (name) set.add(name)
    })
    const sorted = Array.from(set).sort()
    return [
      { value: "all", label: "すべて" },
      ...sorted.map(name => ({ value: name, label: name }))
    ]
  }, [initialInternships])

  // タグオプションを動的生成（名前でソート済み）
  const tagOptions = useMemo(() => {
    const allTags = new Map<string, string>()
    initialInternships.forEach(internship => {
      internship.tags?.forEach(tag => {
        if (tag?.id && tag?.name) {
          allTags.set(tag.id, tag.name)
        }
      })
    })
    const sorted = Array.from(allTags.entries()).sort((a, b) => a[1].localeCompare(b[1]))
    return [
      { value: "all", label: "すべて" },
      ...sorted.map(([id, name]) => ({ value: id, label: name }))
    ]
  }, [initialInternships])

  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    area: 'all',
    industry: 'all',
    jobType: 'all',
    tag: 'all',
    sortBy: 'created_at'
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const handleSearchChange = (params: SearchParams) => {
    setSearchParams(params)
    setCurrentPage(1) // 検索条件変更時はページをリセット
  }

  // フィルタリング・ソートロジック
  const filteredInternships = useMemo(() => {
    let result = [...initialInternships]

    // キーワード検索（タイトル、企業名、企業名カナ、職種説明、業務内容で検索）
    if (searchParams.keyword.trim()) {
      const keyword = searchParams.keyword.trim().toLowerCase()
      result = result.filter(internship => 
        internship.title?.toLowerCase().includes(keyword) ||
        internship.company?.name?.toLowerCase().includes(keyword) ||
        internship.company?.name_kana?.toLowerCase().includes(keyword) ||
        internship.job_type_description?.toLowerCase().includes(keyword) ||
        internship.job_description?.toLowerCase().includes(keyword)
      )
    }

    // エリアフィルタ（勤務地で絞り込み）
    if (searchParams.area && searchParams.area !== 'all') {
      result = result.filter(internship => {
        const location = internship.work_location ?? ''
        const area = searchParams.area ?? ''
        return location.includes(area)
      })
    }

    // タグフィルタ（こだわり条件）
    if (searchParams.tag && searchParams.tag !== 'all') {
      const selectedTag = searchParams.tag ?? ''
      result = result.filter(internship => {
        return internship.tags?.some(tag => tag?.id === selectedTag) ?? false
      })
    }

    // 業界フィルタ（company.company_overviews.industry.nameで絞り込み）
    if (searchParams.industry && searchParams.industry !== 'all') {
      result = result.filter(internship => {
        const industryName = internship.company?.company_overviews?.industry?.name ?? ''
        const selectedIndustry = searchParams.industry ?? ''
        return industryName === selectedIndustry
      })
    }

    // 職種フィルタ（job_type.nameで絞り込み）
    if (searchParams.jobType && searchParams.jobType !== 'all') {
      result = result.filter(internship => {
        const jobTypeName = internship.job_type?.name ?? ''
        const selectedJobType = searchParams.jobType ?? ''
        return jobTypeName === selectedJobType
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
  }, [initialInternships, searchParams])

  // ページネーション用のデータ計算
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInternships = filteredInternships.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchHero
        keywordPlaceholder="職種、企業名など"
        industryOptions={industryOptions}
        jobTypeOptions={jobTypeOptions}
        tagOptions={tagOptions}
        searchParams={searchParams}
        onSearchChange={handleSearchChange}
        resultCount={filteredInternships.length}
        showTagFilter={true}
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
                currentInternships.map((internship) => (
                  <InternshipCard 
                    key={internship.id} 
                    internship={internship} 
                    tags={internship.tags || []} 
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {filteredInternships.length > 0 && totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-8">
                <div className="text-sm text-gray-600">
                  {startIndex + 1}〜{Math.min(endIndex, filteredInternships.length)}件 / 全{filteredInternships.length}件
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
