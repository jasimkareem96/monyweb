"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

interface Order {
  id: string
  status: string
  buyerId: string
  merchantId: string
  buyerConfirmedReceived: boolean | null
  dispute?: {
    id: string
  } | null
}

export function OrderActions({
  order,
  isBuyer,
  isMerchant,
  isAdmin,
}: {
  order: Order
  isBuyer: boolean
  isMerchant: boolean
  isAdmin: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  // CRITICAL: Don't render anything if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.pathname))
    }
  }, [status, router])

  // Don't render if not authenticated
  if (status === "unauthenticated" || !session) {
    return null
  }

  const handleAction = async (action: string, data?: any) => {
    setIsLoading(true)
    try {
      const response = await axios.post(`/api/orders/${order.id}/${action}`, data || {})
      
      if (response.data.success) {
        toast({
          title: "تم بنجاح",
          description: response.data.message || "تم تنفيذ العملية بنجاح",
        })
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "حدث خطأ أثناء تنفيذ العملية",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>الإجراءات</CardTitle>
        <CardDescription>إجراءات متاحة حسب حالة الطلب</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isBuyer && order.status === "PENDING_QUOTE" && (
          <Button
            className="w-full"
            onClick={() => handleAction("confirm")}
            disabled={isLoading}
          >
            تأكيد الطلب
          </Button>
        )}

        {isBuyer && order.status === "WAITING_PAYMENT" && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push(`/orders/${order.id}/payment`)}
          >
            📤 رفع إثباتات الدفع
          </Button>
        )}

        {isBuyer && order.status === "WAITING_BUYER_CONFIRM" && (
          <>
            <Button
              className="w-full"
              onClick={() => handleAction("confirm-received")}
              disabled={isLoading}
            >
              تأكيد الاستلام
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => router.push(`/orders/${order.id}/dispute`)}
            >
              رفع نزاع
            </Button>
          </>
        )}

        {isMerchant && order.status === "ESCROWED" && (
          <>
            <Button
              className="w-full"
              onClick={() => handleAction("start-processing")}
              disabled={isLoading}
            >
              بدء المعالجة
            </Button>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => router.push(`/orders/${order.id}/delivery`)}
            >
              📤 رفع إثبات التسليم
            </Button>
          </>
        )}

        {isMerchant && order.status === "MERCHANT_PROCESSING" && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => router.push(`/orders/${order.id}/delivery`)}
          >
            📤 رفع إثبات التسليم
          </Button>
        )}

        {(isBuyer || isMerchant) && 
         !["COMPLETED", "CANCELLED", "EXPIRED"].includes(order.status) && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => handleAction("cancel")}
            disabled={isLoading}
          >
            إلغاء الطلب
          </Button>
        )}

        {isAdmin && order.status === "WAITING_BUYER_CONFIRM" && order.dispute && (
          <Button
            className="w-full"
            onClick={() => router.push(`/admin/disputes/${order.dispute.id}`)}
          >
            مراجعة النزاع
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

