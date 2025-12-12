"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

interface Dispute {
  id: string
  orderId: string
  status: string
}

export function ResolveDisputeForm({ dispute }: { dispute: Dispute }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [resolution, setResolution] = useState("")
  const [notes, setNotes] = useState("")

  const handleResolve = async (favor: "BUYER" | "MERCHANT") => {
    if (!notes) {
      toast({
        title: "خطأ",
        description: "يجب إدخال ملاحظات",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`/api/admin/disputes/${dispute.id}/resolve`, {
        resolution: favor,
        notes,
      })

      if (response.data.success) {
        toast({
          title: "تم حل النزاع",
          description: `تم حل النزاع لصالح ${favor === "BUYER" ? "المشتري" : "التاجر"}`,
        })
        router.push("/admin/disputes")
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "حدث خطأ أثناء حل النزاع",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (dispute.status !== "PENDING" && dispute.status !== "UNDER_REVIEW") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>حالة النزاع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            تم حل هذا النزاع بالفعل
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>حل النزاع</CardTitle>
        <CardDescription>اختر الحل المناسب للنزاع</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            الملاحظات
          </label>
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أدخل ملاحظاتك حول النزاع..."
            required
          />
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            variant="default"
            onClick={() => handleResolve("BUYER")}
            disabled={isLoading}
          >
            حل لصالح المشتري (إرجاع المال)
          </Button>
          <Button
            className="w-full"
            variant="default"
            onClick={() => handleResolve("MERCHANT")}
            disabled={isLoading}
          >
            حل لصالح التاجر (إطلاق الأموال)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

