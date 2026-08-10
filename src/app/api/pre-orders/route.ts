import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { customerGuard } from "@/lib/guards";
import { getConfigValue } from "@/lib/platform-config";
import { toKobo, usdCentsToDollars } from "@/lib/money";
import { logAudit } from "@/lib/audit";

// Public-facing (any registered customer), unlike every other write in this
// app — customers have no client-side insert policy on pre_orders (same
// "mutations go through route handlers" convention as everywhere else), so
// this route uses the service-role client after confirming a real customer
// session via customerGuard().
export async function POST(request: Request) {
  const customer = await customerGuard();
  if (!customer) {
    return NextResponse.json({ error: "Please register or log in to reserve a vehicle." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const listingId = typeof body?.sourcing_listing_id === "string" ? body.sourcing_listing_id : "";
  if (!listingId) {
    return NextResponse.json({ error: "Missing sourcing_listing_id." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: listing } = await supabase.from("sourcing_listings").select("*").eq("id", listingId).maybeSingle();

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (listing.status !== "available") {
    return NextResponse.json({ error: "This vehicle has already been reserved by someone else." }, { status: 409 });
  }

  const [depositPct, ngnRate] = await Promise.all([
    getConfigValue("preorder_deposit_pct", 20),
    getConfigValue("ngn_usd_rate", 1580),
  ]);

  const estimatedTotalUsdCents = listing.estimated_price_usd_cents + (listing.estimated_shipping_usd_cents ?? 0);
  const estimatedTotalNaira = usdCentsToDollars(estimatedTotalUsdCents) * ngnRate;
  const depositAmountKobo = toKobo(estimatedTotalNaira * (depositPct / 100));

  const { data: preOrder, error } = await supabase
    .from("pre_orders")
    .insert({
      customer_id: customer.id,
      sourcing_listing_id: listingId,
      estimated_total_usd_cents: estimatedTotalUsdCents,
      deposit_pct: depositPct,
      deposit_amount_kobo: depositAmountKobo,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create the pre-order." }, { status: 500 });
  }

  // Mark the listing reserved so it stops showing as available to other
  // customers — best-effort, a failure here shouldn't fail the pre-order
  // the customer just successfully placed.
  await supabase.from("sourcing_listings").update({ status: "reserved" }).eq("id", listingId);

  await logAudit({ userId: null, action: "create", tableName: "pre_orders", recordId: preOrder.id, newValue: preOrder });

  const { data: businessProfile } = await supabase.from("platform_config").select("value").eq("key", "business_profile").maybeSingle();

  return NextResponse.json({ preOrder, businessProfile: businessProfile?.value ?? null });
}
