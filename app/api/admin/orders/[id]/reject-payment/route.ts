import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: { id: string } }
) {
  try {
    // 🔐 تحقق أدمن
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const orderId = ctx.params.id;

    const body = await req.json().catch(() => ({}));
    const reason: string = (body?.reason || "").trim();

    if (!reason) {
      return NextResponse.json({ error: "سبب الرفض مطلوب" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    if (order.status !== "PROOFS_SUBMITTED") {
      return NextResponse.json(
        { error: "حالة الطلب غير صحيحة", currentStatus: order.status },
        { status: 409 }
      );
    }

    // ✅ نرجع الحالة فقط (بدون adminRejectionReason لأن ممكن مو موجود)
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "AWAITING_PROOFS" },
    });

    return NextResponse.json({
      ok: true,
      message: "⛔ تم رفض الدفع وطلب إعادة رفع الإثباتات",
      reason, // نرجع السبب بالرد (حتى الواجهة تعرضه إذا تحب)
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
