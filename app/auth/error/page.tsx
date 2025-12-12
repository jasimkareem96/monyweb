"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const errorMessages: Record<string, string> = {
  Configuration: "هناك مشكلة في إعدادات الخادم. يرجى المحاولة لاحقاً.",
  AccessDenied: "ليس لديك صلاحية للوصول إلى هذه الصفحة.",
  Verification: "رمز التحقق منتهي الصلاحية أو غير صحيح.",
  Default: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
}

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Default"

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/signin")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-red-600">خطأ في المصادقة</CardTitle>
          <CardDescription className="text-center">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            سيتم توجيهك تلقائياً إلى صفحة تسجيل الدخول خلال 5 ثوانٍ...
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/auth/signin")}
              className="flex-1"
            >
              العودة لتسجيل الدخول
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex-1"
            >
              الصفحة الرئيسية
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
