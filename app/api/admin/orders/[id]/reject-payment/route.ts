import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const orderId = ctx.params.id
  const body = await req.json().catch(() => ({}))
  const reason = (body?.reason || "").toString().trim()

  if (!reason) {
    return NextResponse.json({ error: "سبب الرفض مطلوب" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, buyerId: true, merchantId: true },
  })

  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
  if (order.status !== "PROOFS_SUBMITTED") {
    return NextResponse.json(
      { error: "لا يمكن رفض الدفع بهذه الحالة", currentStatus: order.status },
      { status: 409 }
    )
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "AWAITING_PROOFS",
      buyerRejectedReason: reason,
    },
  })

  await prisma.notification.createMany({
    data: [
      {
        userId: order.buyerId,
        type: "ORDER",
        title: "تم رفض إثبات الدفع",
        message: `سبب الرفض: ${reason}`,
        link: `/orders/${orderId}/payment`,
      },
      {
        userId: order.merchantId,
        type: "ORDER",
        title: "إثبات الدفع مرفوض",
        message: "تم رفض إثبات الدفع من الإدارة. بانتظار إعادة رفع الإثباتات.",
        link: `/orders/${orderId}`,
      },
    ],
  })

  return NextResponse.json({ ok: true })
}
