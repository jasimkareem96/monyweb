"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Trim email and password
    const trimmedEmail = email.trim()
    const trimmedPassword = password

    if (!trimmedEmail || !trimmedPassword) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email: trimmedEmail,
        password: trimmedPassword,
        redirect: false,
        callbackUrl: "/",
      })

      console.log("Sign in result:", result)
      
      if (result?.error) {
        console.error("Sign in error:", result.error)
        console.error("Sign in error details:", { error: result.error, status: result.status })
        
        let errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        
        if (result.error === "CredentialsSignin") {
          errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من إدخال البيانات بشكل صحيح."
        } else {
          errorMessage = `خطأ: ${result.error}`
        }
        
        toast({
          title: "خطأ في تسجيل الدخول",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        })
        setIsLoading(false)
        return
      }
      
      if (result?.ok && !result?.error) {
        console.log("Sign in successful, redirecting...")
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "جاري التوجيه...",
        })
        // Force a hard redirect to ensure session is set
        window.location.href = "/"
      } else {
        console.log("Unexpected result:", result)
        toast({
          title: "خطأ غير متوقع",
          description: "يرجى المحاولة مرة أخرى",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول. تأكد من إعداد قاعدة البيانات.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
          <CardDescription className="text-center">
            أدخل بياناتك للدخول إلى المنصة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">ليس لديك حساب؟ </span>
            <Link href="/auth/signup" className="text-primary-600 hover:underline">
              سجل الآن
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

