"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import axios from "axios"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "BUYER" as "BUYER" | "MERCHANT",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...signupData } = formData
      console.log("Sending signup request:", { ...signupData, password: "[HIDDEN]" })
      
      const response = await axios.post("/api/auth/signup", signupData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.data.success) {
        toast({
          title: "تم التسجيل بنجاح",
          description: "يمكنك الآن تسجيل الدخول",
        })
        router.push("/auth/signin")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      console.error("Error response:", error.response)
      console.error("Error response data:", error.response?.data)
      
      let errorMessage = "حدث خطأ أثناء التسجيل"
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.status === 429) {
        errorMessage = "تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً"
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "البيانات المرسلة غير صحيحة"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Show error message with more details
      const errorTitle = error.response?.status === 400 && error.response?.data?.error?.includes("مستخدم بالفعل")
        ? "البريد الإلكتروني مستخدم بالفعل"
        : "حدث خطأ"
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Show for 5 seconds
      })
      
      // If email already exists, clear the email field
      if (error.response?.status === 400 && error.response?.data?.error?.includes("مستخدم بالفعل")) {
        setFormData(prev => ({ ...prev, email: "" }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">إنشاء حساب جديد</CardTitle>
          <CardDescription className="text-center">
            سجل الآن للبدء في استخدام المنصة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                الاسم
              </label>
              <Input
                id="name"
                type="text"
                placeholder="أدخل اسمك"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="05xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                نوع الحساب
              </label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "BUYER" | "MERCHANT" })}
                required
              >
                <option value="BUYER">مشتري</option>
                <option value="MERCHANT">تاجر</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                تأكيد كلمة المرور
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">لديك حساب بالفعل؟ </span>
            <Link href="/auth/signin" className="text-primary-600 hover:underline">
              سجل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

