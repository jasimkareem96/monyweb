import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { StatsCharts } from "@/components/admin/StatsCharts"

export default async function AdminStatsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Get comprehensive statistics
  const [
    totalUsers,
    totalMerchants,
    totalBuyers,
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    totalRevenue,
    totalPlatformFees,
    totalPaypalFees,
    activeOffers,
    inactiveOffers,
    pendingDisputes,
    resolvedDisputes,
    topMerchants,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "MERCHANT" } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({
      where: {
        status: {
          in: ["PENDING_QUOTE", "WAITING_PAYMENT", "ESCROWED", "MERCHANT_PROCESSING", "WAITING_BUYER_CONFIRM"],
        },
      },
    }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { platformFee: true },
    }),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { paypalFeeIn: true, paypalFeeOut: true },
    }),
    prisma.offer.count({ where: { isActive: true } }),
    prisma.offer.count({ where: { isActive: false } }),
    prisma.dispute.count({ where: { status: "PENDING" } }),
    prisma.dispute.count({
      where: {
        status: {
          in: ["RESOLVED_MERCHANT", "RESOLVED_BUYER", "CLOSED"],
        },
      },
    }),
    prisma.merchantProfile.findMany({
      include: {
        user: true,
      },
      orderBy: { completedOrders: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: {
        buyer: true,
        merchant: true,
      },
    }),
  ])

  const totalPaypalFeesSum =
    (totalPaypalFees._sum.paypalFeeIn || 0) + (totalPaypalFees._sum.paypalFeeOut || 0)

  // Get data for charts
  const ordersByStatusData = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  })

  const ordersByStatus = ordersByStatusData.map((item) => ({
    status: item.status,
    count: item._count,
  }))

  // Get revenue by month (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const ordersByMonth = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      completedAt: { gte: sixMonthsAgo },
    },
    select: {
      completedAt: true,
      platformFee: true,
    },
  })

  const revenueByMonthMap = new Map<string, number>()
  ordersByMonth.forEach((order) => {
    if (order.completedAt) {
      const month = new Date(order.completedAt).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
      })
      revenueByMonthMap.set(
        month,
        (revenueByMonthMap.get(month) || 0) + (order.platformFee || 0)
      )
    }
  })

  const revenueByMonth = Array.from(revenueByMonthMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Get orders by offer type
  const ordersByTypeData = await prisma.order.groupBy({
    by: ["offerId"],
    _count: true,
  })

  const offerIds = ordersByTypeData.map((item) => item.offerId)
  const offers = await prisma.offer.findMany({
    where: { id: { in: offerIds } },
    select: { id: true, offerType: true },
  })

  const typeCountMap = new Map<string, number>()
  ordersByTypeData.forEach((order) => {
    const offer = offers.find((o) => o.id === order.offerId)
    if (offer) {
      typeCountMap.set(
        offer.offerType,
        (typeCountMap.get(offer.offerType) || 0) + order._count
      )
    }
  })

  const ordersByType = Array.from(typeCountMap.entries()).map(([type, count]) => ({
    type,
    count,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">الإحصائيات الشاملة</h1>
          <Link href="/admin">
            <Button variant="outline">العودة</Button>
          </Link>
        </div>

        {/* Main Statistics */}
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
                {completedOrders} مكتمل | {pendingOrders} معلق | {cancelledOrders} ملغي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إجمالي الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(totalPlatformFees._sum.platformFee || 0)}
              </p>
              <p className="text-sm text-gray-500 mt-2">عمولة المنصة (1%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إجمالي المعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(totalRevenue._sum.totalAmount || 0)}
              </p>
              <p className="text-sm text-gray-500 mt-2">قيمة جميع الطلبات المكتملة</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <StatsCharts
          ordersByStatus={ordersByStatus}
          revenueByMonth={revenueByMonth}
          ordersByType={ordersByType}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Orders Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>المكتملة</span>
                  <span className="font-semibold">{completedOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span>المعلقة</span>
                  <span className="font-semibold">{pendingOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span>الملغية</span>
                  <span className="font-semibold">{cancelledOrders}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold">إجمالي</span>
                    <span className="font-bold text-lg">{totalOrders}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offers Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات العروض</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>النشطة</span>
                  <span className="font-semibold">{activeOffers}</span>
                </div>
                <div className="flex justify-between">
                  <span>المعطلة</span>
                  <span className="font-semibold">{inactiveOffers}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold">الإجمالي</span>
                    <span className="font-bold text-lg">{activeOffers + inactiveOffers}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disputes Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات النزاعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>المعلقة</span>
                  <span className="font-semibold">{pendingDisputes}</span>
                </div>
                <div className="flex justify-between">
                  <span>المحلولة</span>
                  <span className="font-semibold">{resolvedDisputes}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>الإحصائيات المالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>عمولة المنصة</span>
                  <span className="font-semibold">
                    {formatCurrency(totalPlatformFees._sum.platformFee || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم PayPal</span>
                  <span className="font-semibold">{formatCurrency(totalPaypalFeesSum)}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold">صافي الربح</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(
                        (totalPlatformFees._sum.platformFee || 0) - totalPaypalFeesSum
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Merchants */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>أفضل التجار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMerchants.map((merchant, index) => (
                <div key={merchant.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-semibold">
                      #{index + 1} {merchant.user.name}
                    </p>
                    <p className="text-sm text-gray-500">{merchant.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{merchant.completedOrders} طلب مكتمل</p>
                    <p className="text-sm text-gray-500">
                      ⭐ {merchant.averageRating.toFixed(1)} ({merchant.ratingCount} تقييم)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Completed Orders */}
        <Card>
          <CardHeader>
            <CardTitle>آخر الطلبات المكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-semibold">طلب #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {order.buyer.name} → {order.merchant.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-sm text-gray-500">
                      {order.completedAt
                        ? new Date(order.completedAt).toLocaleDateString("ar-SA")
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

