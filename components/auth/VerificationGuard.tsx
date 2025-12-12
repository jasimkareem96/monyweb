"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import axios from "axios"

export function VerificationGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [verification, setVerification] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (session?.user) {
      checkVerification()
    }
  }, [session, status, router])

  const checkVerification = async () => {
    try {
      const response = await axios.get("/api/verification/status")
      setVerification(response.data)
    } catch (error) {
      console.error("Error checking verification:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Admin doesn't need verification
  if (session?.user?.role === "ADMIN") {
    return <>{children}</>
  }

  // Check if user is verified
  if (!verification || verification.status !== "APPROVED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              التحقق من الهوية مطلوب
            </CardTitle>
            <CardDescription>
              يجب التحقق من هويتك قبل البدء في استخدام المنصة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verification?.status === "PENDING" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  طلب التحقق الخاص بك قيد المراجعة. سيتم إشعارك عند الانتهاء.
                </p>
              </div>
            )}

            {verification?.status === "REJECTED" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold mb-2">تم رفض طلب التحقق</p>
                {verification.rejectionReason && (
                  <p className="text-red-600 text-sm">السبب: {verification.rejectionReason}</p>
                )}
              </div>
            )}

            <Link href="/profile/verify">
              <Button className="w-full">
                {verification?.status === "REJECTED" ? "إعادة المحاولة" : "التحقق من الهوية"}
              </Button>
            </Link>

            <Link href="/profile">
              <Button variant="outline" className="w-full">
                عرض الملف الشخصي
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
