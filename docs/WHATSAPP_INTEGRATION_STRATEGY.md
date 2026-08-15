# WhatsApp-First Integration Strategy for DMECH

**Status:** Strategic Planning for Phase 2  
**Date:** 2026-08-15  
**Objective:** Design optimal WhatsApp integration for customer experience, authentication, and operations

---

## Executive Summary

DMECH operates in a market where WhatsApp is the primary communication channel. Current marketing materials already promise WhatsApp follow-ups. This strategy transforms WhatsApp from a marketing promise into the **primary customer communication system** — replacing email-heavy flows with WhatsApp-native onboarding, authentication, and support.

**Key Outcomes:**
- Customers register and authenticate via WhatsApp in < 90 seconds
- All order status, service updates, and communications flow through WhatsApp
- Staff can manage customer interactions from WhatsApp directly
- Compliance with WhatsApp Business API best practices

---

## Part 1: WhatsApp Architecture & Technology Selection

### 1.1 WhatsApp Business API Options

| Option | Provider | Cost | Complexity | Best For |
|--------|----------|------|-----------|----------|
| **Cloud API (Recommended)** | Meta (Facebook) | $0.001–0.0055/msg | Medium | Production, scalable, most features |
| Business API (Deprecated) | WhatsApp | N/A | High | Legacy systems only |
| Twilio WhatsApp | Twilio | $0.0075/msg | Low | Quick start, less customization |
| Vonage | Vonage | $0.0068/msg | Low | Legacy SMS integrations |

**Recommendation:** **Meta Cloud API** (via developers.facebook.com)
- **Why:** Free tier supports 1000 messages/day, most mature, best documentation
- **Scale:** Free tier sufficient for Phase 2 launch, scales to enterprise pricing
- **Features:** Webhooks, media handling, message templates, read receipts
- **Integration:** Native REST API, easy Node.js/Next.js integration

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Customer (WhatsApp)                  │
└──────────────────┬──────────────────────────────────────┘
                   │ Send/Receive Messages
                   ▼
