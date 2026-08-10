"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usdCentsToDollars } from "@/lib/money";
import type { SourcingListing } from "@/types";

export function MarkAsPurchasedAction({ listing }: { listing: SourcingListing }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [priceUsd, setPriceUsd] = useState(String(usdCentsToDollars(listing.estimated_price_usd_cents)));
  const [shippingUsd, setShippingUsd] = useState(
    listing.estimated_shipping_usd_cents ? String(usdCentsToDollars(listing.estimated_shipping_usd_cents)) : "",
  );
  const [vin, setVin] = useState(listing.vin ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function markPurchased() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch(`/api/sourcing-listings/${listing.id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actual_purchase_price_usd: parseFloat(priceUsd) || 0,
          actual_shipping_usd: shippingUsd ? parseFloat(shippingUsd) : null,
          vin: vin || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      router.push(`/ops/vehicles/${json.vehicleId}`);
    } catch {
      setError("Something went wrong.");
      setStatus("error");
    }
  }

  if (listing.status === "purchased" || listing.status === "delisted") return null;

  if (!open) {
    return (
      <div className="ops-panel">
        <div className="ops-panel-title">We Won This Auction</div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
          Once DMECH actually pays for this vehicle, mark it purchased here — this creates the
          real vehicle record, links it back to this listing, and advances any pre-order against
          it (the customer is notified).
        </p>
        <button className="ops-btn" onClick={() => setOpen(true)}>Mark as Purchased</button>
      </div>
    );
  }

  return (
    <div className="ops-panel">
      <div className="ops-panel-title">Mark as Purchased</div>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
        Enter the real amount actually paid at auction — this is very likely different from the
        estimate above, which is the entire point of a pre-order deposit not being a locked-in
        price.
      </p>
      <label className="ops-field-label" htmlFor="mp-price">Actual Purchase Price (USD)</label>
      <input id="mp-price" className="ops-input" type="number" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} />
      <label className="ops-field-label" htmlFor="mp-shipping">Actual Shipping Cost (USD, optional)</label>
      <input id="mp-shipping" className="ops-input" type="number" value={shippingUsd} onChange={(e) => setShippingUsd(e.target.value)} />
      <label className="ops-field-label" htmlFor="mp-vin">VIN (optional, if now confirmed)</label>
      <input id="mp-vin" className="ops-input" value={vin} onChange={(e) => setVin(e.target.value)} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
        <button className="ops-btn" onClick={markPurchased} disabled={status === "saving" || !priceUsd}>
          {status === "saving" ? "Creating Vehicle..." : "Confirm Purchase"}
        </button>
        <button className="ops-btn" style={{ background: "transparent", color: "var(--muted)" }} onClick={() => setOpen(false)} disabled={status === "saving"}>
          Cancel
        </button>
        {error && <span style={{ color: "var(--red)", fontSize: 12 }}>{error}</span>}
      </div>
    </div>
  );
}
