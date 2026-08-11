"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VEHICLE_REQUEST_STATUS_LABELS } from "@/types";
import type { VehicleRequestStatus } from "@/types";

const STATUS_OPTIONS: VehicleRequestStatus[] = ["new", "contacted", "sourcing", "fulfilled", "closed"];

export function VehicleRequestStatusSelect({ requestId, status }: { requestId: string; status: VehicleRequestStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function updateStatus(next: VehicleRequestStatus) {
    setValue(next);
    setSaving(true);
    await fetch(`/api/vehicle-requests/${requestId}`, {
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
      onChange={(e) => updateStatus(e.target.value as VehicleRequestStatus)}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>{VEHICLE_REQUEST_STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}

export function VehicleRequestNotesForm({ requestId, staffNotes }: { requestId: string; staffNotes: string | null }) {
  const router = useRouter();
  const [notes, setNotes] = useState(staffNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/vehicle-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_notes: notes }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div>
      <textarea
        className="ops-input"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Internal notes — what you've tried, who you've contacted, next steps..."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" className="ops-btn" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Notes"}
        </button>
        {saved && <span style={{ color: "var(--green)", fontSize: 12 }}>Saved</span>}
      </div>
    </div>
  );
}
