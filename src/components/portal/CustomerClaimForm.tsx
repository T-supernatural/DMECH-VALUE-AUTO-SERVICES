"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CustomerClaimForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/customers/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not send the code.");
      setSent(true);
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Could not send the code.");
    } finally { setLoading(false); }
  }

  async function claimAccount() {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/customers/claim", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not link your account.");
      router.push("/dashboard"); router.refresh();
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Could not link your account.");
    } finally { setLoading(false); }
  }

  return <div className="ops-panel" style={{ maxWidth: 560, margin: "0 auto 16px" }}>
    <div className="ops-panel-title">Already a DMECH customer?</div>
    <p style={{ margin: "0 0 14px", color: "var(--muted)", fontSize: 13 }}>Verify the phone number you gave DMECH. We&apos;ll safely connect your existing vehicles, payments, and documents to this portal account.</p>
    <label className="ops-field-label" htmlFor="claim-phone">WhatsApp phone number</label>
    <input id="claim-phone" className="ops-input" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="08012345678" disabled={sent || loading} />
    {!sent ? <button type="button" className="ops-btn" onClick={sendCode} disabled={loading || !phone}>{loading ? "Sending…" : "Send WhatsApp code"}</button> : <>
      <label className="ops-field-label" htmlFor="claim-code" style={{ marginTop: 14 }}>Six-digit code</label>
      <input id="claim-code" className="ops-input" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} disabled={loading} />
      <button type="button" className="ops-btn" onClick={claimAccount} disabled={loading || code.length !== 6}>{loading ? "Verifying…" : "Verify and link my account"}</button>
    </>}
    <div aria-live="polite" aria-atomic="true">{error && <p style={{ color: "var(--red)", fontSize: 12, margin: "10px 0 0" }}>{error}</p>}</div>
  </div>;
}
