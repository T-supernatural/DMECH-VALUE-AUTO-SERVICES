# MASTER IMPLEMENTATION INSTRUCTION
# Project: Existing Vehicle Sales & Operations Platform
# Stack: Next.js + TypeScript + Supabase + Paystack + WhatChimp + WhatsApp + AI
# Execution Mode: CONTROLLED, PHASED IMPLEMENTATION

You are now moving from the previously completed architecture/codebase audit into the implementation phase.

IMPORTANT:

This is a production-bound application approaching launch.

You MUST NOT treat this as a greenfield project.

You MUST preserve existing working functionality wherever possible.

You MUST NOT rewrite existing systems simply because you would personally design them differently.

You MUST inspect existing implementations before modifying them.

You MUST implement this project in clearly separated phases.

You MUST NOT execute all phases at once.

After completing each phase, STOP and produce a detailed implementation report.

Wait for explicit approval before proceeding to the next phase.

============================================================
1. PROJECT CONTEXT
============================================================

The existing application is a vehicle sales and operations platform.

The application currently includes functionality related to:

- Public vehicle browsing
- Vehicle details
- Customer accounts
- Customer leads
- Reservations
- Pre-orders
- Sales
- Instalments
- Payments/payment references
- Shipment/delivery tracking
- Customer tracking
- Operational management
- Notifications
- Existing WhatsApp-related functionality

Technology stack discovered during the audit:

- Next.js 16.2.10
- React 19.2.4
- TypeScript
- Supabase
- PostgreSQL through Supabase
- Netlify deployment
- Vitest
- ESLint

The project is NOT a generic product e-commerce store.

The primary business entity is the VEHICLE.

Therefore, do not introduce generic Shopify-style product/order architecture unless absolutely necessary.

The existing domain model should remain authoritative.

============================================================
2. IMPORTANT DISCOVERY FROM THE AUDIT
============================================================

The audit discovered that the project already contains an unfinished direct Meta WhatsApp Cloud API integration.

Existing WhatsApp-related functionality includes concepts such as:

- WhatsApp webhook
- Message sending
- STATUS
- TRACK
- PAYMENT
- FINANCE
- HELP
- WhatsApp tracking
- WhatsApp sessions
- WhatsApp session tokens
- OTP/registration functionality
- WhatsApp-related database migrations
- Notification infrastructure
- WhatsApp-related message/template/session records

DO NOT DELETE OR REBUILD THESE FEATURES BLINDLY.

First determine:

1. What is currently functional?
2. What is incomplete?
3. What is duplicated?
4. What is unsafe?
5. What can be reused?
6. What should be refactored?
7. What should eventually be replaced by WhatChimp?

The goal is to evolve the existing architecture, not destroy it.

============================================================
3. TARGET ARCHITECTURE
============================================================

The desired architecture is:

CUSTOMER
    |
    +----------------------+
    |                      |
    ▼                      ▼
NEXT.JS WEBSITE         WHATSAPP
    |                      |
    |                   WHAT-CHIMP
    |                      |
    |                   AI AGENT
    |                      |
    |              CONTROLLED TOOLS
    |                      |
    +----------+-----------+
               |
               ▼
        NEXT.JS SERVER/API
               |
               ▼
            SUPABASE
               |
      +--------+---------+
      |        |         |
      ▼        ▼         ▼
  Vehicles Customers Finance
      |                  |
      ▼                  ▼
  Sales/Orders        Payments
      |                  |
      ▼                Paystack
  Delivery/Tracking
               |
               ▼
        EVENT / OUTBOX
               |
               ▼
           WHAT-CHIMP
               |
               ▼
            WHATSAPP

IMPORTANT:

The website remains the main business platform.

WhatsApp is the customer communication and engagement channel.

WhatsApp does NOT replace the website.

============================================================
4. CORE PRODUCT PRINCIPLE
============================================================

The final system should allow a customer to:

A. Browse vehicles on the website.

B. Register/login on the website.

C. View vehicle details.

D. Reserve/pre-order/purchase according to the existing business flow.

E. Make payments through the website using Paystack.

F. Receive important business updates through WhatsApp.

G. Ask WhatsApp questions about available vehicles.

H. Ask WhatsApp about their transaction/order/reservation status.

I. Ask about payment status.

J. Ask about delivery/shipment status where available.

K. Receive AI assistance.

