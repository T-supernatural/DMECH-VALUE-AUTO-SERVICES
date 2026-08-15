/**
 * WhatsApp Registration API
 * POST: Start registration flow (generate code)
 * PUT: Verify OTP and complete registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import crypto from 'crypto';

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

    // Normalize phone number
    let normalized = phone.replace(/\D/g, '');
    if (normalized.startsWith('0')) {
      normalized = '234' + normalized.substring(1);
    } else if (!normalized.startsWith('234')) {
      normalized = '234' + normalized;
    }

    // Check if already registered
    const service = createServiceClient();
    const { data: existing } = await service
      .from('customers')
      .select('id')
      .eq('phone', normalized)
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
    const dmechWhatsAppNumber = process.env.WHATSAPP_DMECH_PHONE || '2349118064105';
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
 * PUT /api/auth/register-whatsapp
 * Verify registration code (called after customer sends WhatsApp message)
 */
export async function PUT(request: NextRequest) {
  try {
    const { phone, code, name } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code required' }, { status: 400 });
    }

    // Normalize phone
    let normalized = phone.replace(/\D/g, '');
    if (normalized.startsWith('0')) {
      normalized = '234' + normalized.substring(1);
    } else if (!normalized.startsWith('234')) {
      normalized = '234' + normalized;
    }

    const service = createServiceClient();

    // Check pending registration
    const { data: pending } = await service
      .from('pending_whatsapp_registrations')
      .select('*')
      .eq('code', code)
      .eq('phone_number', normalized)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single();

    if (!pending) {
      return NextResponse.json({ error: 'Invalid or expired registration code' }, { status: 400 });
    }

    // Create customer
    const { data: customer, error: createError } = await service
      .from('customers')
      .insert({
        phone: normalized,
        full_name: name || 'DMECH Customer',
        type: 'cash_buyer',
        whatsapp_verified: true,
        whatsapp_verified_at: new Date().toISOString(),
        registration_source: 'whatsapp',
      })
      .select()
      .single();

    if (createError || !customer) {
      console.error('Failed to create customer:', createError);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { error: sessionError } = await service.from('whatsapp_sessions').insert({
      customer_id: customer.id,
      phone_number: normalized,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    });

    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Delete pending registration
    await service.from('pending_whatsapp_registrations').delete().eq('code', code);

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      token: sessionToken,
      message: 'Registration successful! You can now access your account.',
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
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

    let normalized = phone.replace(/\D/g, '');
    if (normalized.startsWith('0')) {
      normalized = '234' + normalized.substring(1);
    } else if (!normalized.startsWith('234')) {
      normalized = '234' + normalized;
    }

    const service = createServiceClient();
    const { data: customer } = await service
      .from('customers')
      .select('id')
      .eq('phone', normalized)
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
