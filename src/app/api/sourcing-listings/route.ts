import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { staffGuard } from "@/lib/guards";
import { logAudit } from "@/lib/audit";
import type { StaffRole, SourcingPlatform, TitleStatus, FuelType, SourcingListingPhoto } from "@/types";

// Same roles as vehicle sourcing/intake (src/app/api/vehicles/route.ts) --
// this is the same job, just for a car DMECH hasn't bought yet.
export const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "ops_manager", "sales_manager"];

const SOURCE_PLATFORMS: SourcingPlatform[] = ["copart", "iaai", "europe_other", "china_ev", "other"];
const TITLE_STATUSES: TitleStatus[] = ["clean", "salvage", "rebuilt", "certificate_of_destruction", "unknown"];
const FUEL_TYPES: FuelType[] = ["petrol", "diesel", "hybrid", "electric"];

export async function POST(request: Request) {
  const staff = await staffGuard();
  if (!staff || !EDIT_ROLES.includes(staff.role as StaffRole)) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const make = typeof body?.make === "string" ? body.make.trim() : "";
  const model = typeof body?.model === "string" ? body.model.trim() : "";
  const year = Number(body?.year);
  const sourcePlatform = body?.source_platform as SourcingPlatform;
  const locationCountry = typeof body?.location_country === "string" ? body.location_country.trim() : "";
  const estimatedPriceUsdCents = Number(body?.estimated_price_usd_cents);

  if (!make || !model || !year || !SOURCE_PLATFORMS.includes(sourcePlatform) || !locationCountry || !estimatedPriceUsdCents) {
    return NextResponse.json(
      { error: "Make, model, year, source, location, and an estimated price are required." },
      { status: 400 },
    );
  }

  const titleStatus = TITLE_STATUSES.includes(body?.title_status) ? body.title_status : null;
  const fuelType = FUEL_TYPES.includes(body?.fuel_type) ? body.fuel_type : null;
  const photos: SourcingListingPhoto[] = Array.isArray(body?.photos)
    ? body.photos
        .filter((p: unknown): p is string => typeof p === "string" && p.trim().length > 0)
        .map((url: string, i: number) => ({ url: url.trim(), sort_order: i }))
    : [];

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sourcing_listings")
    .insert({
      source_platform: sourcePlatform,
      make,
      model,
      year,
      trim: body?.trim || null,
      vin: body?.vin || null,
      lot_number: body?.lot_number || null,
      title_status: titleStatus,
      primary_damage: body?.primary_damage || null,
      secondary_damage: body?.secondary_damage || null,
      odometer_km: body?.odometer_km ? Number(body.odometer_km) : null,
      run_and_drive: typeof body?.run_and_drive === "boolean" ? body.run_and_drive : null,
      fuel_type: fuelType,
      condition_notes: body?.condition_notes || null,
      location_country: locationCountry,
      location_city: body?.location_city || null,
      auction_date: body?.auction_date || null,
      estimated_price_usd_cents: estimatedPriceUsdCents,
      estimated_shipping_usd_cents: body?.estimated_shipping_usd_cents ? Number(body.estimated_shipping_usd_cents) : null,
      photos,
      created_by: staff.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not save the listing." }, { status: 500 });
  }

  await logAudit({ userId: staff.id, action: "create", tableName: "sourcing_listings", recordId: data.id, newValue: data });

  return NextResponse.json({ listing: data });
}
