import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserFilters } from "@/components/admin/UserFilters"
import { UserActions } from "@/components/admin/UserActions"

const roleLabels: Record<string, string> = {
  ADMIN: "مدير",
  MERCHANT: "تاجر",
  BUYER: "مشتري",
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string; search?: string; page?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const page = parseInt(searchParams.page || "1")
  const pageSize = 20
  const skip = (page - 1) * pageSize

  let where: any = {}

  if (searchParams.role) {
    where.role = searchParams.role
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search } },
      { email: { contains: searchParams.search } },
    ]
  }

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        merchantProfile: true,
        _count: {
          select: {
            ordersAsBuyer: true,
            ordersAsMerchant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(totalUsers / pageSize)

  // Statistics
  const stats = await Promise.all([
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "MERCHANT" } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.user.count({ where: { isBlocked: true } }),
    prisma.user.count({ where: { isVerified: true } }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <Link href="/admin">
            <Button variant="outline">العودة</Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">المديرين</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats[0]}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">التجار</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats[1]}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">المشترين</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats[2]}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">محظورين</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats[3]}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">موثقين</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats[4]}</p>
            </CardContent>
          </Card>
        </div>

        <UserFilters />

        {users.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">لا يوجد مستخدمين</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">{user.name || "بدون اسم"}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "MERCHANT"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {roleLabels[user.role] || user.role}
                          </span>
                          {user.isBlocked && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              محظور
                            </span>
                          )}
                          {user.isVerified && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              موثق
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">تاريخ التسجيل</p>
                            <p className="font-semibold">
                              {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                          {user.role === "MERCHANT" && user.merchantProfile && (
                            <>
                              <div>
                                <p className="text-gray-600">التقييم</p>
                                <p className="font-semibold">
                                  ⭐ {user.merchantProfile.averageRating.toFixed(1)} (
                                  {user.merchantProfile.ratingCount})
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">الطلبات المكتملة</p>
                                <p className="font-semibold">
                                  {user.merchantProfile.completedOrders}
                                </p>
                              </div>
                            </>
                          )}
                          {user.role === "BUYER" && (
                            <div>
                              <p className="text-gray-600">عدد الطلبات</p>
                              <p className="font-semibold">{user._count.ordersAsBuyer}</p>
                            </div>
                          )}
                          {user.role === "MERCHANT" && (
                            <div>
                              <p className="text-gray-600">عدد الطلبات</p>
                              <p className="font-semibold">{user._count.ordersAsMerchant}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <UserActions user={user} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/users?page=${page - 1}${searchParams.role ? `&role=${searchParams.role}` : ""}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
                  >
                    <Button variant="outline">السابق</Button>
                  </Link>
                )}
                <span className="px-4 py-2">صفحة {page} من {totalPages}</span>
                {page < totalPages && (
                  <Link
                    href={`/admin/users?page=${page + 1}${searchParams.role ? `&role=${searchParams.role}` : ""}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
                  >
                    <Button variant="outline">التالي</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

