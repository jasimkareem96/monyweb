"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const roleOptions = [
  { value: "", label: "جميع الأدوار" },
  { value: "ADMIN", label: "مدير" },
  { value: "MERCHANT", label: "تاجر" },
  { value: "BUYER", label: "مشتري" },
]

export function UserFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState(searchParams.get("search") || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    const role = searchParams.get("role")
    if (role) params.set("role", role)
    if (search) params.set("search", search)
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleRoleChange = (value: string) => {
    const params = new URLSearchParams()
    if (value) params.set("role", value)
    if (searchParams.get("search")) params.set("search", searchParams.get("search") || "")
    router.push(`/admin/users?${params.toString()}`)
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="px-4 py-2 border rounded-md flex-1"
            value={searchParams.get("role") || ""}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Input
            type="text"
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
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

