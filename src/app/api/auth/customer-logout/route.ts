import { NextResponse } from "next/server";
import { revokeCurrentWhatsAppCustomerSession } from "@/lib/customer-session";

export async function POST() {
  await revokeCurrentWhatsAppCustomerSession();
  return NextResponse.json({ ok: true });
}
