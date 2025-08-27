import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchField {
  label: string
  placeholder: string
  type: 'input' | 'select'
  options?: { value: string; label: string }[]
}

interface SearchHeroProps {
  title: string
  subtitle: string
  searchTitle: string
  keywordPlaceholder: string
  fields: SearchField[]
  onSearch?: () => void
}

const areaOptions = [
  { value: "aichi", label: "愛知県" },
  { value: "shizuoka", label: "静岡県" },
  { value: "gifu", label: "岐阜県" },
  { value: "mie", label: "三重県" }
]

export function SearchHero({
  title,
  subtitle,
  searchTitle,
  keywordPlaceholder,
  fields,
  onSearch
}: SearchHeroProps) {
  return (
    <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        <p className="text-lg md:text-xl mb-8">{subtitle}</p>
        
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              {searchTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* キーワード入力フィールド */}
              <div>
                <label className="text-sm font-medium mb-2 block">キーワード</label>
                <Input placeholder={keywordPlaceholder} />
              </div>

              {/* エリア選択フィールド */}
              <div>
                <label className="text-sm font-medium mb-2 block">エリア</label>
                <Select>
                  <SelectTrigger>
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

              {/* 追加フィールド */}
              {fields.map((field, index) => (
                <div key={index}>
                  <label className="text-sm font-medium mb-2 block">{field.label}</label>
                  {field.type === 'input' ? (
                    <Input placeholder={field.placeholder} />
                  ) : (
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}

              {/* 検索ボタン */}
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={onSearch}
                >
                  検索する
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
