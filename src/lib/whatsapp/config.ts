/**
 * WhatsApp Configuration
 * Central configuration for WhatsApp Business API integration
 * 
 * For testing: Uses dummy credentials
 * For production: Replace with real Meta Cloud API credentials
 */

export const WHATSAPP_CONFIG = {
  // Meta Cloud API Configuration
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || 'dummy_account_id',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1234567890',
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'dummy_token',
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'dummy_verify_token',
  apiSecret: process.env.WHATSAPP_API_SECRET || 'dummy_secret',

  // Webhook URL (must be publicly accessible HTTPS)
  webhookUrl: process.env.WHATSAPP_WEBHOOK_URL || 'https://dmech.app/api/webhooks/whatsapp',

  // DMECH Business WhatsApp Number
  dmechPhoneNumber: process.env.WHATSAPP_DMECH_PHONE || '2348151023414',
  dmechPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1234567890',

  // Feature flags
  isDevelopment: process.env.NODE_ENV === 'development',
  useDummyMessaging: process.env.WHATSAPP_USE_DUMMY_MODE === 'true' || process.env.NODE_ENV === 'development',
};

/**
 * WhatsApp Message Templates (Pre-approved by Meta)
 * In development/testing, templates are simulated
 * In production, these must be registered with Meta
 */
export const MESSAGE_TEMPLATES = {
  otp_login: {
    name: 'otp_login',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Your DMECH login code is: {{1}}. Valid for 15 minutes.',
    parameters: [{ name: 'code', type: 'text' }],
  },
  otp_registration: {
    name: 'otp_registration',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Welcome to DMECH! Your verification code is: {{1}}. This code expires in 10 minutes.',
    parameters: [{ name: 'code', type: 'text' }],
  },
  welcome_registered: {
    name: 'welcome_registered',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Welcome {{1}}! 🎉 You can now browse our vehicles. Login here: {{2}}',
    parameters: [
      { name: 'customer_name', type: 'text' },
      { name: 'login_url', type: 'text' },
    ],
  },
  order_placed: {
    name: 'order_placed',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: '✅ Order {{1}} confirmed! Your vehicle {{2}} is on the way. Track: {{3}}',
    parameters: [
      { name: 'order_id', type: 'text' },
      { name: 'vehicle_name', type: 'text' },
      { name: 'tracking_url', type: 'text' },
    ],
  },
  order_status_update: {
    name: 'order_status_update',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: '{{1}} 🚚 Order {{2}} - {{3}} Track: {{4}}',
    parameters: [
      { name: 'emoji', type: 'text' },
      { name: 'order_id', type: 'text' },
      { name: 'status_message', type: 'text' },
      { name: 'tracking_url', type: 'text' },
    ],
  },
  support_response: {
    name: 'support_response',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: '{{1}} We received your message and will respond within 30 minutes.',
    parameters: [{ name: 'customer_name', type: 'text' }],
  },
};

/**
 * OTP Configuration
 */
export const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 15,
  maxAttempts: 5,
  resendDelaySeconds: 60,
};

/**
 * WhatsApp Session Configuration
 */
export const SESSION_CONFIG = {
  tokenLength: 32,
  expiryDays: 30,
};

/**
 * Test/Dummy Data for Development
 */
export const DUMMY_DATA = {
  // Test phone numbers (for testing without real WhatsApp)
  testPhoneNumbers: [
    '2348000000001', // Test customer 1
    '2348000000002', // Test customer 2
    '2348000000003', // Test customer 3
  ],

  // Dummy WhatsApp messages (simulated responses)
  dummyMessages: {
    '2348000000001': [
      { timestamp: new Date(), message: 'REGISTER ABC123', sender: '2348000000001' },
    ],
  },
};
