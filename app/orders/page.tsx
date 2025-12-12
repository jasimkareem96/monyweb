import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

const statusLabels: Record<string, string> = {
  PENDING_QUOTE: "في انتظار التأكيد",
  WAITING_PAYMENT: "بانتظار الدفع",
  ESCROWED: "الأموال محجوزة",
  MERCHANT_PROCESSING: "التاجر ينفذ العملية",
  WAITING_BUYER_CONFIRM: "بانتظار تأكيد المشتري",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
  EXPIRED: "منتهي",
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  let orders

  if (session.user.role === "BUYER") {
    orders = await prisma.order.findMany({
      where: { buyerId: session.user.id },
      include: {
        offer: true,
        merchant: {
          include: {
            merchantProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } else if (session.user.role === "MERCHANT") {
    orders = await prisma.order.findMany({
      where: { merchantId: session.user.id },
      include: {
        offer: true,
        buyer: true,
      },
      orderBy: { createdAt: "desc" },
    })
  } else {
    orders = await prisma.order.findMany({
      include: {
        offer: true,
        buyer: true,
        merchant: {
          include: {
            merchantProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">الطلبات</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">لا توجد طلبات</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Link
                          href={`/orders/${order.id}`}
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
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">المبلغ</p>
                          <p className="font-semibold">
                            {formatCurrency(order.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">المبلغ الإجمالي</p>
                          <p className="font-semibold">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                        {session.user.role === "BUYER" && "merchant" in order && (
                          <div>
                            <p className="text-gray-600">التاجر</p>
                            <p className="font-semibold">
                              {order.merchant.name}
                            </p>
                          </div>
                        )}
                        {session.user.role === "MERCHANT" && "buyer" in order && (
                          <div>
                            <p className="text-gray-600">المشتري</p>
                            <p className="font-semibold">{order.buyer.name}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-600">التاريخ</p>
                          <p className="font-semibold">
                            {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link href={`/orders/${order.id}`}>
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                        عرض التفاصيل
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

