import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { staffGuard } from "@/lib/guards";
import { logAudit } from "@/lib/audit";
import type { StaffRole, PreOrderStatus, PaymentMethod } from "@/types";

const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "accountant", "sales_manager"];

const VALID_STATUSES: PreOrderStatus[] = [
  "pending_deposit", "deposit_paid", "sourcing", "purchased", "cancelled", "refunded",
];
const VALID_PAYMENT_METHODS: PaymentMethod[] = ["bank_transfer", "paystack", "pos", "cash"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff || !EDIT_ROLES.includes(staff.role as StaffRole)) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if ("status" in body && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  if ("deposit_payment_method" in body && body.deposit_payment_method && !VALID_PAYMENT_METHODS.includes(body.deposit_payment_method)) {
    return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
  }
  if ("balance_payment_method" in body && body.balance_payment_method && !VALID_PAYMENT_METHODS.includes(body.balance_payment_method)) {
    return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  for (const key of ["status", "notes"] as const) {
    if (key in body) updates[key] = body[key];
  }

  // Marking a deposit paid always sets the paid-at timestamp and bumps the
  // pre-order into deposit_paid status, same "record + advance status"
  // pattern as marking an invoice paid.
  if (body.deposit_paid === true) {
    updates.deposit_paid = true;
    updates.deposit_paid_at = new Date().toISOString();
    updates.deposit_payment_method = body.deposit_payment_method ?? null;
    if (!("status" in body)) updates.status = "deposit_paid";
  }
  // Same "record + timestamp" pattern as the deposit above -- this is what
  // clears the vehicles PATCH route's delivery gate for this pre-order.
  if (body.balance_paid === true) {
    updates.balance_paid = true;
    updates.balance_paid_at = new Date().toISOString();
    updates.balance_payment_method = body.balance_payment_method ?? null;
  }
  updates.updated_at = new Date().toISOString();

  const supabase = createServiceClient();
  const { data: before } = await supabase.from("pre_orders").select("*").eq("id", id).maybeSingle();

  const { data, error } = await supabase
    .from("pre_orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not update the pre-order." }, { status: 500 });
  }

  await logAudit({ userId: staff.id, action: "update", tableName: "pre_orders", recordId: id, oldValue: before, newValue: updates });

  return NextResponse.json({ preOrder: data });
}
