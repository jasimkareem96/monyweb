"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function OrderReviewActions({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  async function approve() {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "فشل")
      setMsg("✅ تم قبول الدفع بنجاح")
      location.reload()
    } catch (e: any) {
      setMsg(`❌ ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function reject() {
    if (!reason.trim()) {
      setMsg("❌ اكتب سبب الرفض أولاً")
      return
    }
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "فشل")
      setMsg("✅ تم رفض الدفع وطلب إعادة رفع الإثباتات")
      location.reload()
    } catch (e: any) {
      setMsg(`❌ ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-4 border-t space-y-3">
      <div className="text-sm text-gray-600">
        الحالة الحالية: <span className="font-semibold">{currentStatus}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={approve} disabled={loading || currentStatus !== "PROOFS_SUBMITTED"}>
          قبول الدفع
        </Button>

        <Button
          variant="destructive"
          onClick={reject}
          disabled={loading || currentStatus !== "PROOFS_SUBMITTED"}
        >
          رفض الدفع
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">سبب الرفض (يظهر للمستخدم)</label>
        <textarea
          className="w-full rounded-md border p-2 text-sm bg-white"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="مثال: الإثبات غير واضح / رقم العملية غير مطابق / صورة ناقصة..."
        />
      </div>

      {msg && <div className="text-sm">{msg}</div>}

      <div className="text-xs text-gray-500">
        * الأزرار تعمل فقط عندما تكون الحالة PROOFS_SUBMITTED
      </div>
    </div>
  )
}
