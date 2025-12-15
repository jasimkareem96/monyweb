import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

async function uploadToSupabase(
  supabase: any,
  file: File,
  path: string
) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: file.type || "image/png",
      upsert: true,
    });

  if (error) throw error;
}

export async function POST(
  req: NextRequest,
  ctx: { params: { id: string } }
) {
  try {
    const orderId = ctx.params.id;
    const formData = await req.formData();

    const beforePaymentProof = formData.get("beforePaymentProof");
    const afterPaymentProof = formData.get("afterPaymentProof");
    const transactionId = formData.get("transactionId")?.toString() || "";
    const confirmationText = formData.get("confirmationText")?.toString() || "";

    if (!(beforePaymentProof instanceof File)) {
      return NextResponse.json(
        { error: "ملف إثبات الدفع (قبل) غير موجود" },
        { status: 400 }
      );
    }

    if (!(afterPaymentProof instanceof File)) {
      return NextResponse.json(
        { error: "ملف إثبات الدفع (بعد) غير موجود" },
        { status: 400 }
      );
    }

    if (
      beforePaymentProof.size > MAX_SIZE ||
      afterPaymentProof.size > MAX_SIZE
    ) {
      return NextResponse.json(
        { error: "حجم الملف أكبر من 5MB" },
        { status: 400 }
      );
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // جلب الطلب
    const { data: order, error: orderError } = await supabase
      .from("Order")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    const allowedStatuses = ["WAITING_PAYMENT", "AWAITING_PROOFS"];

    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          error: "حالة الطلب غير صحيحة",
          currentStatus: order.status,
        },
        { status: 409 }
      );
    }

    const beforeExt = safeExtFromFile(beforePaymentProof);
    const afterExt = safeExtFromFile(afterPaymentProof);
    const basePath = `orders/${orderId}`;

    // رفع الملفات
    try {
      await uploadToSupabase(
        supabase,
        beforePaymentProof,
        `${basePath}/before.${beforeExt}`
      );
      await uploadToSupabase(
        supabase,
        afterPaymentProof,
        `${basePath}/after.${afterExt}`
      );
    } catch (e: any) {
      console.error("Storage upload error:", e);
      return NextResponse.json(
        { error: "فشل رفع صور الإثبات", details: e.message },
        { status: 500 }
      );
    }

    const { data: beforeUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${basePath}/before.${beforeExt}`);

    const { data: afterUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${basePath}/after.${afterExt}`);

    // تحديث الطلب (أسماء الأعمدة الصحيحة)
    const { error: updateError } = await supabase
      .from("Order")
      .update({
        buyerBeforePaymentProof: beforeUrl.publicUrl,
        buyerAfterPaymentProof: afterUrl.publicUrl,
        paypalTransactionId: transactionId,
        buyerConfirmationText: confirmationText,
        status: "PROOFS_SUBMITTED",
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Order update error:", updateError);
      return NextResponse.json(
        {
          error: "فشل تحديث الطلب بعد رفع الإثباتات",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "تم رفع إثباتات الدفع بنجاح",
    });
  } catch (err: any) {
    console.error("Upload payment proof error:", err);
    return NextResponse.json(
      { error: "خطأ غير متوقع", details: err.message },
      { status: 500 }
    );
  }
}
