"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

const offerTypes = [
  { value: "PAYPAL_TO_PAYPAL", label: "PayPal → PayPal" },
  { value: "PAYPAL_GS", label: "PayPal G&S" },
  { value: "PAYPAL_FF", label: "PayPal F&F" },
  { value: "PAYPAL_TO_ZAINCASH", label: "PayPal → ZainCash" },
  { value: "PAYPAL_TO_BANK_TRANSFER", label: "PayPal → Bank Transfer" },
  { value: "PAYPAL_TO_CASH_PICKUP", label: "PayPal → Cash Pickup" },
  { value: "PAYPAL_TO_MASTERCARD", label: "PayPal → Mastercard" },
]

interface MerchantProfile {
  id: string
  lastOfferCreatedAt: Date | null
}

export function CreateOfferForm({ 
  merchantId, 
  merchantProfile 
}: { 
  merchantId: string
  merchantProfile?: MerchantProfile 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    offerType: "",
    priceRate: "",
    minAmount: "",
    maxAmount: "",
    speed: "",
    description: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canCreate) {
      toast({
        title: "غير مسموح",
        description: `يجب الانتظار ${minutesRemaining} دقيقة قبل إنشاء عرض جديد`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post("/api/offers/create", {
        merchantId,
        ...formData,
        priceRate: parseFloat(formData.priceRate),
        minAmount: parseFloat(formData.minAmount),
        maxAmount: parseFloat(formData.maxAmount),
      })

      if (response.data.success) {
        toast({
          title: "تم إنشاء العرض",
          description: "تم إنشاء العرض بنجاح",
        })
        setIsOpen(false)
        setFormData({
          offerType: "",
          priceRate: "",
          minAmount: "",
          maxAmount: "",
          speed: "",
          description: "",
        })
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "حدث خطأ أثناء إنشاء العرض",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if can create offer
  const canCreateOffer = () => {
    if (!merchantProfile) return true
    
    // Check time restriction
    if (merchantProfile.lastOfferCreatedAt) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const lastOfferTime = new Date(merchantProfile.lastOfferCreatedAt)
      return lastOfferTime <= oneHourAgo
    }
    return true
  }

  const canCreate = canCreateOffer()
  const getTimeRemaining = () => {
    if (!merchantProfile?.lastOfferCreatedAt) return 0
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const lastOfferTime = new Date(merchantProfile.lastOfferCreatedAt)
    if (lastOfferTime <= oneHourAgo) return 0
    return Math.ceil((lastOfferTime.getTime() - oneHourAgo.getTime()) / (1000 * 60))
  }

  const minutesRemaining = getTimeRemaining()

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)} 
        disabled={!canCreate}
        title={!canCreate ? `يجب الانتظار ${minutesRemaining} دقيقة` : ""}
      >
        {canCreate ? "إنشاء عرض جديد" : `انتظر ${minutesRemaining} دقيقة`}
      </Button>
    )
  }

  return (
    <Card className="fixed inset-4 md:inset-auto md:relative md:max-w-2xl md:mx-auto z-50">
      <CardHeader>
        <CardTitle>إنشاء عرض جديد</CardTitle>
        <CardDescription>أدخل تفاصيل العرض المالي</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">نوع العملية</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={formData.offerType}
              onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
              required
            >
              <option value="">اختر النوع</option>
              {offerTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">سعر الصرف</label>
            <Input
              type="number"
              step="0.01"
              value={formData.priceRate}
              onChange={(e) => setFormData({ ...formData, priceRate: e.target.value })}
              placeholder="1.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">الحد الأدنى (USD)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                placeholder="10.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الحد الأعلى (USD)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                placeholder="1000.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">سرعة التنفيذ</label>
            <Input
              type="text"
              value={formData.speed}
              onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
              placeholder="مثال: 5-10 دقائق"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الوصف (اختياري)</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف إضافي للعرض..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "جاري الإنشاء..." : "إنشاء العرض"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

