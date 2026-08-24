/**
 * WhatsApp Registration API
 * POST: Start registration flow (generate code)
 * PUT: Verify OTP and complete registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { normalizePhoneNumber } from '@/lib/whatsapp/auth';

/**
 * POST /api/auth/register-whatsapp
 * Start WhatsApp registration by generating a registration code
 */
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const normalized = normalizePhoneNumber(phone);
    if (!/^234\d{10}$/.test(normalized)) {
      return NextResponse.json({ error: 'Enter a valid Nigerian phone number.' }, { status: 400 });
    }

    // Check if already registered
    const service = createServiceClient();
    const { data: existing } = await service
      .from('customers')
      .select('id')
      .eq('phone', normalized)
      .is('deleted_at', null)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This phone number is already registered. Use login instead.' },
        { status: 400 }
      );
    }

    // Generate unique registration code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store pending registration
    const { error } = await service.from('pending_whatsapp_registrations').insert({
      code,
      phone_number: normalized,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error('Failed to create pending registration:', error);
      return NextResponse.json({ error: 'Failed to start registration' }, { status: 500 });
    }

    // Return the code and WhatsApp message link
    const whatsappMessage = `REGISTER ${code}`;
    const dmechWhatsAppNumber = process.env.WHATSAPP_DMECH_PHONE || '2348151023414';
    const waLink = `https://wa.me/${dmechWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    return NextResponse.json({
      success: true,
      code,
      message: `Open WhatsApp and send: ${whatsappMessage}`,
      waLink, // Direct link to WhatsApp
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

/**
 * GET /api/auth/register-whatsapp?phone=...
 * Polled by the "waiting" screen to detect that the customer has sent
 * REGISTER <code> on WhatsApp and the webhook has completed registration.
 */
export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const normalized = normalizePhoneNumber(phone);

    const service = createServiceClient();
    const { data: customer } = await service
      .from('customers')
      .select('id')
      .eq('phone', normalized)
      .is('deleted_at', null)
      .limit(1)
      .single();

    if (!customer) {
      return NextResponse.json({ done: false });
    }

    const { data: session } = await service
      .from('whatsapp_sessions')
      .select('session_token')
      .eq('customer_id', customer.id)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!session) {
      return NextResponse.json({ done: false });
    }

    return NextResponse.json({ done: true, token: session.session_token, customerId: customer.id });
  } catch (error) {
    console.error('Registration status check error:', error);
    return NextResponse.json({ done: false });
  }
}
