"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye, CheckCircle, XCircle, Upload } from "lucide-react"
import Image from "next/image"

interface Order {
  id: string
  buyerBeforePaymentProof: string | null
  buyerAfterPaymentProof: string | null
  buyerConfirmationText: string | null
  merchantDeliveryProof: string | null
  merchantConfirmationText: string | null
  paypalTransactionId: string | null
  merchantTransactionId: string | null
  status: string
}

export function OrderEvidence({
  order,
  isBuyer,
  isMerchant,
  isAdmin,
}: {
  order: Order
  isBuyer: boolean
  isMerchant: boolean
  isAdmin: boolean
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const canView = isBuyer || isMerchant || isAdmin
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // CRITICAL: Don't render anything if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.pathname))
    }
  }, [status, router])

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle escape key to close modal
  useEffect(() => {
    if (!expandedImage || !mounted) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setExpandedImage(null)
      }
    }
    
    document.addEventListener("keydown", handleEscape)
    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = originalOverflow
    }
  }, [expandedImage, mounted])
  
  // Check if buyer can upload payment proof (active status)
  const canBuyerUpload = isBuyer && 
    (order.status === "WAITING_PAYMENT" || order.status === "PENDING_QUOTE") && 
    (!order.buyerBeforePaymentProof || !order.buyerAfterPaymentProof)
  
  // Check if merchant can upload delivery proof (active status)
  const canMerchantUpload = isMerchant && 
    (order.status === "ESCROWED" || order.status === "MERCHANT_PROCESSING") && 
    !order.merchantDeliveryProof
  
  // Show upload buttons if proofs are missing (even in cancelled/completed orders, but disabled)
  const showBuyerUploadButton = isBuyer && (!order.buyerBeforePaymentProof || !order.buyerAfterPaymentProof)
  const showMerchantUploadButton = isMerchant && !order.merchantDeliveryProof
  
  // Check if order is in a state that allows uploads
  const isOrderActive = !["CANCELLED", "COMPLETED", "EXPIRED"].includes(order.status)

  // Don't render if not authenticated (AFTER hooks)
  if (status === "unauthenticated" || !session) {
    return null
  }

  if (!canView) return null

  const hasBuyerEvidence = order.buyerBeforePaymentProof || order.buyerAfterPaymentProof
  const hasMerchantEvidence = order.merchantDeliveryProof

  const ProofImage = ({ src, alt, title }: { src: string; alt: string; title: string }) => (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          unoptimized
          className="w-full h-auto max-h-64 object-contain bg-gray-50 cursor-pointer"
          onClick={() => setExpandedImage(src)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                window.open(src, "_blank")
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              عرض
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                const link = document.createElement("a")
                link.href = src
                link.download = alt
                link.click()
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              تحميل
            </Button>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1 text-center">{title}</p>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>الإثباتات</span>
            {hasBuyerEvidence && hasMerchantEvidence && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </CardTitle>
          <CardDescription>إثباتات الدفع والتسليم المرفوعة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buyer Evidence */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>إثباتات المشتري</span>
                {hasBuyerEvidence ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
              </h3>
              {showBuyerUploadButton && (
                <Button
                  size="sm"
                  onClick={() => router.push(`/orders/${order.id}/payment`)}
                  className={`flex items-center gap-2 ${
                    isOrderActive 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isOrderActive}
                >
                  <Upload className="w-4 h-4" />
                  {isOrderActive ? "رفع إثباتات الدفع" : "الطلب مغلق - لا يمكن رفع الإثباتات"}
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {order.buyerBeforePaymentProof ? (
                <ProofImage
                  src={order.buyerBeforePaymentProof}
                  alt="Before Payment Proof"
                  title="إثبات الدفع (قبل) - يظهر اسم المستلم والمبلغ ونوع التحويل"
                />
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    ⚠️ لم يتم رفع إثبات الدفع (قبل) بعد
                  </p>
                  {showBuyerUploadButton && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/orders/${order.id}/payment`)}
                      className="w-full"
                      disabled={!isOrderActive}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      رفع إثبات الدفع (قبل)
                    </Button>
                  )}
                </div>
              )}

              {order.buyerAfterPaymentProof ? (
                <ProofImage
                  src={order.buyerAfterPaymentProof}
                  alt="After Payment Proof"
                  title="إثبات الدفع (بعد) - يظهر Transaction ID و Payment Completed"
                />
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    ⚠️ لم يتم رفع إثبات الدفع (بعد) بعد
                  </p>
                  {showBuyerUploadButton && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/orders/${order.id}/payment`)}
                      className="w-full"
                      disabled={!isOrderActive}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      رفع إثبات الدفع (بعد)
                    </Button>
                  )}
                </div>
              )}

              {order.paypalTransactionId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">PayPal Transaction ID:</p>
                  <p className="text-sm font-mono text-blue-700 break-all">{order.paypalTransactionId}</p>
                </div>
              )}

              {order.buyerConfirmationText && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">نص التأكيد:</p>
                  <p className="text-sm text-gray-600 italic">{order.buyerConfirmationText}</p>
                </div>
              )}
            </div>
          </div>

          {/* Merchant Evidence */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>إثباتات التاجر</span>
                {hasMerchantEvidence ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
              </h3>
              {showMerchantUploadButton && (
                <Button
                  size="sm"
                  onClick={() => router.push(`/orders/${order.id}/delivery`)}
                  className={`flex items-center gap-2 ${
                    isOrderActive 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isOrderActive}
                >
                  <Upload className="w-4 h-4" />
                  {isOrderActive ? "رفع إثبات التسليم" : "الطلب مغلق - لا يمكن رفع الإثباتات"}
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {order.merchantDeliveryProof ? (
                <ProofImage
                  src={order.merchantDeliveryProof}
                  alt="Delivery Proof"
                  title="إثبات التسليم - يظهر Transaction ID و Payment Sent/Transfer Completed وعنوان المستلم"
                />
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    ⚠️ لم يتم رفع إثبات التسليم بعد
                  </p>
                  {showMerchantUploadButton && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/orders/${order.id}/delivery`)}
                      className="w-full"
                      disabled={!isOrderActive}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      رفع إثبات التسليم
                    </Button>
                  )}
                </div>
              )}

              {order.merchantTransactionId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Transaction ID:</p>
                  <p className="text-sm font-mono text-blue-700 break-all">{order.merchantTransactionId}</p>
                </div>
              )}

              {order.merchantConfirmationText && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">نص التأكيد:</p>
                  <p className="text-sm text-gray-600 italic">{order.merchantConfirmationText}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Image Modal - Using Portal for better DOM management */}
      {mounted && expandedImage && createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setExpandedImage(null)
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="معاينة الصورة"
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={(e) => {
                e.stopPropagation()
                setExpandedImage(null)
              }}
            >
              ✕ إغلاق
            </Button>
            <Image
              src={expandedImage}
              alt="Expanded proof"
              width={1600}
              height={1200}
              unoptimized
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

