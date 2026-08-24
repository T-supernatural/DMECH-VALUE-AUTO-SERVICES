import { NextResponse } from "next/server";
import { consumeWhatsAppPortalClaimOTP, normalizePhoneNumber, sendWhatsAppPortalClaimOTP } from "@/lib/whatsapp/auth";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function currentAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: Request) {
  const user = await currentAuthUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const phone = typeof body?.phone === "string" ? normalizePhoneNumber(body.phone) : "";
  if (!/^234\d{10}$/.test(phone)) return NextResponse.json({ error: "Enter a valid Nigerian phone number." }, { status: 400 });
  const service = createServiceClient();
  const { data: customer } = await service.from("customers").select("id, user_id").eq("phone", phone).is("deleted_at", null).maybeSingle();
  if (!customer) return NextResponse.json({ error: "No existing DMECH customer record matches this number. Complete new registration instead." }, { status: 404 });
  if (customer.user_id) return NextResponse.json({ error: "This customer record is already linked to a portal account." }, { status: 409 });
  try {
    await sendWhatsAppPortalClaimOTP(phone);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not send the code." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const user = await currentAuthUser();
  if (!user?.email) return NextResponse.json({ error: "Please sign in with an email first." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const phone = typeof body?.phone === "string" ? body.phone : "";
  const code = typeof body?.code === "string" ? body.code : "";
  if (!phone || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Phone number and six-digit code are required." }, { status: 400 });
  try {
    const verifiedPhone = await consumeWhatsAppPortalClaimOTP(phone, code);
    const service = createServiceClient();
    const { data: customerId, error } = await service.rpc("dmech_claim_customer_portal", { p_auth_user_id: user.id, p_email: user.email, p_phone: verifiedPhone });
    if (error || !customerId) throw new Error(error?.message || "Could not link your account.");
    return NextResponse.json({ ok: true, customerId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not link your account." }, { status: 400 });
  }
}
