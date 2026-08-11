import { redirect } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { ClickableRow } from "@/components/ops/ClickableRow";
import { staffGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import { VEHICLE_REQUEST_STATUS_LABELS, VEHICLE_REQUEST_TIMELINE_LABELS } from "@/types";
import type { VehicleRequest } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  new: "ops-badge-amber",
  contacted: "ops-badge-blue",
  sourcing: "ops-badge-blue",
  fulfilled: "ops-badge-green",
  closed: "ops-badge-muted",
};

export default async function VehicleRequestsPage() {
  const staff = await staffGuard();
  if (!staff) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.from("vehicle_requests").select("*").order("created_at", { ascending: false });

  const requests = (data as VehicleRequest[] | null) ?? [];

  return (
    <>
      <TopBar title="Vehicle Requests" />
      <div className="ops-content">
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
          Visitors who told us what they&apos;re looking for when they couldn&apos;t find it
          already listed — triage these and update status as you follow up.
        </p>
        {requests.length === 0 ? (
          <div className="ops-panel" style={{ color: "var(--muted)", fontSize: 14 }}>
            No vehicle requests yet.
          </div>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Wanted</th>
                  <th>Budget</th>
                  <th>Timeline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <ClickableRow key={r.id} href={`/ops/vehicle-requests/${r.id}`}>
                    <td>{r.full_name}<br /><span style={{ fontSize: 11, color: "var(--subtle)" }}>{r.phone}</span></td>
                    <td>
                      {r.make || r.model ? `${r.make ?? ""} ${r.model ?? ""}`.trim() : "Any make/model"}
                      {(r.year_min || r.year_max) && (
                        <span style={{ color: "var(--subtle)" }}> ({r.year_min ?? "—"}–{r.year_max ?? "—"})</span>
                      )}
                    </td>
                    <td>{r.budget_max_kobo ? formatNaira(r.budget_max_kobo) : "—"}</td>
                    <td>{r.timeline ? VEHICLE_REQUEST_TIMELINE_LABELS[r.timeline] : "—"}</td>
                    <td>
                      <span className={`ops-badge ${STATUS_BADGE[r.status]}`}>{VEHICLE_REQUEST_STATUS_LABELS[r.status]}</span>
                    </td>
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
