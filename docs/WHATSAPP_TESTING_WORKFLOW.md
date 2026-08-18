# WhatsApp Integration - Quick Testing Workflow

## Prerequisites
```bash
npm run dev  # Must be running on localhost:3000
```

## Test 1: Registration UI Loads ✅

**Status**: Works now (no DB needed)

```bash
# Open in browser
http://localhost:3000/register-whatsapp

# You should see:
# 1. "Sign up with WhatsApp" button
# 2. Click it → Phone number input field appears
# 3. Enter: 2348000000001
# 4. Click "Continue with WhatsApp"
# 5. Currently fails with 500 (needs DB), but UI works ✅
```

## Test 2: Login UI Loads ✅

**Status**: Works now (no DB needed)

```bash
# Open in browser
http://localhost:3000/login-whatsapp

# You should see:
# 1. Phone number input
# 2. OTP input field (appears after entering phone)
# 3. Countdown timer (appears after sending code)
# 4. UI is fully interactive ✅
```

## Test 3: Registration API (Requires DB)

**Step 1: Deploy migration first**
```bash
supabase db push
```

**Step 2: Test via curl**
```bash
curl -X POST http://localhost:3000/api/auth/register-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "2348000000001"}'

# Expected response:
# {
#   "code": "ABC12345",
#   "waLink": "https://wa.me/2348000000001?text=REGISTER%20ABC12345",
#   "expiresIn": 600
# }
```

**Step 3: Verify in DB**
```bash
# In Supabase dashboard, check:
# SELECT * FROM pending_whatsapp_registrations 
# WHERE phone_number = '2348000000001'

# You should see:
# - code: ABC12345
# - phone_number: 2348000000001
# - expires_at: 10 minutes from now
```

**Step 4: Complete registration (simulate webhook)**
```bash
curl -X PUT http://localhost:3000/api/auth/register-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "2348000000001",
    "code": "ABC12345",
    "name": "Test Customer"
  }'

# Expected response:
# {
#   "token": "a1b2c3d4e5f6...",
#   "customerId": "uuid-here",
#   "phone": "2348000000001"
# }
```

**Step 5: Verify customer created**
```bash
# In Supabase dashboard:
# SELECT * FROM customers 
# WHERE phone = '2348000000001'

# You should see:
# - id: (customer UUID)
# - phone: 2348000000001
# - name: Test Customer
# - whatsapp_verified: true
# - registration_source: whatsapp
```

## Test 4: Webhook Handler (Requires DB)

**Scenario 1: Registration via WhatsApp**
```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123456789",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "messages": [{
            "from": "2348000000001",
            "id": "wamid.test1",
            "timestamp": "1234567890",
            "type": "text",
            "text": {
              "body": "REGISTER ABC12345"
            }
          }],
          "contacts": [{
            "profile": {
              "name": "Test Customer"
            },
            "wa_id": "2348000000001"
          }]
        }
      }]
    }]
  }'

# Server logs should show:
# [Webhook] Received message from 2348000000001
# [Handler] Registration message detected
# [Handler] Code ABC12345 verified
# [Service] Customer created successfully
# [Messaging] Welcome message sent

# In Supabase, check:
# - customers table → New entry with whatsapp_verified=true
# - whatsapp_sessions table → Session created for customer
# - whatsapp_messages table → Message logged
```

**Scenario 2: OTP Login via WhatsApp**

First, send OTP:
```bash
curl -X POST http://localhost:3000/api/auth/login-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "2348000000001"}'

# Response:
# {
#   "success": true,
#   "message": "OTP sent to your WhatsApp"
# }

# In dev mode, check server logs:
# [DUMMY WhatsApp OTP] To 2348000000001: Your DMECH login code is: 123456
```

Then verify OTP:
```bash
curl -X PUT http://localhost:3000/api/auth/login-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "2348000000001",
    "otp": "123456"
  }'

# Response:
# {
#   "token": "a1b2c3d4e5f6...",
#   "customerId": "uuid-here"
# }
```

