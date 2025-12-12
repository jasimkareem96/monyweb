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

const CONFIRMATION_TEXT = "I confirm that I am paying for a digital escrowed service. This is not a product purchase. I understand that the payment is final unless the seller fails to deliver the service."

export default function PaymentPage() {
  const params = useParams()
  const orderId = params?.id as string
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [beforePaymentProof, setBeforePaymentProof] = useState<File | null>(null)
  const [afterPaymentProof, setAfterPaymentProof] = useState<File | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  // CRITICAL: Check authentication and authorization
  useEffect(() => {
    if (!orderId) return
    
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(`/orders/${orderId}/payment`))
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

  const handleFileChange = (setter: (file: File | null) => void) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!beforePaymentProof || !afterPaymentProof || !transactionId || !confirmed) {
      toast({
        title: "خطأ",
        description: "جميع الحقول مطلوبة",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("beforePaymentProof", beforePaymentProof)
      formData.append("afterPaymentProof", afterPaymentProof)
      formData.append("transactionId", transactionId)
      formData.append("confirmationText", CONFIRMATION_TEXT)

      const response = await axios.post(
        `/api/orders/${orderId}/upload-payment-proof`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (response.data.success) {
        toast({
          title: "تم رفع الإثباتات",
          description: "تم رفع إثباتات الدفع بنجاح",
        })
        router.push(`/orders/${orderId}`)
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "حدث خطأ أثناء رفع الإثباتات",
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
            <CardTitle>رفع إثباتات الدفع</CardTitle>
            <CardDescription>
              يرجى رفع إثباتات الدفع المطلوبة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  إثبات الدفع (قبل) - صورة تظهر اسم المستلم والمبلغ ونوع التحويل
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange(setBeforePaymentProof)}
                  required
                />
                {beforePaymentProof && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 mb-2">
                      ✓ تم اختيار الملف: {beforePaymentProof.name}
                    </p>
                    {beforePaymentProof.type.startsWith("image/") && (
                      <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                        <img
                          src={URL.createObjectURL(beforePaymentProof)}
                          alt="Preview"
                          className="max-w-full h-auto max-h-48 rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  يجب أن تظهر الصورة: اسم مستلم الأموال (حساب المنصة)، المبلغ، نوع التحويل (G&S أو F&F)، العملة
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  إثبات الدفع (بعد) - صورة تظهر Transaction ID و Payment Completed
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange(setAfterPaymentProof)}
                  required
                />
                {afterPaymentProof && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 mb-2">
                      ✓ تم اختيار الملف: {afterPaymentProof.name}
                    </p>
                    {afterPaymentProof.type.startsWith("image/") && (
                      <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                        <img
                          src={URL.createObjectURL(afterPaymentProof)}
                          alt="Preview"
                          className="max-w-full h-auto max-h-48 rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  يجب أن تظهر الصورة: Transaction ID، Payment Completed / Sent
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Transaction ID
                </label>
                <Input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="أدخل Transaction ID"
                  required
                />
              </div>

              <div>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    required
                    className="mt-1"
                  />
                  <span className="text-sm">
                    أوافق على النص التالي: {CONFIRMATION_TEXT}
                  </span>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري الرفع..." : "رفع الإثباتات"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