L. Escalate to human customer support where necessary.

M. Return from WhatsApp to the website whenever a complex operation is required.

============================================================
5. WHAT WHATSAPP MUST NOT DO
============================================================

Do NOT turn WhatsApp into a complete replacement for the website.

Do NOT move the entire vehicle catalogue into WhatsApp.

Do NOT move the complete checkout system into WhatsApp.

Do NOT process raw payment information inside WhatsApp.

Do NOT expose unrestricted database access to AI.

Do NOT allow AI to invent vehicle availability, payment status, delivery status or customer information.

The website/backend/database remains the source of truth.

============================================================
6. WHAT-CHIMP ARCHITECTURE
============================================================

WhatChimp is being considered as the external WhatsApp communication and automation layer.

The preferred conceptual architecture is:

Application
    |
    ▼
Internal WhatsApp/Notification Service Interface
    |
    ▼
WhatChimp Adapter
    |
    ▼
WhatChimp
    |
    ▼
WhatsApp

The application should ideally not be tightly coupled to WhatChimp-specific implementation details throughout the codebase.

Where appropriate, create an abstraction/provider boundary.

For example, conceptually:

WhatsAppProvider
    |
    +-- WhatChimpProvider

Do NOT blindly create these exact names if the existing architecture has a better equivalent.

Inspect the project first.

The purpose is to make the communication provider replaceable without rewriting the business logic.

============================================================
7. META DEPENDENCY
============================================================

The project/business currently has a Meta access problem.

The business owner's personal Facebook account is under Meta review/restriction, which has affected access to the Meta Business environment.

This is an external infrastructure/business setup issue.

DO NOT attempt to bypass Meta restrictions.

DO NOT create fake accounts.

DO NOT impersonate another person.

DO NOT use unauthorized credentials.

DO NOT attempt to circumvent Meta verification or restrictions.

The application should remain architecturally decoupled from Meta wherever possible.

Meta/WhatsApp setup will be handled separately through legitimate business access.

============================================================
8. PAYSTACK
============================================================

The audit discovered that Paystack is NOT currently fully integrated.

Existing payment-related structures exist, but the complete Paystack payment lifecycle is not yet implemented.

The eventual system must support, where applicable:

- Transaction initialization
- Secure checkout
- Payment reference
- Payment verification
- Paystack webhook
- Webhook signature verification
- Idempotent event handling
- Payment status updates
- Reconciliation
- Linking payment to the correct customer and business transaction
- Successful payment event
- Failed payment handling

Do NOT assume Paystack is already implemented.

Inspect the current code first.

The WhatsApp system must never claim that payment succeeded based merely on a client-side redirect.

The trusted payment confirmation must come from a verified Paystack server-side mechanism.

============================================================
9. AI ARCHITECTURE
============================================================

AI will eventually operate through controlled backend capabilities.

AI must NOT receive unrestricted database credentials.

AI must NOT execute arbitrary SQL.

AI must NOT directly manipulate Supabase tables.

Instead, create controlled application-level tools/services where required.

Potential capabilities include:

- Search available vehicles
- Get vehicle details
- Check vehicle availability
- Get customer transaction status
- Get payment summary/status
- Get reservation/pre-order status
- Get delivery/shipment status
- Create support request
- Generate website purchase/reservation link
- Generate website payment link

These are conceptual capabilities.

Do not automatically create all of them.

First inspect what already exists.

Reuse existing services where appropriate.

Every AI-accessible operation must have:

- Authentication/identity strategy
- Authorization
- Input validation
- Output validation
- Data minimization
- Rate limiting where appropriate
- Error handling
- Auditability

============================================================
10. CUSTOMER IDENTITY
============================================================

The WhatsApp system must eventually be able to associate a WhatsApp user with the correct customer account.

Audit and improve this architecture carefully.

Potential identifiers include:

- Supabase user ID
- Customer ID
- Phone number
- WhatsApp number
- Verified phone number
- Session/token

Do not assume phone number alone is sufficient for sensitive customer information.

A customer asking:

"Where is my vehicle?"

must not be able to receive another customer's information.

Implement strong authorization boundaries.

============================================================
11. NOTIFICATION ARCHITECTURE
============================================================

The audit identified the need for a durable notification/outbox architecture.

Where appropriate, establish:

BUSINESS EVENT
    ↓
