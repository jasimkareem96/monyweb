import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { OrderFilters } from "@/components/admin/OrderFilters"

const statusLabels: Record<string, string> = {
  PENDING_QUOTE: "في انتظار التأكيد",
  WAITING_PAYMENT: "بانتظار الدفع",
  PROOFS_SUBMITTED: "بانتظار مراجعة الإثباتات",
  ESCROWED: "الأموال محجوزة",
  MERCHANT_PROCESSING: "التاجر ينفذ العملية",
  WAITING_BUYER_CONFIRM: "بانتظار تأكيد المشتري",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
  EXPIRED: "منتهي",
}

function statusLink(status?: string) {
  return status ? `/admin/orders?status=${encodeURIComponent(status)}` : "/admin/orders"
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const page = Math.max(1, parseInt(searchParams.page || "1", 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: any = {}

  if (searchParams.status && searchParams.status !== "ALL") {
    where.status = searchParams.status
  }

  if (searchParams.search?.trim()) {
    const q = searchParams.search.trim()
    where.OR = [
      { id: { contains: q } },
      { buyer: { name: { contains: q } } },
      { buyer: { email: { contains: q } } },
      { merchant: { name: { contains: q } } },
      { merchant: { email: { contains: q } } },
    ]
  }

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        offer: true,
        buyer: true,
        merchant: { include: { merchantProfile: true } },
        dispute: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(totalOrders / pageSize)

  // ✅ إحصائيات عامة (بدون فلتر where)
  const [pendingQuote, waitingPayment, proofsSubmitted, escrowed, completed, cancelled] =
    await Promise.all([
      prisma.order.count({ where: { status: "PENDING_QUOTE" } }),
      prisma.order.count({ where: { status: "WAITING_PAYMENT" } }),
      prisma.order.count({ where: { status: "PROOFS_SUBMITTED" } }),
      prisma.order.count({ where: { status: "ESCROWED" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
    ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <Link href="/admin">
            <Button variant="outline">العودة</Button>
          </Link>
        </div>

        {/* ✅ Cards clickable */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Link href={statusLink("PENDING_QUOTE")}>
            <Card className="cursor-pointer hover:shadow-sm transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">في انتظار التأكيد</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{pendingQuote}</p>
              </CardContent>
            </Card>
          </Link>

          <Link href={statusLink("WAITING_PAYMENT")}>
            <Card className="cursor-pointer hover:shadow-sm transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">بانتظار الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{waitingPayment}</p>
              </CardContent>
            </Card>
          </Link>

          <Link href={statusLink("PROOFS_SUBMITTED")}>
            <Card className="cursor-pointer hover:shadow-sm transition border-orange-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">
                  بانتظار مراجعة الإثباتات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-700">{proofsSubmitted}</p>
              </CardContent>
            </Card>
          </Link>

          <Link href={statusLink("ESCROWED")}>
            <Card className="cursor-pointer hover:shadow-sm transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">الأموال محجوزة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{escrowed}</p>
              </CardContent>
            </Card>
          </Link>

          <Link href={statusLink("COMPLETED")}>
            <Card className="cursor-pointer hover:shadow-sm transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">مكتمل</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{completed}</p>
              </CardContent>
            </Card>
          </Link>

          <Link href={statusLink("CANCELLED")}>
            <Card className="cursor-pointer hover:shadow-sm transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ملغي</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{cancelled}</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* ✅ Filters */}
        <OrderFilters />

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              لا توجد طلبات لهذه الحالة
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {orders.map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-lg font-semibold text-primary-600 hover:underline"
                          >
                            طلب #{order.id.slice(0, 8)}
                          </Link>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "CANCELLED" || order.status === "EXPIRED"
                                ? "bg-red-100 text-red-800"
                                : order.status === "PROOFS_SUBMITTED"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {statusLabels[order.status] || order.status}
                          </span>

                          {order.dispute && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              نزاع
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">المبلغ</p>
                            <p className="font-semibold">{formatCurrency(order.amount)}</p>
                          </div>

                          <div>
                            <p className="text-gray-600">المشتري</p>
                            <p className="font-semibold">{order.buyer?.name}</p>
                            <p className="text-xs text-gray-500">{order.buyer?.email}</p>
                          </div>

                          <div>
                            <p className="text-gray-600">التاجر</p>
                            <p className="font-semibold">{order.merchant?.name}</p>
                            <p className="text-xs text-gray-500">{order.merchant?.email}</p>
                          </div>

                          <div>
                            <p className="text-gray-600">التاريخ</p>
                            <p className="font-semibold">
                              {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm">عرض التفاصيل</Button>
                        </Link>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">صفحة الطلب</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/orders?page=${page - 1}${
                      searchParams.status ? `&status=${searchParams.status}` : ""
                    }${searchParams.search ? `&search=${searchParams.search}` : ""}`}
                  >
                    <Button variant="outline">السابق</Button>
                  </Link>
                )}
                <span className="px-4 py-2">
                  صفحة {page} من {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/admin/orders?page=${page + 1}${
                      searchParams.status ? `&status=${searchParams.status}` : ""
                    }${searchParams.search ? `&search=${searchParams.search}` : ""}`}
                  >
                    <Button variant="outline">التالي</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
