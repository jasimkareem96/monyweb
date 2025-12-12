"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { NotificationBell } from "@/components/notifications/NotificationBell"

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold text-primary-600">MonyWeb</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/offers">
                <Button variant="ghost">العروض</Button>
              </Link>
              <Link href="/orders">
                <Button variant="ghost">الطلبات</Button>
              </Link>
              {session.user.role === "MERCHANT" && (
                <Link href="/merchant/offers">
                  <Button variant="ghost">عروضي</Button>
                </Link>
              )}
              {session.user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="ghost">لوحة التحكم</Button>
                </Link>
              )}
              <NotificationBell />
              <Link href="/profile" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {(session.user as any).profileImage ? (
                    <img
                      src={(session.user as any).profileImage}
                      alt={session.user.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600 hidden md:inline">{session.user.name || session.user.email}</span>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost">تسجيل الدخول</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>إنشاء حساب</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

