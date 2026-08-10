import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { ClickableRow } from "@/components/ops/ClickableRow";
import { staffGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import { formatUsd, usdCentsToDollars } from "@/lib/money";
import { SOURCING_PLATFORM_LABELS } from "@/types";
import type { SourcingListing, StaffRole } from "@/types";

const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "ops_manager", "sales_manager"];

const STATUS_BADGE: Record<string, string> = {
  available: "ops-badge-green",
  reserved: "ops-badge-amber",
  purchased: "ops-badge-blue",
  delisted: "ops-badge-muted",
};

export default async function SourcingCatalogPage() {
  const staff = await staffGuard();
  if (!staff) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.from("sourcing_listings").select("*").order("created_at", { ascending: false });

  const listings = (data as SourcingListing[] | null) ?? [];
  const canEdit = EDIT_ROLES.includes(staff.role as StaffRole);

  return (
    <>
      <TopBar
        title="Sourcing Catalog"
        actions={
          canEdit ? (
            <Link href="/ops/sourcing/new" className="ops-btn" style={{ textDecoration: "none" }}>
              + Add Listing
            </Link>
          ) : undefined
        }
      />
      <div className="ops-content">
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
          Real, specific vehicles spotted on Copart, IAAI, and other sources abroad that DMECH
          doesn&apos;t own yet. Customers browse and reserve these on the public site; reserving
          one is what triggers DMECH to actually go buy it.
        </p>
        {listings.length === 0 ? (
          <div className="ops-panel" style={{ color: "var(--muted)", fontSize: 14 }}>
            No sourcing listings yet — add one to start building the catalog customers can
            browse and reserve.
          </div>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Source</th>
                  <th>Location</th>
                  <th>Title</th>
                  <th>Est. Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <ClickableRow key={l.id} href={`/ops/sourcing/${l.id}`}>
                    <td>{l.make} {l.model} {l.year}{l.trim ? ` ${l.trim}` : ""}</td>
                    <td>{SOURCING_PLATFORM_LABELS[l.source_platform]}</td>
                    <td>{l.location_city ? `${l.location_city}, ` : ""}{l.location_country}</td>
                    <td style={{ textTransform: "capitalize" }}>{l.title_status?.replace(/_/g, " ") ?? "—"}</td>
                    <td>{formatUsd(usdCentsToDollars(l.estimated_price_usd_cents))}</td>
                    <td>
                      <span className={`ops-badge ${STATUS_BADGE[l.status]}`}>{l.status}</span>
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
