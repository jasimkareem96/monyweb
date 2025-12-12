"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function OfferFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/offers?${params.toString()}`)
  }

  const handleSearch = () => {
    updateParams("search", search)
  }

  const handleClear = () => {
    setSearch("")
    setMinPrice("")
    setMaxPrice("")
    router.push("/offers")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">البحث</label>
          <div className="flex gap-2">
            <Input
              placeholder="ابحث في الوصف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
            />
            <Button onClick={handleSearch}>بحث</Button>
          </div>
        </div>

        {/* Price Range */}
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">الحد الأدنى</label>
            <Input
              type="number"
              placeholder="10"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value)
                updateParams("minPrice", e.target.value)
              }}
              className="w-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحد الأعلى</label>
            <Input
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value)
                updateParams("maxPrice", e.target.value)
              }}
              className="w-24"
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium mb-1">الترتيب</label>
          <select
            className="px-4 py-2 border rounded-md"
            defaultValue={searchParams.get("sort") || ""}
            onChange={(e) => updateParams("sort", e.target.value)}
          >
            <option value="">الافتراضي</option>
            <option value="price">حسب السعر (أقل إلى أعلى)</option>
            <option value="rating">حسب التقييم</option>
            <option value="speed">حسب السرعة</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">النوع</label>
          <select
            className="px-4 py-2 border rounded-md"
            defaultValue={searchParams.get("type") || ""}
            onChange={(e) => updateParams("type", e.target.value)}
          >
            <option value="">الكل</option>
            <option value="PAYPAL_TO_PAYPAL">PayPal → PayPal</option>
            <option value="PAYPAL_GS">PayPal G&S</option>
            <option value="PAYPAL_FF">PayPal F&F</option>
            <option value="PAYPAL_TO_ZAINCASH">PayPal → ZainCash</option>
            <option value="PAYPAL_TO_BANK_TRANSFER">PayPal → Bank Transfer</option>
            <option value="PAYPAL_TO_CASH_PICKUP">PayPal → Cash Pickup</option>
            <option value="PAYPAL_TO_MASTERCARD">PayPal → Mastercard</option>
          </select>
        </div>

        {/* Online Status */}
        <div>
          <label className="block text-sm font-medium mb-1">الحالة</label>
          <select
            className="px-4 py-2 border rounded-md"
            defaultValue={searchParams.get("online") || ""}
            onChange={(e) => updateParams("online", e.target.value)}
          >
            <option value="">الكل</option>
            <option value="true">متصل فقط</option>
            <option value="false">غير متصل</option>
          </select>
        </div>

        {/* Tier */}
        <div>
          <label className="block text-sm font-medium mb-1">المستوى</label>
          <select
            className="px-4 py-2 border rounded-md"
            defaultValue={searchParams.get("tier") || ""}
            onChange={(e) => updateParams("tier", e.target.value)}
          >
            <option value="">الكل</option>
            <option value="GOLD">ذهبي</option>
            <option value="SILVER">فضي</option>
            <option value="BRONZE">برونزي</option>
          </select>
        </div>

        {/* Min Rating */}
        <div>
          <label className="block text-sm font-medium mb-1">التقييم الأدنى</label>
          <select
            className="px-4 py-2 border rounded-md"
            defaultValue={searchParams.get("minRating") || ""}
            onChange={(e) => updateParams("minRating", e.target.value)}
          >
            <option value="">الكل</option>
            <option value="4">4+ ⭐</option>
            <option value="3">3+ ⭐</option>
            <option value="2">2+ ⭐</option>
            <option value="1">1+ ⭐</option>
          </select>
        </div>

        {/* Clear */}
        <Button variant="outline" onClick={handleClear}>
          مسح
        </Button>
      </div>
    </div>
  )
}

