import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, ClipboardList, Wallet, FileText, PlusCircle } from "lucide-react";
import { TopBar } from "@/components/ops/TopBar";
import { Reveal } from "@/components/marketing/Reveal";
import { customerGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import { stageLabel, stageBadgeClass } from "@/lib/ops/vehicle-stage";
import { PRE_ORDER_STATUS_LABELS } from "@/types";
import type { ApprovalStatus, Instalment, PreOrder, Vehicle } from "@/types";

const PRE_ORDER_BADGE: Record<string, string> = {
  pending_deposit: "ops-badge-amber",
  deposit_paid: "ops-badge-blue",
  sourcing: "ops-badge-blue",
  purchased: "ops-badge-green",
  cancelled: "ops-badge-muted",
  refunded: "ops-badge-muted",
};

const STATUS_COPY: Record<ApprovalStatus, { title: string; body: string; tone: string }> = {
  pending: {
    title: "Application Under Review",
    body: "A DMECH staff member is reviewing your registration. We'll update this once a decision is made.",
    tone: "ops-badge-amber",
  },
  stage2_docs: {
    title: "Additional Documents Needed",
    body: "We need a few more documents before we can finish reviewing your application — see the Documents tab.",
    tone: "ops-badge-blue",
  },
  approved: { title: "Approved", body: "", tone: "ops-badge-green" },
  declined: {
    title: "Application Declined",
    body: "Your registration wasn't approved this time. Contact DMECH directly if you have questions.",
    tone: "ops-badge-muted",
  },
};

export default async function PortalDashboardPage() {
  const customer = await customerGuard();
  if (!customer) redirect("/verify");

  const supabase = await createClient();
  const [vehiclesRes, instalmentsRes, preOrdersRes] = await Promise.all([
    supabase.from("vehicles").select("*").eq("buyer_id", customer.id).is("deleted_at", null),
    supabase.from("instalments").select("*, vehicles!vehicle_id(make,model,year)").eq("customer_id", customer.id),
    supabase.from("pre_orders").select("*, sourcing_listings(make,model,year)").eq("customer_id", customer.id),
  ]);

  const vehicles = (vehiclesRes.data as Vehicle[] | null) ?? [];
  const instalments = (instalmentsRes.data ?? []) as unknown as (Instalment & {
    vehicles: { make: string; model: string; year: number } | null;
  })[];
  const preOrders = (preOrdersRes.data ?? []) as unknown as (PreOrder & {
    sourcing_listings: { make: string; model: string; year: number } | null;
  })[];
  const activeInstalments = instalments.filter((i) => i.status === "active").length;

  const statusInfo = STATUS_COPY[customer.approval_status];

  return (
    <>
      <TopBar title={`Welcome, ${customer.full_name.split(" ")[0]}`} />
      <div className="ops-content">
        {customer.approval_status !== "approved" && (
          <Reveal>
            <div className="ops-panel">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span className={`ops-badge ${statusInfo.tone}`}>{customer.approval_status}</span>
                <span className="ops-panel-title" style={{ margin: 0 }}>{statusInfo.title}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{statusInfo.body}</div>
            </div>
          </Reveal>
        )}

        <div className="ops-stat-grid" style={{ marginBottom: 20 }}>
          {[
            { icon: Car, value: vehicles.length, label: "Your Vehicles" },
            { icon: ClipboardList, value: preOrders.length, label: "Reservations" },
            { icon: Wallet, value: activeInstalments, label: "Active Instalment Plans" },
            { icon: FileText, value: customer.documents.length, label: "Documents on File" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delayMs={i * 60}>
              <div className="ops-stat-card">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: "var(--blue-d)",
                      color: "var(--blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <stat.icon size={17} strokeWidth={2} />
                  </div>
                  <div className="ops-stat-value">{stat.value}</div>
                </div>
                <div className="ops-stat-label" style={{ marginTop: 8 }}>{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="ops-panel">
            <div className="ops-panel-title">Your Vehicles</div>
            {vehicles.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--muted)" }}>
                <Car size={16} strokeWidth={1.75} />
                No vehicles linked to your account yet.
              </div>
            ) : (
              vehicles.map((v) => (
                <div className="ops-info-row" key={v.id}>
                  <span className="ops-info-label">{v.year} {v.make} {v.model}</span>
                  <span className={`ops-badge ${stageBadgeClass(v.lifecycle_stage)}`}>{stageLabel(v.lifecycle_stage)}</span>
                </div>
              ))
            )}
          </div>
        </Reveal>

        {preOrders.length > 0 && (
          <Reveal delayMs={60}>
            <div className="ops-panel">
              <div className="ops-panel-title">Your Reservations</div>
              {preOrders.map((po) => (
                <div className="ops-info-row" key={po.id}>
                  <span className="ops-info-label">
                    {po.sourcing_listings
                      ? `${po.sourcing_listings.year} ${po.sourcing_listings.make} ${po.sourcing_listings.model}`
                      : "Vehicle"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ops-info-value">{formatNaira(po.deposit_amount_kobo)} deposit</span>
                    <span className={`ops-badge ${PRE_ORDER_BADGE[po.status]}`}>{PRE_ORDER_STATUS_LABELS[po.status]}</span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delayMs={120}>
          <div className="ops-panel">
            <div className="ops-panel-title">Your Instalment Plans</div>
            {instalments.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--muted)" }}>
                <Wallet size={16} strokeWidth={1.75} />
                No active instalment plans.
              </div>
            ) : (
              instalments.map((i) => (
                <div className="ops-info-row" key={i.id}>
                  <span className="ops-info-label">
                    {i.vehicles ? `${i.vehicles.year} ${i.vehicles.make} ${i.vehicles.model}` : "Vehicle"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ops-info-value">
                      {i.monthly_amount_kobo ? `${formatNaira(i.monthly_amount_kobo)}/mo` : formatNaira(i.total_price_kobo)}
                    </span>
                    <Link href="/payments" className="ops-badge ops-badge-blue" style={{ textDecoration: "none" }}>
                      {i.status}
                    </Link>
                  </span>
                </div>
              ))
            )}
          </div>
        </Reveal>

        {customer.documents.length === 0 && (
          <Reveal delayMs={180}>
            <Link href="/documents" className="ops-panel" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <PlusCircle size={20} strokeWidth={1.75} style={{ color: "var(--blue)", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>No documents on file yet</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Upload your ID and other documents to speed up approval →</div>
              </div>
            </Link>
          </Reveal>
        )}
      </div>
    </>
  );
}
