/**
 * WhatsApp Webhook Handlers
 * Processes incoming messages from Meta Cloud API
 */

import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { formatNaira } from '@/lib/money';
import { stageLabel } from '@/lib/ops/vehicle-stage';
import { getFinancingConfig } from '@/lib/financing-config';
import { CONTACT } from '@/lib/contact';
import type { LifecycleStage } from '@/types';
import { WHATSAPP_CONFIG } from './config';
import { createWhatsAppSession } from './auth';
import { sendTextMessage } from './messaging';

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
interface WebhookContact {
  profile?: { name?: string };
}

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
export async function handleIncomingMessage(message: WebhookMessage, contacts: WebhookContact[]): Promise<void> {
  const senderPhone = message.from;
  const messageText = message.text?.body || message.button?.text || '';

  console.info('[WhatsApp Webhook] Received inbound message.');

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

  // Try to match customer by phone -- excludes soft-deleted customers so a
  // deleted account can't keep using its old WhatsApp identity.
  const { data: customer } = await service
    .from('customers')
    .select('id')
    .eq('phone', senderPhone)
    .is('deleted_at', null)
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

  // Structured commands -- Meta's policy (effective Jan 15, 2026) permits
  // automation scoped to defined business tasks like these; this is the
  // deterministic v1 version (keyword match, no LLM involved yet), where
  // every reply is read straight off real DMECH data, never guessed at.
  // Requires a known customer, same as the auto-reply below.
  if (customer) {
    const command = messageText.trim().toUpperCase();
    if (command === 'STATUS' || command === 'TRACK') {
      await handleStatusCommand(senderPhone, customer.id);
      return;
    }
    if (command === 'PAYMENT' || command === 'BALANCE') {
      await handlePaymentCommand(senderPhone, customer.id);
      return;
    }
    if (command === 'FINANCE' || command === 'FINANCING') {
      await handleFinanceCommand(senderPhone);
      return;
    }
    if (command === 'HELP') {
      await handleHelpCommand(senderPhone);
      return;
    }
  }

  // For other messages, send auto-reply
  if (customer) {
    await sendTextMessage(
      senderPhone,
      `👋 Thanks for reaching out! A DMECH specialist will reply within 30 minutes. For urgent matters, call us: ${CONTACT.phoneDisplay}\n\nType HELP to see what I can look up for you right away.`
    );
  }
}

/**
 * STATUS / TRACK -- the customer's vehicle(s) and lifecycle stage
 */
async function handleStatusCommand(phone: string, customerId: string): Promise<void> {
  const service = createServiceClient();
  const [{ data: vehicles }, { data: unpaidPreOrders }] = await Promise.all([
    service.from('vehicles').select('make, model, year, lifecycle_stage').eq('buyer_id', customerId).is('deleted_at', null),
    service
      .from('pre_orders')
      .select('balance_amount_kobo, sourcing_listings(make, model, year)')
      .eq('customer_id', customerId)
      .eq('status', 'purchased')
      .eq('balance_paid', false)
      .gt('balance_amount_kobo', 0),
  ]);

  const lines: string[] = [];
  if (vehicles && vehicles.length > 0) {
    lines.push(...vehicles.map((v) => `• ${v.year} ${v.make} ${v.model} — ${stageLabel(v.lifecycle_stage as LifecycleStage)}`));
  }

  if (lines.length === 0 && (!unpaidPreOrders || unpaidPreOrders.length === 0)) {
    await sendTextMessage(
      phone,
      "You don't have any vehicles linked to your account yet. Browse our stock and let us know when you're ready to reserve one!"
    );
    return;
  }

  let reply = lines.length > 0 ? `📦 Your vehicle status:\n\n${lines.join('\n')}` : '';

  if (unpaidPreOrders && unpaidPreOrders.length > 0) {
    const balanceLines = unpaidPreOrders.map((po) => {
      const listing = po.sourcing_listings as unknown as { make: string; model: string; year: number } | null;
      const vehicleLabel = listing ? `${listing.year} ${listing.make} ${listing.model}` : 'your vehicle';
      return `⚠️ Balance due on ${vehicleLabel}: ${formatNaira(po.balance_amount_kobo as number)} — this must clear before delivery.`;
    });
    reply += (reply ? '\n\n' : '') + balanceLines.join('\n');
  }

  await sendTextMessage(phone, reply);
}

/**
 * PAYMENT / BALANCE -- the customer's next due or overdue payment
 */