NOTIFICATION OUTBOX
    ↓
DELIVERY WORKER/PROCESSOR
    ↓
WHATSAPP PROVIDER
    ↓
WHAT-CHIMP
    ↓
WHATSAPP

The system should support:

- Retry
- Failure tracking
- Idempotency
- Delivery status
- Error recording
- Appropriate logging
- Avoiding duplicate customer messages

Do NOT send critical business notifications directly from random business logic if an outbox/event mechanism is more appropriate.

However, inspect the existing notification architecture first and evolve it rather than unnecessarily rebuilding it.

============================================================
12. EXPECTED WHATSAPP CUSTOMER EXPERIENCES
============================================================

Eventually support scenarios such as:

------------------------------------------------------------
SCENARIO A — VEHICLE SEARCH
------------------------------------------------------------

Customer:

"Do you have a 2024 Toyota Prado?"

System:

WhatsApp
→ WhatChimp
→ AI
→ controlled backend tool
→ vehicle database
→ result
→ WhatsApp

Example:

"Yes, we currently have a 2024 Toyota Prado available.

Price: ₦XX,XXX,XXX.

Would you like to view the vehicle?"

[VIEW VEHICLE]

The button should lead to the website.

------------------------------------------------------------
SCENARIO B — PURCHASE/RESERVATION
------------------------------------------------------------

Customer:

"I want to buy it."

WhatsApp responds with a secure website link.

Customer completes the appropriate transaction on the website.

------------------------------------------------------------
SCENARIO C — PAYMENT
------------------------------------------------------------

Customer receives:

[PAY NOW]

Clicking the button takes the customer to the website/Paystack flow.

Payment happens through Paystack.

Verified Paystack event updates the application.

Application then triggers the appropriate WhatsApp notification.

------------------------------------------------------------
SCENARIO D — PAYMENT CONFIRMATION
------------------------------------------------------------

Customer receives:

"Your payment has been successfully confirmed.

Reference: XXXXX

Your transaction is now being processed."

Only send this after verified backend confirmation.

------------------------------------------------------------
SCENARIO E — STATUS
------------------------------------------------------------

Customer:

"What is the status of my vehicle?"

AI:

WhatsApp
→ WhatChimp
→ controlled backend tool
→ authenticated customer
→ actual business data
→ response

Never hallucinate.

------------------------------------------------------------
SCENARIO F — DELIVERY
------------------------------------------------------------

Customer:

"Where is my vehicle?"

System checks the actual available tracking/delivery information.

If no current tracking information exists:

"Your vehicle is currently being processed. We don't have a new delivery update yet."

Do NOT invent a location.

------------------------------------------------------------
SCENARIO G — HUMAN SUPPORT
------------------------------------------------------------

If AI cannot safely answer a question:

- Explain that human assistance is required.
- Create/route a support request if the system supports it.
- Do not fabricate an answer.

============================================================
13. SECURITY REMEDIATION
============================================================

The audit identified several security concerns.

Investigate and remediate appropriately, including where applicable:

- Weak OTP generation
- OTP rate limiting
- Registration takeover risks
- Duplicate customer phone numbers
- Plaintext tracking tokens
- PII in logs
- Webhook verification
- Webhook idempotency
- WhatsApp sender verification
- Development fallback credentials
- Consent enforcement
- Authentication
- Authorization
- IDOR risks
- AI data exposure
- API abuse
- Rate limiting
- Sensitive data leakage

IMPORTANT:

Do not blindly change security-sensitive behavior without understanding the current flow.

For each security fix:

1. Explain the current vulnerability.
2. Explain the proposed fix.
3. Implement the fix.
4. Test it.
5. Report any compatibility impact.

============================================================
14. PHASED IMPLEMENTATION PLAN
============================================================

You will execute the project in the following phases.

DO NOT SKIP PHASES.

DO NOT COMBINE ALL PHASES INTO ONE OPERATION.

------------------------------------------------------------
PHASE 0 — IMPLEMENTATION BASELINE
------------------------------------------------------------

Before changing anything:

- Re-read the current codebase.
- Reconfirm the audit findings.
- Check current git status.
- Check current branch.
- Identify uncommitted changes.
- Identify current environment configuration without exposing secrets.
- Run existing tests.
- Run lint/type checks where available.
- Establish a baseline.

DO NOT modify application behavior in this phase.

OUTPUT:

