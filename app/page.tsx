import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/Navbar"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Allow authenticated users to see the home page
  // No redirect to dashboard

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {session ? <Navbar /> : (
        <nav className="border-b bg-white">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <h1 className="text-2xl font-bold text-primary-600">MonyWeb</h1>
            <div className="flex gap-4">
              <Link href="/auth/signin">
                <Button variant="ghost">تسجيل الدخول</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>إنشاء حساب</Button>
              </Link>
            </div>
          </div>
        </nav>
      )}

      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            منصة P2P Financial Marketplace
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            نظام آمن للتبادل المالي مع حماية Escrow
          </p>
          <div className="flex gap-4 justify-center">
            {session ? (
              <>
                <Link href="/offers">
                  <Button size="lg">تصفح العروض</Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">لوحة التحكم</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg">ابدأ الآن</Button>
                </Link>
                <Link href="/offers">
                  <Button size="lg" variant="outline">تصفح العروض</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">🛡️ نظام Escrow آمن</h3>
            <p className="text-gray-600">
              حجز الأموال لدى المنصة حتى اكتمال الصفقة بنجاح
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">⚡ تنفيذ سريع</h3>
            <p className="text-gray-600">
              عمليات مالية سريعة وآمنة مع أفضل الأسعار
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">⭐ تقييمات موثوقة</h3>
            <p className="text-gray-600">
              نظام تقييم شامل لضمان جودة الخدمة
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

