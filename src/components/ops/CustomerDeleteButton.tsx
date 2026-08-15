"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CustomerDeleteButton({ customerId, customerName }: { customerId: string; customerName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = window.confirm(`Delete customer "${customerName}"? This will hide them from the customer list.`);
    if (!confirmed) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || "Unable to delete customer.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to delete customer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="ops-btn-danger"
      onClick={handleDelete}
      disabled={busy}
      style={{ minWidth: 92 }}
    >
      {busy ? "Deleting..." : "Delete"}
    </button>
  );
}
