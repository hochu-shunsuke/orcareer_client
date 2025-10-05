"use client"

import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export interface SearchParams {
  keyword: string
  area: string
  industry: string
  jobType: string
  tag?: string  // インターンシップ用タグフィルタ
  sortBy: 'created_at' | 'favorites'
}

interface SearchHeroProps {
  keywordPlaceholder: string
  industryOptions: { value: string; label: string }[]
  jobTypeOptions: { value: string; label: string }[]
  tagOptions?: { value: string; label: string }[]  // インターンシップ用
  onSearchChange: (params: SearchParams) => void
  searchParams: SearchParams
  resultCount: number
  showTagFilter?: boolean  // タグフィルタを表示するか
}

const areaOptions = [
  { value: "all", label: "すべて" },
  { value: "愛知県", label: "愛知県" },
  { value: "静岡県", label: "静岡県" },
  { value: "岐阜県", label: "岐阜県" },
  { value: "三重県", label: "三重県" }
]

const sortOptions = [
  { value: "created_at", label: "新着順" },
  { value: "favorites", label: "お気に入り数順（未実装）" }
]

export function SearchHero({
  keywordPlaceholder,
  industryOptions,
  jobTypeOptions,
  tagOptions,
  onSearchChange,
  searchParams,
  resultCount,
  showTagFilter = false
}: SearchHeroProps) {
  const handleChange = (field: keyof SearchParams, value: string) => {
    const updatedParams = {
      ...searchParams,
      [field]: value
    }
    // tagフィールドが存在しない場合は削除
    if (field === 'tag' && !showTagFilter) {
      delete updatedParams.tag
    }
    onSearchChange(updatedParams)
  }

  const getSelectLabel = (value: string, options: { value: string; label: string }[], defaultLabel: string) => {
    if (value === 'all') return defaultLabel
    const option = options.find(opt => opt.value === value)
    return option ? option.label : defaultLabel
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <Card className="border-2 border-gray-200 shadow-sm">
        <div className="p-4">
          {/* 上段：フィルター */}
          <div className={`grid ${showTagFilter ? 'grid-cols-4' : 'grid-cols-3'} gap-3 mb-3`}>
            {/* 業界 */}
            <Select value={searchParams.industry} onValueChange={(value) => handleChange('industry', value)}>
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue>
                  {getSelectLabel(searchParams.industry, industryOptions, '業界')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* エリア */}
            <Select value={searchParams.area} onValueChange={(value) => handleChange('area', value)}>
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue>
                  {getSelectLabel(searchParams.area, areaOptions, 'エリア')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {areaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 職種 */}
            <Select value={searchParams.jobType} onValueChange={(value) => handleChange('jobType', value)}>
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue>
                  {getSelectLabel(searchParams.jobType, jobTypeOptions, '職種')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {jobTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* こだわり条件（インターンシップのみ） */}
            {showTagFilter && tagOptions && (
              <Select value={searchParams.tag || 'all'} onValueChange={(value) => handleChange('tag', value)}>
                <SelectTrigger className="h-10 border-gray-300">
                  <SelectValue>
                    {getSelectLabel(searchParams.tag || 'all', tagOptions, 'こだわり条件')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tagOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 下段：キーワード検索 */}
          <div className="relative">
            <Input 
              placeholder={keywordPlaceholder}
              className="h-12 pl-4 pr-12 border-gray-300 text-base"
              value={searchParams.keyword}
              onChange={(e) => handleChange('keyword', e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 rounded-full p-2">
              <Search className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </Card>

      {/* 検索結果カウントとソート */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">検索結果：{resultCount}件</span>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-gray-300" />
            <span>募集中のみ表示</span>
          </label>
        </div>
        <Select value={searchParams.sortBy} onValueChange={(value) => handleChange('sortBy', value as 'created_at' | 'favorites')}>
          <SelectTrigger className="w-32 h-9 border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

