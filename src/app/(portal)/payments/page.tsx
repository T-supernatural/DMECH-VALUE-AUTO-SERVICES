import { redirect } from "next/navigation";
import { Receipt } from "lucide-react";
import { TopBar } from "@/components/ops/TopBar";
import { Reveal } from "@/components/marketing/Reveal";
import { PaymentCheckoutButton } from "@/components/portal/PaymentCheckoutButton";
import { customerGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import type { Invoice, Payment, PaymentStatus, PreOrder } from "@/types";

const STATUS_CLASS: Record<PaymentStatus, string> = { paid: "ops-badge-green", pending: "ops-badge-blue", overdue: "ops-badge-amber", partial: "ops-badge-muted" };

interface PaymentRow extends Payment {
  instalments: { vehicles: { make: string; model: string; year: number } | null } | null;
}

export default async function PortalPaymentsPage() {
  const customer = await customerGuard();
  if (!customer) redirect("/verify");

  const supabase = await createClient();
  const [paymentsRes, preOrdersRes, invoicesRes, receiptsRes] = await Promise.all([
    supabase.from("payments").select("*, instalments(vehicles!vehicle_id(make,model,year))").eq("customer_id", customer.id).order("due_date", { ascending: true }),
    supabase.from("pre_orders").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("customer_id", customer.id).eq("doc_type", "invoice").is("voided_at", null).order("created_at", { ascending: false }),
    supabase.from("invoices").select("related_invoice_id, total_kobo").eq("customer_id", customer.id).eq("doc_type", "receipt").not("related_invoice_id", "is", null),
  ]);
  const payments = (paymentsRes.data ?? []) as unknown as PaymentRow[];
  const preOrders = (preOrdersRes.data ?? []) as PreOrder[];
  const invoices = (invoicesRes.data ?? []) as Invoice[];
  const receiptsByInvoice = new Map<string, number>();
  for (const receipt of receiptsRes.data ?? []) {
    if (receipt.related_invoice_id) receiptsByInvoice.set(receipt.related_invoice_id, (receiptsByInvoice.get(receipt.related_invoice_id) ?? 0) + receipt.total_kobo);
  }
  const openPayments = payments.filter((payment) => payment.status !== "paid" && payment.amount_kobo > (payment.amount_paid_kobo ?? 0));
  // Instalment plans have their own deposit/schedule targets.  Exposing the
  // master invoice here would let a customer bypass that agreed schedule.
  const openInvoices = invoices.map((invoice) => ({ invoice, outstandingKobo: invoice.total_kobo - (receiptsByInvoice.get(invoice.id) ?? 0) })).filter(({ invoice, outstandingKobo }) => invoice.instalment_id == null && outstandingKobo > 0);
  const openPreOrders = preOrders.filter((preOrder) => !["cancelled", "refunded"].includes(preOrder.status)).flatMap((preOrder) => {
    const depositOutstanding = preOrder.deposit_amount_kobo - (preOrder.deposit_amount_paid_kobo ?? 0);
    const balanceOutstanding = (preOrder.balance_amount_kobo ?? 0) - (preOrder.balance_amount_paid_kobo ?? 0);
    return [
      ...(depositOutstanding > 0 ? [{ label: "Pre-order deposit", targetType: "pre_order_deposit" as const, targetId: preOrder.id, outstandingKobo: depositOutstanding }] : []),
      ...(balanceOutstanding > 0 ? [{ label: "Pre-order balance", targetType: "pre_order_balance" as const, targetId: preOrder.id, outstandingKobo: balanceOutstanding }] : []),
    ];
  });

  return <><TopBar title="Payments" /><div className="ops-content">
    <Reveal><div className="ops-panel"><div className="ops-panel-title">Pay Online</div>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px" }}>Choose any amount up to the balance shown. Payment is completed on Paystack&apos;s secure checkout page.</p>
      {openPayments.length === 0 && openInvoices.length === 0 && openPreOrders.length === 0 ? <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>You have no outstanding online payments.</p> : <div style={{ display: "grid", gap: 12 }}>
        {openPayments.map((payment) => { const outstandingKobo = payment.amount_kobo - (payment.amount_paid_kobo ?? 0); const vehicle = payment.instalments?.vehicles; return <div className="ops-info-row" key={payment.id} style={{ alignItems: "center", gap: 16, flexWrap: "wrap" }}><div><strong>{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Instalment payment"}</strong><div className="ops-info-label">Payment #{payment.payment_number ?? "—"} · {formatNaira(outstandingKobo)} outstanding</div></div><PaymentCheckoutButton targetType="instalment_payment" targetId={payment.id} outstandingKobo={outstandingKobo} /></div>; })}
        {openInvoices.map(({ invoice, outstandingKobo }) => <div className="ops-info-row" key={invoice.id} style={{ alignItems: "center", gap: 16, flexWrap: "wrap" }}><div><strong>Vehicle sale invoice {invoice.invoice_number}</strong><div className="ops-info-label">{formatNaira(outstandingKobo)} outstanding</div></div><PaymentCheckoutButton targetType="invoice" targetId={invoice.id} outstandingKobo={outstandingKobo} /></div>)}
        {openPreOrders.map((preOrder) => <div className="ops-info-row" key={`${preOrder.targetType}-${preOrder.targetId}`} style={{ alignItems: "center", gap: 16, flexWrap: "wrap" }}><div><strong>{preOrder.label}</strong><div className="ops-info-label">{formatNaira(preOrder.outstandingKobo)} outstanding</div></div><PaymentCheckoutButton targetType={preOrder.targetType} targetId={preOrder.targetId} outstandingKobo={preOrder.outstandingKobo} /></div>)}
      </div>}</div></Reveal>
    <Reveal delayMs={80}><div className="ops-panel"><div className="ops-panel-title">Instalment Payment History</div>
      {payments.length === 0 ? <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--muted)" }}><Receipt size={16} strokeWidth={1.75} />No instalment payments on your account yet.</div> : <div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>#</th><th>Vehicle</th><th>Due Date</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td>{payment.payment_number ?? "—"}</td><td>{payment.instalments?.vehicles ? `${payment.instalments.vehicles.year} ${payment.instalments.vehicles.make} ${payment.instalments.vehicles.model}` : "—"}</td><td>{new Date(payment.due_date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</td><td>{formatNaira(Math.max(0, payment.amount_kobo - (payment.amount_paid_kobo ?? 0)))}</td><td><span className={`ops-badge ${STATUS_CLASS[payment.status]}`}>{payment.status}</span></td></tr>)}</tbody></table></div>}
    </div></Reveal>
  </div></>;
}
