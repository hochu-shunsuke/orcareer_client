import Link from "next/link"
import Image from "next/image"

interface ArticleCardProps {
  title: string
  imageUrl: string
  link: string
}

export function ArticleCard({ title, imageUrl, link }: ArticleCardProps) {
  return (
    <Link 
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative w-full h-48">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-sm group-hover:text-orange-600 transition-colors">{title}</h3>
        </div>
      </div>
    </Link>
  )
}