**Scenario 3: Simulate customer sending OTP via WhatsApp**
```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123456789",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "messages": [{
            "from": "2348000000001",
            "id": "wamid.test2",
            "timestamp": "1234567890",
            "type": "text",
            "text": {
              "body": "123456"
            }
          }],
          "contacts": [{
            "profile": {
              "name": "Test Customer"
            },
            "wa_id": "2348000000001"
          }]
        }
      }]
    }]
  }'

# Server logs:
# [Webhook] Received message from 2348000000001
# [Handler] OTP message detected
# [Handler] OTP verified successfully
# [Service] Session created for customer
```

## Test 5: End-to-End UI Flow

**Registration Flow (Manual)**
```
1. Browser: http://localhost:3000
2. Click: "Get Started" button
3. Redirected to: /register-whatsapp
4. Enter: 2348000000001
5. Click: "Continue with WhatsApp"
6. See: Registration code (e.g., ABC12345)
7. See: WhatsApp link
8. Click: "Open WhatsApp" (opens wa.me link)
9. Type: REGISTER ABC12345
10. Send to DMECH test number
11. Webhook processes message
12. Auto-redirect to: /portal/dashboard
```

**Login Flow (Manual)**
```
1. Browser: http://localhost:3000/login-whatsapp
2. Enter: 2348000000001
3. Click: "Send Code via WhatsApp"
4. In dev mode, OTP appears in server logs
5. Copy OTP (e.g., 123456)
6. Enter in: OTP input field
7. Click: "Verify"
8. Auto-redirect to: /portal/dashboard
```

## Test 6: Database Verification

After registration/login, verify these tables:

```sql
-- Registrations waiting for verification
SELECT * FROM pending_whatsapp_registrations
WHERE phone_number = '2348000000001';

-- OTP codes sent
SELECT * FROM whatsapp_otp_codes
WHERE phone_number = '2348000000001'
ORDER BY created_at DESC;

-- Active sessions
SELECT * FROM whatsapp_sessions
WHERE phone_number = '2348000000001'
AND revoked_at IS NULL;

-- Message audit log
SELECT * FROM whatsapp_messages
WHERE sender_phone = '2348000000001'
ORDER BY created_at DESC;

-- Customer record
SELECT id, phone, name, whatsapp_verified, registration_source 
FROM customers
WHERE phone = '2348000000001';
```

## Test 7: Error Scenarios

**Invalid Registration Code**
```bash
curl -X PUT http://localhost:3000/api/auth/register-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "2348000000001",
    "code": "INVALID",
    "name": "Test"
  }'

# Expected: 400 error "Invalid or expired registration code"
```

**Wrong OTP**
```bash
curl -X PUT http://localhost:3000/api/auth/login-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "2348000000001",
    "otp": "000000"
  }'

# Expected: 400 error "Invalid OTP"
```

**Too Many OTP Attempts**
```bash
# Try 5 times with wrong OTP
# On 6th attempt: 429 error "Too many attempts"
```

**Non-normalized Phone**
```bash
curl -X POST http://localhost:3000/api/auth/register-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "08000000001"}'

# Server auto-converts:
# 08000000001 → 2348000000001 ✓
```

## Dev Console Output to Check

When running `npm run dev`, watch for these logs:

### Registration
```
[DUMMY WhatsApp] To 2348000000001: Please send: REGISTER ABC12345
[Service] Registration code generated: ABC12345
```

### Login
```
[DUMMY WhatsApp OTP] To 2348000000001: Your DMECH login code is: 123456
[Service] OTP generated for 2348000000001
```

### Webhook Received
```
[Webhook] Received POST /api/webhooks/whatsapp
[Webhook] Message type: text
[Handler] Processing message from 2348000000001
```

### Success
```
[Service] Customer created/updated successfully
[Service] Session created: token=a1b2c3d4e5f6...
[Messaging] Welcome message queued for 2348000000001
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| 500 error on registration | DB not deployed | `supabase db push` |
| Phone format wrong | Input not normalized | Works auto, 08→234 |
| OTP not showing | Dev mode disabled | Check `WHATSAPP_USE_DUMMY_MODE=true` |
| Webhook not processing | Missing DB tables | Deploy migration |
| Session not created | No customer record | Must complete registration first |

## When DB is Deployed

After `supabase db push`, all these tests will fully work end-to-end without manual intervention.

