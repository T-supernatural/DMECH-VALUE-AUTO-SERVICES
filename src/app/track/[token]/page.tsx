import { Car, ClipboardList, Wallet, AlertTriangle, MessageCircle } from "lucide-react";
import "@/styles/ops.css";
import { verifyWhatsAppSession } from "@/lib/whatsapp/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import { stageLabel, stageBadgeClass } from "@/lib/ops/vehicle-stage";
import { whatsappHref } from "@/lib/contact";
import { PRE_ORDER_STATUS_LABELS } from "@/types";
import type { Instalment, PreOrder, Vehicle, Payment } from "@/types";

export const metadata = { title: "Your DMECH Order Status" };

// No login, no dashboard -- this is the customer's entire web-facing account
// surface. It exists purely as a read-only view resolved from the same
// bearer token WhatsApp already issued after registration/login, matching
// the WhatsApp-first customer model: the phone number IS the identity, this
// page just gives it something to open when useful (or when WhatsApp itself
// is unavailable) rather than requiring a separate login.
const PRE_ORDER_BADGE: Record<string, string> = {
  pending_deposit: "ops-badge-amber",
  deposit_paid: "ops-badge-blue",
  sourcing: "ops-badge-blue",
  purchased: "ops-badge-green",
  cancelled: "ops-badge-muted",
  refunded: "ops-badge-muted",
};

const PAYMENT_BADGE: Record<string, string> = {
  pending: "ops-badge-blue",
  paid: "ops-badge-green",
  overdue: "ops-badge-red",
  partial: "ops-badge-amber",
};

function ExpiredView() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg)" }}>
      <div style={{ maxWidth: 420, width: "100%", background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: 36, textAlign: "center" }}>
        <AlertTriangle size={32} strokeWidth={1.5} style={{ color: "var(--amber)", marginBottom: 14 }} />
        <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, marginBottom: 8 }}>This link has expired</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: 14, marginBottom: 24 }}>
          Tracking links expire after 30 days for your security. Message us on WhatsApp and we&apos;ll send you a fresh one.
        </p>
        <a
          href={whatsappHref("Hi DMECH, my tracking link expired. Please send me a new one.")}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            background: "#22C55E",
            color: "#fff",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <MessageCircle size={16} strokeWidth={2} /> Message DMECH on WhatsApp
        </a>
      </div>
    </main>
  );
}

export default async function TrackOrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let session: { customerId: string; phone: string } | null = null;
  try {
    session = await verifyWhatsAppSession(token);
  } catch {
    session = null;
  }

  if (!session) {
    return <ExpiredView />;
  }

  const service = createServiceClient();
  const [customerRes, vehiclesRes, instalmentsRes, preOrdersRes, paymentsRes] = await Promise.all([
    service.from("customers").select("full_name").eq("id", session.customerId).is("deleted_at", null).single(),
    service.from("vehicles").select("*").eq("buyer_id", session.customerId).is("deleted_at", null),
    service
      .from("instalments")
      .select("*, vehicles!vehicle_id(make,model,year)")
      .eq("customer_id", session.customerId),
    service
      .from("pre_orders")
      .select("*, sourcing_listings(make,model,year)")
      .eq("customer_id", session.customerId),
    service.from("payments").select("*").eq("customer_id", session.customerId).order("due_date", { ascending: true }),
  ]);

  // Customer record missing (deleted, or otherwise gone) -- same fallback
  // as an expired token rather than showing a broken or stale page.
  if (!customerRes.data) {
    return <ExpiredView />;
  }

  const firstName = (customerRes.data.full_name as string | undefined)?.split(" ")[0] || "there";
  const vehicles = (vehiclesRes.data as Vehicle[] | null) ?? [];
  const instalments = (instalmentsRes.data ?? []) as unknown as (Instalment & {
    vehicles: { make: string; model: string; year: number } | null;
  })[];
  const preOrders = (preOrdersRes.data ?? []) as unknown as (PreOrder & {
    sourcing_listings: { make: string; model: string; year: number } | null;
  })[];
  const payments = (paymentsRes.data as Payment[] | null) ?? [];

  const activeInstalments = instalments.filter((i) => i.status === "active").length;
  const overduePayments = payments.filter((p) => p.status === "overdue").length;

  return (
    <div data-theme="dark">
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 60px" }}>
        <div style={{ marginBottom: 24 }}>
          <div className="ops-panel-title" style={{ fontSize: 22 }}>Hi {firstName} 👋</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Here&apos;s where things stand with DMECH.</div>
        </div>

        <div className="ops-stat-grid" style={{ marginBottom: 20 }}>
          {[
            { icon: Car, value: vehicles.length, label: "Your Vehicles" },
            { icon: ClipboardList, value: preOrders.length, label: "Reservations" },
            { icon: Wallet, value: activeInstalments, label: "Active Instalment Plans" },
            { icon: AlertTriangle, value: overduePayments, label: "Overdue Payments" },
          ].map((stat) => (
            <div className="ops-stat-card" key={stat.label}>
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
          ))}
        </div>

        <div className="ops-panel" style={{ marginBottom: 16 }}>
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

        {preOrders.length > 0 && (
          <div className="ops-panel" style={{ marginBottom: 16 }}>
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
        )}

        <div className="ops-panel" style={{ marginBottom: 16 }}>
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
                  <span className="ops-badge ops-badge-blue">{i.status}</span>
                </span>
              </div>
            ))
          )}
        </div>

        {payments.length > 0 && (
          <div className="ops-panel" style={{ marginBottom: 16 }}>
            <div className="ops-panel-title">Your Payments</div>
            {payments.map((p) => (
              <div className="ops-info-row" key={p.id}>
                <span className="ops-info-label">
                  Due {new Date(p.due_date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="ops-info-value">{formatNaira(p.amount_kobo)}</span>
                  <span className={`ops-badge ${PAYMENT_BADGE[p.status]}`}>{p.status}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <a
          href={whatsappHref("Hi DMECH, I have a question about my order.")}
          target="_blank"
          rel="noopener noreferrer"
          className="ops-panel"
          style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
        >
          <MessageCircle size={20} strokeWidth={1.75} style={{ color: "#22C55E", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>Questions about any of this?</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Message us on WhatsApp — same number as always →</div>
          </div>
        </a>
      </div>
    </div>
  );
}
