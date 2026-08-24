import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { customerGuard } from "@/lib/guards";
import { createServiceClient } from "@/lib/supabase/server";
import { initializePaystackTransaction, type PaymentCurrency } from "@/lib/paystack";

export const runtime = "nodejs";

const targets = ["instalment_payment", "pre_order_deposit", "pre_order_balance", "invoice"] as const;
type TargetType = (typeof targets)[number];

function originFor(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  return configured ?? new URL(request.url).origin;
}

async function outstandingFor(service: ReturnType<typeof createServiceClient>, customerId: string, type: TargetType, id: string) {
  if (type === "instalment_payment") {
    const { data } = await service.from("payments").select("amount_kobo, amount_paid_kobo, customer_id").eq("id", id).maybeSingle();
    return data?.customer_id === customerId ? (data.amount_kobo - (data.amount_paid_kobo ?? 0)) : null;
  }
  if (type.startsWith("pre_order")) {
    const { data } = await service.from("pre_orders").select("customer_id, deposit_amount_kobo, deposit_amount_paid_kobo, balance_amount_kobo, balance_amount_paid_kobo").eq("id", id).maybeSingle();
    if (data?.customer_id !== customerId) return null;
    return type === "pre_order_deposit"
      ? data.deposit_amount_kobo - (data.deposit_amount_paid_kobo ?? 0)
      : data.balance_amount_kobo == null ? null : data.balance_amount_kobo - (data.balance_amount_paid_kobo ?? 0);
  }
  const { data: invoice } = await service.from("invoices").select("id, customer_id, total_kobo, voided_at").eq("id", id).eq("doc_type", "invoice").maybeSingle();
  if (!invoice || invoice.customer_id !== customerId || invoice.voided_at) return null;
  const { data: receipts } = await service.from("invoices").select("total_kobo").eq("doc_type", "receipt").eq("related_invoice_id", id);
  return invoice.total_kobo - (receipts ?? []).reduce((sum, receipt) => sum + receipt.total_kobo, 0);
}

export async function POST(request: Request) {
  const customer = await customerGuard();
  if (!customer) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!customer.email) return NextResponse.json({ error: "Add an email address to your account before paying online." }, { status: 400 });

  const body = await request.json().catch(() => null);
  const targetType = targets.includes(body?.target_type) ? body.target_type as TargetType : null;
  const targetId = typeof body?.target_id === "string" ? body.target_id : "";
  const amountSubunit = Number.isSafeInteger(body?.amount_subunit) ? body.amount_subunit : 0;
  const currency = body?.currency === "USD" ? "USD" : body?.currency === "NGN" ? "NGN" : null;
  if (!targetType || !targetId || !currency || amountSubunit <= 0) return NextResponse.json({ error: "Invalid payment request." }, { status: 400 });
  // Existing customer debt records are NGN/kobo. USD needs a separately
  // approved customer quote/rate, which this application does not yet model.
  if (currency !== "NGN") return NextResponse.json({ error: "USD checkout is unavailable until DMECH records an approved USD customer quote." }, { status: 409 });

  const service = createServiceClient();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await service
    .from("payment_transactions")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customer.id)
    .gte("created_at", tenMinutesAgo);
  if ((count ?? 0) >= 5) return NextResponse.json({ error: "Too many checkout attempts. Please wait a few minutes." }, { status: 429 });
  const outstanding = await outstandingFor(service, customer.id, targetType, targetId);
  if (outstanding == null) return NextResponse.json({ error: "This payable record was not found." }, { status: 404 });
  if (outstanding <= 0) return NextResponse.json({ error: "This balance has already been paid." }, { status: 409 });
  if (amountSubunit > outstanding) return NextResponse.json({ error: "The requested amount exceeds the outstanding balance." }, { status: 400 });

  const reference = `DM-${crypto.randomUUID().replace(/-/g, "")}`;
  const { data: transaction, error } = await service.from("payment_transactions").insert({
    customer_id: customer.id, target_type: targetType, target_id: targetId, reference, currency: currency as PaymentCurrency, amount_subunit: amountSubunit,
  }).select("id").single();
  if (error || !transaction) return NextResponse.json({ error: "Could not create the payment request." }, { status: 500 });

  try {
    const checkout = await initializePaystackTransaction({
      email: customer.email, amountSubunit, currency, reference,
      callbackUrl: `${originFor(request)}/api/payments/verify?reference=${encodeURIComponent(reference)}`,
      metadata: { payment_transaction_id: transaction.id, customer_id: customer.id },
    });
    await service.from("payment_transactions").update({ status: "pending", updated_at: new Date().toISOString() }).eq("id", transaction.id);
    return NextResponse.json({ authorizationUrl: checkout.authorization_url, reference });
  } catch {
    await service.from("payment_transactions").update({ status: "failed", failed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", transaction.id);
    return NextResponse.json({ error: "Could not start Paystack checkout. Please try again." }, { status: 502 });
  }
}
