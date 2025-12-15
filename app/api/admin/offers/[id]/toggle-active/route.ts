import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  ctx: { params: { id: string } }
) {
  try {
    // 🔐 تحقق أدمن
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const offerId = ctx.params.id;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      select: { id: true, isActive: true },
    });

    if (!offer) {
      return NextResponse.json(
        { error: "العرض غير موجود" },
        { status: 404 }
      );
    }

    const updated = await prisma.offer.update({
      where: { id: offerId },
      data: { isActive: !offer.isActive },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({
      ok: true,
      offer: updated,
      message: updated.isActive
        ? "✅ تم تفعيل العرض"
        : "⛔ تم إيقاف العرض",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
