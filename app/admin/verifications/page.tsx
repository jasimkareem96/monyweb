"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, Clock, Eye } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { addCSRFToBody, getCSRFToken } from "@/lib/csrf-client"
import Image from "next/image"

interface Verification {
  id: string
  userId: string
  idType: string
  idImage: string
  selfieImage: string
  fullName: string
  address: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  rejectionReason?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function VerificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true)
      const url = filter ? `/api/admin/verifications?status=${filter}` : "/api/admin/verifications"
      const response = await axios.get(url)
      setVerifications(response.data.verifications)
    } catch (error: any) {
      console.error("Error fetching verifications:", error)
      toast({
        title: "حدث خطأ",
        description: "فشل في جلب طلبات التحقق",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filter, toast])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (session?.user && session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    if (session?.user) {
      fetchVerifications()
    }
  }, [session, status, router, fetchVerifications])

  const handleApprove = async (id: string) => {
    if (!confirm("هل أنت متأكد من الموافقة على هذا الطلب؟")) {
      return
    }

    setProcessing(true)
    try {
      const csrfToken = await getCSRFToken()
      const dataWithCSRF = await addCSRFToBody({})
      
      await axios.post(`/api/admin/verifications/${id}/approve`, dataWithCSRF, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      })
      toast({
        title: "تم بنجاح",
        description: "تم قبول طلب التحقق",
      })
      fetchVerifications()
      setSelectedVerification(null)
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "فشل في قبول الطلب",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال سبب الرفض",
        variant: "destructive",
      })
      return
    }

    if (!confirm("هل أنت متأكد من رفض هذا الطلب؟")) {
      return
    }

    setProcessing(true)
    try {
      const csrfToken = await getCSRFToken()
      const dataWithCSRF = await addCSRFToBody({
        rejectionReason,
      })
      
      await axios.post(`/api/admin/verifications/${id}/reject`, dataWithCSRF, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      })
      toast({
        title: "تم بنجاح",
        description: "تم رفض طلب التحقق",
      })
      fetchVerifications()
      setSelectedVerification(null)
      setRejectionReason("")
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "فشل في رفض الطلب",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            مقبول
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

  const getIdTypeName = (type: string) => {
    switch (type) {
      case "NATIONAL_ID":
        return "بطاقة وطنية"
      case "PASSPORT":
        return "جواز سفر"
      case "DRIVER_LICENSE":
        return "رخصة قيادة"
      default:
        return type
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">مراجعة طلبات التحقق</h1>
          <p className="text-gray-600 mt-2">مراجعة واعتماد طلبات التحقق من الهوية</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">العودة للوحة التحكم</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === "" ? "default" : "outline"}
          onClick={() => setFilter("")}
        >
          الكل
        </Button>
        <Button
          variant={filter === "PENDING" ? "default" : "outline"}
          onClick={() => setFilter("PENDING")}
        >
          قيد المراجعة
        </Button>
        <Button
          variant={filter === "APPROVED" ? "default" : "outline"}
          onClick={() => setFilter("APPROVED")}
        >
          مقبول
        </Button>
        <Button
          variant={filter === "REJECTED" ? "default" : "outline"}
          onClick={() => setFilter("REJECTED")}
        >
          مرفوض
        </Button>
      </div>

      {/* Verifications List */}
      <div className="grid gap-4">
        {verifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              لا توجد طلبات تحقق
            </CardContent>
          </Card>
        ) : (
          verifications.map((verification) => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{verification.user.name}</CardTitle>
                    <CardDescription>{verification.user.email}</CardDescription>
                  </div>
                  {getStatusBadge(verification.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">نوع الهوية</label>
                    <p>{getIdTypeName(verification.idType)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">الاسم الثلاثي</label>
                    <p>{verification.fullName}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">عنوان السكن</label>
                    <p>{verification.address}</p>
                  </div>
                  {verification.rejectionReason && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-red-500">سبب الرفض</label>
                      <p className="text-red-600">{verification.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">صورة الهوية</label>
                    <Image
                      src={verification.idImage}
                      alt="ID"
                      width={900}
                      height={450}
                      unoptimized
                      className="w-full h-48 object-cover rounded-lg border cursor-pointer"
                      onClick={() => window.open(verification.idImage, "_blank")}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">صورة السيلفي</label>
                    <Image
                      src={verification.selfieImage}
                      alt="Selfie"
                      width={900}
                      height={450}
                      unoptimized
                      className="w-full h-48 object-cover rounded-lg border cursor-pointer"
                      onClick={() => window.open(verification.selfieImage, "_blank")}
                    />
                  </div>
                </div>

                {verification.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(verification.id)}
                      disabled={processing}
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      قبول
                    </Button>
                    <Button
                      onClick={() => setSelectedVerification(verification)}
                      variant="outline"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      رفض
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rejection Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>رفض طلب التحقق</CardTitle>
              <CardDescription>يرجى إدخال سبب الرفض</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">سبب الرفض</label>
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="أدخل سبب الرفض..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedVerification(null)
                    setRejectionReason("")
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => handleReject(selectedVerification.id)}
                  disabled={processing || !rejectionReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  رفض
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