┌─────────────────────────────────────────────────────────┐
│       Meta WhatsApp Cloud API (Webhooks + REST)         │
│  (Receives: messages, delivery receipts, read status)   │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
    ┌────────────┐      ┌─────────────────┐
    │   Inbound  │      │    Outbound     │
    │  Handler   │      │ Message Queue   │
    └──────┬─────┘      └────────┬────────┘
           │                     │
           └─────────┬───────────┘
                     ▼
        ┌──────────────────────────┐
        │   Supabase Database      │
        │  (Customers, Messages,   │
        │   Sessions, Notifications│
        └──────────────────────────┘
           │
      ┌────┴────┐
      ▼         ▼
   Next.js   Background
   Routes    Workers
```

---

## Part 2: Customer Registration Flow (WhatsApp-First)

### 2.1 High-Level Registration Flow

```
Customer Opens App
         ▼
"Sign up with WhatsApp" button
         ▼
Generate unique WhatsApp link (wa.me/DMECH_NUMBER?text=REGISTER_CODE)
         ▼
Customer clicks → Opens WhatsApp with pre-filled "REGISTER [CODE]"
         ▼
Customer sends message
         ▼
DMECH receives via webhook → Triggers registration flow
         ▼
Send OTP via WhatsApp (e.g., "Your DMECH code is: 123456")
         ▼
Customer replies with OTP
         ▼
Verify OTP → Extract phone number from message sender
         ▼
Create minimal customer record:
  - Phone number (verified via WhatsApp sender)
  - Name (first message or explicit reply)
  - WhatsApp verified: true
  - Email: optional
         ▼
Create secure session token
         ▼
Customer logged in and can browse/shop
         ▼
Optionally collect: Email, Full details (later in flow, lower friction)
```

### 2.2 Customer Registration Implementation

**Step 1: Frontend - Registration Initiation**

```typescript
// src/app/(auth)/register-whatsapp/page.tsx
// WhatsApp registration entry point

'use client';

import { CONTACT } from '@/lib/contact';

export default function RegisterWithWhatsApp() {
  const registrationCode = generateSecureCode(); // 6-digit code
  
  const whatsappLink = `https://wa.me/${CONTACT.whatsappNumber}?text=REGISTER+${registrationCode}`;
  
  return (
    <div>
      <h1>Welcome to DMECH</h1>
      <p>Sign up with WhatsApp — takes less than 2 minutes</p>
      
      <a href={whatsappLink} className="btn-primary">
        📱 Start with WhatsApp
      </a>
      
      <p>This will open WhatsApp with your unique registration code. Send it to confirm your phone number.</p>
    </div>
  );
}

// generateSecureCode: Creates 6-digit alphanumeric code, stores in temporary "pending_registrations" table with TTL
```

**Step 2: Backend - Webhook Handler**

```typescript
// src/app/api/webhooks/whatsapp/route.ts

export async function POST(req: Request) {
  const body = await req.json();
  
  // Verify webhook signature from Meta
  if (!verifyWebhookSignature(req, body)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Extract message from webhook
  const { message, sender_phone, timestamp } = parseWhatsAppMessage(body);
  
  // Check if this is a registration message
  if (message.startsWith('REGISTER ')) {
    const code = message.split(' ')[1];
    
    // Verify code exists and isn't expired
    const pending = await getPendingRegistration(code);
    if (!pending || isExpired(pending)) {
      return replyWithWhatsApp(sender_phone, '❌ Code expired. Start again: https://dmech.app/register');
    }
    
    // Create customer record
    const customer = await createCustomer({
      phone: sender_phone,
      whatsapp_verified: true,
      registration_source: 'whatsapp',
    });
    
    // Create session
    const session = await createSession(customer.id, sender_phone);
    
    // Send welcome message with login link
    await sendWhatsAppMessage(sender_phone, {
      template: 'welcome_registered',
      params: {
        name: 'Valued Customer',
        login_link: `https://dmech.app/login?token=${session.token}`,
      }
    });
    
    // Clear pending registration
    await deletePendingRegistration(code);
    
    return new Response('OK', { status: 200 });
  }
  
  // Handle other message types (support, order tracking, etc.)
  return handleOtherMessage(body);
}

// Helper functions...
function parseWhatsAppMessage(body): { message, sender_phone, timestamp } { ... }
function verifyWebhookSignature(req, body): boolean { ... }
async function getPendingRegistration(code): Promise<PendingReg | null> { ... }
function isExpired(pending): boolean { ... }
async function createCustomer(data): Promise<Customer> { ... }
async function createSession(customerId, phone): Promise<Session> { ... }
async function sendWhatsAppMessage(phone, template): Promise<void> { ... }
```

**Step 3: Database Schema Updates**

```sql
-- Create pending registrations table (for tracking in-progress signups)
CREATE TABLE pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes',
  attempt_count INT DEFAULT 0
);

-- Add WhatsApp verification fields to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_verified_at TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS registration_source VARCHAR(50) DEFAULT 'email';

-- Create WhatsApp session table (maps phone to auth token)
CREATE TABLE whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  phone_number VARCHAR(20) NOT NULL,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW()
);

-- Store all WhatsApp messages for audit/support
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  sender_phone VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'document', etc.
  content TEXT NOT NULL,
  media_url TEXT,
  whatsapp_message_id VARCHAR(500) UNIQUE,
  status VARCHAR(50) DEFAULT 'received', -- received, sent, delivered, read, failed
  created_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  read_at TIMESTAMP
);

-- Link notifications to WhatsApp messages
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS whatsapp_message_id VARCHAR(500);
```

---

## Part 3: WhatsApp Authentication (Login)

### 3.1 WhatsApp Login Flow

```
Customer at /login
         ▼
Click "Login with WhatsApp"
         ▼
Enter phone number (pre-filled if returning customer)
         ▼
Click "Send WhatsApp Code"
         ▼
App generates OTP (6 digits)
         ▼
OTP sent via WhatsApp to customer
         ▼
Customer receives: "DMECH login code: 123456"
         ▼
Customer enters code on /login page
         ▼
OTP verified → Create session
         ▼
Customer logged in → Redirect to dashboard/marketplace
```

### 3.2 Implementation

```typescript
// src/app/(auth)/login-whatsapp/page.tsx

'use client';

import { useState } from 'react';
import { sendWhatsAppOTP, verifyWhatsAppOTP } from '@/lib/whatsapp/auth';

