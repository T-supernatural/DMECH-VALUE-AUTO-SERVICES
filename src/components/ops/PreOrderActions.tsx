"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRE_ORDER_STATUS_LABELS } from "@/types";
import type { PaymentMethod, PreOrderStatus } from "@/types";

const STATUS_OPTIONS: PreOrderStatus[] = [
  "pending_deposit", "deposit_paid", "sourcing", "purchased", "cancelled", "refunded",
];

export function PreOrderStatusSelect({ preOrderId, status }: { preOrderId: string; status: PreOrderStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function updateStatus(next: PreOrderStatus) {
    setValue(next);
    setSaving(true);
    await fetch(`/api/pre-orders/${preOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      className="ops-input"
      style={{ marginBottom: 0, width: "auto" }}
      value={value}
      disabled={saving}
      onChange={(e) => updateStatus(e.target.value as PreOrderStatus)}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>{PRE_ORDER_STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}

export function RecordDepositAction({ preOrderId }: { preOrderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recordDeposit() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/pre-orders/${preOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deposit_paid: true, deposit_payment_method: method }),
    });
    const json = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      setError(json?.error || "Something went wrong.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" className="ops-btn" onClick={() => setOpen(true)}>
        Record Deposit Payment
      </button>
    );
  }

  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <select className="ops-input" style={{ marginBottom: 0, width: "auto" }} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="paystack">Paystack</option>
        <option value="pos">POS</option>
        <option value="cash">Cash</option>
      </select>
      <button type="button" className="ops-btn" onClick={recordDeposit} disabled={loading}>
        {loading ? "..." : "Confirm"}
      </button>
      <button type="button" className="ops-btn-ghost" onClick={() => setOpen(false)} disabled={loading}>
        Cancel
      </button>
      {error && <span style={{ color: "var(--red)", fontSize: 12 }}>{error}</span>}
    </span>
  );
}
