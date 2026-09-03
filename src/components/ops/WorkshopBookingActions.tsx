"use client";

import { useState } from "react";

const STATUSES = ["new", "confirmed", "in_progress", "completed", "cancelled"] as const;
type BookingStatus = (typeof STATUSES)[number];

interface Props {
  bookingId: string;
  status: BookingStatus;
  jobCardId: string | null;
  jobCards: Array<{ id: string; reference: string }>;
}

export function WorkshopBookingActions({ bookingId, status, jobCardId, jobCards }: Props) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentJobCard, setCurrentJobCard] = useState(jobCardId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(changes: Record<string, unknown>) {
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch(`/api/workshop-bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!response.ok) return;
      if ("status" in changes) setCurrentStatus(changes.status as BookingStatus);
      if ("job_card_id" in changes) setCurrentJobCard((changes.job_card_id as string | null) ?? "");
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 6, minWidth: 170 }}>
      <select
        className="ops-input"
        value={currentStatus}
        disabled={saving}
        onChange={(event) => save({ status: event.target.value })}
        aria-label="Booking status"
      >
        {STATUSES.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}
      </select>
      <select
        className="ops-input"
        value={currentJobCard}
        disabled={saving}
        onChange={(event) => save({ job_card_id: event.target.value || null })}
        aria-label="Linked job card"
      >
        <option value="">No job card</option>
        {jobCards.map((job) => <option key={job.id} value={job.id}>{job.reference}</option>)}
      </select>
      {saved && <span style={{ color: "var(--green)", fontSize: 11 }}>Saved</span>}
    </div>
  );
}
