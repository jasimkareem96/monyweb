"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const statusOptions = [
  { value: "", label: "جميع الحالات" },
  { value: "PENDING_QUOTE", label: "في انتظار التأكيد" },
  { value: "WAITING_PAYMENT", label: "بانتظار الدفع" },
  { value: "ESCROWED", label: "الأموال محجوزة" },
  { value: "MERCHANT_PROCESSING", label: "التاجر ينفذ العملية" },
  { value: "WAITING_BUYER_CONFIRM", label: "بانتظار تأكيد المشتري" },
  { value: "COMPLETED", label: "مكتمل" },
  { value: "CANCELLED", label: "ملغي" },
  { value: "EXPIRED", label: "منتهي" },
]

export function OrderFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState(searchParams?.get("search") || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    const status = searchParams?.get("status")
    if (status) params.set("status", status)
    if (search) params.set("search", search)
    router.push(`/admin/orders?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams()
    if (value) params.set("status", value)
    if (searchParams?.get("search")) params.set("search", searchParams?.get("search") || "")
    router.push(`/admin/orders?${params.toString()}`)
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="px-4 py-2 border rounded-md flex-1"
            value={searchParams?.get("status") || ""}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Input
            type="text"
            placeholder="بحث بالرقم، الاسم، أو البريد الإلكتروني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleFilter()}
            className="flex-1"
          />
          <Button onClick={handleFilter}>بحث</Button>
        </div>
      </CardContent>
    </Card>
  )
}

