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
import Image from "next/image"

const CONFIRMATION_TEXT = "I confirm that I delivered the requested service completely and correctly to the buyer."

export default function DeliveryPage() {
  const params = useParams()
  const orderId = params?.id as string
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [deliveryProof, setDeliveryProof] = useState<File | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  // CRITICAL: Check authentication and authorization
  useEffect(() => {
    if (!orderId) return
    
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(`/orders/${orderId}/delivery`))
      return
    }
    
    if (status === "authenticated" && session?.user.role !== "MERCHANT") {
      router.push("/dashboard?error=unauthorized")
    }
  }, [session, status, router, orderId])
  
  // Don't render if not authenticated or not merchant
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    )
  }
  
  if (status === "unauthenticated" || !session || session.user.role !== "MERCHANT") {
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDeliveryProof(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!deliveryProof || !transactionId || !recipientAddress || !confirmed) {
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
      formData.append("deliveryProof", deliveryProof)
      formData.append("transactionId", transactionId)
      formData.append("recipientAddress", recipientAddress)
      formData.append("confirmationText", CONFIRMATION_TEXT)

      const response = await axios.post(
        `/api/orders/${orderId}/upload-delivery-proof`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (response.data.success) {
        toast({
          title: "تم رفع الإثبات",
          description: "تم رفع إثبات التسليم بنجاح",
        })
        router.push(`/orders/${orderId}`)
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "حدث خطأ أثناء رفع الإثبات",
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
            <CardTitle>رفع إثبات التسليم</CardTitle>
            <CardDescription>
              يرجى رفع إثبات التسليم المطلوب
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  إثبات التسليم - صورة تظهر Transaction ID و Payment Sent/Transfer Completed وعنوان المستلم
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                {deliveryProof && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 mb-2">
                      ✓ تم اختيار الملف: {deliveryProof.name}
                    </p>
                    {deliveryProof.type.startsWith("image/") && (
                      <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                        <Image
                          src={URL.createObjectURL(deliveryProof)}
                          alt="Preview"
                          width={900}
                          height={450}
                          unoptimized
                          className="max-w-full h-auto max-h-48 rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  يجب أن تظهر الصورة: Transaction ID، Payment Sent / Transfer Completed، عنوان المستلم (PayPal / ZainCash / Bank)
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
                <label className="block text-sm font-medium mb-2">
                  عنوان المستلم (PayPal / ZainCash / Bank)
                </label>
                <Input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="أدخل عنوان المستلم"
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
                {isLoading ? "جاري الرفع..." : "رفع الإثبات"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

