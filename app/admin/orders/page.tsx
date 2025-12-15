import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export default async function AdminOrdersPage() {
  const [
    pendingQuote,
    waitingPayment,
    proofsSubmitted,
    escrowed,
    completed,
    cancelled,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING_QUOTE" } }),
    prisma.order.count({ where: { status: "WAITING_PAYMENT" } }),
    prisma.order.count({ where: { status: "PROOFS_SUBMITTED" } }),
    prisma.order.count({ where: { status: "ESCROWED" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
  ])

  return (
    <div className="space-y-6">
      {/* الإحصائيات */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              في انتظار التأكيد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingQuote}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              بانتظار الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{waitingPayment}</p>
          </CardContent>
        </Card>

        {/* بانتظار مراجعة الإثباتات */}
        <Card className="border-orange-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">
              بانتظار مراجعة الإثباتات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {proofsSubmitted}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              الأموال محجوزة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{escrowed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              مكتمل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              ملغي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* تنبيه للأدمن */}
      <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
        الطلبات بحالة{" "}
        <strong className="text-orange-600">
          بانتظار مراجعة الإثباتات
        </strong>{" "}
        تحتاج إجراء يدوي من الأدمن (قبول أو رفض).
      </div>
    </div>
  )
}
