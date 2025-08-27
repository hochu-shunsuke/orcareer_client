"use client"

import React from "react"
import { useUser } from "@auth0/nextjs-auth0"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UserProfile({ usernameParam }: { usernameParam?: string }) {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (!user) {
    return (
      <div className="text-center mb-6">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">U</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-semibold">ゲスト</h2>
        <p className="text-sm text-gray-500">ログインしてプロフィールを表示できます</p>
        <div className="mt-4">
          <a href="/auth/login">
            <Button className="px-4 py-2 bg-orange-600 hover:bg-orange-700">ログイン</Button>
          </a>
        </div>
      </div>
    )
  }

  const displayName = user.name || user.nickname || user.preferred_username || user.email || user.sub
  const avatar = user.picture
  const isOwner = usernameParam && usernameParam === (user.nickname || user.preferred_username || user.name || user.sub)

  return (
    <div>
      <div className="text-center mb-6">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          {avatar ? <AvatarImage src={avatar} /> : <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">{(displayName || 'U')[0]}</AvatarFallback>}
        </Avatar>
        <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
      </div>
      <div className="mt-6">
        {isOwner ? (
          <Link href={`/user/${encodeURIComponent(user.nickname || user.preferred_username || user.name || user.sub)}`}>
            <Button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700">プロフィール編集</Button>
          </Link>
        ) : null}
      </div>
    </div>
  )
}
