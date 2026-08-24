/**
 * WhatsApp Authentication
 * Handles OTP generation, verification, and session creation
 */

import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { OTP_CONFIG, SESSION_CONFIG } from './config';
import { sendTemplateMessage } from './messaging';

/**
 * Generate a random OTP code
 */
function generateOTP(length: number = OTP_CONFIG.length): string {
  return crypto.randomInt(0, 10 ** length).toString().padStart(length, '0');
}

/**
 * Generate a secure session token
 */
function generateSessionToken(length: number = SESSION_CONFIG.tokenLength): string {
  return crypto.randomBytes(length).toString('hex');
}

function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Normalize phone number to international format (2349XXXXXXXXX)
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');

  // Handle Nigerian numbers
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  } else if (cleaned.startsWith('234')) {
    // Already in international format
  } else if (cleaned.length === 10) {
    // Assume Nigerian number without country code
    cleaned = '234' + cleaned;
  }

  return cleaned;
}

/**
 * Send WhatsApp OTP for login
 * Creates OTP and queues WhatsApp message
 */
export async function sendWhatsAppLoginOTP(phone: string): Promise<void> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000);

  const service = createServiceClient();

  const { data: existingOtp } = await service
    .from('whatsapp_otp_codes')
    .select('id, created_at')
    .eq('phone_number', normalizedPhone)
    .eq('purpose', 'login')
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingOtp) {
    const retryAt = new Date(existingOtp.created_at).getTime() + OTP_CONFIG.resendDelaySeconds * 1000;
    if (retryAt > Date.now()) throw new Error('Please wait before requesting another code.');
    await service.from('whatsapp_otp_codes').update({ used_at: new Date().toISOString() }).eq('id', existingOtp.id);
  }

  // Store OTP in database
  const { error } = await service.from('whatsapp_otp_codes').insert({
    phone_number: normalizedPhone,
    otp_code: otp,
    purpose: 'login',
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error('Failed to store OTP:', error);
    throw new Error('Failed to send verification code');
  }

  // Queue WhatsApp message
  // In development mode, just log it
  if (process.env.NODE_ENV === 'development') {
    console.info('[DUMMY WhatsApp OTP] Login code generated.');
  } else {
    // Send via Meta Cloud API (implement in Phase 2B)
    await queueWhatsAppMessage(normalizedPhone, 'otp_login', { code: otp });
  }
}

/**
 * Send WhatsApp OTP for registration
 */
export async function sendWhatsAppRegistrationOTP(phone: string): Promise<void> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000);

  const service = createServiceClient();

  const { data: existingOtp } = await service
    .from('whatsapp_otp_codes')
    .select('id, created_at')
    .eq('phone_number', normalizedPhone)
    .eq('purpose', 'registration')
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingOtp) {
    const retryAt = new Date(existingOtp.created_at).getTime() + OTP_CONFIG.resendDelaySeconds * 1000;
    if (retryAt > Date.now()) throw new Error('Please wait before requesting another code.');
    await service.from('whatsapp_otp_codes').update({ used_at: new Date().toISOString() }).eq('id', existingOtp.id);
  }

  // Store OTP
  const { error } = await service.from('whatsapp_otp_codes').insert({
    phone_number: normalizedPhone,
    otp_code: otp,
    purpose: 'registration',
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error('Failed to store OTP:', error);
    throw new Error('Failed to send verification code');
  }

  // Queue WhatsApp message
  if (process.env.NODE_ENV === 'development') {
    console.info('[DUMMY WhatsApp OTP] Registration code generated.');
  } else {
    await queueWhatsAppMessage(normalizedPhone, 'otp_registration', { code: otp });
  }
}

/**
 * Verify WhatsApp OTP and create customer + session
 */
export async function verifyWhatsAppOTP(
  phone: string,
  otpCode: string,
  customerName?: string
): Promise<{ token: string; customerId: string }> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const service = createServiceClient();

  // Get stored OTP
  const { data: storedOtp, error: otpError } = await service
    .from('whatsapp_otp_codes')
    .select('*')
    .eq('phone_number', normalizedPhone)
    .eq('otp_code', otpCode)
    .gt('expires_at', new Date().toISOString())
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (otpError || !storedOtp) {
    throw new Error('Invalid or expired code');
  }

  // Check attempt count
  if (storedOtp.attempt_count >= OTP_CONFIG.maxAttempts) {
    throw new Error('Too many attempts. Please request a new code.');
  }

  // Get or create customer
  const { data: existingCustomer } = await service
    .from('customers')
    .select('*')
    .eq('phone', normalizedPhone)
    .is('deleted_at', null)
    .limit(1)
    .single();

  let customerId: string;

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    // Create new customer
    const { data: newCustomer, error: createError } = await service
      .from('customers')
      .insert({
        phone: normalizedPhone,
        full_name: customerName || 'DMECH Customer',
        type: 'cash_buyer',
        whatsapp_verified: true,
        whatsapp_verified_at: new Date().toISOString(),
        registration_source: 'whatsapp',
      })
      .select()
      .single();

    if (createError || !newCustomer) {
      console.error('Failed to create customer:', createError);
      throw new Error('Failed to create customer account');
    }

    customerId = newCustomer.id;
  }

  // Create session
  const sessionToken = await createWhatsAppSession(customerId, normalizedPhone);

  // Mark OTP as used
  await service.from('whatsapp_otp_codes').update({ used_at: new Date().toISOString() }).eq('id', storedOtp.id);

  return { token: sessionToken, customerId };
}

