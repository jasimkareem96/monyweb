import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(_req: NextRequest, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const orderId = ctx.params.id

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, buyerId: true, merchantId: true },
  })

  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
  if (order.status !== "PROOFS_SUBMITTED") {
    return NextResponse.json(
      { error: "لا يمكن قبول الدفع بهذه الحالة", currentStatus: order.status },
      { status: 409 }
    )
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "ESCROWED" },
  })

  // إشعار للطرفين (اختياري لكن احترافي)
  await prisma.notification.createMany({
    data: [
      {
        userId: order.buyerId,
        type: "ORDER",
        title: "تم قبول إثبات الدفع",
        message: "تمت مراجعة إثباتات الدفع وقبولها. العملية مستمرة.",
        link: `/orders/${orderId}`,
      },
      {
        userId: order.merchantId,
        type: "ORDER",
        title: "تم تأكيد الدفع",
        message: "تم تأكيد الدفع من الإدارة. يمكنك بدء تنفيذ الخدمة.",
        link: `/orders/${orderId}`,
      },
    ],
  })

  return NextResponse.json({ ok: true })
}
