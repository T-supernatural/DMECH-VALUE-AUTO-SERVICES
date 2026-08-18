/**
 * TESTING GUIDE FOR WHATSAPP INTEGRATION
 * 
 * This document shows how to test the WhatsApp integration without a live connection
 */

# WhatsApp Integration - Testing Guide

## Current Status
✅ All code implemented and compiles successfully:
- WhatsApp registration flow (UI + API)
- WhatsApp login flow (UI + API)
- Webhook handler for incoming messages
- Database schema for WhatsApp tables
- Message queue system

❌ Requires: Database migrations to be deployed

## How to Deploy & Test

### Step 1: Deploy Database Migrations

```bash
# Using Supabase CLI
supabase db push

# This will create these tables:
# - whatsapp_otp_codes
# - whatsapp_sessions
# - whatsapp_messages  
# - whatsapp_message_templates
# - pending_whatsapp_registrations
# - Updated: customers table with WhatsApp fields
```

### Step 2: Test Registration Flow

**URL:** http://localhost:3000/register-whatsapp

**Test Steps:**
1. Click "Sign up with WhatsApp"
2. Enter phone: `2348000000001` (test number)
3. Click "Continue with WhatsApp"
4. You'll get a registration code (e.g., `ABC12345`)
5. In the "Waiting for your message..." screen, the system shows you what message to send

**What happens behind the scenes:**
1. `POST /api/auth/register-whatsapp` creates a pending registration
2. Returns registration code + WhatsApp wa.me link
3. Stores code in `pending_whatsapp_registrations` table (expires in 10 minutes)
4. Code is ready for webhook verification

### Step 3: Test Login Flow

**URL:** http://localhost:3000/login-whatsapp

**Test Steps:**
1. Enter phone: `2348000000001`
2. Click "Send Code via WhatsApp"
3. In development mode, OTP will be logged to console
4. Enter the 6-digit code
5. You'll be logged in and redirected to dashboard

**In production:**
- OTP is sent via Meta Cloud API
- Requires: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID

### Step 4: Test Webhook (Simulate Customer Message)

**Webhook URL:** `POST /api/webhooks/whatsapp`

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "2348000000001",
            "id": "wamid.test123",
            "timestamp": "'$(date +%s)'",
            "type": "text",
            "text": {
              "body": "REGISTER ABC12345"
            }
          }],
          "contacts": [{
            "profile": {
              "name": "Test Customer"
            }
          }]
        }
      }]
    }]
  }'
```

**What happens:**
1. Webhook validates signature (skipped in development)
2. Parses "REGISTER ABC12345" message
3. Verifies code in pending_whatsapp_registrations table
4. Creates new customer
5. Creates WhatsApp session
6. Sends welcome message

### Step 5: Test OTP Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "2348000000001",
            "id": "wamid.test456",
            "timestamp": "'$(date +%s)'",
            "type": "text",
            "text": {
              "body": "123456"
            }
          }],
          "contacts": [{
            "profile": {
              "name": "Test Customer"
            }
          }]
        }
      }]
    }]
  }'
```

**What happens:**
1. Webhook receives 6-digit OTP message
2. Looks up matching OTP in whatsapp_otp_codes table
3. Creates or updates customer
4. Creates WhatsApp session
5. Sends login/registration success message with link

## Environment Variables Needed

Add to `.env.local`:

```
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# WhatsApp (for production)
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789
WHATSAPP_PHONE_NUMBER_ID=9876543210
WHATSAPP_ACCESS_TOKEN=xxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=my-verify-token
WHATSAPP_API_SECRET=xxx
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/webhooks/whatsapp

# Development mode (set to false in production)
WHATSAPP_USE_DUMMY_MODE=true
NODE_ENV=development
```

## Files Created

### Authentication
- `src/app/(auth)/register-whatsapp/page.tsx` - Registration UI
- `src/app/(auth)/login-whatsapp/page.tsx` - Login UI
- `src/app/api/auth/register-whatsapp/route.ts` - Registration API
- `src/app/api/auth/login-whatsapp/route.ts` - Login API

### Webhooks & Messaging
- `src/app/api/webhooks/whatsapp/route.ts` - Webhook endpoint
- `src/lib/whatsapp/config.ts` - Configuration
- `src/lib/whatsapp/auth.ts` - OTP and session logic
- `src/lib/whatsapp/messaging.ts` - Send messages
- `src/lib/whatsapp/handlers.ts` - Webhook message handlers

### Database
- `supabase/migrations/025_whatsapp_integration.sql` - Full schema

### Navigation
- Updated `src/components/marketing/Nav.tsx` - "Get Started" button now links to WhatsApp registration

## Development Mode Features

In development (WHATSAPP_USE_DUMMY_MODE=true):
- No actual API calls to Meta
- Messages are logged to console
- Perfect for testing without credentials
- All OTP/session logic works normally

## Next Steps to Go Live

1. Deploy migration `025_whatsapp_integration.sql` to Supabase
2. Register WhatsApp Business Account with Meta
3. Get credentials:
   - Business Account ID
   - Phone Number ID  
   - API Access Token
   - Webhook Verify Token
   - API Secret
4. Update `.env` with credentials
5. Set `WHATSAPP_USE_DUMMY_MODE=false`
6. Configure webhook URL in Meta dashboard
7. Test with real WhatsApp messages

## Testing Checklist

- [ ] Database migrations deployed
- [ ] Dev server running (`npm run dev`)
- [ ] /register-whatsapp page loads ✅
- [ ] Registration API returns code ❌ (needs DB)
- [ ] Login page loads ✅
- [ ] OTP generation works ✅
- [ ] Webhook receives test messages
- [ ] Customer records created in DB
- [ ] Session tokens are created
- [ ] Navigation updated to WhatsApp first

## Known Limitations in Testing

Without deploying migrations:
- Can't actually test registration (no DB table)
- Can't verify OTP (no DB table)
- Can test UI components and API structure
- Build passes, TypeScript checks pass

With migrations deployed:
- Full end-to-end testing possible
- Need dummy WhatsApp number for testing
- Need Meta credentials for production

