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
  searchTitle,
  keywordPlaceholder,
  fields,
  onSearch
}: SearchHeroProps) {
  return (
    <section className="py-12 bg-transparent">
      <div className="container mx-auto px-4 text-center">
        <Card className="max-w-4xl mx-auto border-4 border-orange-600 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-center text-black">
              {searchTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* キーワード入力フィールド */}
              <div>
                <label className="text-sm font-medium mb-2 block text-black">キーワード</label>
                <Input placeholder={keywordPlaceholder} className="text-black" />
              </div>

              {/* エリア選択フィールド */}
              <div>
                <label className="text-sm font-medium mb-2 block text-black">エリア</label>
                <Select>
                  <SelectTrigger className="text-black border-gray-300">
                    <SelectValue placeholder="エリアを選択" className="text-black" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-black">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 追加フィールド */}
              {fields.map((field, index) => (
                <div key={index}>
                  <label className="text-sm font-medium mb-2 block text-black">{field.label}</label>
                  {field.type === 'input' ? (
                    <Input placeholder={field.placeholder} className="text-black" />
                  ) : (
                    <Select>
                      <SelectTrigger className="text-black border-gray-300">
                        <SelectValue placeholder={field.placeholder} className="text-black" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-black">
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
                  className="w-full bg-orange-600 text-white border-2 border-orange-600 shadow-md hover:bg-orange-700 hover:text-white"
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
