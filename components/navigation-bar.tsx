"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@auth0/nextjs-auth0"
import { usePathname } from "next/navigation"
// ...existing code...

interface NavigationItem {
  href: string
  label: string
  isActive?: boolean
}

interface NavigationBarProps {
  currentPage?: 'companies' | 'jobs' | 'internships'
  showMobileButtons?: boolean
}

const navigationItems: NavigationItem[] = [
  { href: "/companies", label: "企業一覧" },
  { href: "/internships", label: "インターンシップ" },
  { href: "https://student.orca-career.com/column", label: "就活コラム" }
]

export function NavigationBar({ 
  currentPage,
  showMobileButtons = true 
}: NavigationBarProps) {
  const { user, isLoading } = useUser()
  const pathname = usePathname() ?? ''
  const isOnUserPage = pathname.startsWith('/user')
  const username = user ? encodeURIComponent(user.nickname || user.preferred_username || user.name || user.sub) : ''
  
  // ユーザー同期などの副作用処理は責務外とし、ここでは一切行わない
  
  const getNavItemClass = (itemPage: string) => {
    const isActive = currentPage === itemPage
    return isActive 
      ? "text-orange-600 font-semibold"
      : "text-gray-600 hover:text-orange-600"
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/orcareer.webp"
                alt="オルキャリ"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <nav className="hidden md:flex space-x-6">
              {navigationItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={getNavItemClass(item.href.replace('/', ''))}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Auth buttons */}
          <div>
            {!user ? (
              <a href="/auth/login" className="hidden md:inline-block text-orange-600 border border-orange-600 px-3 py-1 rounded hover:bg-orange-50">ログイン</a>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href={`/user`}>
                  <Button variant="outline" className="hidden md:block border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent">
                    マイページ
                  </Button>
                </Link>
                {/* logout is moved to user settings page */}
              </div>
            )}
          </div>
          {/* Mobile Buttons & Hamburger */}
          {showMobileButtons && (
            <div className="md:hidden flex items-center space-x-2">
              {/* mobile top buttons removed; show auth button in sheet bottom */}
              
              {/* Mobile Navigation Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <SheetHeader>
                    <SheetTitle>メニュー</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 pt-8">
                    <Link href="/" className="text-lg font-semibold text-gray-800 hover:text-orange-600">
                      TOP
                    </Link>
                    {navigationItems.map((item) => (
                      <Link 
                        key={item.href}
                        href={item.href} 
                        className={`text-lg font-semibold ${
                          currentPage === item.href.replace('/', '') 
                            ? 'text-orange-600' 
                            : 'text-gray-800 hover:text-orange-600'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="flex flex-col gap-4 mt-4 border-t pt-4">
                      {!user ? (
                        <a href="/auth/login">
                          <Button
                            variant="outline"
                            className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent"
                          >
                            ログイン
                          </Button>
                        </a>
                      ) : (
                        <Link href={`/user`}>
                          <Button
                            variant="outline"
                            className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent"
                          >
                            マイページ
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
