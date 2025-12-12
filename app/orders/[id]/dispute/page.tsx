"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useParams } from "next/navigation"

export default function DisputePage() {
  const params = useParams()
  const orderId = params?.id as string
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [statement, setStatement] = useState("")

  // CRITICAL: Check authentication and authorization
  useEffect(() => {
    if (!orderId) return
    
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(`/orders/${orderId}/dispute`))
      return
    }
    
    if (status === "authenticated" && session?.user.role !== "BUYER") {
      router.push("/dashboard?error=unauthorized")
    }
  }, [session, status, router, orderId])
  
  // Don't render if not authenticated or not buyer
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    )
  }
  
  if (status === "unauthenticated" || !session || session.user.role !== "BUYER") {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason || !statement) {
      toast({
        title: "خطأ",
        description: "جميع الحقول مطلوبة",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`/api/orders/${orderId}/dispute`, {
        reason,
        buyerStatement: statement,
      })

      if (response.data.success) {
        toast({
          title: "تم رفع النزاع",
          description: "سيتم مراجعة النزاع من قبل الإدارة",
        })
        router.push(`/orders/${orderId}`)
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "حدث خطأ أثناء رفع النزاع",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>رفع نزاع</CardTitle>
            <CardDescription>
              إذا لم تستلم الخدمة، يمكنك رفع نزاع للمراجعة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  سبب النزاع
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="">اختر السبب</option>
                  <option value="NOT_RECEIVED">لم أستلم الخدمة</option>
                  <option value="WRONG_AMOUNT">المبلغ خاطئ</option>
                  <option value="POOR_QUALITY">جودة الخدمة سيئة</option>
                  <option value="OTHER">أسباب أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  بيانك (وصف المشكلة بالتفصيل)
                </label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="اشرح المشكلة بالتفصيل..."
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ سيتم مراجعة النزاع من قبل الإدارة. يرجى التأكد من صحة المعلومات المقدمة.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري الرفع..." : "رفع النزاع"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

