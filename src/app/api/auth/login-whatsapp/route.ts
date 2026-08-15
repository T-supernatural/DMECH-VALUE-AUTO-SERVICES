/**
 * WhatsApp Login API
 * POST: Send OTP to phone number
 * PUT: Verify OTP and create session
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppLoginOTP, verifyWhatsAppOTP, normalizePhoneNumber } from '@/lib/whatsapp/auth';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/login-whatsapp
 * Send OTP to customer's WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const normalized = normalizePhoneNumber(phone);

    // Check if customer exists
    const service = createServiceClient();
    const { data: customer } = await service
      .from('customers')
      .select('id')
      .eq('phone_number', normalized)
      .limit(1)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: 'No account found with this phone number. Please register first.' },
        { status: 400 }
      );
    }

    // Send OTP
    await sendWhatsAppLoginOTP(phone);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your WhatsApp. Enter the 6-digit code below.',
      expiresIn: 900, // 15 minutes
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/login-whatsapp
 * Verify OTP and create session
 */
export async function PUT(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 });
    }

    // Verify OTP and create session
    const { token, customerId } = await verifyWhatsAppOTP(phone, otp);

    return NextResponse.json({
      success: true,
      token,
      customerId,
      message: 'Login successful!',
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid or expired code' },
      { status: 400 }
    );
  }
}
