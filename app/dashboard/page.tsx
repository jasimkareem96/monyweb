import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  // Check verification status (except for ADMIN)
  if (session.user.role !== "ADMIN") {
    const verification = await prisma.verification.findUnique({
      where: { userId: session.user.id },
    })

    if (!verification || verification.status !== "APPROVED") {
      redirect("/profile")
    }
  }

  let stats = null

  try {
    if (session.user.role === "MERCHANT") {
      const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        offers: true,
        user: {
          include: {
            ordersAsMerchant: true,
          },
        },
      },
    })

    const orders = merchantProfile?.user.ordersAsMerchant || []
    const activeOffers = merchantProfile?.offers.filter(o => o.isActive).length || 0
    const completedOrders = orders.filter(o => o.status === "COMPLETED").length

    stats = {
      activeOffers,
      totalOrders: orders.length,
      completedOrders,
      averageRating: merchantProfile?.averageRating || 0,
    }
  } else if (session.user.role === "BUYER") {
    const orders = await prisma.order.findMany({
      where: { buyerId: session.user.id },
    })

    stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => ["PENDING_QUOTE", "WAITING_PAYMENT", "ESCROWED"].includes(o.status)).length,
      completedOrders: orders.filter(o => o.status === "COMPLETED").length,
    }
  } else if (session.user.role === "ADMIN") {
    const [users, orders, offers, disputes] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.offer.count({ where: { isActive: true } }),
      prisma.dispute.count({ where: { status: "PENDING" } }),
    ])

    stats = {
      totalUsers: users,
      totalOrders: orders,
      activeOffers: offers,
      pendingDisputes: disputes,
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {session.user.role === "MERCHANT" && stats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>العروض النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.activeOffers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>إجمالي الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>الطلبات المكتملة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.completedOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>التقييم المتوسط</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{(stats.averageRating || 0).toFixed(1)}</p>
                </CardContent>
              </Card>
            </>
          )}

          {session.user.role === "BUYER" && stats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>إجمالي الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>الطلبات المعلقة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>الطلبات المكتملة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.completedOrders}</p>
                </CardContent>
              </Card>
            </>
          )}

          {session.user.role === "ADMIN" && stats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>إجمالي المستخدمين</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>إجمالي الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>العروض النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.activeOffers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>النزاعات المعلقة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.pendingDisputes}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {session.user.role === "MERCHANT" && (
            <Card>
              <CardHeader>
                <CardTitle>إدارة العروض</CardTitle>
                <CardDescription>أنشئ أو عدّل عروضك المالية</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/merchant/offers">
                  <Button className="w-full">إدارة العروض</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>الطلبات</CardTitle>
              <CardDescription>عرض وإدارة جميع طلباتك</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/orders">
                <Button className="w-full">عرض الطلبات</Button>
              </Link>
            </CardContent>
          </Card>

          {session.user.role === "BUYER" && (
            <Card>
              <CardHeader>
                <CardTitle>تصفح العروض</CardTitle>
                <CardDescription>ابحث عن أفضل العروض المالية</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/offers">
                  <Button className="w-full">تصفح العروض</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {session.user.role === "ADMIN" && (
            <Card>
              <CardHeader>
                <CardTitle>لوحة التحكم الإدارية</CardTitle>
                <CardDescription>إدارة المنصة بالكامل</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button className="w-full">الذهاب للوحة التحكم</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
  } catch (error: any) {
    console.error("Dashboard error:", error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>خطأ في الاتصال</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">
                {error.code === "P1001" || error.message?.includes("connect")
                  ? "خطأ في الاتصال بقاعدة البيانات. يرجى التحقق من إعدادات قاعدة البيانات في ملف .env"
                  : "حدث خطأ أثناء تحميل البيانات"}
              </p>
              <p className="text-sm text-gray-600">
                تأكد من:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                <li>إعداد ملف .env مع DATABASE_URL</li>
                <li>تشغيل الأمر: npx prisma db push</li>
                <li>أن قاعدة البيانات تعمل</li>
              </ul>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }
}

