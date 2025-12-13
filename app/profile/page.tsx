"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, AlertCircle, Camera, Upload, X } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { addCSRFToBody, getCSRFToken } from "@/lib/csrf-client"
import Image from "next/image"

interface VerificationStatus {
  status: "PENDING" | "APPROVED" | "REJECTED" | null
  rejectionReason?: string
  idType?: string
  fullName?: string
  address?: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [verification, setVerification] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const loadProfileData = useCallback(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: (session.user as any).phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      if ((session.user as any).profileImage) {
        setProfileImagePreview((session.user as any).profileImage)
      }
    }
  }, [session])

  const fetchVerificationStatus = useCallback(async () => {
    try {
      const response = await axios.get("/api/verification/status")
      setVerification(response.data)
    } catch (error: any) {
      console.error("Error fetching verification:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (session?.user) {
      setLoading(true)
      fetchVerificationStatus()
      loadProfileData()
    }
  }, [session, status, router, fetchVerificationStatus, loadProfileData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطأ",
          description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
          variant: "destructive",
        })
        return
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "خطأ",
          description: "الملف يجب أن يكون صورة",
          variant: "destructive",
        })
        return
      }
      setProfileImageFile(file)
      setProfileImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      })
      return
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      let profileImageUrl = profileImagePreview

      // Upload profile image if changed
      if (profileImageFile) {
        const formData = new FormData()
        formData.append("file", profileImageFile)
        formData.append("type", "profile")
        
        // Add CSRF token to form data
        const csrfToken = await getCSRFToken()
        formData.append("_csrf", csrfToken)

        const uploadResponse = await axios.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRF-Token": csrfToken,
          },
        })

        profileImageUrl = uploadResponse.data.url
      }

      // Update profile
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }

      if (profileImageUrl) {
        updateData.profileImage = profileImageUrl
      }

      if (formData.newPassword) {
        updateData.password = formData.newPassword
        updateData.currentPassword = formData.currentPassword
      }

      // Add CSRF token
      const dataWithCSRF = await addCSRFToBody(updateData)
      
      // Get CSRF token for header
      const csrfToken = await getCSRFToken()

      const response = await axios.put("/api/profile/update", dataWithCSRF, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      })

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث الملف الشخصي",
      })

      // Update session
      await update({
        ...session?.user,
        name: response.data.user.name,
        email: response.data.user.email,
        profileImage: response.data.user.profileImage,
        phone: response.data.user.phone,
      })

      setIsEditing(false)
      setProfileImageFile(null)
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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

  if (!session?.user) {
    return null
  }

  const getVerificationBadge = () => {
    if (!verification || !verification.status) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertCircle className="w-4 h-4 mr-1" />
          غير محقق
        </Badge>
      )
    }

    switch (verification.status) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            محقق
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="w-4 h-4 mr-1" />
            قيد المراجعة
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-4 h-4 mr-1" />
            مرفوض
          </Badge>
        )
      default:
        return null
    }
  }

  const getVerificationMessage = () => {
    if (!verification || !verification.status) {
      return {
        title: "تحقق من هويتك",
        description: "يجب التحقق من هويتك قبل البدء في استخدام المنصة",
        action: "ابدأ التحقق",
        link: "/profile/verify",
      }
    }

    switch (verification.status) {
      case "APPROVED":
        return {
          title: "تم التحقق من هويتك",
          description: "حسابك محقق ويمكنك استخدام جميع ميزات المنصة",
          action: null,
          link: null,
        }
      case "PENDING":
        return {
          title: "طلبك قيد المراجعة",
          description: "نقوم بمراجعة معلومات التحقق الخاصة بك. سيتم إشعارك عند الانتهاء",
          action: null,
          link: null,
        }
      case "REJECTED":
        return {
          title: "تم رفض طلب التحقق",
          description: verification.rejectionReason || "يرجى مراجعة المعلومات وإعادة المحاولة",
          action: "إعادة المحاولة",
          link: "/profile/verify",
        }
      default:
        return null
    }
  }

  const verificationInfo = getVerificationMessage()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
        <p className="text-gray-600 mt-2">إدارة معلوماتك الشخصية وحالة التحقق</p>
      </div>

      <div className="grid gap-6">
        {/* معلومات المستخدم */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>المعلومات الشخصية</CardTitle>
                <CardDescription>معلومات حسابك الأساسية</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>تعديل</Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Image */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profileImagePreview ? (
                    <Image
                      src={profileImagePreview}
                      alt="Profile"
                      width={96}
                      height={96}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl text-gray-400">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {isEditing && (
                <div>
                  <p className="text-sm text-gray-600">صورة الملف الشخصي</p>
                  <p className="text-xs text-gray-500">ستظهر هذه الصورة للجميع</p>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">الاسم</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1"
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">تغيير كلمة المرور</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">كلمة المرور الحالية</label>
                      <Input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="mt-1"
                        placeholder="اتركه فارغاً إذا لم ترد التغيير"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">كلمة المرور الجديدة</label>
                        <Input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">تأكيد كلمة المرور</label>
                        <Input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                    {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      loadProfileData()
                      setProfileImageFile(null)
                      setProfileImagePreview((session.user as any).profileImage || null)
                    }}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">الاسم</label>
                  <p className="text-lg">{session.user.name || "غير محدد"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                  <p className="text-lg">{session.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                  <p className="text-lg">{(session.user as any).phone || "غير محدد"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">نوع الحساب</label>
                  <p className="text-lg">
                    {session.user.role === "BUYER" ? "مشتري" : session.user.role === "MERCHANT" ? "تاجر" : "مدير"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">حالة التحقق</label>
                  <div className="mt-1">{getVerificationBadge()}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* حالة التحقق */}
        <Card>
          <CardHeader>
            <CardTitle>حالة التحقق من الهوية</CardTitle>
            <CardDescription>معلومات التحقق من هويتك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationInfo && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">{verificationInfo.title}</h3>
                <p className="text-gray-600 mb-4">{verificationInfo.description}</p>
                {verificationInfo.action && verificationInfo.link && (
                  <Link href={verificationInfo.link}>
                    <Button>{verificationInfo.action}</Button>
                  </Link>
                )}
              </div>
            )}

            {verification?.status === "APPROVED" && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">نوع الهوية</label>
                  <p className="text-lg">
                    {verification.idType === "NATIONAL_ID"
                      ? "بطاقة وطنية"
                      : verification.idType === "PASSPORT"
                      ? "جواز سفر"
                      : "رخصة قيادة"}
                  </p>
                </div>
                {verification.fullName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">الاسم الثلاثي</label>
                    <p className="text-lg">{verification.fullName}</p>
                  </div>
                )}
                {verification.address && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">عنوان السكن</label>
                    <p className="text-lg">{verification.address}</p>
                  </div>
                )}
              </div>
            )}

            {(!verification || verification.status !== "APPROVED") && (
              <Link href="/profile/verify">
                <Button className="w-full">التحقق من الهوية</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
