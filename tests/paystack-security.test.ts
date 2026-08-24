import crypto from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { verifyPaystackSignature } from "@/lib/paystack";

const originalSecret = process.env.PAYSTACK_SECRET_KEY;

afterEach(() => {
  if (originalSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
  else process.env.PAYSTACK_SECRET_KEY = originalSecret;
});

describe("Paystack webhook signature verification", () => {
  it("accepts only the SHA-512 HMAC for the unchanged raw body", () => {
    process.env.PAYSTACK_SECRET_KEY = "test_secret";
    const body = '{"event":"charge.success"}';
    const signature = crypto.createHmac("sha512", "test_secret").update(body).digest("hex");

    expect(verifyPaystackSignature(body, signature)).toBe(true);
    expect(verifyPaystackSignature(`${body} `, signature)).toBe(false);
    expect(verifyPaystackSignature(body, "bad-signature")).toBe(false);
  });
});
