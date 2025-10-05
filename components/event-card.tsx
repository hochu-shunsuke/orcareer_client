import Link from "next/link"

interface EventCardProps {
  title: string
  date: string
  link: string
}

export function EventCard({ title, date, link }: EventCardProps) {
  return (
    <Link 
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-6 py-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-orange-600 font-bold mb-1">{date}</p>
          <h3 className="font-bold text-black">{title}</h3>
        </div>
        <span className="text-gray-400">→</span>
      </div>
    </Link>
  )
}
