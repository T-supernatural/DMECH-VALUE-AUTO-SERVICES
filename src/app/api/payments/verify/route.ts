import { NextResponse } from "next/server";
import { customerGuard } from "@/lib/guards";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const customer = await customerGuard();
  if (!customer) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const reference = new URL(request.url).searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });
  const service = createServiceClient();
  const { data: transaction } = await service.from("payment_transactions").select("*").eq("reference", reference).eq("customer_id", customer.id).maybeSingle();
  if (!transaction) return NextResponse.json({ error: "Payment request not found." }, { status: 404 });
  if (transaction.status === "succeeded") return NextResponse.json({ status: "succeeded", receiptId: transaction.receipt_id });
  try {
    const verified = await verifyPaystackTransaction(reference);
    const emailMatches = verified.customer?.email?.toLowerCase() === customer.email?.toLowerCase();
    if (verified.status !== "success" || verified.reference !== reference || verified.amount !== transaction.amount_subunit || verified.currency !== transaction.currency || !emailMatches) {
      return NextResponse.json({ status: "pending" }, { status: 202 });
    }
    const { data: receiptId, error } = await service.rpc("dmech_confirm_online_payment", { p_transaction_id: transaction.id, p_provider_transaction_id: String(verified.id), p_confirmed_at: verified.paid_at ?? new Date().toISOString() });
    if (error) throw error;
    return NextResponse.json({ status: "succeeded", receiptId });
  } catch {
    return NextResponse.json({ error: "Payment verification is temporarily unavailable; please do not pay again." }, { status: 502 });
  }
}
