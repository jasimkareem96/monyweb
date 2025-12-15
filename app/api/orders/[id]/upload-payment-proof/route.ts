import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET_NAME = "imeg_user";
const MAX_SIZE = 5 * 1024 * 1024;

function safeExtFromFile(file: File) {
  const name = file.name || "proof.png";
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "png";
  const blocked = ["exe", "bat", "cmd", "js", "sh", "php", "html"];
  return blocked.includes(ext) ? "png" : ext;
}

async function uploadToSupabaseStorage(supabase: any, file: File, path: string) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
    contentType: file.type || "image/png",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl as string;
}

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const orderId = ctx.params.id;

    const formData = await req.formData();
    const beforePaymentProof = formData.get("beforePaymentProof");
    const afterPaymentProof = formData.get("afterPaymentProof");
    const transactionId = formData.get("transactionId")?.toString() || "";
    const confirmationText = formData.get("confirmationText")?.toString() || "";

    if (!(beforePaymentProof instanceof File)) {
      return NextResponse.json({ error: "ملف إثبات الدفع (قبل) غير موجود" }, { status: 400 });
    }
    if (!(afterPaymentProof instanceof File)) {
      return NextResponse.json({ error: "ملف إثبات الدفع (بعد) غير موجود" }, { status: 400 });
    }
    if (beforePaymentProof.size > MAX_SIZE || afterPaymentProof.size > MAX_SIZE) {
      return NextResponse.json({ error: "حجم الملف أكبر من 5MB" }, { status: 400 });
    }

    // 1) اقرأ الطلب من نفس DB اللي تقرأ منها لوحة الأدمن (Prisma)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // خليه واسع شوي حتى ما تتعطل، حسب مساراتك الحالية
    const allowedStatuses = ["WAITING_PAYMENT", "AWAITING_PROOFS", "PENDING_QUOTE"];
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: "حالة الطلب غير صحيحة", currentStatus: order.status, allowed: allowedStatuses },
        { status: 409 }
      );
    }

    // 2) ارفع الصور على Supabase Storage
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase env missing", details: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const beforeExt = safeExtFromFile(beforePaymentProof);
    const afterExt = safeExtFromFile(afterPaymentProof);
    const basePath = `orders/${orderId}`;

    let beforeUrl = "";
    let afterUrl = "";

    try {
      beforeUrl = await uploadToSupabaseStorage(
        supabase,
        beforePaymentProof,
        `${basePath}/before.${beforeExt}`
      );
      afterUrl = await uploadToSupabaseStorage(
        supabase,
        afterPaymentProof,
        `${basePath}/after.${afterExt}`
      );
    } catch (e: any) {
      console.error("Storage upload error:", e);
      return NextResponse.json(
        { error: "فشل رفع صور الإثبات", details: e?.message ?? String(e) },
        { status: 500 }
      );
    }

    // 3) حدّث الطلب بـ Prisma (هذا اللي يخلي الأدمن يشوفه)
    await prisma.order.update({
      where: { id: orderId },
      data: {
        buyerBeforePaymentProof: beforeUrl,
        buyerAfterPaymentProof: afterUrl,
        paypalTransactionId: transactionId,
        buyerConfirmationText: confirmationText,
        status: "PROOFS_SUBMITTED",
      },
    });

    return NextResponse.json({ ok: true, message: "تم رفع إثباتات الدفع بنجاح" });
  } catch (err: any) {
    console.error("Upload payment proof error:", err);
    return NextResponse.json(
      { error: "خطأ غير متوقع", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
