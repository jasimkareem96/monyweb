import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import OrderReviewActions from "@/components/admin/OrderReviewActions"

export default async function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { buyer: true, merchant: true, offer: true },
  })

  if (!order) redirect("/admin/orders")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">تفاصيل الطلب #{order.id.slice(0, 8)}</h1>
          <Link href="/admin/orders">
            <Button variant="outline">رجوع</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">المبلغ</CardTitle></CardHeader>
            <CardContent className="text-xl font-bold">{formatCurrency(order.amount)}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">الحالة</CardTitle></CardHeader>
            <CardContent className="text-xl font-bold">{order.status}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">رقم العملية</CardTitle></CardHeader>
            <CardContent className="text-sm font-medium">
              {order.paypalTransactionId || "—"}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>بيانات الأطراف</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">المشتري</p>
              <p className="font-semibold">{order.buyer?.name}</p>
              <p className="text-gray-600">{order.buyer?.email}</p>
            </div>
            <div>
              <p className="text-gray-500">التاجر</p>
              <p className="font-semibold">{order.merchant?.name}</p>
              <p className="text-gray-600">{order.merchant?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>إثباتات الدفع</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p><span className="font-semibold">نص التأكيد:</span> {order.buyerConfirmationText || "—"}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-semibold">قبل الدفع</p>
                {order.buyerBeforePaymentProof ? (
                  <a href={order.buyerBeforePaymentProof} target="_blank" rel="noreferrer">
                    <img
                      src={order.buyerBeforePaymentProof}
                      alt="before proof"
                      className="w-full rounded-lg border bg-white"
                    />
                  </a>
                ) : (
                  <p className="text-gray-500">لا يوجد</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-semibold">بعد الدفع</p>
                {order.buyerAfterPaymentProof ? (
                  <a href={order.buyerAfterPaymentProof} target="_blank" rel="noreferrer">
                    <img
                      src={order.buyerAfterPaymentProof}
                      alt="after proof"
                      className="w-full rounded-lg border bg-white"
                    />
                  </a>
                ) : (
                  <p className="text-gray-500">لا يوجد</p>
                )}
              </div>
            </div>

            <OrderReviewActions orderId={order.id} currentStatus={order.status} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
