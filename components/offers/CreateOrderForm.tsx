"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { formatCurrency } from "@/lib/utils"
import { getFreshCSRFToken } from "@/lib/csrf-client"

interface Offer {
  id: string
  priceRate: number
  minAmount: number
  maxAmount: number
  merchant: {
    userId: string
  }
}

export function CreateOrderForm({ offer }: { offer: Offer }) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const amountNum = parseFloat(amount)

    if (isNaN(amountNum) || amountNum < offer.minAmount || amountNum > offer.maxAmount) {
      toast({
        title: "خطأ",
        description: `المبلغ يجب أن يكون بين ${formatCurrency(offer.minAmount)} و ${formatCurrency(offer.maxAmount)}`,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const csrfToken = await getFreshCSRFToken()
      const dataWithCSRF = {
        offerId: offer.id,
        amount: amountNum,
        _csrf: csrfToken,
      }

      const response = await axios.post("/api/orders/create", dataWithCSRF, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      })

      if (response.data.success) {
        toast({
          title: "تم إنشاء الطلب",
          description: "تم إنشاء الطلب بنجاح",
        })
        router.push(`/orders/${response.data.order.id}`)
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalAmount = amount
    ? (parseFloat(amount) * offer.priceRate).toFixed(2)
    : "0.00"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-2">
          المبلغ المطلوب (USD)
        </label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min={offer.minAmount}
          max={offer.maxAmount}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`${offer.minAmount} - ${offer.maxAmount}`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          الحد الأدنى: {formatCurrency(offer.minAmount)} | الحد الأعلى:{" "}
          {formatCurrency(offer.maxAmount)}
        </p>
      </div>

      {amount && (
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">المبلغ:</span>
            <span className="font-semibold">{formatCurrency(parseFloat(amount) || 0)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">سعر الصرف:</span>
            <span className="font-semibold">{offer.priceRate}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-sm font-medium">المبلغ الإجمالي:</span>
            <span className="font-bold text-lg">{formatCurrency(parseFloat(totalAmount))}</span>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "جاري الإنشاء..." : "إنشاء الطلب"}
      </Button>
    </form>
  )
}

