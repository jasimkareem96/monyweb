"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DbCheckPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const checkDatabase = async () => {
    setLoading(true)
    setStatus(null)
    
    try {
      const response = await fetch("/api/db-check")
      const data = await response.json()
      
      if (data.success) {
        setStatus("success")
      } else {
        setStatus("error")
      }
    } catch (error) {
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>فحص قاعدة البيانات</CardTitle>
          <CardDescription>
            تحقق من اتصال قاعدة البيانات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkDatabase} disabled={loading} className="w-full">
            {loading ? "جاري الفحص..." : "فحص الاتصال"}
          </Button>
          
          {status === "success" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">✅ قاعدة البيانات متصلة بنجاح</p>
            </div>
          )}
          
          {status === "error" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 mb-2">❌ خطأ في الاتصال بقاعدة البيانات</p>
              <p className="text-sm text-red-600">
                تأكد من:
              </p>
              <ul className="list-disc list-inside text-sm text-red-600 mt-2">
                <li>إعداد ملف .env مع DATABASE_URL</li>
                <li>تشغيل: npx prisma db push</li>
                <li>أن قاعدة البيانات تعمل</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