async function handlePaymentCommand(phone: string, customerId: string): Promise<void> {
  const service = createServiceClient();
  const { data: payments } = await service
    .from('payments')
    .select('amount_kobo, due_date, status')
    .eq('customer_id', customerId)
    .in('status', ['pending', 'overdue', 'partial'])
    .order('due_date', { ascending: true })
    .limit(1);

  const next = payments?.[0];
  if (!next) {
    await sendTextMessage(phone, "✅ You're all caught up — no pending payments right now.");
    return;
  }

  const dueDate = new Date(next.due_date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const label = next.status === 'overdue' ? '⚠️ Overdue payment' : 'Next payment due';
  await sendTextMessage(phone, `${label}: ${formatNaira(next.amount_kobo)} on ${dueDate}`);
}

/**
 * FINANCE / FINANCING -- reads real platform settings, not a hardcoded script
 */
async function handleFinanceCommand(phone: string): Promise<void> {
  const financingConfig = await getFinancingConfig();
  const { defaultDepositPct: depositPct, defaultTenorMonths: tenorMonths } = financingConfig;

  await sendTextMessage(
    phone,
    `💰 DMECH Direct Finance:\n\n• Deposit: ${depositPct}% upfront\n• Balance spread over ${tenorMonths} months\n• We also work with partner financing options\n\nReply with the vehicle you're interested in and we'll work out the exact numbers.`
  );
}

/**
 * HELP -- lists the commands this version actually supports
 */
async function handleHelpCommand(phone: string): Promise<void> {
  await sendTextMessage(
    phone,
    `Here's what I can help with right now:\n\nSTATUS — your vehicle(s) and where they are\nPAYMENT — your next payment due\nFINANCE — how DMECH financing works\n\nAnything else, just ask and a DMECH specialist will step in.`
  );
}

/**
 * Handle REGISTER message from customer
 */
async function handleRegistrationMessage(phone: string, code: string, customerName?: string): Promise<void> {
  const service = createServiceClient();

  // Check if code is valid and not expired
  const { data: pending } = await service
    .from('pending_whatsapp_registrations')
    .select('id')
    .eq('code', code)
    .eq('phone_number', phone)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dmech.app';

  if (!pending) {
    await sendTextMessage(phone, `❌ Registration code expired or invalid. Start again: ${appUrl}/register-whatsapp`);
    return;
  }

  const { data: existingCustomer } = await service
    .from('customers')
    .select('id')
    .eq('phone', phone)
    .is('deleted_at', null)
    .maybeSingle();
  const { data: newCustomer, error } = existingCustomer
    ? { data: existingCustomer, error: null }
    : await service
        .from('customers')
        .insert({
          phone,
          full_name: customerName || 'DMECH Customer',
          type: 'cash_buyer',
          whatsapp_verified: true,
          whatsapp_verified_at: new Date().toISOString(),
          registration_source: 'whatsapp',
        })
        .select('id')
        .single();

  if (error || !newCustomer) {
    console.error('WhatsApp registration could not create a customer.');
    await sendTextMessage(phone, `❌ Registration failed. Please try again: ${appUrl}/register-whatsapp`);
    return;
  }

  const sessionToken = await createWhatsAppSession(newCustomer.id, phone);

  // Delete pending registration
  await service.from('pending_whatsapp_registrations').delete().eq('id', pending.id).eq('phone_number', phone);

  // Send welcome message
  const trackUrl = `${appUrl}/track/${sessionToken}`;
  await sendTextMessage(
    phone,
    `✅ Welcome ${customerName || 'to DMECH'}! 🎉\n\nYou can now:\n✓ Browse our vehicles\n✓ Check pricing & financing\n✓ Track orders\n\nTrack your account here: ${trackUrl}`
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
    .gt('expires_at', new Date().toISOString())
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const matches = validOtp?.otp_code?.length === otp.length
    && crypto.timingSafeEqual(Buffer.from(validOtp.otp_code), Buffer.from(otp));
  if (!validOtp || validOtp.attempt_count >= 5 || !matches) {
    if (validOtp && validOtp.attempt_count < 5) {
      await service
        .from('whatsapp_otp_codes')
        .update({ attempt_count: validOtp.attempt_count + 1 })
        .eq('id', validOtp.id)
        .eq('attempt_count', validOtp.attempt_count);
    }
    await sendTextMessage(phone, '❌ Invalid or expired code. Please try again.');
    return;
  }

  const { data: consumedOtp } = await service
    .from('whatsapp_otp_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', validOtp.id)
    .is('used_at', null)
    .select('id')
    .maybeSingle();
  if (!consumedOtp) return;

  // Handle based on purpose
  if (validOtp.purpose === 'login') {
    await handleLoginOTP(phone);
  } else if (validOtp.purpose === 'registration') {
    await handleRegistrationOTP(phone);
  }
}

/**
 * Handle OTP for login
 */
async function handleLoginOTP(phone: string): Promise<void> {
  const service = createServiceClient();

  // Get or create customer -- excludes soft-deleted customers
  const { data: customer } = await service
    .from('customers')
    .select('id, full_name')
    .eq('phone', phone)
    .is('deleted_at', null)
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

  const sessionToken = await createWhatsAppSession(customerId, phone);

  // Send login link
  const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dmech.app'}/track/${sessionToken}`;
  await sendTextMessage(
    phone,
    `✅ Login successful!\n\nTrack your account here:\n${trackUrl}\n\nThis link expires in 30 days.`
  );
}

/**
 * Handle OTP for registration
 */
async function handleRegistrationOTP(phone: string): Promise<void> {
  const service = createServiceClient();

  // Check if customer already exists
  const { data: existing } = await service
    .from('customers')
    .select('id')
    .eq('phone', phone)
    .is('deleted_at', null)
    .limit(1)
    .single();

  if (existing) {
    // Customer already registered, treat as login
    await handleLoginOTP(phone);
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

  const sessionToken = await createWhatsAppSession(newCustomer.id, phone);

  // Send welcome message
  const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dmech.app'}/track/${sessionToken}`;
  await sendTextMessage(
    phone,
    `✅ Welcome to DMECH! 🎉\n\nYou're all set. Track your account:\n${trackUrl}\n\nStart by browsing our available vehicles.`
  );
}
