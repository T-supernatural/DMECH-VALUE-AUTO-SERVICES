import { NextResponse } from "next/server";
import { verifyPaystackSignature, verifyPaystackTransaction } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  try {
    if (!verifyPaystackSignature(rawBody, request.headers.get("x-paystack-signature"))) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }
  const event = JSON.parse(rawBody) as { event?: string; data?: { id?: number | string; reference?: string } };
  if (event.event !== "charge.success" || !event.data?.reference || event.data.id == null) return NextResponse.json({ received: true });
  const service = createServiceClient();
  const eventId = String(event.data.id);
  const { error: eventError } = await service.from("payment_webhook_events").insert({ provider: "paystack", provider_event_id: eventId, event_type: event.event, payload: event });
  if (eventError?.code === "23505") return NextResponse.json({ received: true });
  if (eventError) return NextResponse.json({ error: "Could not record webhook." }, { status: 500 });
  try {
    const { data: transaction } = await service.from("payment_transactions").select("*").eq("reference", event.data.reference).maybeSingle();
    if (!transaction) throw new Error("Unknown payment reference");
    const { data: customer } = await service.from("customers").select("email").eq("id", transaction.customer_id).maybeSingle();
    const verified = await verifyPaystackTransaction(event.data.reference);
    if (verified.status !== "success" || verified.reference !== transaction.reference || verified.amount !== transaction.amount_subunit || verified.currency !== transaction.currency || !customer?.email || verified.customer?.email?.toLowerCase() !== customer.email.toLowerCase()) throw new Error("Verification mismatch");
    const { error } = await service.rpc("dmech_confirm_online_payment", { p_transaction_id: transaction.id, p_provider_transaction_id: String(verified.id), p_confirmed_at: verified.paid_at ?? new Date().toISOString() });
    if (error) throw error;
    await service.from("payment_webhook_events").update({ processed_at: new Date().toISOString() }).eq("provider", "paystack").eq("provider_event_id", eventId).eq("event_type", event.event);
  } catch {
    await service.from("payment_webhook_events").update({ processing_error: "Verification or settlement failed" }).eq("provider", "paystack").eq("provider_event_id", eventId).eq("event_type", event.event);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