export default function LoginWithWhatsApp() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate and normalize phone number
      const normalizedPhone = normalizePhoneNumber(phone);
      
      // Send OTP via WhatsApp
      await sendWhatsAppOTP(normalizedPhone);
      
      // Save phone for next step
      sessionStorage.setItem('whatsapp_login_phone', normalizedPhone);
      
      setStep('otp');
    } catch (error) {
      alert('Failed to send code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const savedPhone = sessionStorage.getItem('whatsapp_login_phone');
      
      // Verify OTP and create session
      const { token } = await verifyWhatsAppOTP(savedPhone, otp);
      
      // Save session and redirect
      localStorage.setItem('auth_token', token);
      window.location.href = '/portal/dashboard';
    } catch (error) {
      alert('Code incorrect or expired. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOTP} className="max-w-md mx-auto">
        <h1>Login with WhatsApp</h1>
        <input
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send WhatsApp Code'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOTP} className="max-w-md mx-auto">
      <h1>Enter Your Code</h1>
      <p>Check WhatsApp for your 6-digit code</p>
      <input
        type="text"
        placeholder="000000"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.toUpperCase())}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify & Login'}
      </button>
    </form>
  );
}
```

```typescript
// src/lib/whatsapp/auth.ts

import { createServiceClient } from '@/lib/supabase/server';
import { sendTemplateMessage } from './messaging';

export async function sendWhatsAppOTP(phone: string): Promise<void> {
  const otp = generateOTP(); // 6-digit code
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  const service = createServiceClient();
  
  // Store OTP in database
  await service.from('whatsapp_otp_codes').insert({
    phone_number: phone,
    otp_code: otp,
    expires_at: expiresAt.toISOString(),
    attempt_count: 0,
  });
  
  // Send OTP via WhatsApp
  await sendTemplateMessage(phone, 'otp_login', {
    code: otp,
    expiry_minutes: '15',
  });
}

export async function verifyWhatsAppOTP(phone: string, otpCode: string) {
  const service = createServiceClient();
  
  // Get stored OTP
  const { data: stored } = await service
    .from('whatsapp_otp_codes')
    .select('*')
    .eq('phone_number', phone)
    .eq('otp_code', otpCode)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (!stored) {
    throw new Error('Invalid or expired code');
  }
  
  // Get or create customer
  let customer = await getOrCreateCustomerByPhone(phone);
  
  // Create session
  const sessionToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await service.from('whatsapp_sessions').insert({
    customer_id: customer.id,
    phone_number: phone,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  });
  
  // Mark OTP as used
  await service
    .from('whatsapp_otp_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', stored.id);
  
  return { token: sessionToken, customer };
}

async function getOrCreateCustomerByPhone(phone: string) {
  const service = createServiceClient();
  
  // Check if customer exists
  let { data: customer } = await service
    .from('customers')
    .select('*')
    .eq('phone_number', normalizePhoneNumber(phone))
    .single();
  
  if (!customer) {
    // Create new customer with minimal data
    const { data: newCustomer } = await service
      .from('customers')
      .insert({
        phone_number: normalizePhoneNumber(phone),
        whatsapp_verified: true,
        registration_source: 'whatsapp_login',
      })
      .select()
      .single();
    
    customer = newCustomer;
  }
  
  return customer;
}
```

---

## Part 4: Order Status & Notifications via WhatsApp

### 4.1 Message Template Strategy

**Approved Templates** (must be registered with Meta):

1. **welcome_registered** — First-time registration confirmation
2. **otp_login** — Login code
3. **order_placed** — New order confirmation with tracking link
4. **order_status** — Order status updates (In Transit, Delivered, etc.)
5. **payment_reminder** — Instalment due reminder
6. **service_booking_confirmed** — Service appointment confirmation
7. **service_ready_for_pickup** — Vehicle ready message
8. **financing_approved** — Financing application approved
9. **financing_rejected** — Financing declined with next steps
10. **support_response** — Staff reply to customer inquiry

### 4.2 Integration Points

```typescript
// src/lib/whatsapp/notifications.ts

export async function notifyOrderPlaced(customerId: string, orderId: string) {
  const customer = await getCustomer(customerId);
  const order = await getOrder(orderId);
  
  if (!customer.whatsapp_verified) return; // Only WhatsApp customers
  
  await sendTemplateMessage(customer.phone_number, 'order_placed', {
    order_number: order.id.slice(0, 8).toUpperCase(),
    vehicle_name: order.vehicle_name,
    tracking_url: `https://dmech.app/track/${orderId}`,
    support_url: `https://wa.me/${CONTACT.whatsappNumber}?text=Help with order ${order.id}`,
  });
  
  // Log in database
  await queueNotification({
    recipientId: customerId,
    recipientPhone: customer.phone_number,
    channel: 'whatsapp',
    template: 'order_placed',
    payload: { orderId },
  });
}

