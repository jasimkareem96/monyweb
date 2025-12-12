"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  isBlocked: boolean
  isVerified: boolean
}

export function UserActions({ user }: { user: User }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      const response = await axios.post(`/api/admin/users/${user.id}/${action}`)
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
      {!user.isBlocked ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleAction("block")}
          disabled={isLoading}
        >
          حظر
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          onClick={() => handleAction("unblock")}
          disabled={isLoading}
        >
          إلغاء الحظر
        </Button>
      )}
      {!user.isVerified && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction("verify")}
          disabled={isLoading}
        >
          توثيق
        </Button>
      )}
    </div>
  )
}

