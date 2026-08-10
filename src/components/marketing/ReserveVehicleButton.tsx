"use client";

import { useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/money";

interface BusinessProfile {
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
}

export function ReserveVehicleButton({ listingId }: { listingId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "needs-account" | "unavailable" | "error" | "reserved">("idle");
  const [depositKobo, setDepositKobo] = useState(0);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  async function reserve() {
    setState("loading");
    try {
      const res = await fetch("/api/pre-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourcing_listing_id: listingId }),
      });
      const json = await res.json().catch(() => null);
      if (res.status === 401) {
        setState("needs-account");
        return;
      }
      if (res.status === 409) {
        setState("unavailable");
        return;
      }
      if (!res.ok) {
        setState("error");
        return;
      }
      setDepositKobo(json.preOrder.deposit_amount_kobo);
      setBusinessProfile(json.businessProfile);
      setState("reserved");
    } catch {
      setState("error");
    }
  }

  if (state === "reserved") {
    return (
      <div style={{ padding: 20, background: "var(--blue-d)", borderRadius: 12, border: "1px solid var(--blue)" }}>
        <div style={{ fontWeight: 700, color: "var(--blue)", marginBottom: 8 }}>Vehicle Reserved!</div>
        <p style={{ fontSize: 13, color: "var(--text)", marginBottom: 12 }}>
          Pay a deposit of <strong>{formatNaira(depositKobo)}</strong> to confirm — our team starts
          working to win this vehicle at auction once your deposit clears. The final price is
          confirmed once we actually purchase it.
        </p>
        {businessProfile?.bank_account_number && (
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div><strong>Bank:</strong> {businessProfile.bank_name}</div>
            <div><strong>Account Name:</strong> {businessProfile.bank_account_name}</div>
            <div><strong>Account Number:</strong> {businessProfile.bank_account_number}</div>
          </div>
        )}
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
          A DMECH rep will confirm your deposit and keep you updated from your customer portal.
        </p>
      </div>
    );
  }

  if (state === "needs-account") {
    return (
      <div style={{ padding: 16, background: "var(--amber-d)", borderRadius: 12, fontSize: 13, color: "var(--text)" }}>
        You need a DMECH account to reserve a vehicle.{" "}
        <Link href="/register" style={{ color: "var(--blue)", fontWeight: 600 }}>Register or log in →</Link>
      </div>
    );
  }

  if (state === "unavailable") {
    return (
      <div style={{ padding: 16, background: "var(--red-d)", borderRadius: 12, fontSize: 13, color: "var(--red)" }}>
        Someone else just reserved this vehicle. Check the catalog for others available.
      </div>
    );
  }

  return (
    <div>
      <button type="button" className="v-card-btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={reserve} disabled={state === "loading"}>
        {state === "loading" ? "Reserving..." : "Reserve This Vehicle"}
      </button>
      {state === "error" && (
        <p style={{ fontSize: 12, color: "var(--red)", marginTop: 8 }}>Something went wrong — please try again.</p>
      )}
    </div>
  );
}
