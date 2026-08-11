import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { VehicleRequestStatusSelect, VehicleRequestNotesForm } from "@/components/ops/VehicleRequestActions";
import { staffGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import { VEHICLE_REQUEST_TIMELINE_LABELS } from "@/types";
import type { VehicleRequest, SourceRegion } from "@/types";

const REGION_LABELS: Record<SourceRegion, string> = {
  usa: "USA",
  europe: "Europe",
  china: "China",
  nigeria: "Nigerian-used",
};

export default async function VehicleRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff) redirect("/login");

  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("vehicle_requests").select("*").eq("id", id).maybeSingle();

  if (!data) notFound();
  const request = data as VehicleRequest;

  return (
    <>
      <TopBar title={`${request.full_name}'s Request`} />
      <div className="ops-content">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <VehicleRequestStatusSelect requestId={request.id} status={request.status} />
          <span style={{ color: "var(--subtle)", fontSize: 12 }}>
            Submitted {new Date(request.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
            {" via "}
            {request.source === "dedicated_page" ? "Request page" : request.source === "vehicles_empty" ? "Vehicles (no match)" : "Sourcing Catalog (no match)"}
          </span>
        </div>

        <div className="ops-grid-2">
          <div className="ops-panel">
            <div className="ops-panel-title">Contact</div>
            <div className="ops-info-row">
              <span className="ops-info-label">Name</span>
              <span className="ops-info-value">{request.full_name}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Phone</span>
              <span className="ops-info-value">{request.phone}</span>
            </div>
            {request.email && (
              <div className="ops-info-row">
                <span className="ops-info-label">Email</span>
                <span className="ops-info-value">{request.email}</span>
              </div>
            )}
          </div>

          <div className="ops-panel">
            <div className="ops-panel-title">What They Want</div>
            <div className="ops-info-row">
              <span className="ops-info-label">Make / Model</span>
              <span className="ops-info-value">{request.make || request.model ? `${request.make ?? ""} ${request.model ?? ""}`.trim() : "Any"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Year Range</span>
              <span className="ops-info-value">{request.year_min || request.year_max ? `${request.year_min ?? "—"}–${request.year_max ?? "—"}` : "Any"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Budget</span>
              <span className="ops-info-value">{request.budget_max_kobo ? `Up to ${formatNaira(request.budget_max_kobo)}` : "Not specified"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Fuel Type</span>
              <span className="ops-info-value" style={{ textTransform: "capitalize" }}>{request.fuel_type ?? "No preference"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Source Preference</span>
              <span className="ops-info-value">
                {request.source_region_preference ? REGION_LABELS[request.source_region_preference] : "No preference"}
              </span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Condition</span>
              <span className="ops-info-value" style={{ textTransform: "capitalize" }}>{request.condition_preference ?? "No preference"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Timeline</span>
              <span className="ops-info-value">{request.timeline ? VEHICLE_REQUEST_TIMELINE_LABELS[request.timeline] : "—"}</span>
            </div>
            {request.notes && (
              <div className="ops-info-row">
                <span className="ops-info-label">Notes</span>
                <span className="ops-info-value">{request.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ops-panel">
          <div className="ops-panel-title">Staff Notes</div>
          <VehicleRequestNotesForm requestId={request.id} staffNotes={request.staff_notes} />
        </div>
      </div>
    </>
  );
}
