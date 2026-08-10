import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { staffGuard } from "@/lib/guards";
import { logAudit } from "@/lib/audit";
import type { StaffRole, SourcingListingStatus } from "@/types";

const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "ops_manager", "sales_manager"];

const ALLOWED = [
  "make", "model", "year", "trim", "vin", "lot_number", "title_status", "primary_damage",
  "secondary_damage", "odometer_km", "run_and_drive", "fuel_type", "condition_notes",
  "location_country", "location_city", "auction_date", "estimated_price_usd_cents",
  "estimated_shipping_usd_cents", "photos", "status", "fulfilled_vehicle_id",
] as const;

const VALID_STATUSES: SourcingListingStatus[] = ["available", "reserved", "purchased", "delisted"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff || !EDIT_ROLES.includes(staff.role as StaffRole)) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if ("status" in body && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key];
  }
  updates.updated_at = new Date().toISOString();

  const supabase = createServiceClient();
  const { data: before } = await supabase.from("sourcing_listings").select("*").eq("id", id).maybeSingle();

  const { data, error } = await supabase
    .from("sourcing_listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not update the listing." }, { status: 500 });
  }

  await logAudit({ userId: staff.id, action: "update", tableName: "sourcing_listings", recordId: id, oldValue: before, newValue: updates });

  return NextResponse.json({ listing: data });
}