export async function notifyOrderStatusChange(orderId: string, newStatus: string) {
  const order = await getOrder(orderId);
  const customer = await getCustomer(order.customer_id);
  
  const statusMessages = {
    'in_transit': { title: '🚚 Your vehicle is on the way!', desc: 'Tracking your delivery from our port facility to Lagos.' },
    'in_transit_customs': { title: '🛂 Customs clearance in progress', desc: 'We're working on your customs paperwork now.' },
    'ready_for_delivery': { title: '✅ Ready for delivery!', desc: 'Your vehicle has arrived and is ready for handover.' },
    'delivered': { title: '🎉 Delivery complete!', desc: 'Welcome to the DMECH family. Your vehicle is yours.' },
  };
  
  const msg = statusMessages[newStatus] || { title: 'Update', desc: newStatus };
  
  await sendTemplateMessage(customer.phone_number, 'order_status', {
    order_number: order.id.slice(0, 8).toUpperCase(),
    status_title: msg.title,
    status_description: msg.desc,
    tracking_url: `https://dmech.app/track/${orderId}`,
  });
}

export async function remindInstalmentDue(invoiceId: string) {
  const invoice = await getInvoice(invoiceId);
  const customer = await getCustomer(invoice.customer_id);
  
  if (!customer.whatsapp_verified) return;
  
  const daysUntilDue = Math.ceil((new Date(invoice.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  await sendTemplateMessage(customer.phone_number, 'payment_reminder', {
    invoice_number: invoice.invoice_number,
    amount_due: formatNaira(invoice.amount_due),
    due_date: formatDate(invoice.due_date),
    days_until_due: Math.max(0, daysUntilDue).toString(),
    payment_link: `https://dmech.app/pay/${invoiceId}`,
  });
}
```

---

## Part 5: Two-Way Messaging & Support

### 5.1 Customer Support via WhatsApp

```
Customer sends WhatsApp to DMECH number
         ▼
Webhook receives message
         ▼
Message stored in whatsapp_messages table
         ▼
Auto-reply sent: "Thanks for reaching out! A DMECH specialist will reply within 30 mins"
         ▼
Notification sent to ops staff
         ▼
Staff replies via ops dashboard (Ops → WhatsApp Inbox)
         ▼
Reply sent back to customer via WhatsApp
         ▼
Conversation logged and linked to customer record
```

### 5.2 Ops Dashboard Integration

```typescript
// src/app/ops/whatsapp-inbox/page.tsx

'use client';

import { useState, useEffect } from 'react';

export default function WhatsAppInboxPage() {
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    // Fetch unread WhatsApp messages
    fetchInboxMessages();
  }, []);

  const fetchInboxMessages = async () => {
    const res = await fetch('/api/whatsapp/inbox');
    const data = await res.json();
    setMessages(data);
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    
    await fetch('/api/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({
        phone: selectedConversation.customer.phone_number,
        message: reply,
        related_to: selectedConversation.customer_id,
      }),
    });
    
    setReply('');
    fetchInboxMessages();
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div>
        <h2>Messages</h2>
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => setSelectedConversation(msg)}
            className="p-3 border-b cursor-pointer hover:bg-gray-100"
          >
            <p className="font-bold">{msg.customer_name}</p>
            <p className="text-sm text-gray-600">{msg.last_message}</p>
            <p className="text-xs text-gray-400">{msg.time_ago}</p>
          </div>
        ))}
      </div>

      {selectedConversation && (
        <div>
          <h2>{selectedConversation.customer_name}</h2>
          <div className="h-96 overflow-y-auto border p-3 mb-3">
            {selectedConversation.messages.map((m) => (
              <div key={m.id} className={`mb-2 ${m.direction === 'inbound' ? 'text-left' : 'text-right'}`}>
                <p className={`inline-block p-2 rounded ${m.direction === 'inbound' ? 'bg-gray-100' : 'bg-blue-100'}`}>
                  {m.content}
                </p>
              </div>
            ))}
          </div>
          
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply..."
            className="w-full p-2 border rounded"
          />
          <button
            onClick={sendReply}
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Part 6: WhatsApp API Webhook Implementation

### 6.1 Webhook Handler (Complete)

```typescript
// src/app/api/webhooks/whatsapp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { handleIncomingMessage } from '@/lib/whatsapp/handlers';
import { logWebhookEvent } from '@/lib/audit';

const WHATSAPP_WEBHOOK_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const WHATSAPP_API_SECRET = process.env.WHATSAPP_API_SECRET;

// Verify webhook signature from Meta
function verifyWebhookSignature(
  body: string,
  xHubSignature: string
): boolean {
  if (!WHATSAPP_API_SECRET) return false;
  
  const hash = crypto
    .createHmac('sha256', WHATSAPP_API_SECRET)
    .update(body)
    .digest('hex');
  
  const signature = `sha256=${hash}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(xHubSignature)
  );
}

