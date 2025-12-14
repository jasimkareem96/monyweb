import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// مهم حتى ما يشتغل على Edge
export const runtime = "nodejs";

// عدّل الاسم إذا بكتك مختلف
const BUCKET = "img_user";

// 5MB
const MAX_SIZE = 5 * 1024 * 1024;

function safeExtFromFile(file: File) {
  const name = file.name || "proof.png";
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "png";
  // منع امتدادات خطرة
  const blocked = ["exe", "bat", "cmd", "js", "sh", "php", "html"];
  return blocked.includes(ext) ? "png" : ext;
}

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const orderId = ctx.params.id;

    // حماية بسيطة للـ id
    if (!orderId || orderId.includes("..") || orderId.includes("/") || orderId.includes("\\")) {
      return NextResponse.json({ error: "Order ID غير صالح" }, { status: 400 });
    }

    // 1) اقرأ formData بنفس الأسماء اللي ظهرت عندك
    const formData = await req.formData();

    const beforePaymentProof = formData.get("beforePaymentProof") as File | null;
    const afterPaymentProof = formData.get("afterPaymentProof") as File | null;
    const transactionId = (formData.get("transactionId") as string | null) ?? "";
    const confirmationText = (formData.get("confirmationText") as string | null) ?? "";

    // ✅ تحديث: تحقق من الوجود + الحجم (size==0) لأن أحيانًا ينرسل File فارغ
    if (
      !beforePaymentProof ||
      !afterPaymentProof ||
      beforePaymentProof.size === 0 ||
      afterPaymentProof.size === 0 ||
      !transactionId.trim() ||
      !confirmationText.trim()
    ) {
      return NextResponse.json(
        { error: "ملفات الإثبات أو البيانات النصية غير مكتملة" },
        { status: 400 }
      );
    }

    // 2) تحقق سريع من النوع والحجم
    const files = [beforePaymentProof, afterPaymentProof];

    for (const f of files) {
      if (f.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "حجم الملف يجب أن يكون أقل من 5MB" },
          { status: 400 }
        );
      }
      if (!f.type || !f.type.startsWith("image/")) {
        return NextResponse.json({ error: "الملف يجب أن يكون صورة" }, { status: 400 });
      }
    }

    // 3) جهّز Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase env vars missing: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 4) ارفع الملفين إلى Storage
    const ts = Date.now();

    const beforeExt = safeExtFromFile(beforePaymentProof);
    const afterExt = safeExtFromFile(afterPaymentProof);

    const beforePath = `payment_proofs/${orderId}/before_${ts}.${beforeExt}`;
    const afterPath = `payment_proofs/${orderId}/after_${ts}.${afterExt}`;

    const beforeBuf = Buffer.from(await beforePaymentProof.arrayBuffer());
    const afterBuf = Buffer.from(await afterPaymentProof.arrayBuffer());

    const up1 = await supabase.storage.from(BUCKET).upload(beforePath, beforeBuf, {
      contentType: beforePaymentProof.type,
      upsert: false,
    });

    if (up1.error) {
      console.error("Supabase upload before error:", up1.error);
      return NextResponse.json(
        { error: `فشل رفع صورة قبل الدفع: ${up1.error.message}` },
        { status: 500 }
      );
    }

    const up2 = await supabase.storage.from(BUCKET).upload(afterPath, afterBuf, {
      contentType: afterPaymentProof.type,
      upsert: false,
    });

    if (up2.error) {
      console.error("Supabase upload after error:", up2.error);
      return NextResponse.json(
        { error: `فشل رفع صورة بعد الدفع: ${up2.error.message}` },
        { status: 500 }
      );
    }

    const beforeUrl = supabase.storage.from(BUCKET).getPublicUrl(beforePath).data.publicUrl;
    const afterUrl = supabase.storage.from(BUCKET).getPublicUrl(afterPath).data.publicUrl;

    // ✅ إذا عندك Prisma وتريد تخزين الروابط بالطلب، فك التعليق وعدّل أسماء الحقول حسب جدولك
    /*
    const { prisma } = await import("@/lib/prisma");
    await prisma.order.update({
      where: { id: orderId },
      data: {
        buyerBeforePaymentProof: beforeUrl,
        buyerAfterPaymentProof: afterUrl,
        paypalTransactionId: transactionId,
        buyerConfirmationText: confirmationText,
        // status: "ESCROWED",
      },
    });
    */

    // 5) رجّع النتيجة للواجهة
    return NextResponse.json({
      success: true,
      beforeUrl,
      afterUrl,
      transactionId,
    });
  } catch (err: any) {
    console.error("Upload payment proof error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
