import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Article {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
}

const articles: Article[] = [
  {
    id: '1',
    title: '就活の始め方完全ガイド',
    description: '初めての就活で何から始めればいいかわからない方へ',
    color: 'from-blue-400 to-blue-600',
    icon: '就活準備'
  },
  {
    id: '2',
    title: '面接で好印象を与える方法',
    description: '面接官に印象を残すためのテクニック集',
    color: 'from-green-400 to-green-600',
    icon: '面接対策'
  },
  {
    id: '3',
    title: 'エントリーシート書き方講座',
    description: '通過率を上げるES作成のポイント',
    color: 'from-purple-400 to-purple-600',
    icon: 'ES対策'
  },
  {
    id: '4',
    title: 'IT業界の最新動向',
    description: '成長著しいIT業界の現状と将来性',
    color: 'from-red-400 to-red-600',
    icon: '業界研究'
  }
];

export function StudentArticles() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>学生向け記事</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {articles.map((article) => (
          <div 
            key={article.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className={`w-full h-32 bg-gradient-to-r ${article.color} rounded-lg mb-3 flex items-center justify-center`}>
              <span className="text-white font-bold">{article.icon}</span>
            </div>
            <h4 className="font-semibold text-sm mb-2">{article.title}</h4>
            <p className="text-xs text-gray-600">{article.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
