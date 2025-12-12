import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DisputeFilters } from "@/components/admin/DisputeFilters"

const statusLabels: Record<string, string> = {
  PENDING: "معلق",
  UNDER_REVIEW: "قيد المراجعة",
  RESOLVED_MERCHANT: "تم الحل لصالح التاجر",
  RESOLVED_BUYER: "تم الحل لصالح المشتري",
  CLOSED: "مغلق",
}

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  let where: any = {}

  if (searchParams.status) {
    where.status = searchParams.status
  }

  if (searchParams.search) {
    where.OR = [
      { reason: { contains: searchParams.search } },
      { buyer: { name: { contains: searchParams.search } } },
      { buyer: { email: { contains: searchParams.search } } },
      { merchant: { name: { contains: searchParams.search } } },
      { merchant: { email: { contains: searchParams.search } } },
    ]
  }

  const [disputes, stats] = await Promise.all([
    prisma.dispute.findMany({
    where,
    include: {
      order: {
        include: {
          buyer: true,
          merchant: true,
        },
      },
      buyer: true,
      merchant: true,
    },
      orderBy: { createdAt: "desc" },
    }),
    Promise.all([
      prisma.dispute.count({ where: { status: "PENDING" } }),
      prisma.dispute.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.dispute.count({
        where: { status: { in: ["RESOLVED_MERCHANT", "RESOLVED_BUYER", "CLOSED"] } },
      }),
      prisma.dispute.count(),
    ]),
  ])

  const [pendingCount, underReviewCount, resolvedCount, totalCount] = stats

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">النزاعات</h1>
          <Link href="/admin">
            <Button variant="outline">العودة</Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">معلقة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{underReviewCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">محلولة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{resolvedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">الإجمالي</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalCount}</p>
            </CardContent>
          </Card>
        </div>

        <DisputeFilters />

        {disputes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">لا توجد نزاعات</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Card key={dispute.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Link
                          href={`/admin/disputes/${dispute.id}`}
                          className="text-lg font-semibold text-primary-600 hover:underline"
                        >
                          نزاع #{dispute.id.slice(0, 8)}
                        </Link>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            dispute.status === "PENDING" || dispute.status === "UNDER_REVIEW"
                              ? "bg-yellow-100 text-yellow-800"
                              : dispute.status === "RESOLVED_MERCHANT"
                              ? "bg-blue-100 text-blue-800"
                              : dispute.status === "RESOLVED_BUYER"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusLabels[dispute.status] || dispute.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">المشتري</p>
                          <p className="font-semibold">{dispute.buyer.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">التاجر</p>
                          <p className="font-semibold">{dispute.merchant.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">السبب</p>
                          <p className="font-semibold">{dispute.reason}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">التاريخ</p>
                          <p className="font-semibold">
                            {new Date(dispute.createdAt).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                      </div>
                      {dispute.buyerStatement && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-1">بيان المشتري:</p>
                          <p className="text-sm bg-gray-50 p-3 rounded">
                            {dispute.buyerStatement}
                          </p>
                        </div>
                      )}
                    </div>
                    <Link href={`/admin/disputes/${dispute.id}`}>
                      <Button>مراجعة</Button>
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

