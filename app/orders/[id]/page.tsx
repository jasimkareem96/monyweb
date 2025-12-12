import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderActions } from "@/components/orders/OrderActions"
import { OrderEvidence } from "@/components/orders/OrderEvidence"
import { RatingForm } from "@/components/orders/RatingForm"
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

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // CRITICAL: Check authentication FIRST before any data fetching
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=" + encodeURIComponent(`/orders/${params.id}`))
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      offer: true,
      buyer: true,
      merchant: {
        include: {
          merchantProfile: true,
        },
      },
      dispute: true,
      rating: true,
    },
  })

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">الطلب غير موجود</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // CRITICAL: Check authorization - user must be buyer, merchant, or admin
  const hasAccess = 
    session.user.role === "ADMIN" ||
    order.buyerId === session.user.id ||
    order.merchantId === session.user.id

  if (!hasAccess) {
    // Redirect unauthorized users immediately
    redirect("/dashboard?error=unauthorized")
  }

  const isBuyer = order.buyerId === session.user.id
  const isMerchant = order.merchantId === session.user.id
  const isAdmin = session.user.role === "ADMIN"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            طلب #{order.id.slice(0, 8)}
          </h1>
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">المبلغ</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(order.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">سعر الصرف</p>
                    <p className="text-lg font-semibold">
                      {order.exchangeRate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                    <p className="text-lg font-semibold">
                      {new Date(order.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>
                {order.status === "COMPLETED" && order.completedAt && (
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الإكمال</p>
                    <p className="text-lg font-semibold">
                      {new Date(order.completedAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <OrderEvidence order={order} isBuyer={isBuyer} isMerchant={isMerchant} isAdmin={isAdmin} />

            {order.dispute && (
              <Card>
                <CardHeader>
                  <CardTitle>النزاع</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">السبب:</p>
                  <p className="mb-4">{order.dispute.reason}</p>
                  {order.dispute.buyerStatement && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">بيان المشتري:</p>
                      <p>{order.dispute.buyerStatement}</p>
                    </div>
                  )}
                  {order.dispute.merchantStatement && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">بيان التاجر:</p>
                      <p>{order.dispute.merchantStatement}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {order.status === "COMPLETED" && (
              <RatingForm order={order} />
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الأطراف</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">المشتري</p>
                  <p className="font-semibold">{order.buyer.name}</p>
                  <p className="text-sm text-gray-500">{order.buyer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">التاجر</p>
                  <p className="font-semibold">{order.merchant.name}</p>
                  <p className="text-sm text-gray-500">{order.merchant.email}</p>
                  {order.merchant.merchantProfile && (
                    <p className="text-sm text-gray-500 mt-1">
                      التقييم: ⭐{" "}
                      {order.merchant.merchantProfile.averageRating.toFixed(1)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الرسوم والعمولات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Buyer Section */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">المشتري</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">المبلغ المطلوب:</span>
                      <span className="font-semibold">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">سعر الصرف:</span>
                      <span className="font-semibold">
                        {order.exchangeRate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المبلغ الإجمالي المدفوع:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                    {order.paypalFeeIn && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">رسوم PayPal (على المشتري):</span>
                        <span className="font-semibold text-red-600">
                          -{formatCurrency(order.paypalFeeIn)}
                        </span>
                      </div>
                    )}
                    {order.grossIn && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600">المبلغ المستلم من المشتري:</span>
                        <span className="font-semibold">
                          {formatCurrency(order.grossIn)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform Section */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">المنصة</h3>
                  <div className="space-y-2 text-sm">
                    {order.netIn && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">صافي بعد رسوم PayPal:</span>
                        <span className="font-semibold">
                          {formatCurrency(order.netIn)}
                        </span>
                      </div>
                    )}
                    {order.platformFee ? (
                      <div className="flex justify-between">
                        <span className="text-gray-600">عمولة المنصة (1%):</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(order.platformFee)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-600">عمولة المنصة (1%):</span>
                        <span className="font-semibold text-gray-400">
                          {formatCurrency((order.totalAmount || order.amount * order.exchangeRate) * 0.029 + 0.30)}
                        </span>
                        <span className="text-xs text-gray-400">(تقديري)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Merchant Section */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">التاجر</h3>
                  <div className="space-y-2 text-sm">
                    {order.merchantReceivable && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">المبلغ المستحق للتاجر:</span>
                        <span className="font-semibold">
                          {formatCurrency(order.merchantReceivable)}
                        </span>
                      </div>
                    )}
                    {order.paypalFeeOut && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">رسوم PayPal (على التاجر):</span>
                        <span className="font-semibold text-red-600">
                          -{formatCurrency(order.paypalFeeOut)}
                        </span>
                      </div>
                    )}
                    {order.merchantNetFinal ? (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">المبلغ النهائي للتاجر:</span>
                        <span className="font-bold text-lg text-green-600">
                          {formatCurrency(order.merchantNetFinal)}
                        </span>
                      </div>
                    ) : (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">
                          سيتم حساب المبلغ النهائي بعد إكمال الطلب
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {order.status === "COMPLETED" && order.merchantNetFinal && (
                  <div className="pt-4 border-t bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">ملخص:</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>المشتري دفع:</span>
                        <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>رسوم PayPal (المشتري):</span>
                        <span className="font-semibold">-{formatCurrency(order.paypalFeeIn || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>عمولة المنصة:</span>
                        <span className="font-semibold text-green-600">+{formatCurrency(order.platformFee || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>رسوم PayPal (التاجر):</span>
                        <span className="font-semibold">-{formatCurrency(order.paypalFeeOut || 0)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t mt-1">
                        <span className="font-semibold">التاجر يستلم:</span>
                        <span className="font-bold text-green-600">{formatCurrency(order.merchantNetFinal)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <OrderActions order={order} isBuyer={isBuyer} isMerchant={isMerchant} isAdmin={isAdmin} />
          </div>
        </div>
      </main>
    </div>
  )
}

