"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function OfferAdminActions({
  offer,
}: {
  offer: { id: string; isActive: boolean };
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function toggleActive() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}/toggle-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل");
      setMsg(data?.message || "✅ تم التحديث");
      location.reload();
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-4 border-t space-y-3 min-w-[220px]">
      <div className="text-sm text-gray-600">
        الحالة:{" "}
        <span className="font-semibold">
          {offer.isActive ? "نشط ✅" : "معطل ⛔"}
        </span>
      </div>

      <Button onClick={toggleActive} disabled={loading}>
        {offer.isActive ? "إيقاف العرض" : "تفعيل العرض"}
      </Button>

      {msg && <div className="text-sm">{msg}</div>}
    </div>
  );
}
