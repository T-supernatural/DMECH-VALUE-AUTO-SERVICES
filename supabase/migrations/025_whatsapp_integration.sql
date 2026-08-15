-- Phase 2: WhatsApp Integration Schema
-- Adds tables and fields needed for WhatsApp-first customer experience

-- 1. OTP codes for WhatsApp authentication
CREATE TABLE IF NOT EXISTS whatsapp_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  purpose VARCHAR(50) DEFAULT 'login', -- 'login', 'registration', 'verification'
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  CHECK (attempt_count <= 5),
  CHECK (expires_at > created_at)
);

CREATE INDEX idx_whatsapp_otp_phone_unused
  ON whatsapp_otp_codes(phone_number, used_at, expires_at);

-- 2. WhatsApp sessions (authentication tokens)
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  device_info TEXT, -- Browser user agent for device tracking
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);

CREATE INDEX idx_whatsapp_sessions_token ON whatsapp_sessions(session_token);
CREATE INDEX idx_whatsapp_sessions_customer ON whatsapp_sessions(customer_id);
CREATE INDEX idx_whatsapp_sessions_active
  ON whatsapp_sessions(customer_id, revoked_at, expires_at);

-- 3. All WhatsApp messages (for audit and support)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
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
  whatsapp_status VARCHAR(50) DEFAULT 'received', -- 'received', 'sent', 'delivered', 'read', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_whatsapp_messages_customer ON whatsapp_messages(customer_id);
CREATE INDEX idx_whatsapp_messages_phone ON whatsapp_messages(sender_phone);
CREATE INDEX idx_whatsapp_messages_timestamp ON whatsapp_messages(created_at DESC);

-- 4. WhatsApp message templates registry
CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
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

-- 5. Pending registrations (temporary storage for in-progress signups)
CREATE TABLE IF NOT EXISTS pending_whatsapp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  customer_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes'
);

CREATE INDEX idx_pending_registrations_code ON pending_whatsapp_registrations(code);
CREATE INDEX idx_pending_registrations_expires ON pending_whatsapp_registrations(expires_at);

-- 6. Update customers table with WhatsApp fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_verified_at TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS registration_source VARCHAR(50) DEFAULT 'email';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_contact_channel VARCHAR(20) DEFAULT 'whatsapp';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT TRUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_whatsapp_contact_at TIMESTAMP;

-- Enable RLS on new tables
ALTER TABLE whatsapp_otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_whatsapp_registrations ENABLE ROW LEVEL SECURITY;

-- RLS: Customers can only see their own messages
CREATE POLICY whatsapp_messages_read_own 
  ON whatsapp_messages FOR SELECT 
  USING (customer_id = auth.uid());

-- RLS: Customers can only see their own sessions
CREATE POLICY whatsapp_sessions_read_own 
  ON whatsapp_sessions FOR SELECT 
  USING (customer_id = auth.uid());

-- RLS: Only service role can insert messages and OTP codes
CREATE POLICY whatsapp_otp_insert_service_only 
  ON whatsapp_otp_codes FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY whatsapp_messages_insert_service_only 
  ON whatsapp_messages FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY whatsapp_sessions_insert_service_only 
  ON whatsapp_sessions FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');
