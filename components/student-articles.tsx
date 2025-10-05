import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Article {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
}

const articles: Article[] = [
  {
    id: '1',
    title: '名古屋でおすすめの新卒就活エージェント7選！選ぶ際のポイントも解説',
    imageUrl: 'https://student.orca-career.com/wp-content/uploads/2025/09/orcr_student_icatch-12-768x403.png',
    link: 'https://student.orca-career.com/nagoya-job-hunting-agent/'
  },
  {
    id: '2',
    title: '名古屋の就活で人気の企業は？ホワイト企業15選【2025年版】',
    imageUrl: 'https://student.orca-career.com/wp-content/uploads/2025/09/orcr_student_icatch-11-768x403.png',
    link: 'https://student.orca-career.com/nagoya-popular-company-2025/'
  },
  {
    id: '3',
    title: '名古屋のおすすめ就活塾を紹介！選び方のポイントも解説',
    imageUrl: 'https://student.orca-career.com/wp-content/uploads/2025/09/orcr_student_icatch-768x403.png',
    link: 'https://student.orca-career.com/nagoya-shukatsu-juku/'
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
          <Link 
            href={article.link}
            key={article.id}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative w-full h-36">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-sm">{article.title}</h4>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
