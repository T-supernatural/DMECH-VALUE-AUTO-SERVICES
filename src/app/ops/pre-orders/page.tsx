import { redirect } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { ClickableRow } from "@/components/ops/ClickableRow";
import { staffGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import { PRE_ORDER_STATUS_LABELS } from "@/types";
import type { PreOrder } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  pending_deposit: "ops-badge-amber",
  deposit_paid: "ops-badge-blue",
  sourcing: "ops-badge-blue",
  purchased: "ops-badge-green",
  cancelled: "ops-badge-muted",
  refunded: "ops-badge-muted",
};

interface PreOrderRow extends PreOrder {
  customers: { full_name: string } | null;
  sourcing_listings: { make: string; model: string; year: number } | null;
}

export default async function PreOrdersPage() {
  const staff = await staffGuard();
  if (!staff) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("pre_orders")
    .select("*, customers(full_name), sourcing_listings(make, model, year)")
    .order("created_at", { ascending: false });

  const preOrders = (data as unknown as PreOrderRow[] | null) ?? [];

  return (
    <>
      <TopBar title="Pre-Orders" />
      <div className="ops-content">
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
          Customer commitments against specific Sourcing Catalog vehicles. The estimated total
          shown is a snapshot at reservation time, not a locked price — the real cost is only
          known once DMECH actually wins the vehicle at auction.
        </p>
        {preOrders.length === 0 ? (
          <div className="ops-panel" style={{ color: "var(--muted)", fontSize: 14 }}>
            No pre-orders yet.
          </div>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Deposit</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {preOrders.map((po) => (
                  <ClickableRow key={po.id} href={`/ops/pre-orders/${po.id}`}>
                    <td>{po.customers?.full_name ?? "—"}</td>
                    <td>
                      {po.sourcing_listings
                        ? `${po.sourcing_listings.make} ${po.sourcing_listings.model} ${po.sourcing_listings.year}`
                        : "—"}
                    </td>
                    <td>{formatNaira(po.deposit_amount_kobo)}</td>
                    <td>
                      <span className={`ops-badge ${STATUS_BADGE[po.status]}`}>{PRE_ORDER_STATUS_LABELS[po.status]}</span>
                    </td>
                    <td>{new Date(po.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</td>
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
