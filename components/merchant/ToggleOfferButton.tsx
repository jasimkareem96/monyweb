"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

interface ToggleOfferButtonProps {
  offerId: string
  isActive: boolean
  disabled?: boolean
  disabledMessage?: string
}

export function ToggleOfferButton({
  offerId,
  isActive,
  disabled = false,
  disabledMessage = "",
}: ToggleOfferButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleToggle = async () => {
    if (disabled) {
      toast({
        title: "غير مسموح",
        description: disabledMessage || "لا يمكن تنفيذ هذه العملية حالياً",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`/api/offers/${offerId}/toggle`)

      if (response.data.success) {
        toast({
          title: "تم بنجاح",
          description: response.data.message || "تم تحديث العرض بنجاح",
        })
        // Force a hard refresh to ensure all data is updated
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error: any) {
      console.error("Toggle offer error:", error)
      const errorMessage = error.response?.data?.error || error.message || "حدث خطأ أثناء تحديث العرض"
      toast({
        title: "حدث خطأ",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isActive) {
    return (
      <Button
        onClick={handleToggle}
        variant="destructive"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "جاري التحديث..." : "إلغاء التفعيل"}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleToggle}
      variant="default"
      className="w-full"
      disabled={isLoading || disabled}
      title={disabled ? disabledMessage : ""}
    >
      {isLoading
        ? "جاري التحديث..."
        : disabled
        ? disabledMessage || "انتظر"
        : "تفعيل"}
    </Button>
  )
}

