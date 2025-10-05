import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">オルキャリ</h3>
            <p className="text-gray-400">東海地方を中心とした新卒向け求人・企業情報サイト</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">求人を探す</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/companies" className="hover:text-white transition-colors">
                  企業一覧
                </Link>
              </li>
              <li>
                <Link href="/internships" className="hover:text-white transition-colors">
                  インターンシップ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">企業の方へ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="https://orca-career.com/company" className="hover:text-white transition-colors">
                  採用ご担当者様向けサイト
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">学生の方へ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="https://student.orca-career.com/" className="hover:text-white transition-colors">
                  学生向けサイト
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 オルキャリ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
