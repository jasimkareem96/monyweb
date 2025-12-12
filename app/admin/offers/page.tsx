import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { OfferAdminFilters } from "@/components/admin/OfferAdminFilters"
import { OfferAdminActions } from "@/components/admin/OfferAdminActions"

const offerTypeLabels: Record<string, string> = {
  PAYPAL_TO_PAYPAL: "PayPal → PayPal",
  PAYPAL_GS: "PayPal G&S",
  PAYPAL_FF: "PayPal F&F",
  PAYPAL_TO_ZAINCASH: "PayPal → ZainCash",
  PAYPAL_TO_BANK_TRANSFER: "PayPal → Bank Transfer",
  PAYPAL_TO_CASH_PICKUP: "PayPal → Cash Pickup",
  PAYPAL_TO_MASTERCARD: "PayPal → Mastercard",
}

export default async function AdminOffersPage({
  searchParams,
}: {
  searchParams: { active?: string; search?: string; page?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const page = parseInt(searchParams.page || "1")
  const pageSize = 20
  const skip = (page - 1) * pageSize

  let where: any = {}

  if (searchParams.active !== undefined) {
    where.isActive = searchParams.active === "true"
  }

  if (searchParams.search) {
    where.OR = [
      { description: { contains: searchParams.search } },
      { merchant: { user: { name: { contains: searchParams.search } } } },
      { merchant: { user: { email: { contains: searchParams.search } } } },
    ]
  }

  const [offers, totalOffers] = await Promise.all([
    prisma.offer.findMany({
      where,
      include: {
        merchant: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.offer.count({ where }),
  ])

  const totalPages = Math.ceil(totalOffers / pageSize)

  // Statistics
  const stats = await Promise.all([
    prisma.offer.count({ where: { isActive: true } }),
    prisma.offer.count({ where: { isActive: false } }),
    prisma.offer.count(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة العروض</h1>
          <Link href="/admin">
            <Button variant="outline">العودة</Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">العروض النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats[0]}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">العروض المعطلة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats[1]}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العروض</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats[2]}</p>
            </CardContent>
          </Card>
        </div>

        <OfferAdminFilters />

        {offers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">لا توجد عروض</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {offers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {offerTypeLabels[offer.offerType] || offer.offerType}
                            </h3>
                            <p className="text-sm text-gray-500">
                              التاجر: {offer.merchant.user.name} ({offer.merchant.user.email})
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              offer.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {offer.isActive ? "نشط" : "معطل"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">سعر الصرف</p>
                            <p className="font-semibold">{offer.priceRate}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">الحد الأدنى</p>
                            <p className="font-semibold">{formatCurrency(offer.minAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">الحد الأعلى</p>
                            <p className="font-semibold">{formatCurrency(offer.maxAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">عدد الطلبات</p>
                            <p className="font-semibold">{offer._count.orders}</p>
                          </div>
                        </div>
                        {offer.description && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">{offer.description}</p>
                          </div>
                        )}
                      </div>
                      <OfferAdminActions offer={offer} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/offers?page=${page - 1}${searchParams.active ? `&active=${searchParams.active}` : ""}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
                  >
                    <Button variant="outline">السابق</Button>
                  </Link>
                )}
                <span className="px-4 py-2">صفحة {page} من {totalPages}</span>
                {page < totalPages && (
                  <Link
                    href={`/admin/offers?page=${page + 1}${searchParams.active ? `&active=${searchParams.active}` : ""}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
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