Provide:

- Current git state
- Test status
- Lint status
- Type-check status
- Existing build status if safely runnable
- Existing uncommitted changes
- Any blockers

STOP.

Wait for approval.

------------------------------------------------------------
PHASE 1 — SECURITY AND FOUNDATION
------------------------------------------------------------

Address the highest-priority security and reliability issues identified in the audit.

Prioritize:

1. Authentication/authorization vulnerabilities
2. OTP security
3. Rate limiting
4. Sensitive token handling
5. PII logging
6. Webhook security
7. Environment credential handling
8. Customer data isolation

Do not yet build the complete WhatChimp integration.

Do not yet build the AI agent.

Do not yet redesign the whole application.

Only implement foundational security/reliability improvements.

Run tests after each logical group.

OUTPUT:

- Changes made
- Why each change was necessary
- Files changed
- Database changes
- Tests added/updated
- Security impact
- Compatibility risks
- Remaining concerns

STOP.

Wait for approval.

------------------------------------------------------------
PHASE 2 — PAYMENT FOUNDATION
------------------------------------------------------------

Implement/harden the Paystack integration.

Inspect the existing payment architecture first.

Implement only what is actually required.

Potential components:

- Transaction initialization
- Secure payment flow
- Server-side verification
- Paystack webhook
- Signature verification
- Idempotency
- Payment status transitions
- Error handling
- Reconciliation
- Correct customer/transaction association

Do not connect payment success directly to WhatsApp yet unless the notification architecture required for this phase is already safe.

Test:

- Successful payment
- Failed payment
- Duplicate webhook
- Invalid webhook
- Incorrect reference
- Unauthorized access
- Payment replay attempt

OUTPUT:

Detailed payment implementation report.

STOP.

Wait for approval.

------------------------------------------------------------
PHASE 3 — NOTIFICATION / EVENT OUTBOX
------------------------------------------------------------

Design and implement the durable event/notification foundation.

Inspect the existing notification tables and services.

Where appropriate:

Business event
→ notification event
→ outbox
→ delivery attempt
→ provider

Support:

- Retry
- Idempotency
- Delivery status
- Failure handling
- Observability

Do not yet depend on a live WhatChimp account unless explicitly instructed.

A mock/test provider may be used if appropriate.

OUTPUT:

- Architecture
- Database changes
- Event types
- Retry strategy
- Idempotency strategy
- Tests
- Failure scenarios

STOP.

Wait for approval.

------------------------------------------------------------
PHASE 4 — WHATSAPP PROVIDER ABSTRACTION
------------------------------------------------------------

Now refactor the existing WhatsApp implementation carefully.

IMPORTANT:

The application already contains direct Meta WhatsApp Cloud API code.

Do NOT delete it immediately.

First:

- Identify all direct Meta dependencies.
- Identify all message sending code.
- Identify webhook processing.
- Identify templates.
- Identify sessions.
- Identify commands.
- Identify tracking.
- Identify notifications.
- Identify database dependencies.

Create a clean internal provider boundary where appropriate.

Conceptually:

Application
    ↓
WhatsApp Service
    ↓
Provider Interface
    ↓
WhatChimp Adapter

The architecture should allow the provider to be changed without rewriting business logic.

Do not remove the existing Meta implementation until the replacement path is tested.

If practical, retain the old implementation behind a provider boundary until migration is complete.

OUTPUT:

- Existing Meta integration inventory
- Refactoring performed
- Provider abstraction design
- WhatChimp integration boundary
- Remaining Meta dependencies
- Migration risks

STOP.

Wait for approval.

------------------------------------------------------------
PHASE 5 — WHAT-CHIMP INTEGRATION
------------------------------------------------------------

Only after the provider architecture is ready should you implement the WhatChimp connection.

Use environment variables/secrets appropriately.

Do NOT hardcode:

- API keys
- tokens
- phone numbers
- credentials
- secrets

Implement:

- WhatChimp API communication
- Webhook handling where required
- Request authentication
- Response validation
- Error handling
- Retry behavior
- Idempotency
- Logging without exposing secrets/PII

Do not assume undocumented WhatChimp behavior.

If a required WhatChimp capability cannot be verified from available documentation/configuration:

STOP and report it rather than inventing an implementation.

OUTPUT:

