import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const [
    totalUsers,
    totalMerchants,
    totalBuyers,
    totalOrders,
    completedOrders,
    pendingDisputes,
    activeOffers,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "MERCHANT" } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.dispute.count({ where: { status: "PENDING" } }),
    prisma.offer.count({ where: { isActive: true } }),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { platformFee: true },
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">لوحة التحكم الإدارية</h1>
          <Link href="/admin/verifications">
            <Button>مراجعة طلبات التحقق</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>إجمالي المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalUsers}</p>
              <p className="text-sm text-gray-500 mt-2">
                {totalMerchants} تاجر | {totalBuyers} مشتري
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إجمالي الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalOrders}</p>
              <p className="text-sm text-gray-500 mt-2">
                {completedOrders} مكتمل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>العروض النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeOffers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>النزاعات المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingDisputes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إجمالي الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(totalRevenue._sum.platformFee || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/orders">
                <Button className="w-full">عرض جميع الطلبات</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إدارة النزاعات</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/disputes">
                <Button className="w-full">عرض النزاعات</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إدارة المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full">عرض المستخدمين</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إدارة العروض</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/offers">
                <Button className="w-full">عرض جميع العروض</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الإحصائيات</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/stats">
                <Button className="w-full">عرض الإحصائيات</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

