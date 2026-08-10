import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { SourcingListingForm } from "@/components/ops/SourcingListingForm";
import { staffGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import { formatNaira, formatUsd, usdCentsToDollars } from "@/lib/money";
import { SOURCING_PLATFORM_LABELS, TITLE_STATUS_LABELS, PRE_ORDER_STATUS_LABELS } from "@/types";
import type { SourcingListing, PreOrder, StaffRole } from "@/types";

const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "ops_manager", "sales_manager"];

const PRE_ORDER_STATUS_BADGE: Record<string, string> = {
  pending_deposit: "ops-badge-amber",
  deposit_paid: "ops-badge-blue",
  sourcing: "ops-badge-blue",
  purchased: "ops-badge-green",
  cancelled: "ops-badge-muted",
  refunded: "ops-badge-muted",
};

interface PreOrderRow extends PreOrder {
  customers: { full_name: string; phone: string } | null;
}

export default async function SourcingListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff) redirect("/login");

  const { id } = await params;
  const supabase = await createClient();
  const [listingRes, preOrdersRes] = await Promise.all([
    supabase.from("sourcing_listings").select("*").eq("id", id).maybeSingle(),
    supabase.from("pre_orders").select("*, customers(full_name, phone)").eq("sourcing_listing_id", id).order("created_at", { ascending: false }),
  ]);

  if (!listingRes.data) notFound();
  const listing = listingRes.data as SourcingListing;
  const preOrders = (preOrdersRes.data as unknown as PreOrderRow[] | null) ?? [];
  const canEdit = EDIT_ROLES.includes(staff.role as StaffRole);

  return (
    <>
      <TopBar title={`${listing.make} ${listing.model} ${listing.year}`} />
      <div className="ops-content">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span className="ops-badge ops-badge-blue">{SOURCING_PLATFORM_LABELS[listing.source_platform]}</span>
          <span
            className={`ops-badge ${
              listing.status === "available"
                ? "ops-badge-green"
                : listing.status === "reserved"
                  ? "ops-badge-amber"
                  : listing.status === "purchased"
                    ? "ops-badge-blue"
                    : "ops-badge-muted"
            }`}
          >
            {listing.status}
          </span>
          {listing.lot_number && (
            <span style={{ color: "var(--subtle)", fontSize: 12 }}>Lot #{listing.lot_number}</span>
          )}
        </div>

        {listing.photos.length > 0 && (
          <div className="ops-panel">
            <div className="ops-panel-title">Photos</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {listing.photos.map((photo, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- pasted external URL, not a local asset
                <img key={i} src={photo.url} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
              ))}
            </div>
          </div>
        )}

        <div className="ops-grid-2">
          <div className="ops-panel">
            <div className="ops-panel-title">Vehicle</div>
            <div className="ops-info-row">
              <span className="ops-info-label">Trim</span>
              <span className="ops-info-value">{listing.trim ?? "—"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">VIN</span>
              <span className="ops-info-value">{listing.vin ?? "—"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Fuel Type</span>
              <span className="ops-info-value" style={{ textTransform: "capitalize" }}>{listing.fuel_type ?? "—"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Odometer</span>
              <span className="ops-info-value">{listing.odometer_km ? `${listing.odometer_km.toLocaleString()} km` : "—"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Title Status</span>
              <span className="ops-info-value">{listing.title_status ? TITLE_STATUS_LABELS[listing.title_status] : "—"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Run &amp; Drive</span>
              <span className="ops-info-value">{listing.run_and_drive === null ? "—" : listing.run_and_drive ? "Yes" : "No"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Primary Damage</span>
              <span className="ops-info-value">{listing.primary_damage ?? "—"}</span>
            </div>
            {listing.secondary_damage && (
              <div className="ops-info-row">
                <span className="ops-info-label">Secondary Damage</span>
                <span className="ops-info-value">{listing.secondary_damage}</span>
              </div>
            )}
            {listing.condition_notes && (
              <div className="ops-info-row">
                <span className="ops-info-label">Notes</span>
                <span className="ops-info-value">{listing.condition_notes}</span>
              </div>
            )}
          </div>

          <div className="ops-panel">
            <div className="ops-panel-title">Location &amp; Pricing</div>
            <div className="ops-info-row">
              <span className="ops-info-label">Location</span>
              <span className="ops-info-value">{listing.location_city ? `${listing.location_city}, ` : ""}{listing.location_country}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Auction Date</span>
              <span className="ops-info-value">
                {listing.auction_date ? new Date(listing.auction_date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Estimated Price</span>
              <span className="ops-info-value">{formatUsd(usdCentsToDollars(listing.estimated_price_usd_cents))}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Estimated Shipping</span>
              <span className="ops-info-value">
                {listing.estimated_shipping_usd_cents ? formatUsd(usdCentsToDollars(listing.estimated_shipping_usd_cents)) : "—"}
              </span>
            </div>
            {listing.fulfilled_vehicle_id && (
              <div className="ops-info-row">
                <span className="ops-info-label">Fulfilled As</span>
                <Link href={`/ops/vehicles/${listing.fulfilled_vehicle_id}`} style={{ color: "var(--blue)" }}>
                  View Vehicle →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="ops-panel">
          <div className="ops-panel-title">Pre-Orders ({preOrders.length})</div>
          {preOrders.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13 }}>No customer has reserved this vehicle yet.</div>
          ) : (
            preOrders.map((po) => (
              <div className="ops-info-row" key={po.id}>
                <span className="ops-info-label">
                  {po.customers?.full_name ?? "—"} · {new Date(po.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="ops-info-value">{formatNaira(po.deposit_amount_kobo)} deposit</span>
                  <span className={`ops-badge ${PRE_ORDER_STATUS_BADGE[po.status]}`}>{PRE_ORDER_STATUS_LABELS[po.status]}</span>
                </span>
              </div>
            ))
          )}
        </div>

        {canEdit && <SourcingListingForm listing={listing} />}
      </div>
    </>
  );
}
