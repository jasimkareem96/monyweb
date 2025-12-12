"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

interface Order {
  id: string
  status: string
  rating: any
}

export function RatingForm({ order }: { order: Order }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState("5")
  const [comment, setComment] = useState("")

  if (order.status !== "COMPLETED") {
    return null
  }

  if (order.rating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>التقييم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <span className="text-xl font-semibold">
              {order.rating.rating}/5
            </span>
          </div>
          {order.rating.comment && (
            <p className="text-gray-600">{order.rating.comment}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post(`/api/orders/${order.id}/rate`, {
        rating: parseInt(rating),
        comment,
      })

      if (response.data.success) {
        toast({
          title: "تم إضافة التقييم",
          description: "شكراً لتقييمك",
        })
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.response?.data?.error || "حدث خطأ أثناء إضافة التقييم",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تقييم التاجر</CardTitle>
        <CardDescription>كيف كانت تجربتك مع هذا التاجر؟</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">التقييم</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            >
              <option value="5">5 ⭐⭐⭐⭐⭐</option>
              <option value="4">4 ⭐⭐⭐⭐</option>
              <option value="3">3 ⭐⭐⭐</option>
              <option value="2">2 ⭐⭐</option>
              <option value="1">1 ⭐</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">تعليق (اختياري)</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب تعليقك هنا..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "جاري الإرسال..." : "إرسال التقييم"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

