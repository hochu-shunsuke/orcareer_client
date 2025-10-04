"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface SearchParams {
  keyword: string
  area: string
  industry: string
  jobType: string
  sortBy: 'created_at' | 'favorites'
}

interface SearchHeroProps {
  searchTitle: string
  keywordPlaceholder: string
  industryOptions: { value: string; label: string }[]
  jobTypeOptions: { value: string; label: string }[]
  onSearchChange: (params: SearchParams) => void
  searchParams: SearchParams
}

const areaOptions = [
  { value: "all", label: "すべて" },
  { value: "aichi", label: "愛知県" },
  { value: "shizuoka", label: "静岡県" },
  { value: "gifu", label: "岐阜県" },
  { value: "mie", label: "三重県" }
]

const sortOptions = [
  { value: "created_at", label: "掲載順" },
  { value: "favorites", label: "お気に入り数順" }
]

export function SearchHero({
  searchTitle,
  keywordPlaceholder,
  industryOptions,
  jobTypeOptions,
  onSearchChange,
  searchParams
}: SearchHeroProps) {
  const handleChange = (field: keyof SearchParams, value: string) => {
    onSearchChange({
      ...searchParams,
      [field]: value
    })
  }

  const handleClear = () => {
    onSearchChange({
      keyword: '',
      area: 'all',
      industry: 'all',
      jobType: 'all',
      sortBy: 'created_at'
    })
  }

  return (
    <section className="py-8 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* タイトル */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {searchTitle}
          </h2>

          {/* 検索フォーム */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* キーワード入力 */}
              <div className="lg:col-span-3">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  キーワード
                </label>
                <Input 
                  placeholder={keywordPlaceholder} 
                  className="h-11 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500" 
                  value={searchParams.keyword}
                  onChange={(e) => handleChange('keyword', e.target.value)}
                />
              </div>

              {/* エリア選択 */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  エリア
                </label>
                <Select value={searchParams.area} onValueChange={(value) => handleChange('area', value)}>
                  <SelectTrigger className="h-11 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="エリアを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 業界選択 */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  業界
                </label>
                <Select value={searchParams.industry} onValueChange={(value) => handleChange('industry', value)}>
                  <SelectTrigger className="h-11 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="業界を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 業種選択 */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  業種
                </label>
                <Select value={searchParams.jobType} onValueChange={(value) => handleChange('jobType', value)}>
                  <SelectTrigger className="h-11 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="業種を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ソートとアクションボタン */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  並び順
                </label>
                <Select value={searchParams.sortBy} onValueChange={(value) => handleChange('sortBy', value as 'created_at' | 'favorites')}>
                  <SelectTrigger className="h-11 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="並び順を選択" />
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

              {/* クリアボタン */}
              <div className="flex items-end">
                <Button 
                  variant="outline"
                  className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                  onClick={handleClear}
                >
                  条件をクリア
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