- WhatChimp integration
- Required environment variables
- Webhook endpoints
- Provider behavior
- Tests
- Error handling
- External setup requirements
- Any remaining Meta requirements

STOP.

Wait for approval.

------------------------------------------------------------
PHASE 6 — CONTROLLED AI TOOLS
------------------------------------------------------------

Build the backend capabilities required for AI.

Prioritize:

1. Vehicle search
2. Vehicle details
3. Vehicle availability
4. Customer transaction status
5. Payment status
6. Pre-order/reservation status
7. Delivery/shipment status
8. Website purchase/reservation link
9. Website payment link
10. Support escalation

Every tool must enforce authorization.

The AI must never receive unrestricted database access.

Implement safe structured inputs and outputs.

For example:

AI asks:

searchAvailableVehicles({
    make,
    model,
    year,
    budget,
    availability
})

Backend validates.

Backend queries database.

Backend returns only approved fields.

AI generates customer-friendly response.

Do not expose internal database structure to customers.

Do not expose unnecessary PII.

OUTPUT:

- Tool inventory
- API/service design
- Authorization model
- Validation
- Tests
- Example inputs/outputs
- Security considerations

STOP.

Wait for approval.

------------------------------------------------------------
PHASE 7 — WHATSAPP AI CUSTOMER EXPERIENCE
------------------------------------------------------------

Now connect the controlled AI capabilities to the WhatsApp experience.

Implement carefully.

Support:

- Vehicle search
- Vehicle questions
- Availability
- Pricing
- Customer status
- Payment status
- Delivery status
- Website links
- Human escalation

AI behavior must follow these rules:

RULE 1:
Never invent business data.

RULE 2:
Use backend tools for live business information.

RULE 3:
If the tool cannot verify the answer, say so.

RULE 4:
Never expose another customer's data.

RULE 5:
Never expose internal database details.

RULE 6:
Never claim payment success without verified payment state.

RULE 7:
Never claim delivery status without actual tracking data.

RULE 8:
Never perform destructive business operations without explicit authorization and appropriate safeguards.

RULE 9:
Prefer sending customers to the website for complex operations.

OUTPUT:

- AI flow
- Tool calls
- WhatsApp interaction examples
- Security validation
- Test results
- Failure behavior

STOP.

Wait for approval.

------------------------------------------------------------
PHASE 8 — AUTOMATED CUSTOMER NOTIFICATIONS
------------------------------------------------------------

Connect business events to WhatsApp notifications.

Potential events:

- New reservation
- Pre-order created
- Payment confirmed
- Payment failed
- Transaction processing
- Vehicle ready
- Shipment/dispatched
- In transit
- Delivery update
- Delivered
- Other appropriate operational events

Only implement events that actually exist in the application's business model.

Do not invent event types.

Use the notification/outbox architecture.

Ensure duplicate events do not produce duplicate customer messages.

OUTPUT:

- Event-to-message mapping
- Templates/messages
- Retry behavior
- Idempotency behavior
- Tests
- Failure scenarios

STOP.

Wait for approval.

------------------------------------------------------------
PHASE 9 — END-TO-END TESTING
------------------------------------------------------------

Test the complete customer journey.

At minimum:

TEST 1:
Customer registration

TEST 2:
Customer identification

TEST 3:
Vehicle search

TEST 4:
Vehicle availability

TEST 5:
Website purchase/reservation

TEST 6:
Payment initiation

TEST 7:
Successful Paystack payment

TEST 8:
Failed payment

TEST 9:
Duplicate Paystack webhook

TEST 10:
WhatsApp notification

TEST 11:
Customer asks for status

TEST 12:
Customer asks for payment status

TEST 13:
Customer asks for delivery status

TEST 14:
Unauthorized customer attempting to access another customer's data

TEST 15:
AI unable to retrieve information

TEST 16:
WhatChimp failure

TEST 17:
WhatsApp webhook failure

TEST 18:
Notification retry

TEST 19:
Duplicate notification event

TEST 20:
Human support escalation

Also test mobile website behavior.

OUTPUT:

Produce a complete test report.

STOP.

Wait for approval.

------------------------------------------------------------
PHASE 10 — PRODUCTION READINESS
------------------------------------------------------------

Only after all previous phases are approved:

Review:

