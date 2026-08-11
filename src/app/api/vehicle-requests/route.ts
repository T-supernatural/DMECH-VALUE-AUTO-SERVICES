import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { queueNotification } from "@/lib/notifications";
import { toKobo } from "@/lib/money";
import { CONTACT } from "@/lib/contact";
import type { VehicleRequestSource } from "@/types";

const VALID_SOURCES: VehicleRequestSource[] = ["dedicated_page", "vehicles_empty", "sourcing_empty"];
const VALID_FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric"];
const VALID_REGIONS = ["usa", "europe", "china", "nigeria"];
const VALID_CONDITIONS = ["used", "new"];
const VALID_TIMELINES = ["immediately", "within_1_month", "within_3_months", "just_browsing"];

// Anonymous, public capture form — same pattern as /api/calculator/lead:
// the cookie-bound (anon) client, not service-role, since the "anyone can
// submit a vehicle request" RLS policy already permits this insert. Don't
// chain .select() onto the insert: anon has no SELECT policy on this table.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const fullName = typeof body?.full_name === "string" ? body.full_name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!fullName || phone.length < 10) {
    return NextResponse.json({ error: "Your name and a valid phone number are required." }, { status: 400 });
  }

  const source: VehicleRequestSource = VALID_SOURCES.includes(body?.source) ? body.source : "dedicated_page";
  const yearMin = Number.isInteger(body?.year_min) ? body.year_min : null;
  const yearMax = Number.isInteger(body?.year_max) ? body.year_max : null;
  const budgetMaxNaira = typeof body?.budget_max_naira === "number" && body.budget_max_naira > 0 ? body.budget_max_naira : null;

  const supabase = await createClient();
  const { error } = await supabase.from("vehicle_requests").insert({
    full_name: fullName,
    phone,
    email: typeof body?.email === "string" && body.email.trim() ? body.email.trim() : null,
    make: typeof body?.make === "string" && body.make.trim() ? body.make.trim() : null,
    model: typeof body?.model === "string" && body.model.trim() ? body.model.trim() : null,
    year_min: yearMin,
    year_max: yearMax,
    budget_max_kobo: budgetMaxNaira ? toKobo(budgetMaxNaira) : null,
    fuel_type: VALID_FUEL_TYPES.includes(body?.fuel_type) ? body.fuel_type : null,
    source_region_preference: VALID_REGIONS.includes(body?.source_region_preference) ? body.source_region_preference : null,
    condition_preference: VALID_CONDITIONS.includes(body?.condition_preference) ? body.condition_preference : null,
    timeline: VALID_TIMELINES.includes(body?.timeline) ? body.timeline : null,
    notes: typeof body?.notes === "string" && body.notes.trim() ? body.notes.trim() : null,
    source,
  });

  if (error) {
    return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
  }

  await queueNotification({
    recipientPhone: CONTACT.phoneHref,
    channel: "sms",
    template: "new_vehicle_request",
    payload: { fullName, phone, make: body?.make ?? null, model: body?.model ?? null },
  });

  return NextResponse.json({ ok: true });
}