// GET: Webhook verification from Meta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const verifyToken = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  if (!verifyToken || !challenge) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  
  // Verify token matches what we gave to Meta
  if (verifyToken !== WHATSAPP_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Invalid verify token' }, { status: 403 });
  }
  
  // Meta expects us to echo back the challenge
  return new NextResponse(challenge, { status: 200 });
}

// POST: Handle incoming messages, delivery receipts, etc.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const xHubSignature = req.headers.get('x-hub-signature-256') || '';
  
  // Verify signature
  if (!verifyWebhookSignature(body, xHubSignature)) {
    await logWebhookEvent('whatsapp_webhook', 'signature_failed', { xHubSignature });
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 403 });
  }
  
  const data = JSON.parse(body);
  
  // Meta sends events under data.entry[].changes[]
  if (data.entry && Array.isArray(data.entry)) {
    for (const entry of data.entry) {
      if (entry.changes && Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            // Handle incoming message
            const messages = change.value.messages || [];
            const contacts = change.value.contacts || [];
            const statuses = change.value.statuses || [];
            
            for (const message of messages) {
              await handleIncomingMessage(message, contacts);
            }
            
            // Handle delivery receipts
            for (const status of statuses) {
              await handleDeliveryStatus(status);
            }
          }
        }
      }
    }
  }
  
  // Always respond with 200 OK to Meta (async processing)
  return NextResponse.json({ success: true }, { status: 200 });
}

async function handleDeliveryStatus(status) {
  const service = createServiceClient();
  
  // Update message status in database
  await service
    .from('whatsapp_messages')
    .update({
      status: status.status, // 'sent', 'delivered', 'read', 'failed'
      [status.status === 'delivered' ? 'delivered_at' : status.status === 'read' ? 'read_at' : 'updated_at']: new Date().toISOString(),
    })
    .eq('whatsapp_message_id', status.id);
}
```

---

## Part 7: Database Schema (Complete)

```sql
-- OTP codes for authentication
CREATE TABLE whatsapp_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  CHECK (attempt_count <= 5)
);

CREATE INDEX idx_whatsapp_otp_phone_unused ON whatsapp_otp_codes(phone_number) 
  WHERE used_at IS NULL AND expires_at > NOW();

-- WhatsApp sessions
CREATE TABLE whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  device_info TEXT, -- Browser user agent, device type
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);

CREATE INDEX idx_whatsapp_sessions_token ON whatsapp_sessions(session_token);
CREATE INDEX idx_whatsapp_sessions_customer ON whatsapp_sessions(customer_id);

-- All WhatsApp messages
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  sender_phone VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'document', 'template'
  content TEXT,
  media_url TEXT,
  template_name VARCHAR(100), -- If it's a template message
  template_params JSONB, -- Parameters passed to template
  whatsapp_message_id VARCHAR(500) UNIQUE, -- Meta's message ID for tracking
  whatsapp_status VARCHAR(50) DEFAULT 'received', -- received, sent, delivered, read, failed
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_whatsapp_messages_customer ON whatsapp_messages(customer_id);
CREATE INDEX idx_whatsapp_messages_phone ON whatsapp_messages(sender_phone);
CREATE INDEX idx_whatsapp_messages_timestamp ON whatsapp_messages(created_at DESC);

-- Message templates registry
CREATE TABLE whatsapp_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  meta_template_name VARCHAR(100) NOT NULL, -- Name registered with Meta
  description TEXT,
  category VARCHAR(50), -- 'transactional', 'marketing', 'support'
  parameters JSONB, -- Expected parameters: { name, type, example }
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pending registrations (short-lived)
CREATE TABLE pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes'
);

