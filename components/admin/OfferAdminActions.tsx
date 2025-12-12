"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

interface Offer {
  id: string
  isActive: boolean
}

export function OfferAdminActions({ offer }: { offer: Offer }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post(`/api/admin/offers/${offer.id}/toggle`)
      if (response.data.success) {
        toast({
          title: "تم بنجاح",
          description: response.data.message,
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
    <div className="flex flex-col gap-2">
      <Button
        variant={offer.isActive ? "destructive" : "default"}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
      >
        {offer.isActive ? "تعطيل" : "تفعيل"}
      </Button>
    </div>
  )
}

