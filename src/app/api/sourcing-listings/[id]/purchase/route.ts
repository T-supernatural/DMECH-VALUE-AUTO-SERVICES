import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { staffGuard } from "@/lib/guards";
import { logAudit } from "@/lib/audit";
import { queueNotification } from "@/lib/notifications";
import { dollarsToUsdCents } from "@/lib/money";
import type { StaffRole, SourcingListing, SourceRegion, VehiclePhoto } from "@/types";

const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "ops_manager", "sales_manager"];

// Copart/IAAI are both US auction houses; europe_other/china_ev map 1:1.
// 'other' has no fixed region in the vehicles schema's source_region enum,
// so it's left null rather than guessed.
const SOURCE_REGION_MAP: Record<SourcingListing["source_platform"], SourceRegion | null> = {
  copart: "usa",
  iaai: "usa",
  europe_other: "europe",
  china_ev: "china",
  other: null,
};

// This is the one action that graduates a sourcing_listing into a real,
// ownable `vehicles` row -- the exact gap flagged during planning: without
// it, staff had no way to actually close the loop between "we won this
// auction" and a vehicle DMECH can publish, ship, and sell. It deliberately
// asks for the ACTUAL purchase price/shipping here rather than silently
// carrying over the listing's estimate, because the whole point of the
// pre-order feature is that the estimate was never a locked-in number.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!EDIT_ROLES.includes(staff.role as StaffRole)) {
    return NextResponse.json({ error: "Not permitted to mark this listing as purchased." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const actualPriceUsd = typeof body?.actual_purchase_price_usd === "number" ? body.actual_purchase_price_usd : null;
  const actualShippingUsd = typeof body?.actual_shipping_usd === "number" ? body.actual_shipping_usd : null;
  const vin = typeof body?.vin === "string" && body.vin.trim() ? body.vin.trim() : null;

  if (!actualPriceUsd || actualPriceUsd <= 0) {
    return NextResponse.json({ error: "Enter the actual purchase price paid at auction." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: listing } = await supabase
    .from("sourcing_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (listing.status === "purchased" || listing.status === "delisted") {
    return NextResponse.json({ error: `This listing is already ${listing.status}.` }, { status: 409 });
  }

  const photos: VehiclePhoto[] = (listing.photos as { url: string; sort_order: number }[]).map((p, i) => ({
    id: crypto.randomUUID(),
    url: p.url,
    tag: null,
    is_internal: false,
    sort_order: p.sort_order ?? i,
  }));

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .insert({
      make: listing.make,
      model: listing.model,
      year: listing.year,
      vin: vin ?? listing.vin,
      fuel_type: listing.fuel_type,
      source_region: SOURCE_REGION_MAP[listing.source_platform as SourcingListing["source_platform"]],
      source_detail: listing.location_city ? `${listing.location_city}, ${listing.location_country}` : listing.location_country,
      condition: "used",
      purchase_price_usd_cents: dollarsToUsdCents(actualPriceUsd),
      shipping_cost_usd_cents: actualShippingUsd ? dollarsToUsdCents(actualShippingUsd) : null,
      photos,
      acquisition_channel: "import",
    })
    .select("id")
    .single();

  if (vehicleError || !vehicle) {
    return NextResponse.json({ error: "Could not create the vehicle record." }, { status: 500 });
  }

  await supabase
    .from("sourcing_listings")
    .update({ status: "purchased", fulfilled_vehicle_id: vehicle.id, updated_at: new Date().toISOString() })
    .eq("id", id);

  await logAudit({
    userId: staff.id,
    action: "purchase",
    tableName: "sourcing_listings",
    recordId: id,
    oldValue: { status: listing.status },
    newValue: { status: "purchased", fulfilled_vehicle_id: vehicle.id },
  });

  // Advance every still-active pre-order against this listing (normally
  // just one -- a listing goes 'reserved' after its first pre-order and the
  // customer-facing POST /api/pre-orders route blocks a second one against
  // an already-reserved listing) and let each customer know.
  const { data: preOrders } = await supabase
    .from("pre_orders")
    .select("id, customer_id")
    .eq("sourcing_listing_id", id)
    .not("status", "in", "(cancelled,refunded,purchased)");

  for (const po of preOrders ?? []) {
    await supabase.from("pre_orders").update({ status: "purchased", updated_at: new Date().toISOString() }).eq("id", po.id);
    const { data: customer } = await supabase
      .from("customers")
      .select("user_id, phone")
      .eq("id", po.customer_id)
      .maybeSingle();
    await queueNotification({
      recipientId: customer?.user_id ?? null,
      recipientPhone: customer?.phone ?? null,
      channel: "email",
      template: "preorder_purchased",
      payload: {
        preOrderId: po.id,
        vehicleId: vehicle.id,
        make: listing.make,
        model: listing.model,
        year: listing.year,
      },
    });
  }

  return NextResponse.json({ ok: true, vehicleId: vehicle.id });
}
