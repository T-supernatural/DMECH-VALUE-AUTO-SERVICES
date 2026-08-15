/**
 * WhatsApp Authentication
 * Handles OTP generation, verification, and session creation
 */

import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { OTP_CONFIG, SESSION_CONFIG } from './config';

/**
 * Generate a random OTP code
 */
function generateOTP(length: number = OTP_CONFIG.length): string {
  return Math.random()
    .toString(10)
    .substring(2, 2 + length)
    .padEnd(length, '0');
}

/**
 * Generate a secure session token
 */
function generateSessionToken(length: number = SESSION_CONFIG.tokenLength): string {
  return crypto.randomBytes(length).toString('hex');
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
    console.log(`[DUMMY WhatsApp OTP] To ${normalizedPhone}: Your DMECH login code is: ${otp}`);
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
    console.log(
      `[DUMMY WhatsApp OTP] To ${normalizedPhone}: Welcome to DMECH! Your verification code is: ${otp}`
    );
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
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_CONFIG.expiryDays * 24 * 60 * 60 * 1000);

  const { error: sessionError } = await service.from('whatsapp_sessions').insert({
    customer_id: customerId,
    phone_number: normalizedPhone,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  });

  if (sessionError) {
    console.error('Failed to create session:', sessionError);
    throw new Error('Failed to create session');
  }

  // Mark OTP as used
  await service.from('whatsapp_otp_codes').update({ used_at: new Date().toISOString() }).eq('id', storedOtp.id);

  return { token: sessionToken, customerId };
}

/**
 * Verify WhatsApp session token
 */
export async function verifyWhatsAppSession(token: string): Promise<{ customerId: string; phone: string }> {
  const service = createServiceClient();

  const { data: session, error } = await service
    .from('whatsapp_sessions')
    .select('customer_id, phone_number')
    .eq('session_token', token)
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
    .eq('session_token', token);
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
    .eq('session_token', token)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data.customers;
}
