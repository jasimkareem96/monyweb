"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const statusOptions = [
  { value: "", label: "جميع الحالات" },
  { value: "PENDING", label: "معلق" },
  { value: "UNDER_REVIEW", label: "قيد المراجعة" },
  { value: "RESOLVED_MERCHANT", label: "محلول لصالح التاجر" },
  { value: "RESOLVED_BUYER", label: "محلول لصالح المشتري" },
  { value: "CLOSED", label: "مغلق" },
]

export function DisputeFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState(searchParams.get("search") || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    const status = searchParams.get("status")
    if (status) params.set("status", status)
    if (search) params.set("search", search)
    router.push(`/admin/disputes?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams()
    if (value) params.set("status", value)
    if (searchParams.get("search")) params.set("search", searchParams.get("search") || "")
    router.push(`/admin/disputes?${params.toString()}`)
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="px-4 py-2 border rounded-md flex-1"
            value={searchParams.get("status") || ""}
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
            placeholder="بحث بالسبب، الاسم، أو البريد الإلكتروني..."
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

