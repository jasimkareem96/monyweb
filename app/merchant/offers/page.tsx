import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { CreateOfferForm } from "@/components/merchant/CreateOfferForm"
import { ToggleOfferButton } from "@/components/merchant/ToggleOfferButton"

export const revalidate = 0 // Always revalidate to get fresh data

const offerTypeLabels: Record<string, string> = {
  PAYPAL_TO_PAYPAL: "PayPal → PayPal",
  PAYPAL_GS: "PayPal G&S",
  PAYPAL_FF: "PayPal F&F",
  PAYPAL_TO_ZAINCASH: "PayPal → ZainCash",
  PAYPAL_TO_BANK_TRANSFER: "PayPal → Bank Transfer",
  PAYPAL_TO_CASH_PICKUP: "PayPal → Cash Pickup",
  PAYPAL_TO_MASTERCARD: "PayPal → Mastercard",
}

export default async function MerchantOffersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "MERCHANT") {
    redirect("/dashboard")
  }

  const merchantProfile = await prisma.merchantProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      offers: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!merchantProfile) {
    redirect("/dashboard")
  }

  // Calculate if can create/activate new offer
  const activeOffers = merchantProfile.offers.filter(o => o.isActive)
  const hasActiveOffer = activeOffers.length > 0
  
  let canCreateNewOffer = false
  let canActivateOffer = false
  let minutesRemaining = 0
  
  // Can create new offer if no active offer
  if (!hasActiveOffer) {
    if (merchantProfile.lastOfferCreatedAt) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const lastOfferTime = new Date(merchantProfile.lastOfferCreatedAt)
      canCreateNewOffer = lastOfferTime <= oneHourAgo
      canActivateOffer = lastOfferTime <= oneHourAgo
      if (!canCreateNewOffer) {
        minutesRemaining = Math.ceil((lastOfferTime.getTime() - oneHourAgo.getTime()) / (1000 * 60))
      }
    } else {
      canCreateNewOffer = true
      canActivateOffer = true
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">عروضي</h1>
          {canCreateNewOffer && (
            <CreateOfferForm merchantId={merchantProfile.id} merchantProfile={merchantProfile} />
          )}
        </div>

        {/* Check active offers */}
        {hasActiveOffer && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-sm text-yellow-800 font-semibold mb-2">
                ⚠️ لديك عرض نشط واحد
              </p>
              <p className="text-xs text-yellow-700">
                يمكنك إنشاء عرض واحد فقط في كل وقت. يجب إلغاء تفعيل العرض الحالي أولاً قبل إنشاء عرض جديد.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Check time restriction */}
        {!hasActiveOffer && !canCreateNewOffer && minutesRemaining > 0 && (
          <Card className="mb-6 border-blue-300 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                ⏰ قيد الانتظار
              </p>
              <p className="text-sm text-blue-700">
                يجب الانتظار {minutesRemaining} دقيقة قبل إنشاء أو تفعيل عرض جديد.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                آخر عرض تم إنشاؤه/تفعيله: {merchantProfile.lastOfferCreatedAt ? new Date(merchantProfile.lastOfferCreatedAt).toLocaleString("ar-SA") : "لا يوجد"}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                يمكنك إنشاء أو تفعيل عرض واحد كل ساعة واحدة.
              </p>
            </CardContent>
          </Card>
        )}

        {merchantProfile.offers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">لا توجد عروض حالياً</p>
              {canCreateNewOffer ? (
                <CreateOfferForm merchantId={merchantProfile.id} merchantProfile={merchantProfile} />
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-2">
                    يجب الانتظار قبل إنشاء عرض جديد
                  </p>
                  {merchantProfile.lastOfferCreatedAt && (
                    <p className="text-sm text-gray-400">
                      آخر عرض تم إنشاؤه: {new Date(merchantProfile.lastOfferCreatedAt).toLocaleString("ar-SA")}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchantProfile.offers.map((offer) => (
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
                        offer.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {offer.isActive ? "نشط" : "غير نشط"}
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
                    {offer.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {offer.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!offer.isActive && !hasActiveOffer && (
                      <div className="flex-1">
                        <ToggleOfferButton
                          offerId={offer.id}
                          isActive={false}
                          disabled={!canActivateOffer}
                          disabledMessage={
                            !canActivateOffer
                              ? `يجب الانتظار ${minutesRemaining} دقيقة`
                              : ""
                          }
                        />
                      </div>
                    )}
                    {offer.isActive && (
                      <div className="flex-1">
                        <ToggleOfferButton
                          offerId={offer.id}
                          isActive={true}
                        />
                      </div>
                    )}
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

