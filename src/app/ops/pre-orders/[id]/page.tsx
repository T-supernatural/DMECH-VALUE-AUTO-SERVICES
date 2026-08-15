import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { PreOrderStatusSelect, RecordDepositAction, RecordBalancePaymentAction } from "@/components/ops/PreOrderActions";
import { staffGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import { formatNaira, formatUsd, usdCentsToDollars } from "@/lib/money";
import { SOURCING_PLATFORM_LABELS } from "@/types";
import type { PreOrder, SourcingListing, StaffRole } from "@/types";

const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "accountant", "sales_manager"];
const PAYMENT_METHOD_LABEL: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  paystack: "Paystack",
  pos: "POS",
  cash: "Cash",
};

interface PreOrderWithJoins extends PreOrder {
  customers: { id: string; full_name: string; phone: string; email: string | null } | null;
  sourcing_listings: SourcingListing | null;
}

export default async function PreOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff) redirect("/login");

  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("pre_orders")
    .select("*, customers(id, full_name, phone, email), sourcing_listings(*)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const preOrder = data as unknown as PreOrderWithJoins;
  const listing = preOrder.sourcing_listings;
  const canManage = EDIT_ROLES.includes(staff.role as StaffRole);

  return (
    <>
      <TopBar title={listing ? `${listing.make} ${listing.model} ${listing.year}` : "Pre-Order"} />
      <div className="ops-content">
        <div className="ops-grid-2">
          <div className="ops-panel">
            <div className="ops-panel-title">Customer</div>
            <div className="ops-info-row">
              <span className="ops-info-label">Name</span>
              <span className="ops-info-value">{preOrder.customers?.full_name ?? "—"}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Phone</span>
              <span className="ops-info-value">{preOrder.customers?.phone ?? "—"}</span>
            </div>
            {preOrder.customers?.email && (
              <div className="ops-info-row">
                <span className="ops-info-label">Email</span>
                <span className="ops-info-value">{preOrder.customers.email}</span>
              </div>
            )}
            {listing && (
              <div className="ops-info-row">
                <span className="ops-info-label">Vehicle</span>
                <Link href={`/ops/sourcing/${listing.id}`} style={{ color: "var(--blue)" }}>
                  {SOURCING_PLATFORM_LABELS[listing.source_platform]} — view listing →
                </Link>
              </div>
            )}
          </div>

          <div className="ops-panel">
            <div className="ops-panel-title">Deposit &amp; Estimate</div>
            <div className="ops-info-row">
              <span className="ops-info-label">Estimated Total (at reservation)</span>
              <span className="ops-info-value">{formatUsd(usdCentsToDollars(preOrder.estimated_total_usd_cents))}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Deposit ({preOrder.deposit_pct}%)</span>
              <span className="ops-info-value">{formatNaira(preOrder.deposit_amount_kobo)}</span>
            </div>
            <div className="ops-info-row">
              <span className="ops-info-label">Deposit Paid</span>
              <span className={`ops-badge ${preOrder.deposit_paid ? "ops-badge-green" : "ops-badge-amber"}`}>
                {preOrder.deposit_paid ? "Yes" : "Not yet"}
              </span>
            </div>
            {preOrder.deposit_paid && (
              <>
                <div className="ops-info-row">
                  <span className="ops-info-label">Method</span>
                  <span className="ops-info-value">
                    {preOrder.deposit_payment_method ? PAYMENT_METHOD_LABEL[preOrder.deposit_payment_method] : "—"}
                  </span>
                </div>
                <div className="ops-info-row">
                  <span className="ops-info-label">Paid Date</span>
                  <span className="ops-info-value">
                    {preOrder.deposit_paid_at
                      ? new Date(preOrder.deposit_paid_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </span>
                </div>
              </>
            )}
          </div>

          {preOrder.status === "purchased" && preOrder.balance_amount_kobo != null && (
            <div className="ops-panel">
              <div className="ops-panel-title">Balance</div>
              <div className="ops-info-row">
                <span className="ops-info-label">Balance Due</span>
                <span className="ops-info-value">{formatNaira(preOrder.balance_amount_kobo)}</span>
              </div>
              <div className="ops-info-row">
                <span className="ops-info-label">Balance Paid</span>
                <span className={`ops-badge ${preOrder.balance_paid ? "ops-badge-green" : "ops-badge-amber"}`}>
                  {preOrder.balance_paid ? "Yes" : "Not yet"}
                </span>
              </div>
              {preOrder.balance_paid && (
                <>
                  <div className="ops-info-row">
                    <span className="ops-info-label">Method</span>
                    <span className="ops-info-value">
                      {preOrder.balance_payment_method ? PAYMENT_METHOD_LABEL[preOrder.balance_payment_method] : "—"}
                    </span>
                  </div>
                  <div className="ops-info-row">
                    <span className="ops-info-label">Paid Date</span>
                    <span className="ops-info-value">
                      {preOrder.balance_paid_at
                        ? new Date(preOrder.balance_paid_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </span>
                  </div>
                </>
              )}
              {!preOrder.balance_paid && (
                <p style={{ fontSize: 12, color: "var(--amber)", marginTop: 8 }}>
                  This vehicle can&apos;t be marked delivered until the balance is recorded as paid.
                </p>
              )}
            </div>
          )}
        </div>

        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
          The estimate above is a snapshot from when the customer reserved this vehicle — the
          real total is only known once DMECH actually wins it at auction, per the July 2026
          pricing policy this was built around.
        </p>

        {canManage && (
          <div className="ops-panel">
            <div className="ops-panel-title">Manage</div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div>
                <label className="ops-field-label">Status</label>
                <PreOrderStatusSelect preOrderId={preOrder.id} status={preOrder.status} />
              </div>
              {!preOrder.deposit_paid && (
                <div>
                  <label className="ops-field-label">Deposit</label>
                  <RecordDepositAction preOrderId={preOrder.id} />
                </div>
              )}
              {preOrder.status === "purchased" && !preOrder.balance_paid && preOrder.balance_amount_kobo != null && (
                <div>
                  <label className="ops-field-label">Balance</label>
                  <RecordBalancePaymentAction preOrderId={preOrder.id} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
