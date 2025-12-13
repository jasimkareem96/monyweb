import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreateOrderForm } from "@/components/offers/CreateOrderForm"

const offerTypeLabels: Record<string, string> = {
  PAYPAL_TO_PAYPAL: "PayPal → PayPal",
  PAYPAL_GS: "PayPal G&S",
  PAYPAL_FF: "PayPal F&F",
  PAYPAL_TO_ZAINCASH: "PayPal → ZainCash",
  PAYPAL_TO_BANK_TRANSFER: "PayPal → Bank Transfer",
  PAYPAL_TO_CASH_PICKUP: "PayPal → Cash Pickup",
  PAYPAL_TO_MASTERCARD: "PayPal → Mastercard",
}

export default async function OfferDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  // Allow all users (authenticated and unauthenticated) to view offer details
  // Only authenticated buyers can create orders
  const canCreateOrder = session?.user?.role === "BUYER"

  let offer: any = null
  let dbError: string | null = null
  try {
    offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        merchant: {
          include: {
            user: true,
          },
        },
      },
    })
  } catch (error: any) {
    console.error("Offer detail DB error:", error)
    dbError =
      process.env.NODE_ENV === "production"
        ? "تعذر تحميل تفاصيل العرض حالياً بسبب مشكلة في قاعدة البيانات. يرجى المحاولة لاحقاً."
        : error?.message || "Database error"
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <p className="text-gray-700 font-semibold">تعذر تحميل العرض</p>
              <p className="text-sm text-gray-600">
                {dbError}
                {!process.env.DATABASE_URL ? (
                  <>
                    {" "}
                    (مطلوب ضبط <code>DATABASE_URL</code> في إعدادات الاستضافة)
                  </>
                ) : null}
              </p>
              <Link href="/offers">
                <Button>العودة للعروض</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!offer || !offer.isActive) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">العرض غير موجود أو غير نشط</p>
              <Link href="/offers">
                <Button className="mt-4">العودة للعروض</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
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
        <Link href="/offers">
          <Button variant="ghost" className="mb-4">← العودة</Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل العرض</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">نوع العملية</p>
                <p className="text-lg font-semibold">
                  {offerTypeLabels[offer.offerType] || offer.offerType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">سعر الصرف</p>
                <p className="text-lg font-semibold">{offer.priceRate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الحد الأدنى</p>
                <p className="text-lg font-semibold">${offer.minAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الحد الأعلى</p>
                <p className="text-lg font-semibold">${offer.maxAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">سرعة التنفيذ</p>
                <p className="text-lg font-semibold">{offer.speed}</p>
              </div>
              {offer.description && (
                <div>
                  <p className="text-sm text-gray-600">الوصف</p>
                  <p className="text-lg">{offer.description}</p>
                </div>
              )}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">التاجر</p>
                <p className="text-lg font-semibold">
                  {offer.merchant.user.name}
                </p>
                <p className="text-sm text-gray-500">
                  التقييم: ⭐ {offer.merchant.averageRating.toFixed(1)} (
                  {offer.merchant.ratingCount} تقييم)
                </p>
                <p className="text-sm text-gray-500">
                  الطلبات المكتملة: {offer.merchant.completedOrders}
                </p>
              </div>
            </CardContent>
          </Card>

          {canCreateOrder ? (
            <Card>
              <CardHeader>
                <CardTitle>إنشاء طلب جديد</CardTitle>
                <CardDescription>
                  أدخل المبلغ المطلوب لإنشاء طلب جديد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateOrderForm offer={offer} />
              </CardContent>
            </Card>
          ) : !session ? (
            <Card>
              <CardHeader>
                <CardTitle>إنشاء طلب جديد</CardTitle>
                <CardDescription>
                  يجب تسجيل الدخول لعمل صفقة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center py-4">
                  لتتمكن من عمل صفقة وشراء هذا العرض، يجب عليك تسجيل الدخول أولاً
                </p>
                <div className="flex gap-2">
                  <Link href="/auth/signin" className="flex-1">
                    <Button className="w-full">تسجيل الدخول</Button>
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <Button className="w-full" variant="outline">إنشاء حساب</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>إنشاء طلب جديد</CardTitle>
                <CardDescription>
                  فقط المشترون يمكنهم إنشاء طلبات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-4">
                  يجب أن تكون مشترياً لإنشاء طلب جديد
                </p>
                <Link href="/dashboard">
                  <Button className="w-full">العودة إلى لوحة التحكم</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

