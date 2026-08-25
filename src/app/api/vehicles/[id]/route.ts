import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { staffGuard } from "@/lib/guards";
import { logAudit } from "@/lib/audit";
import { formatNaira } from "@/lib/money";
import type { StaffRole } from "@/types";

// Mirrors oro-energy-management-hub's equipment PATCH route: role check,
// then build `updates` only from this explicit allowlist of writable
// columns — never spread the raw request body into the update.
// certification_status is deliberately NOT here — it only changes via
// POST /api/vehicles/[id]/certify, which also creates the matching
// warranty_policies row in the same step (see VehicleEditForm's comment).
const ALLOWED = [
  "lifecycle_stage",
  "sale_price_kobo",
  "condition",
  "colour",
  "video_url",
  "is_published",
  "lot_number",
  "seo_title",
  "seo_description",
  "use_categories",
  "history_report",
  "display_stamps",
] as const;

const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "ops_manager", "sales_manager", "it_manager"];

// Freeform text fields prone to stray leading/trailing whitespace from
// manual entry -- trimmed at the boundary so it can never reach the DB.
const TRIM_FIELDS = ["colour", "lot_number"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!EDIT_ROLES.includes(staff.role as StaffRole)) {
    return NextResponse.json({ error: "Not permitted to edit vehicles." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key];
  }
  if ("display_stamps" in updates && (!Array.isArray(updates.display_stamps) || !(updates.display_stamps as unknown[]).every((stamp) => ["verified", "sold", "reserved", "inspected", "delivered"].includes(stamp as string)))) return NextResponse.json({ error: "Invalid vehicle display stamp." }, { status: 400 });
  for (const key of TRIM_FIELDS) {
    if (typeof updates[key] === "string") updates[key] = (updates[key] as string).trim();
  }

  // service-role: vehicles has no staff UPDATE RLS policy (only SELECT) —
  // the RLS-respecting client would silently update 0 rows here.
  const supabase = createServiceClient();

  // Reserve From Abroad's leverage mechanism: a pre-ordered vehicle can't
  // be marked delivered while the customer still owes the balance from
  // when DMECH bought it. Without this, "balance before delivery" would
  // just be a UI convention staff could ignore.
  if (updates.lifecycle_stage === "delivered") {
    const { data: listing } = await supabase
      .from("sourcing_listings")
      .select("id")
      .eq("fulfilled_vehicle_id", id)
      .maybeSingle();

    if (listing) {
      const { data: unpaidPreOrder } = await supabase
        .from("pre_orders")
        .select("id, balance_amount_kobo")
        .eq("sourcing_listing_id", listing.id)
        .eq("status", "purchased")
        .eq("balance_paid", false)
        .gt("balance_amount_kobo", 0)
        .maybeSingle();

      if (unpaidPreOrder) {
        return NextResponse.json(
          {
            error: `This vehicle has an unpaid balance of ${formatNaira(unpaidPreOrder.balance_amount_kobo)} on its pre-order. Record the balance payment before marking it delivered.`,
          },
          { status: 409 },
        );
      }
    }
  }

  const { data, error } = await supabase
    .from("vehicles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Vehicle update failed", {
      vehicleId: id,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const missingColumn = error.code === "42703" || /column .* does not exist/i.test(error.message);
    return NextResponse.json(
      {
        error: missingColumn
          ? "Vehicle updates need the latest database migrations. Apply migrations 018 and 029 in Supabase, then try again."
          : "Could not update the vehicle. Check the server log for the database error.",
      },
      { status: 500 },
    );
  }

  // Only is_published is audited here — a public-visibility toggle is a
  // meaningfully trust-sensitive change; the other allowlisted fields
  // (price, colour, etc.) aren't logged yet, a known gap in coverage.
  if ("is_published" in updates) {
    await logAudit({
      userId: staff.id,
      action: "update",
      tableName: "vehicles",
      recordId: id,
      newValue: { is_published: updates.is_published },
    });
  }

  return NextResponse.json({ vehicle: data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!EDIT_ROLES.includes(staff.role as StaffRole)) {
    return NextResponse.json({ error: "Not permitted to delete vehicles." }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("vehicles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Vehicle not found or already deleted." }, { status: 404 });
  }

  await logAudit({
    userId: staff.id,
    action: "delete",
    tableName: "vehicles",
    recordId: id,
    oldValue: { deleted_at: null },
    newValue: { deleted_at: new Date().toISOString() },
  });

  return NextResponse.json({ success: true, deletedId: id });
}
