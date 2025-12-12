import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ResolveDisputeForm } from "@/components/admin/ResolveDisputeForm"
import { OrderEvidence } from "@/components/orders/OrderEvidence"
import { formatCurrency } from "@/lib/utils"

export default async function DisputeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: params.id },
    include: {
      order: {
        include: {
          offer: true,
          buyer: true,
          merchant: {
            include: {
              merchantProfile: true,
            },
          },
        },
      },
      buyer: true,
      merchant: true,
    },
  })

  if (!dispute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">النزاع غير موجود</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/disputes">
          <Button variant="ghost" className="mb-4">← العودة</Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل النزاع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">السبب</p>
                  <p className="font-semibold">{dispute.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">بيان المشتري</p>
                  <p className="bg-gray-50 p-3 rounded mt-1">
                    {dispute.buyerStatement || "لا يوجد"}
                  </p>
                </div>
                {dispute.merchantStatement && (
                  <div>
                    <p className="text-sm text-gray-600">بيان التاجر</p>
                    <p className="bg-gray-50 p-3 rounded mt-1">
                      {dispute.merchantStatement}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">حالة النزاع</p>
                  <p className="font-semibold">{dispute.status}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">المبلغ</p>
                    <p className="font-semibold">
                      {formatCurrency(dispute.order.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                    <p className="font-semibold">
                      {formatCurrency(dispute.order.totalAmount)}
                    </p>
                  </div>
                </div>
                <Link href={`/orders/${dispute.order.id}`}>
                  <Button variant="outline" className="w-full">
                    عرض تفاصيل الطلب الكاملة
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Order Evidence - Show all proofs to admin */}
            <OrderEvidence 
              order={dispute.order} 
              isBuyer={false} 
              isMerchant={false} 
              isAdmin={true} 
            />
          </div>

          <div>
            <ResolveDisputeForm dispute={dispute} />
          </div>
        </div>
      </main>
    </div>
  )
}

