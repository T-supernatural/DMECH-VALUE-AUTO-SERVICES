/**
 * WhatsApp Webhook Handlers
 * Processes incoming messages from Meta Cloud API
 */

import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { WHATSAPP_CONFIG } from './config';
import { logWhatsAppMessage, sendTextMessage } from './messaging';

/**
 * Verify webhook signature from Meta
 * Ensures the webhook came from Meta and not an attacker
 */
export function verifyWebhookSignature(body: string, xHubSignature: string): boolean {
  if (!WHATSAPP_CONFIG.apiSecret) return false;

  const hash = crypto
    .createHmac('sha256', WHATSAPP_CONFIG.apiSecret)
    .update(body)
    .digest('hex');

  const signature = `sha256=${hash}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(xHubSignature));
  } catch {
    return false;
  }
}

/**
 * Extract message from Meta's webhook payload
 */
interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'location';
  text?: {
    body: string;
  };
  button?: {
    text: string;
  };
}

/**
 * Handle incoming WhatsApp message
 */
export async function handleIncomingMessage(message: WebhookMessage, contacts: any[]): Promise<void> {
  const senderPhone = message.from;
  const messageText = message.text?.body || message.button?.text || '';

  console.log(`[WhatsApp Webhook] Received message from ${senderPhone}: ${messageText}`);

  const service = createServiceClient();

  // Log the message
  await service.from('whatsapp_messages').insert({
    sender_phone: senderPhone,
    direction: 'inbound',
    message_type: message.type,
    content: messageText,
    whatsapp_message_id: message.id,
    whatsapp_status: 'received',
    created_at: new Date(parseInt(message.timestamp) * 1000).toISOString(),
  });

  // Try to match customer by phone
  const { data: customer } = await service
    .from('customers')
    .select('id')
    .eq('phone', senderPhone)
    .limit(1)
    .single();

  if (customer) {
    // Update the message with customer ID
    await service
      .from('whatsapp_messages')
      .update({ customer_id: customer.id })
      .eq('whatsapp_message_id', message.id);
  }

  // Check if this is a registration message
  if (messageText.startsWith('REGISTER ')) {
    const parts = messageText.split(' ');
    const code = parts[1];

    await handleRegistrationMessage(senderPhone, code, contacts[0]?.profile?.name);
    return;
  }

  // Check if this is an OTP verification
  if (/^\d{6}$/.test(messageText)) {
    await handleOTPMessage(senderPhone, messageText);
    return;
  }

  // For other messages, send auto-reply
  if (customer) {
    await sendTextMessage(
      senderPhone,
      '👋 Thanks for reaching out! A DMECH specialist will reply within 30 minutes. For urgent matters, call us: 0800-DMECH-00'
    );
  }
}

/**
 * Handle REGISTER message from customer
 */
async function handleRegistrationMessage(phone: string, code: string, customerName?: string): Promise<void> {
  const service = createServiceClient();

  // Check if code is valid and not expired
  const { data: pending } = await service
    .from('pending_whatsapp_registrations')
    .select('*')
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dmech.app';

  if (!pending) {
    await sendTextMessage(phone, `❌ Registration code expired or invalid. Start again: ${appUrl}/register-whatsapp`);
    return;
  }

  // Create customer
  const { data: newCustomer, error } = await service
    .from('customers')
    .insert({
      phone: phone,
      full_name: customerName || 'DMECH Customer',
      type: 'cash_buyer',
      whatsapp_verified: true,
      whatsapp_verified_at: new Date().toISOString(),
      registration_source: 'whatsapp',
    })
    .select()
    .single();

  if (error || !newCustomer) {
    console.error('Failed to create customer:', error);
    await sendTextMessage(phone, `❌ Registration failed. Please try again: ${appUrl}/register-whatsapp`);
    return;
  }

  // Create session
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await service.from('whatsapp_sessions').insert({
    customer_id: newCustomer.id,
    phone_number: phone,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  });

  // Delete pending registration
  await service.from('pending_whatsapp_registrations').delete().eq('code', code);

  // Send welcome message
  const loginUrl = `${appUrl}/dashboard?token=${sessionToken}`;
  await sendTextMessage(
    phone,
    `✅ Welcome ${customerName || 'to DMECH'}! 🎉\n\nYou can now:\n✓ Browse our vehicles\n✓ Check pricing & financing\n✓ Track orders\n\nLogin here: ${loginUrl}`
  );
}

/**
 * Handle OTP verification message
 */
async function handleOTPMessage(phone: string, otp: string): Promise<void> {
  const service = createServiceClient();

  // Find valid OTP
  const { data: validOtp } = await service
    .from('whatsapp_otp_codes')
    .select('*')
    .eq('phone_number', phone)
    .eq('otp_code', otp)
    .gt('expires_at', new Date().toISOString())
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!validOtp) {
    await sendTextMessage(phone, '❌ Invalid or expired code. Please try again.');
    return;
  }

  // Mark as used
  await service.from('whatsapp_otp_codes').update({ used_at: new Date().toISOString() }).eq('id', validOtp.id);

  // Handle based on purpose
  if (validOtp.purpose === 'login') {
    await handleLoginOTP(phone, validOtp.id);
  } else if (validOtp.purpose === 'registration') {
    await handleRegistrationOTP(phone, validOtp.id);
  }
}

/**
 * Handle OTP for login
 */
async function handleLoginOTP(phone: string, otpId: string): Promise<void> {
  const service = createServiceClient();

  // Get or create customer
  const { data: customer } = await service
    .from('customers')
    .select('id, full_name')
    .eq('phone', phone)
    .limit(1)
    .single();

  let customerId: string;

  if (!customer) {
    // Create new customer for login
    const { data: newCustomer } = await service
      .from('customers')
      .insert({
        phone: phone,
        full_name: 'DMECH Customer',
        type: 'cash_buyer',
        whatsapp_verified: true,
      })
      .select()
      .single();

    if (!newCustomer) {
      await sendTextMessage(phone, '❌ Login failed. Please try again.');
      return;
    }

    customerId = newCustomer.id;
  } else {
    customerId = customer.id;
  }

  // Create session
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await service.from('whatsapp_sessions').insert({
    customer_id: customerId,
    phone_number: phone,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  });

  // Send login link
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dmech.app'}/dashboard?token=${sessionToken}`;
  await sendTextMessage(
    phone,
    `✅ Login successful!\n\nClick here to access your dashboard:\n${loginUrl}\n\nThis link expires in 30 days.`
  );
}

