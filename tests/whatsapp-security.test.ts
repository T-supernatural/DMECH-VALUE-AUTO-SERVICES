import crypto from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('WhatsApp webhook signature verification', () => {
  it('rejects missing and invalid signatures', async () => {
    vi.stubEnv('WHATSAPP_API_SECRET', 'test-webhook-secret');
    const { verifyWebhookSignature } = await import('../src/lib/whatsapp/handlers');

    expect(verifyWebhookSignature('{"event":"test"}', '')).toBe(false);
    expect(verifyWebhookSignature('{"event":"test"}', 'sha256=invalid')).toBe(false);
  });

  it('accepts only a valid HMAC-SHA256 signature', async () => {
    vi.stubEnv('WHATSAPP_API_SECRET', 'test-webhook-secret');
    const body = '{"event":"test"}';
    const signature = `sha256=${crypto.createHmac('sha256', 'test-webhook-secret').update(body).digest('hex')}`;
    const { verifyWebhookSignature } = await import('../src/lib/whatsapp/handlers');

    expect(verifyWebhookSignature(body, signature)).toBe(true);
  });

  it('fails closed when no secret is configured, including development mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('WHATSAPP_API_SECRET', '');
    const { verifyWebhookSignature } = await import('../src/lib/whatsapp/handlers');

    expect(verifyWebhookSignature('{"event":"test"}', 'sha256=anything')).toBe(false);
  });
});

describe('WhatsApp token helpers', () => {
  it('normalizes Nigerian numbers without exposing a token or OTP', async () => {
    const { normalizePhoneNumber } = await import('../src/lib/whatsapp/auth');

    expect(normalizePhoneNumber('0803 123 4567')).toBe('2348031234567');
    expect(normalizePhoneNumber('+234 803 123 4567')).toBe('2348031234567');
  });
});