/** Website-only proof that the person controls an existing customer's phone. */
export async function sendWhatsAppPortalClaimOTP(phone: string): Promise<void> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const otp = generateOTP();
  const service = createServiceClient();
  const existing = await service.from('whatsapp_otp_codes').select('id, created_at').eq('phone_number', normalizedPhone).eq('purpose', 'portal_claim').is('used_at', null).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (existing.data) {
    const retryAt = new Date(existing.data.created_at).getTime() + OTP_CONFIG.resendDelaySeconds * 1000;
    if (retryAt > Date.now()) throw new Error('Please wait before requesting another code.');
    await service.from('whatsapp_otp_codes').update({ used_at: new Date().toISOString() }).eq('id', existing.data.id);
  }
  const { error } = await service.from('whatsapp_otp_codes').insert({ phone_number: normalizedPhone, otp_code: otp, purpose: 'portal_claim', expires_at: new Date(Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000).toISOString() });
  if (error) throw new Error('Failed to send verification code.');
  if (process.env.NODE_ENV === 'development') console.info('[DUMMY WhatsApp OTP] Portal claim code generated.');
  else await sendTemplateMessage(normalizedPhone, 'otp_login', { code: otp });
}

export async function consumeWhatsAppPortalClaimOTP(phone: string, otpCode: string): Promise<string> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const service = createServiceClient();
  const { data: stored } = await service.from('whatsapp_otp_codes').select('id, otp_code, attempt_count').eq('phone_number', normalizedPhone).eq('purpose', 'portal_claim').is('used_at', null).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
  const matches = stored?.otp_code?.length === otpCode.length && crypto.timingSafeEqual(Buffer.from(stored.otp_code), Buffer.from(otpCode));
  if (!stored || stored.attempt_count >= OTP_CONFIG.maxAttempts || !matches) {
    if (stored && stored.attempt_count < OTP_CONFIG.maxAttempts) await service.from('whatsapp_otp_codes').update({ attempt_count: stored.attempt_count + 1 }).eq('id', stored.id).eq('attempt_count', stored.attempt_count);
    throw new Error('Invalid or expired code.');
  }
  const { data: consumed } = await service.from('whatsapp_otp_codes').update({ used_at: new Date().toISOString() }).eq('id', stored.id).is('used_at', null).select('id').maybeSingle();
  if (!consumed) throw new Error('This code has already been used.');
  return normalizedPhone;
}

/** Stores only a hash; the raw bearer token is returned once to the customer. */
export async function createWhatsAppSession(customerId: string, phone: string): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_CONFIG.expiryDays * 24 * 60 * 60 * 1000);
  const service = createServiceClient();
  const { error } = await service.from('whatsapp_sessions').insert({
    customer_id: customerId,
    phone_number: phone,
    session_token: hashSessionToken(sessionToken),
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw new Error('Failed to create session');
  return sessionToken;
}

/**
 * Verify WhatsApp session token
 */
export async function verifyWhatsAppSession(token: string): Promise<{ customerId: string; phone: string }> {
  const service = createServiceClient();

  const { data: session, error } = await service
    .from('whatsapp_sessions')
    .select('customer_id, phone_number')
    .in('session_token', [hashSessionToken(token), token])
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  if (error || !session) {
    throw new Error('Invalid or expired session');
  }

  return { customerId: session.customer_id, phone: session.phone_number };
}

/**
 * Queue a WhatsApp message (sends to notifications table for async processing)
 */
async function queueWhatsAppMessage(
  phone: string,
  templateName: string,
  params: Record<string, string>
): Promise<void> {
  const service = createServiceClient();

  await service.from('notifications').insert({
    recipient_phone: phone,
    channel: 'whatsapp',
    template: templateName,
    payload: params,
    status: 'queued',
  });
}

/**
 * Revoke a WhatsApp session (logout)
 */
export async function revokeWhatsAppSession(token: string): Promise<void> {
  const service = createServiceClient();

  await service
    .from('whatsapp_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .in('session_token', [hashSessionToken(token), token]);
}

/**
 * Get customer from WhatsApp session token
 */
export async function getCustomerFromWhatsAppToken(token: string) {
  const service = createServiceClient();

  const { data, error } = await service
    .from('whatsapp_sessions')
    .select(
      `
      customer_id,
      customers (*)
    `
    )
    .in('session_token', [hashSessionToken(token), token])
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data.customers;
}
