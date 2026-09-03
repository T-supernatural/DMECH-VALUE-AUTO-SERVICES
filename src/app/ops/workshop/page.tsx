import { redirect } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { ClickableRow } from "@/components/ops/ClickableRow";
import { WorkshopBookingActions } from "@/components/ops/WorkshopBookingActions";
import { staffGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import { PRIORITY_CLASS, PRIORITY_LABEL } from "@/lib/ops/job-card";
import type { JobCard, JobCardStage } from "@/types";

interface JobCardRow extends JobCard {
  customers: { full_name: string } | null;
  specialists: { name: string } | null;
}

const STAGE_CLASS: Record<JobCardStage, string> = {
  reception: "ops-badge-muted",
  diagnostics: "ops-badge-blue",
  planning: "ops-badge-blue",
  execution: "ops-badge-amber",
  qa: "ops-badge-amber",
  released: "ops-badge-green",
};

const STAGE_LABEL: Record<JobCardStage, string> = {
  reception: "Reception",
  diagnostics: "Diagnostics",
  planning: "Planning",
  execution: "Execution",
  qa: "QA",
  released: "Released",
};

export default async function OpsWorkshopPage() {
  const staff = await staffGuard();
  if (!staff) redirect("/login");

  const supabase = await createClient();
  const [jobCardResponse, bookingResponse] = await Promise.all([
    supabase.from("job_cards").select("*, customers(full_name), specialists(name)").order("created_at", { ascending: false }),
    supabase.from("workshop_bookings").select("*").order("created_at", { ascending: false }),
  ]);

  const jobCards = (jobCardResponse.data as JobCardRow[] | null) ?? [];
  const bookings = (bookingResponse.data as Array<{
    id: string;
    name: string;
    phone: string;
    vehicle_make: string | null;
    vehicle_model: string | null;
    vehicle_year: string | null;
    services: string[];
    preferred_date: string | null;
    preferred_time: string | null;
    status: "new" | "confirmed" | "in_progress" | "completed" | "cancelled";
    job_card_id: string | null;
    complaint: string | null;
    created_at: string;
  }> | null) ?? [];

  return (
    <>
      <TopBar title="Workshop" />
      <div className="ops-content">
        <div className="ops-panel" style={{ marginBottom: 20 }}>
          <div className="ops-panel-title">Booking Requests</div>
          {bookings.length === 0 ? <div style={{ color: "var(--muted)", fontSize: 14 }}>No booking requests yet.</div> : (
            <div className="ops-table-wrap">
              <table className="ops-table">
                <thead><tr><th>Customer</th><th>Vehicle</th><th>Requested slot</th><th>Services</th><th>Manage</th></tr></thead>
                <tbody>{bookings.map((booking) => <tr key={booking.id}>
                  <td><strong>{booking.name}</strong><br /><span style={{ color: "var(--muted)", fontSize: 12 }}>{booking.phone}</span></td>
                  <td>{[booking.vehicle_year, booking.vehicle_make, booking.vehicle_model].filter(Boolean).join(" ") || "—"}</td>
                  <td>{booking.preferred_date || "Flexible"}{booking.preferred_time ? ` · ${booking.preferred_time}` : ""}</td>
                  <td>{booking.services.join(", ") || "General service"}</td>
                  <td><WorkshopBookingActions bookingId={booking.id} status={booking.status} jobCardId={booking.job_card_id} jobCards={jobCards.map((job) => ({ id: job.id, reference: job.reference }))} /></td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
        {jobCards.length === 0 ? (
          <div className="ops-panel" style={{ color: "var(--muted)", fontSize: 14 }}>
            No job cards yet.
          </div>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Vehicle</th>
                  <th>Stage</th>
                  <th>Priority</th>
                  <th>Customer</th>
                  <th>Quote</th>
                </tr>
              </thead>
              <tbody>
                {jobCards.map((j) => (
                  <ClickableRow key={j.id} href={`/ops/workshop/${j.id}`}>
                    <td>{j.reference}</td>
                    <td>{j.vehicle_desc}</td>
                    <td>
                      <span className={`ops-badge ${STAGE_CLASS[j.stage]}`}>{STAGE_LABEL[j.stage]}</span>
                    </td>
                    <td>
                      <span className={`ops-badge ${PRIORITY_CLASS[j.priority]}`}>{PRIORITY_LABEL[j.priority]}</span>
                    </td>
                    <td>{j.customers?.full_name ?? "—"}</td>
                    <td>{j.quote_kobo ? formatNaira(j.quote_kobo) : "—"}</td>
                  </ClickableRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