CREATE INDEX idx_pending_registrations_code ON pending_registrations(code);
CREATE INDEX idx_pending_registrations_expires ON pending_registrations(expires_at);

-- Update customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_verified_at TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS registration_source VARCHAR(50) DEFAULT 'email';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_contact_channel VARCHAR(20) DEFAULT 'whatsapp';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT TRUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_whatsapp_contact_at TIMESTAMP;
```

---

## Part 8: Implementation Roadmap (Phase 2)

### Week 1: Foundation & Webhooks
- [ ] Set up Meta Cloud API account and get credentials
- [ ] Create database schema (Part 7)
- [ ] Implement webhook handler (Part 6)
- [ ] Test webhook verification with Meta

### Week 2: Authentication
- [ ] Build WhatsApp OTP system
- [ ] Create login-whatsapp page
- [ ] Implement sendWhatsAppOTP and verifyWhatsAppOTP
- [ ] Test authentication flow end-to-end

### Week 3: Registration
- [ ] Create register-whatsapp page
- [ ] Implement registration flow
- [ ] Test customer creation
- [ ] Update customer profile flows

### Week 4: Notifications & Integration
- [ ] Register message templates with Meta
- [ ] Implement sendTemplateMessage
- [ ] Hook up order notifications
- [ ] Build notification queue processor
- [ ] Test end-to-end order flow with WhatsApp updates

### Week 5: Support & Dashboard
- [ ] Build ops WhatsApp inbox
- [ ] Implement staff message replies
- [ ] Create two-way messaging flow
- [ ] Test support scenarios

### Week 6: Testing & Optimization
- [ ] Load testing (1000s of messages/day)
- [ ] Error handling and retries
- [ ] Rate limiting and quota management
- [ ] Documentation and runbooks

---

## Part 9: Environment Variables Required

```env
# WhatsApp Cloud API Configuration
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_API_VERSION=v20.0
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_API_SECRET=your_api_secret

# Webhook URL (must be publicly accessible HTTPS)
WHATSAPP_WEBHOOK_URL=https://dmech.app/api/webhooks/whatsapp
```

---

## Part 10: Compliance & Best Practices

### Do's ✅
- Only send messages to customers who opted in
- Use approved message templates
- Respect rate limits (160 messages/second per Meta)
- Store all messages for audit
- Support opt-out (but all DMECH customers should be on WhatsApp)
- Provide support response within 24 hours
- Use WhatsApp status updates for non-critical info

### Don'ts ❌
- Don't send unsolicited marketing to random numbers
- Don't use templates for content they weren't approved for
- Don't share customer data with third parties
- Don't store WhatsApp passwords or credentials in code
- Don't spam customers with too many messages
- Don't ignore failed message deliveries

---

## Part 11: Success Metrics

| Metric | Target | How to Track |
|--------|--------|--------------|
| Customer onboarding time | < 90 seconds | whatsapp_sessions.created_at |
| Message delivery rate | > 98% | whatsapp_messages.whatsapp_status |
| Support response time | < 30 minutes | whatsapp_messages.sent_at - inbound.created_at |
| Customer retention (30d) | > 80% | Returning customers via WhatsApp |
| Order notification open rate | > 90% | whatsapp_messages.read_at != NULL |
| Support satisfaction | > 4.5/5 | Post-support survey via WhatsApp |

---

## Phase 2 Entry Criteria

Before starting Phase 2, ensure:

✅ Phase 0 exit criteria complete  
✅ Phase 1 stabilization in place  
✅ WhatsApp Business Account created and verified  
✅ Meta API credentials obtained  
✅ Team trained on WhatsApp Business API  
✅ Ops team ready to manage customer support via WhatsApp  

---

## Handoff to Implementation

This document serves as the **complete specification for Phase 2**. Implementation can begin immediately:

1. Developer sets up Meta account and gets API credentials
2. Creates database schema from Part 7
3. Implements webhook handler from Part 6
4. Follows implementation roadmap from Part 8
5. Tests against success metrics from Part 11

**Estimated Phase 2 Duration:** 4-6 weeks (including testing and optimization)

**Team Size:** 1-2 backend engineers + 1 frontend engineer + 1 QA