- Security
- Authentication
- Authorization
- Environment variables
- Database migrations
- Supabase RLS
- Paystack
- WhatChimp
- WhatsApp
- AI
- Webhooks
- Notification reliability
- Logging
- Monitoring
- Error handling
- Rate limiting
- Performance
- Mobile UX
- Deployment configuration
- Rollback strategy

Create a final production-readiness report.

DO NOT deploy to production unless explicitly instructed.

============================================================
15. DATABASE RULES
============================================================

Before modifying Supabase:

1. Inspect existing schema.
2. Inspect existing migrations.
3. Check relationships.
4. Check RLS policies.
5. Check existing indexes.
6. Avoid duplicate tables.
7. Avoid unnecessary columns.
8. Preserve existing data.
9. Make migrations reversible where practical.
10. Never modify production data destructively without explicit approval.

Never drop existing tables or columns simply because they appear unused.

Investigate first.

============================================================
16. API RULES
============================================================

All new external-facing APIs must have:

- Authentication where required
- Authorization
- Input validation
- Output validation
- Error handling
- Rate limiting where appropriate
- Appropriate logging
- No sensitive data leakage

Do not expose internal Supabase credentials.

Do not expose service-role credentials to clients.

Do not allow arbitrary database queries from AI.

============================================================
17. ENVIRONMENT VARIABLES
============================================================

Never hardcode secrets.

Potential future configuration may include:

- Supabase credentials
- Paystack secret key
- Paystack public key
- Paystack webhook configuration
- WhatChimp credentials
- WhatsApp configuration
- AI provider configuration
- Webhook secrets

Only add environment variables that are actually required.

When adding one:

1. Document its purpose.
2. Add it to the appropriate example environment file if one exists.
3. Never place the real secret in source control.
4. Never print secret values in logs or reports.

============================================================
18. TESTING RULES
============================================================

After every meaningful change:

Run appropriate:

- Unit tests
- Integration tests
- Type checking
- Linting
- Build validation where appropriate

Do not declare success because code "looks correct."

If a test fails:

Investigate.

Do not simply suppress the failure.

Do not remove tests to make the suite pass.

============================================================
19. GIT / CHANGE MANAGEMENT
============================================================

Before every phase:

Check git status.

Do not overwrite unrelated developer changes.

Do not reset files that you did not modify.

Do not use destructive git commands unless explicitly instructed.

Keep changes logically grouped.

If the repository uses a branch/PR workflow, respect it.

============================================================
20. STOP CONDITIONS
============================================================

Immediately stop and report if:

- Required credentials are unavailable.
- Meta access is required but unavailable.
- WhatChimp behavior is undocumented or unclear.
- A database migration could cause data loss.
- Existing functionality would be broken.
- A security vulnerability is discovered that requires architectural approval.
- Paystack behavior cannot be safely verified.
- An external service cannot be tested safely.
- The existing architecture contradicts a required business rule.
- You discover a major business requirement that was not specified.

Do not invent solutions to unblock yourself.

Ask for clarification or provide a recommendation.

============================================================
21. COMMUNICATION STYLE
============================================================

At the end of each phase, provide a report containing:

PHASE:
STATUS:

OBJECTIVE:

WHAT WAS INSPECTED:

WHAT WAS CHANGED:

FILES CHANGED:

DATABASE CHANGES:

API CHANGES:

SECURITY CHANGES:

TESTS RUN:

TEST RESULTS:

RISKS:

REMAINING ISSUES:

EXTERNAL SERVICES REQUIRED:

MANUAL STEPS REQUIRED FROM THE BUSINESS OWNER:

NEXT PHASE:

Then STOP.

============================================================
22. MOST IMPORTANT RULE
============================================================

DO NOT IMPLEMENT EVERYTHING AT ONCE.

The order is:

AUDIT
→ BASELINE
→ SECURITY
→ PAYSTACK
→ EVENT/OUTBOX
→ WHATSAPP PROVIDER ABSTRACTION
→ WHAT-CHIMP
→ CONTROLLED AI TOOLS
→ AI CUSTOMER EXPERIENCE
→ AUTOMATED NOTIFICATIONS
→ END-TO-END TESTING
→ PRODUCTION READINESS

Each phase requires explicit approval before the next phase.

============================================================
23. START NOW
============================================================

Start with PHASE 0 only.

Do not implement Phase 1.

Do not modify application behavior.

Inspect the current state, establish the baseline, and provide the Phase 0 report.

Then STOP and wait for approval.