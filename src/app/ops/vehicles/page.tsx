import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { VehicleTableActions } from "@/components/ops/VehicleTableActions";
import { staffGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle, AcquisitionChannel, StaffRole } from "@/types";

const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "ops_manager", "sales_manager", "it_manager"];

const CHANNEL_LABEL: Record<AcquisitionChannel, string> = {
  import: "Import",
  local_outright: "Local Outright",
  consignment: "Consignment",
  trade_in: "Trade-In",
};

export default async function OpsVehiclesPage() {
  const staff = await staffGuard();
  if (!staff) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const vehicles = (data as Vehicle[] | null) ?? [];

  return (
    <>
      <TopBar
        title="Vehicles"
        actions={
          EDIT_ROLES.includes(staff.role as StaffRole) ? (
            <Link href="/ops/vehicles/new" className="ops-btn" style={{ textDecoration: "none" }}>
              + Add Vehicle
            </Link>
          ) : undefined
        }
      />
      <div className="ops-content">
        {vehicles.length === 0 ? (
          <div className="ops-panel" style={{ color: "var(--muted)", fontSize: 14 }}>
            No vehicles in the system yet.
          </div>
        ) : (
          <VehicleTableActions vehicles={vehicles} channelLabelMap={CHANNEL_LABEL} />
        )}
      </div>
    </>
  );
}
