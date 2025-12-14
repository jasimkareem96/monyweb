import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { OfferFilters } from "@/components/offers/OfferFilters"

const offerTypeLabels: Record<string, string> = {
  PAYPAL_TO_PAYPAL: "PayPal → PayPal",
  PAYPAL_GS: "PayPal G&S",
  PAYPAL_FF: "PayPal F&F",
  PAYPAL_TO_ZAINCASH: "PayPal → ZainCash",
  PAYPAL_TO_BANK_TRANSFER: "PayPal → Bank Transfer",
  PAYPAL_TO_CASH_PICKUP: "PayPal → Cash Pickup",
  PAYPAL_TO_MASTERCARD: "PayPal → Mastercard",
}

const tierLabels: Record<string, string> = {
  BRONZE: "برونزي",
  SILVER: "فضي",
  GOLD: "ذهبي",
}

export default async function OffersPage({
  searchParams,
}: {
  searchParams: {
    sort?: string
    type?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    online?: string
    tier?: string
    minRating?: string
  }
}) {
  const session = await getServerSession(authOptions)
  const buildCommit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null

  // Allow both authenticated and unauthenticated users to view offers

  let where: any = { isActive: true }
  let orderBy: any = { createdAt: "desc" }

  // Search in description
  if (searchParams.search) {
    where.description = { contains: searchParams.search }
  }

  // Price range
  if (searchParams.minPrice) {
    where.minAmount = { gte: parseFloat(searchParams.minPrice) }
  }
  if (searchParams.maxPrice) {
    where.maxAmount = { lte: parseFloat(searchParams.maxPrice) }
  }

  // Offer type
  if (searchParams.type) {
    where.offerType = searchParams.type
  }

  // Online status
  if (searchParams.online !== undefined) {
    where.merchant = {
      isOnline: searchParams.online === "true",
    }
  }

  // Tier
  if (searchParams.tier) {
    where.merchant = {
      ...where.merchant,
      tier: searchParams.tier,
    }
  }

  // Min rating
  if (searchParams.minRating) {
    where.merchant = {
      ...where.merchant,
      averageRating: { gte: parseFloat(searchParams.minRating) },
    }
  }

  // Sort
  if (searchParams.sort === "price") {
    orderBy = { priceRate: "asc" }
  } else if (searchParams.sort === "rating") {
    orderBy = { merchant: { averageRating: "desc" } }
  } else if (searchParams.sort === "speed") {
    orderBy = { speed: "asc" }
  }

  let offers: any[] = []
  let dbError: string | null = null
  try {
    offers = await prisma.offer.findMany({
      where,
      include: {
        merchant: {
          include: {
            user: true,
          },
        },
      },
      orderBy,
    })
  } catch (error: any) {
    console.error("Offers page DB error:", error)
    // Avoid leaking details in production
    dbError =
      process.env.NODE_ENV === "production"
        ? "تعذر تحميل العروض حالياً بسبب مشكلة في قاعدة البيانات. يرجى المحاولة لاحقاً."
        : error?.message || "Database error"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session ? <Navbar /> : (
        <nav className="border-b bg-white">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary-600">MonyWeb</h1>
            </Link>
            <div className="flex gap-4">
              <Link href="/auth/signin">
                <Button variant="ghost">تسجيل الدخول</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>إنشاء حساب</Button>
              </Link>
            </div>
          </div>
        </nav>
      )}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">العروض المتاحة</h1>
          <OfferFilters />
        </div>

        {dbError ? (
          <Card>
            <CardHeader>
              <CardTitle>تعذر تحميل العروض</CardTitle>
              <CardDescription>
                {dbError}
                {!process.env.DATABASE_URL ? (
                  <>
                    {" "}
                    (مطلوب ضبط <code>DATABASE_URL</code> في إعدادات الاستضافة)
                  </>
                ) : null}
                {buildCommit ? (
                  <>
                    {" "}
                    <span className="text-xs text-gray-400">(Build: {buildCommit})</span>
                  </>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/">
                <Button variant="outline">العودة للصفحة الرئيسية</Button>
              </Link>
            </CardContent>
          </Card>
        ) : offers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">لا توجد عروض متاحة حالياً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {offerTypeLabels[offer.offerType] || offer.offerType}
                      </CardTitle>
                      <CardDescription>
                        سعر الصرف: {offer.priceRate}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        offer.merchant.isOnline
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {offer.merchant.isOnline ? "متصل" : "غير متصل"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium">الحد الأدنى:</span>{" "}
                      {formatCurrency(offer.minAmount)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">الحد الأعلى:</span>{" "}
                      {formatCurrency(offer.maxAmount)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">السرعة:</span> {offer.speed}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">التاجر:</span>
                      <span className="text-sm">{offer.merchant.user.name}</span>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        {tierLabels[offer.merchant.tier] || offer.merchant.tier}
                      </span>
                    </div>
                    {offer.merchant.averageRating > 0 && (
                      <p className="text-sm">
                        <span className="font-medium">التقييم:</span> ⭐{" "}
                        {offer.merchant.averageRating.toFixed(1)} (
                        {offer.merchant.ratingCount})
                      </p>
                    )}
                    {offer.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {offer.description}
                      </p>
                    )}
                  </div>
                  {session ? (
                    <Link href={`/offers/${offer.id}`}>
                      <Button className="w-full">اختر هذا العرض</Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signin">
                      <Button className="w-full" variant="outline">
                        سجل دخول لعمل صفقة
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

