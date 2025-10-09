import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Company } from "@/types"

interface CompanyListItemProps {
  company: Company
}

export function CompanyListItem({ company }: CompanyListItemProps) {
  const industryName = company.company_overviews?.industry?.name
  
  return (
    <Link 
      href={`/companies/${company.id}`}
      className="block px-6 py-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-black">{company.name}</h3>
            {industryName && (
              <Badge variant="secondary" className="text-xs">
                {industryName}
              </Badge>
            )}
          </div>
        </div>
        <span className="text-gray-400 ml-4">→</span>
      </div>
    </Link>
  )
}
