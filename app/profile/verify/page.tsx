"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Camera, Upload, X } from "lucide-react"
import axios from "axios"
import { addCSRFToBody, getCSRFToken } from "@/lib/csrf-client"

export default function VerifyPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    idType: "",
    fullName: "",
    address: "",
  })
  
  const [idImage, setIdImage] = useState<File | null>(null)
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleIdTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, idType: e.target.value })
  }

  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setIdImage(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setShowCamera(true)
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "لا يمكن الوصول إلى الكاميرا. تأكد من السماح بالوصول إلى الكاميرا",
        variant: "destructive",
      })
    }
  }

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context?.drawImage(video, 0, 0)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)
      setSelfieImage(imageData)
      stopCamera()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.idType || !formData.fullName || !formData.address) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      })
      return
    }

    if (!idImage) {
      toast({
        title: "خطأ",
        description: "يرجى رفع صورة الهوية",
        variant: "destructive",
      })
      return
    }

    if (!selfieImage) {
      toast({
        title: "خطأ",
        description: "يرجى التقاط صورة سيلفي",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get CSRF token
      const csrfToken = await getCSRFToken()

      // Upload ID image
      const idFormData = new FormData()
      idFormData.append("file", idImage)
      idFormData.append("type", "id")
      idFormData.append("_csrf", csrfToken)

      const idResponse = await axios.post("/api/upload", idFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRF-Token": csrfToken,
        },
      })

      // Upload selfie image
      const selfieFormData = new FormData()
      const selfieBlob = await fetch(selfieImage).then((res) => res.blob())
      selfieFormData.append("file", selfieBlob, "selfie.jpg")
      selfieFormData.append("type", "selfie")
      selfieFormData.append("_csrf", csrfToken)

      const selfieResponse = await axios.post("/api/upload", selfieFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRF-Token": csrfToken,
        },
      })

      // Submit verification request
      const verificationData = {
        idType: formData.idType,
        idImage: idResponse.data.url,
        selfieImage: selfieResponse.data.url,
        fullName: formData.fullName,
        address: formData.address,
      }

      // Add CSRF token (csrfToken already defined above)
      const dataWithCSRF = await addCSRFToBody(verificationData)

      await axios.post("/api/verification/submit", dataWithCSRF, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      })

      toast({
        title: "تم إرسال طلب التحقق",
        description: "سيتم مراجعة طلبك من قبل الإدارة",
      })

      router.push("/profile")
    } catch (error: any) {
      console.error("Verification error:", error)
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "حدث خطأ أثناء إرسال طلب التحقق",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">التحقق من الهوية</h1>
        <p className="text-gray-600 mt-2">أكمل المعلومات التالية للتحقق من هويتك</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات التحقق</CardTitle>
          <CardDescription>يرجى التأكد من صحة جميع المعلومات</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* نوع الهوية */}
            <div className="space-y-2">
              <label htmlFor="idType" className="text-sm font-medium">
                نوع الهوية <span className="text-red-500">*</span>
              </label>
              <select
                id="idType"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={formData.idType}
                onChange={handleIdTypeChange}
                required
              >
                <option value="">اختر نوع الهوية</option>
                <option value="NATIONAL_ID">بطاقة وطنية</option>
                <option value="PASSPORT">جواز سفر</option>
                <option value="DRIVER_LICENSE">رخصة قيادة</option>
              </select>
            </div>

            {/* الاسم الثلاثي */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                الاسم الثلاثي <span className="text-red-500">*</span>
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="أدخل الاسم الثلاثي"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            {/* عنوان السكن */}
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                عنوان السكن <span className="text-red-500">*</span>
              </label>
              <Input
                id="address"
                type="text"
                placeholder="أدخل عنوان السكن الكامل"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            {/* صورة الهوية */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                صورة الهوية <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIdImageChange}
                    className="hidden"
                  />
                  {idImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={URL.createObjectURL(idImage)}
                        alt="ID"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setIdImage(null)
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-xs text-gray-500 mt-1">رفع صورة</p>
                    </div>
                  )}
                </label>
                {idImage && (
                  <p className="text-sm text-gray-600">{idImage.name}</p>
                )}
              </div>
            </div>

            {/* صورة السيلفي */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                صورة سيلفي <span className="text-red-500">*</span>
              </label>
              {!selfieImage && !showCamera && (
                <Button
                  type="button"
                  onClick={startCamera}
                  variant="outline"
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  التقاط صورة سيلفي
                </Button>
              )}

              {showCamera && (
                <div className="space-y-2">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={captureSelfie}
                      className="flex-1"
                    >
                      التقاط
                    </Button>
                    <Button
                      type="button"
                      onClick={stopCamera}
                      variant="outline"
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}

              {selfieImage && !showCamera && (
                <div className="relative">
                  <img
                    src={selfieImage}
                    alt="Selfie"
                    className="w-full max-w-md rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={() => setSelfieImage(null)}
                    variant="outline"
                    className="mt-2"
                  >
                    إعادة التقاط
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "جاري الإرسال..." : "إرسال طلب التحقق"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