/**
 * Handle OTP for registration
 */
async function handleRegistrationOTP(phone: string, otpId: string): Promise<void> {
  const service = createServiceClient();

  // Check if customer already exists
  const { data: existing } = await service.from('customers').select('id').eq('phone', phone).limit(1).single();

  if (existing) {
    // Customer already registered, treat as login
    await handleLoginOTP(phone, otpId);
    return;
  }

  // Create new customer
  const { data: newCustomer, error } = await service
    .from('customers')
    .insert({
      phone: phone,
      full_name: 'DMECH Customer',
      type: 'cash_buyer',
      whatsapp_verified: true,
      whatsapp_verified_at: new Date().toISOString(),
      registration_source: 'whatsapp',
    })
    .select()
    .single();

  if (error || !newCustomer) {
    await sendTextMessage(phone, '❌ Registration failed. Please try again.');
    return;
  }

  // Create session
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await service.from('whatsapp_sessions').insert({
    customer_id: newCustomer.id,
    phone_number: phone,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  });

  // Send welcome message
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dmech.app'}/dashboard?token=${sessionToken}`;
  await sendTextMessage(
    phone,
    `✅ Welcome to DMECH! 🎉\n\nYou're all set. Access your account:\n${loginUrl}\n\nStart by browsing our available vehicles.`
  );
}
