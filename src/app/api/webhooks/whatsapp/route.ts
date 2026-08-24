/**
 * WhatsApp Webhook Endpoint
 * Receives messages from Meta Cloud API
 * 
 * GET: Webhook verification (required by Meta)
 * POST: Incoming messages from customers
 */

import { NextRequest, NextResponse } from 'next/server';
import { WHATSAPP_CONFIG } from '@/lib/whatsapp/config';
import { verifyWebhookSignature, handleIncomingMessage } from '@/lib/whatsapp/handlers';

/**
 * GET /api/webhooks/whatsapp
 * Webhook verification endpoint (required by Meta)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify the mode and token
  if (mode === 'subscribe' && token === WHATSAPP_CONFIG.webhookVerifyToken) {
    console.info('[WhatsApp Webhook] Verification succeeded.');
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn('[WhatsApp Webhook] Verification failed.');
  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * POST /api/webhooks/whatsapp
 * Receives incoming messages from customers
 */
export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const xHubSignature = request.headers.get('x-hub-signature-256') || '';

    // Read body
    const body = await request.text();

    if (!verifyWebhookSignature(body, xHubSignature)) {
      console.warn('[WhatsApp Webhook] Signature verification failed.');
      return new NextResponse('Forbidden', { status: 403 });
    }

    const payload = JSON.parse(body);

    // Check if this is a message webhook
    if (payload.object !== 'whatsapp_business_account') {
      return new NextResponse('OK', { status: 200 });
    }

    // Process each entry
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const { value } = change;

        // Handle message status updates
        if (value.statuses) {
          for (const _status of value.statuses) {
            console.info('[WhatsApp Webhook] Received message status update.');
            // Update in database
            // TODO: Update message status in whatsapp_messages table
          }
        }

        // Handle incoming messages
        if (value.messages) {
          for (const message of value.messages) {
            await handleIncomingMessage(message, value.contacts || []);
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch {
    console.error('[WhatsApp Webhook] Error processing webhook.');
    return new NextResponse('Error', { status: 500 });
  }
}
