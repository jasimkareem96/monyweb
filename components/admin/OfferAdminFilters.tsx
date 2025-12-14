"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function OfferAdminFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState(searchParams?.get("search") || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    const active = searchParams?.get("active")
    if (active) params.set("active", active)
    if (search) params.set("search", search)
    router.push(`/admin/offers?${params.toString()}`)
  }

  const handleActiveChange = (value: string) => {
    const params = new URLSearchParams()
    if (value !== "all") params.set("active", value)
    if (searchParams?.get("search")) params.set("search", searchParams?.get("search") || "")
    router.push(`/admin/offers?${params.toString()}`)
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="px-4 py-2 border rounded-md flex-1"
            value={searchParams?.get("active") || "all"}
            onChange={(e) => handleActiveChange(e.target.value)}
          >
            <option value="all">جميع العروض</option>
            <option value="true">نشطة فقط</option>
            <option value="false">معطلة فقط</option>
          </select>
          <Input
            type="text"
            placeholder="بحث في العروض..."
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

