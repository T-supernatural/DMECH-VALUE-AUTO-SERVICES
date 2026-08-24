import { cookies } from "next/headers";
import { verifyWhatsAppSession, revokeWhatsAppSession } from "@/lib/whatsapp/auth";

export const CUSTOMER_SESSION_COOKIE = "dmech_customer_session";

export async function currentWhatsAppCustomerSession() {
  const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  try { return await verifyWhatsAppSession(token); } catch { return null; }
}

export async function revokeCurrentWhatsAppCustomerSession() {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (token) await revokeWhatsAppSession(token);
  store.delete(CUSTOMER_SESSION_COOKIE);
}
