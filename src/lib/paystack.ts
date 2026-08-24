import crypto from "node:crypto";

const PAYSTACK_API = "https://api.paystack.co";

export type PaymentCurrency = "NGN" | "USD";

type PaystackVerification = {
  id: number | string;
  status: string;
  reference: string;
  amount: number;
  currency: PaymentCurrency;
  customer?: { email?: string };
  paid_at?: string;
};

function secretKey() {
  const value = process.env.PAYSTACK_SECRET_KEY;
  if (!value) throw new Error("Paystack is not configured.");
  return value;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  const supplied = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return supplied.length === expectedBuffer.length && crypto.timingSafeEqual(supplied, expectedBuffer);
}

export async function initializePaystackTransaction(input: {
  email: string;
  amountSubunit: number;
  currency: PaymentCurrency;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}) {
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      amount: String(input.amountSubunit),
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: JSON.stringify(input.metadata),
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.status || !payload.data?.authorization_url) throw new Error("Paystack could not initialize checkout.");
  return payload.data as { authorization_url: string; reference: string };
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerification> {
  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.status || !payload.data) throw new Error("Paystack could not verify the transaction.");
  return payload.data as PaystackVerification;
}
