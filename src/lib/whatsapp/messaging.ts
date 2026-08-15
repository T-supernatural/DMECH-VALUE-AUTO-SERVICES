/**
 * WhatsApp Messaging
 * Handles sending WhatsApp messages via Meta Cloud API
 */

import { WHATSAPP_CONFIG, MESSAGE_TEMPLATES } from './config';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * Send a WhatsApp template message
 * In development mode, logs the message instead of sending
 */
export async function sendTemplateMessage(
  recipientPhone: string,
  templateName: string,
  parameters: Record<string, string>
): Promise<void> {
  const service = createServiceClient();

  // Log in development mode
  if (WHATSAPP_CONFIG.useDummyMessaging) {
    console.log(`[DUMMY WhatsApp] To ${recipientPhone}:`);
    console.log(`  Template: ${templateName}`);
    console.log(`  Parameters:`, parameters);
    return;
  }

  // In production, send via Meta Cloud API
  // This is the REST call to Meta
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'en_US',
      },
      components: [
        {
          type: 'body',
          parameters: Object.values(parameters).map(value => ({
            type: 'text',
            text: value,
          })),
        },
      ],
    },
  };

  try {
    const response = await fetch(
      `https://graph.instagram.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = (await response.json()) as any;

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Log message to database
    await service.from('whatsapp_messages').insert({
      sender_phone: WHATSAPP_CONFIG.dmechPhoneNumber,
      direction: 'outbound',
      message_type: 'template',
      template_name: templateName,
      template_params: parameters,
      whatsapp_message_id: data.messages?.[0]?.id,
      whatsapp_status: 'sent',
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}

/**
 * Send a text message to customer
 */
export async function sendTextMessage(recipientPhone: string, text: string): Promise<void> {
  const service = createServiceClient();

  // Log in development mode
  if (WHATSAPP_CONFIG.useDummyMessaging) {
    console.log(`[DUMMY WhatsApp] To ${recipientPhone}: ${text}`);
    return;
  }

  // In production, send via Meta Cloud API
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientPhone,
    type: 'text',
    text: {
      body: text,
    },
  };

  try {
    const response = await fetch(
      `https://graph.instagram.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = (await response.json()) as any;

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Log to database
    await service.from('whatsapp_messages').insert({
      sender_phone: WHATSAPP_CONFIG.dmechPhoneNumber,
      direction: 'outbound',
      message_type: 'text',
      content: text,
      whatsapp_message_id: data.messages?.[0]?.id,
      whatsapp_status: 'sent',
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to send text message:', error);
    throw error;
  }
}

/**
 * Send order status notification
 */
export async function notifyOrderStatus(
  customerPhone: string,
  orderId: string,
  vehicleName: string,
  status: string,
  trackingUrl: string
): Promise<void> {
  const statusEmojis: Record<string, string> = {
    in_transit: '🚚',
    in_customs: '🛂',
    ready_for_delivery: '✅',
    delivered: '🎉',
  };

  const emoji = statusEmojis[status] || '📦';

  const statusMessages: Record<string, string> = {
    in_transit: 'Your vehicle is on the way from the port',
    in_customs: 'We are processing customs clearance',
    ready_for_delivery: 'Your vehicle has arrived and is ready for pickup',
    delivered: 'Welcome to the DMECH family! Your vehicle is yours',
  };

  const statusMessage = statusMessages[status] || status;

  await sendTemplateMessage(customerPhone, 'order_status_update', {
    emoji,
    order_id: orderId.substring(0, 8).toUpperCase(),
    status_message: statusMessage,
    tracking_url: trackingUrl,
  });
}

/**
 * Send welcome message after registration
 */
export async function sendWelcomeMessage(
  customerPhone: string,
  customerName: string,
  loginUrl: string
): Promise<void> {
  await sendTemplateMessage(customerPhone, 'welcome_registered', {
    customer_name: customerName,
    login_url: loginUrl,
  });
}

/**
 * Log a message to the database
 */
export async function logWhatsAppMessage(
  customerPhone: string,
  message: string,
  direction: 'inbound' | 'outbound',
  customerId?: string
): Promise<void> {
  const service = createServiceClient();

  await service.from('whatsapp_messages').insert({
    customer_id: customerId || null,
    sender_phone: direction === 'inbound' ? customerPhone : undefined,
    direction,
    message_type: 'text',
    content: message,
    created_at: new Date().toISOString(),
  });
}
