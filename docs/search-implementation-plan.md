# 検索・ソート機能 実装提案書

## 調査結果

### データ構造（実際に取得されるフィールド）

#### Company型
```typescript
{
  id: string
  name: string
  name_kana: string | null
  created_at: string | null
  updated_at: string | null
  
  company_overviews?: {
    industry_id: string | null          // UUID（マスターなし）
    headquarters_address: string | null // 例: "名古屋市中区名古屋城1-1-1"
    employee_count: number | null
    established_year: number | null
  }
  
  company_data?: {
    profile: string | null              // 企業プロフィール
    business_content: string | null     // 事業内容
    headquarters_location: string | null // 例: "名古屋"
    offices: string | null              // 例: "名古屋オフィス，豊田オフィス"
  }
  
  recruitments?: Recruitment[]          // 求人一覧
}
```

#### Internship型
```typescript
{
  id: string
  title: string | null
  job_type_id: string | null           // UUID（マスターなし）
  job_description: string | null
  work_location: string | null
  created_at: string | null
  updated_at: string | null
  
  company?: {
    name: string
  }
  
  tags?: InternshipTag[]
}
```

---

## 実装可能な機能

### ✅ 実装可能（データあり）

#### 1. キーワード検索
- **企業**: name, name_kana, profile, business_content
- **インターン**: title, job_description, company.name

#### 2. エリアフィルタ
- **企業**: headquarters_address, headquarters_location で部分一致
- **インターン**: work_location で部分一致
- **フィルター値**: "愛知県", "静岡県", "岐阜県", "三重県"

#### 3. ソート
- **新着順**: created_at 降順
- **更新順**: updated_at 降順（お気に入り数の代替）

### ⚠️ 実装不可（マスターデータなし）

#### 4. 業界フィルタ
- industry_id はUUIDのみ（名前なし）
- → **現時点では無効化**

#### 5. 職種フィルタ
- job_type_id はUUIDのみ（名前なし）
- → **現時点では無効化**

---

## 実装方法

### Phase 1: 即座に実装可能

```typescript
// 1. キーワード検索（強化版）
const keyword = searchParams.keyword.toLowerCase()
result = result.filter(company => 
  company.name.toLowerCase().includes(keyword) ||
  company.name_kana?.toLowerCase().includes(keyword) ||
  company.company_data?.profile?.toLowerCase().includes(keyword) ||
  company.company_data?.business_content?.toLowerCase().includes(keyword) ||
  company.company_data?.offices?.toLowerCase().includes(keyword)
)

// 2. エリアフィルタ（本社所在地）
if (searchParams.area !== 'all') {
  result = result.filter(company => {
    const headquarters = 
      company.company_overviews?.headquarters_address || 
      company.company_data?.headquarters_location || ''
    return headquarters.includes(searchParams.area)
  })
}

// 3. ソート
if (searchParams.sortBy === 'created_at') {
  result.sort((a, b) => 
    new Date(b.created_at || 0).getTime() - 
    new Date(a.created_at || 0).getTime()
  )
} else if (searchParams.sortBy === 'updated_at') {
  result.sort((a, b) => 
    new Date(b.updated_at || 0).getTime() - 
    new Date(a.updated_at || 0).getTime()
  )
}
```

### Phase 2: マスターデータ追加後

```typescript
// 業界・職種マスターを取得
const industries = await fetchIndustries()
const jobTypes = await fetchJobTypes()

// industryOptions/jobTypeOptionsを動的生成
const industryOptions = [
  { value: "all", label: "すべて" },
  ...industries.map(i => ({ value: i.id, label: i.name }))
]

// フィルタリング
if (searchParams.industry !== 'all') {
  result = result.filter(company => 
    company.company_overviews?.industry_id === searchParams.industry
  )
}
```

---

## UI修正提案

### 現在
```typescript
const industryOptions = [
  { value: "all", label: "すべて" },
  { value: "manufacturer", label: "メーカー" }, // ← 使えない
  ...
]
```

### 修正後（Phase 1）
```typescript
const industryOptions = [
  { value: "all", label: "すべて" }
  // マスターデータ追加まで他の選択肢は非表示
]

// または業界フィルタ自体を一時的に無効化
<Select disabled>
  <SelectTrigger>
    <SelectValue placeholder="業界（準備中）" />
  </SelectTrigger>
</Select>
```

---

## ソート修正

### 現在の問題
- `sortBy: 'favorites'` → favorites_countフィールドが存在しない

### 解決策
```typescript
// SearchParams型を修正
sortBy: 'created_at' | 'updated_at'

// sortOptions
const sortOptions = [
  { value: "created_at", label: "新着順" },
  { value: "updated_at", label: "更新順" }
]

// 実装
if (searchParams.sortBy === 'updated_at') {
  result.sort((a, b) => 
    new Date(b.updated_at || 0).getTime() - 
    new Date(a.updated_at || 0).getTime()
  )
}
```

---

## 実装優先順位

### 🔥 今すぐ実装（データあり）
1. ✅ キーワード検索強化（offices追加）
2. ✅ エリアフィルタ実装
3. ✅ ソート修正（updated_at追加）

### 🔄 準備中（マスターデータ待ち）
4. ⏸️ 業界フィルタ無効化または選択肢削除
5. ⏸️ 職種フィルタ無効化または選択肢削除

### 📅 将来実装（DB拡張後）
6. 🔮 お気に入り数ソート（favorites_countカラム追加）
7. 🔮 業界・職種マスター連携

---

## まとめ

### 即座に実装可能な機能
- ✅ キーワード検索（5フィールド対応）
- ✅ エリアフィルタ（4県対応）
- ✅ 新着順・更新順ソート

### 実装できない機能（マスターデータなし）
- ❌ 業界フィルタ（industry_id → 名前なし）
- ❌ 職種フィルタ（job_type_id → 名前なし）
- ❌ お気に入り数ソート（favorites_countなし）

### 推奨対応
1. 使える機能を完全実装
2. 使えない機能はUI上で無効化または削除
3. マスターデータ追加後に段階的に有効化

---

**実装しますか？**
