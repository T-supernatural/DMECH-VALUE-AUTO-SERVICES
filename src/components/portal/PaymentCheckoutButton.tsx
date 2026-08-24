"use client";

import { useId, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { fromKobo, formatNaira } from "@/lib/money";
import type { OnlinePaymentTarget } from "@/types";

export function PaymentCheckoutButton({ targetType, targetId, outstandingKobo }: { targetType: OnlinePaymentTarget; targetId: string; outstandingKobo: number }) {
  const inputId = useId();
  const [amount, setAmount] = useState(String(fromKobo(outstandingKobo)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function beginCheckout() {
    const amountSubunit = Math.round(Number(amount) * 100);
    if (!Number.isSafeInteger(amountSubunit) || amountSubunit <= 0 || amountSubunit > outstandingKobo) {
      setError(`Enter an amount from ₦0.01 to ${formatNaira(outstandingKobo)}.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target_type: targetType, target_id: targetId, currency: "NGN", amount_subunit: amountSubunit }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.authorizationUrl) throw new Error(payload?.error || "Could not begin secure checkout.");
      window.location.assign(payload.authorizationUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Could not begin secure checkout.");
      setLoading(false);
    }
  }

  return <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
    <div><label className="ops-field-label" htmlFor={inputId}>Amount to pay (NGN)</label><input id={inputId} className="ops-input" type="number" min="0.01" max={fromKobo(outstandingKobo)} step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} style={{ margin: 0, width: 145 }} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined} disabled={loading} /></div>
    <button type="button" className="ops-btn" onClick={beginCheckout} disabled={loading}>{loading ? <Loader2 size={15} className="portal-spin" aria-hidden="true" /> : <CreditCard size={15} aria-hidden="true" />}{loading ? "Opening checkout…" : "Pay securely"}</button>
    <div aria-live="polite" aria-atomic="true" style={{ width: "100%" }}>{error && <p id={`${inputId}-error`} style={{ margin: "4px 0 0", color: "var(--red)", fontSize: 12 }}>{error}</p>}</div>
  </div>;
}
