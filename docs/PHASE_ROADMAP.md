# DMECH Project Phased Delivery Roadmap

**Last Updated:** 2026-08-15  
**Status:** Planning Phase

---

## Overview

This document defines the complete phased delivery plan for the DMECH project improvements. The plan protects the existing app structure while systematically improving:
- Product scope clarity
- Business rule governance
- Documentation and testing
- Customer experience (WhatsApp-first)
- UX clarity and operations consistency
- Measurement and dashboards
- Trust-building features

---

## Core Protection Principles

Before any phase begins, the following rules must be followed:

1. **No broad rewrites** — Change only the part belonging to the current phase.
2. **No breaking changes without fallback** — If a flow works, keep it working. Add new paths in parallel if needed.
3. **Every phase must pass a gate** — Build passes, tests pass, no major breakage before moving forward.

---

## Phase 0: Stabilize Current App (Safety & Baseline)

**Priority:** HIGHEST (foundational)  
**Goal:** Protect and document the existing working structure  
**Duration:** 1 week  
**Risk Level:** MINIMAL

### 0A. Document Current Working Flows

**What:** Catalog all currently stable features  
**How:**
- List all working routes (marketing, sales, portal, ops)
- Identify which features are in production use
- Identify which features are incomplete or unstable
- Document dependencies and data flows

**Test Gate:**
- [ ] All marketing routes render and load
- [ ] All ops routes require auth and render
- [ ] Customer portal pages load
- [ ] No console errors on key pages

**Artifacts:**
- `docs/current-working-flows.md`
- list of stable vs. unstable features

---

### 0B. Identify "Do Not Touch" Zone

**What:** Mark features that must not be changed in later phases  
**How:**
- Payment processing flows (invoices, receipts)
- Auth and MFA flows
- Role-based access control
- Supabase migrations
- Existing vehicle/customer APIs

**Test Gate:**
- [ ] Core payment flow works
- [ ] Auth/MFA flow works
- [ ] Role checks work correctly
- [ ] Database queries return correct data

**Artifacts:**
- `docs/protected-features.md`
- list of features with "do not touch" status

---

### 0C. Establish Development & Test Environment

**What:** Ensure reproducible build and test environments  
**How:**
- Fix build errors (Google Fonts, TypeScript, etc.)
- Verify test suite runs
- Document environment setup
- Create .env.example if not present

**Test Gate:**
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] `npm run test` runs without hanging
- [ ] No TypeScript errors in critical paths

**Artifacts:**
- `.env.example`
- `docs/environment-setup.md`

---

### 0D. Create Baseline Test Harness

**What:** Define what we will test for regression  
**How:**
- Identify 3-5 critical user journeys
- Document the expected behavior
- Create smoke test steps (manual for now)
- Document how to verify core flows

**Test Gate:**
- [ ] Can follow smoke test without failures
- [ ] All critical data flows work
- [ ] Forms submit and save data
- [ ] Notifications/redirects work

**Artifacts:**
- `docs/smoke-test-checklist.md`
- smoke test scenarios for each domain

---

### 0E. Git Baseline Commit

**What:** Commit stable state as Phase 0 checkpoint  
**How:**
- Create a clean commit with all documentation
- Tag as `phase-0-stable`
- Create a backup branch `phase-0-baseline`

**Test Gate:**
- [ ] Commit is clean and documented
- [ ] All Phase 0 docs are in git
- [ ] Previous working state is preserved

---

### Phase 0 Exit Criteria

✅ All of the following must pass before Phase 1 begins:
- Build succeeds
- Core user journeys pass smoke tests
- No new regressions
- Phase 0 documentation is complete
- Stable commit is tagged

---

---

## Phase 1: Foundation (Product Rules & Governance)

**Priority:** HIGHEST (strategic)  
**Goal:** Establish single source of truth for business logic  
**Duration:** 3-4 weeks  
**Risk Level:** LOW (isolated to new layer)

### 1A. Tighten Product Scope

**What:** Define clear boundaries between marketing, sales, ops, and business mgmt  
**Why:** Reduces confusion, prevents feature creep, clarifies ownership  

**How:**
- Document responsibilities:
  - Marketing: discovery, trust, education
  - Sales: lead management, vehicle purchase flow
  - Ops: stock, finance, customs, workshop, reporting
  - Business Config: rules, defaults, approvals
- Create ownership matrix
- Define clear handoff points between domains

**Test Gate:**
- [ ] Each feature has a clear owner
- [ ] No overlapping responsibilities
- [ ] New features can be assigned cleanly
- [ ] Documentation is agreed upon

**Artifacts:**
- `docs/product-scope.md`
- `docs/ownership-matrix.md`
- clear domain boundaries

---

### 1B. Centralize Business Rules

**What:** Move all business logic to a single, versioned, testable layer  
**Why:** Same rule = same result everywhere  

**How:**
- Create `src/lib/business-rules/` folder
- Define modules for:
  - Pricing rules
  - Financing rules
  - Vehicle lifecycle
  - Approval rules
  - Invoice/payment rules
- Implement core functions (not components)
- Each rule is versioned and documented
- All uses of the rule import from central location

**Rules to centralize:**
- Deposit percentage calculation
- Financing default values
- Vehicle status transitions
- Approval thresholds
- Invoice payment logic
- Reserve fund calculations
- Warranty rules

**Test Gate:**
- [ ] Same rule produces same result across all pages
- [ ] Finance calculations match everywhere
- [ ] Vehicle status transitions work consistently
- [ ] No component re-implements business logic
- [ ] All new features use central rules

**Artifacts:**
- `src/lib/business-rules/` folder
- `docs/business-rules-registry.md`
- Test suite for each rule set

---

### 1C. Create Comprehensive Documentation

**What:** Write docs that let a new dev understand the system  
**Why:** Faster onboarding, safer changes, better handoff  

**How:**
Create documentation folder structure:
```
docs/
├── PHASE_ROADMAP.md (this file)
├── ARCHITECTURE.md
├── BUSINESS_RULES.md
├── PRODUCT_SCOPE.md
├── OWNERSHIP_MATRIX.md
├── AUTH_AND_SECURITY.md
├── DATABASE_SCHEMA.md
├── DEPLOYMENT.md
├── ENVIRONMENT.md
├── MIGRATIONS.md
├── TESTING.md
├── USER_FLOWS.md
└── TROUBLESHOOTING.md
```

**Key docs to write:**
- `ARCHITECTURE.md`: App Router, Server/Client split, data layer
- `AUTH_AND_SECURITY.md`: Auth flow, RLS, roles, permissions
- `DATABASE_SCHEMA.md`: Table structure, relationships
- `DEPLOYMENT.md`: Build, deploy, rollback steps
- `ENVIRONMENT.md`: .env setup, local dev, staging, production
- `MIGRATIONS.md`: How to write, test, deploy migrations
- `TESTING.md`: How to write and run tests
- `USER_FLOWS.md`: Critical user journeys
- `TROUBLESHOOTING.md`: Common issues and fixes

**Test Gate:**
- [ ] New dev can follow setup docs and run the app
- [ ] All critical flows are documented
- [ ] Deployment steps are valid
- [ ] No critical knowledge is tribal-only

**Artifacts:**
- Complete `docs/` folder
- All docs formatted and linked

---

### 1D. Build Testing Baseline

**What:** Establish core test coverage for critical business flows  
**Why:** Regressions are caught early, confidence in future changes  

**How:**
Start with high-value test coverage (not 100% coverage):

1. **Business Rule Tests** (`tests/business-rules.test.ts`)
   - Deposit calculations
   - Finance defaults
   - Approval logic
   - Invoice totals

2. **Workflow Tests** (`tests/workflows/`)
   - Vehicle intake flow
   - Finance application
   - Invoice creation
   - Payment processing
   - Staff approval flow

3. **Smoke Tests** (documented in `docs/smoke-test-checklist.md`)
   - Marketing site loads
   - Customer can view vehicle
   - Staff can create invoice
   - Payment can be recorded

**Test Gate:**
- [ ] All business rule tests pass
- [ ] All workflow tests pass
- [ ] No app-breaking regressions
- [ ] Test suite runs in CI-ready format

**Artifacts:**
- `tests/business-rules.test.ts`
- `tests/workflows/` folder
- `docs/testing-strategy.md`

---

### 1E. Security Review & Validation

**What:** Validate that security is intact after changes  
**Why:** Rules centralization and docs should not weaken access control  

**How:**
- Audit auth flow (not changing, just validating)
- Review RLS policies on sensitive tables
- Check service-role usage boundaries
- Validate staff role assignments
- Review audit logging on critical operations
- Document security model in `docs/AUTH_AND_SECURITY.md`

**Test Gate:**
- [ ] Auth flow works correctly
- [ ] RLS prevents unauthorized access
- [ ] Service-role is used only where intended
- [ ] Audit logs capture sensitive actions
- [ ] No new security gaps introduced

**Artifacts:**
- `docs/AUTH_AND_SECURITY.md`
- security review checklist

---

### Phase 1 Exit Criteria

✅ All of the following must pass before Phase 2 begins:
- Product scope is clearly defined and documented
- All business rules are centralized and tested
- Comprehensive documentation is complete and validated
- Core workflow tests pass
- Security review confirms no gaps
- New test suite passes CI
- Phase 1 is tagged in git

---

---

## Phase 2: Customer Experience (WhatsApp-First)

**Priority:** HIGH (customer-focused)  
**Goal:** Redesign customer auth, dashboard, and communication around WhatsApp  
**Duration:** 4 weeks  
**Risk Level:** MEDIUM (customer-facing changes)

### 2A. Restructure Customer Auth Flow

**What:** Replace heavy email-verification flow with WhatsApp-first onboarding  
**Why:** Lower friction, better mobile experience, aligns with regional behavior  

**How:**
- Create new `/auth/whatsapp-onboarding` route
- Simplify customer signup:
  - Name, phone number, WhatsApp confirmation
  - Minimal required fields (remove BVN, bank details for initial onboarding)
  - WhatsApp OTP verification instead of email
- Keep old email flow as fallback for 90 days
- Recognize returning customers via phone + WhatsApp
- Store WhatsApp integration token securely

**Do NOT touch:**
- Existing customer table structure
- Payment processing auth
- Staff authentication
- Admin access controls

**Test Gate:**
- [ ] New customer can complete onboarding in <2 min
- [ ] Returning customer is recognized
- [ ] Old flow still works (fallback)
- [ ] WhatsApp integration receives messages
- [ ] No customer data loss

**Artifacts:**
- `/auth/whatsapp-onboarding` flow
- WhatsApp API integration utilities
- Customer migration guide

---

### 2B. Remove/Soften Formal Verification Friction

**What:** Simplify customer data collection  
**Why:** Reduces abandonment, improves UX without losing business safety  

**How:**
- Remove mandatory email verification
- Remove BVN field from initial signup
- Remove "proof of verification" pages
- Keep minimum data:
  - Name
  - Phone (verified via WhatsApp)
  - Email (optional)
- Move heavy verification to order-time if needed (not onboarding-time)

**Do NOT remove:**
- Payment verification for actual transactions
- Order verification before fulfillment
- Business-critical data collection at purchase

**Test Gate:**
- [ ] Onboarding is faster
- [ ] Fewer fields in initial form
- [ ] Customer completion rate improves
- [ ] No order processing breaks
- [ ] Payment flow still validates correctly

**Artifacts:**
- Simplified customer signup form
- Updated customer schema docs

---

### 2C. Build WhatsApp Integration Layer

**What:** Connect app customer actions to WhatsApp communication  
**Why:** Makes the app feel real and responsive, improves engagement  

**How:**
- Create `src/lib/whatsapp/` folder
- Implement:
  - Order status notifications
  - Customer service responses
  - Returning customer messages
  - Financing updates
  - Service booking confirmations
  - Order tracking
- Each action in the app triggers a WhatsApp message
- Customer can respond via WhatsApp and it reflects in app
- Use queue + async for reliability

**Integration points:**
- New order → WhatsApp notification + order link
- Order status change → WhatsApp update
- Returning customer login → WhatsApp welcome
- Service booking → WhatsApp confirmation
- Payment received → WhatsApp receipt

**Do NOT touch:**
- Payment system itself
- Order fulfillment logic
- Staff communication channels

**Test Gate:**
- [ ] Order status messages send
- [ ] Messages include correct order info
- [ ] Returning customer is recognized
- [ ] No message delays > 2 seconds
- [ ] Queue handles failures gracefully

**Artifacts:**
- `src/lib/whatsapp/` integration
- WhatsApp message templates
- Queue system for async messaging

---

### 2D. Redesign Customer Dashboard

**What:** Replace "account dashboard" with actionable customer command center  
**Why:** Useful, not bureaucratic; aligned with WhatsApp-first approach  

**How:**
- Redesign `/portal/dashboard` to show:
  - My active orders
  - My vehicles
  - Service updates
  - Financing status
  - WhatsApp chat access
  - Order tracking
- Remove: formal account settings, unused fields, overly official language
- Keep: order management, service tracking, payment status

**Do NOT touch:**
- Payment processing on backend
- Order fulfillment logic
- Staff-side operations portal

**Test Gate:**
- [ ] Customer sees relevant info on first load
- [ ] Dashboard loads in <2 seconds
- [ ] All action buttons work
- [ ] No confusing sections
- [ ] Customer knows what to do next

**Artifacts:**
- Redesigned customer dashboard
- Customer-facing docs for features

---

### Phase 2 Exit Criteria

✅ All of the following must pass before Phase 3 begins:
- New WhatsApp onboarding flow works end-to-end
- Old email flow works as fallback
- Returning customer recognition works
- WhatsApp messaging is reliable
- Customer dashboard is cleaner and faster
- All customer flows still work
- No regressions in order processing
- Phase 2 is tagged in git

---

---

## Phase 3: UX Clarity & Operational Consistency

**Priority:** HIGH (quality & usability)  
**Goal:** Make all interactions obvious and consistent  
**Duration:** 3 weeks  
**Risk Level:** LOW (mostly UI/UX changes)

### 3A. Fix Compare Feature UX

**What:** Make vehicle comparison obvious and intuitive  
**Why:** Users should understand "select 2+ and compare" without confusion  

**How:**
- Clear visual indication of selected vehicles
- "Select vehicles" → show checkmarks and count
- "Compare" button disabled until 2+ selected
- Show "need X more" when less than 2 selected
- Auto-open modal when 2nd vehicle selected OR require explicit click (decide and document)
- Clear comparison table
- Easy "remove from comparison" on each vehicle

**Test Gate:**
- [ ] User knows what is selected at all times
- [ ] Comparison flow is obvious
- [ ] No hidden button logic
- [ ] Mobile UX works

**Artifacts:**
- Updated `VehicleMarketplace.tsx`
- Updated `VehicleCompareModal.tsx`
- Updated `Ticker.tsx` and announcements flow

---

### 3B. Simplify Actions & Reduce Hidden Logic

**What:** Make buttons and forms obvious  
**Why:** Ops staff and customers should know what happens next  

**How:**
- Replace vague labels with clear action names
- Examples:
  - ❌ "Process" → ✅ "Approve Financing"
  - ❌ "Submit" → ✅ "Create Invoice"
  - ❌ "Update" → ✅ "Mark as Delivered"
- Add confirmations for destructive actions
- Show success feedback clearly
- Reduce conditional rendering of buttons
- Make required fields very clear

**Test Gate:**
- [ ] No vague button labels remain
- [ ] Users complete actions without guessing
- [ ] Confirmations prevent mistakes
- [ ] Success/error messages are clear

**Artifacts:**
- Updated forms and action buttons
- Button naming conventions doc

---

### 3C. Ensure Operations Consistency

**What:** Same naming, transitions, and rules across all ops screens  
**Why:** Staff can work faster, fewer mistakes, less confusion  

**How:**
- Audit and standardize:
  - Vehicle status names (consistent everywhere)
  - Invoice status names
  - Customer status names
  - Allowed transitions (e.g., Available → Reserved → Sold, never Reserved → Available)
  - Required fields across similar forms
  - Validation messages (same errors get same messages)
  - Date formats
  - Currency display

**Test Gate:**
- [ ] Same status means same thing everywhere
- [ ] No invalid transitions allowed
- [ ] Consistent field validation
- [ ] Same error message for same error
- [ ] Staff workflows are streamlined

**Artifacts:**
- `docs/operations-consistency.md`
- Standardized component library updates

---

### Phase 3 Exit Criteria

✅ All of the following must pass before Phase 4 begins:
- Compare UX is clear and intuitive
- All button labels are explicit
- No "what do I do next?" confusion
- Operations are consistent across all screens
- Staff can work faster
- No regressions in functionality
- Phase 3 is tagged in git

---

---

## Phase 4: Measurement & Analytics Dashboards

**Priority:** MEDIUM-HIGH (business insight)  
**Goal:** Add tracking and dashboards for business metrics  
**Duration:** 3-4 weeks  
**Risk Level:** MEDIUM (new features, no changes to core)

### What to Build

Dashboards for:
- **Sales Pipeline**: leads, quotes, conversions
- **Inventory Aging**: stock duration, turnover rate
- **Financing Health**: approval rate, default rate, avg tenor
- **Pending Approvals**: waiting actions, SLA tracking
- **Customer Metrics**: returning vs. new, LTV, churn
- **Operations**: staff efficiency, task completion time

### Implementation Strategy

- Add tracking events to critical flows (without breaking them)
- Create aggregation queries
- Build dashboard pages in `/ops/reports`
- Start with basic reports, enhance later
- Use existing platform_config for thresholds

### Test Gate

- [ ] Metrics are accurate
- [ ] Dashboards reflect real data
- [ ] No performance impact on main app
- [ ] Managers can act on data

### Artifacts

- `src/app/ops/reports/` dashboard pages
- Analytics tracking layer
- `docs/analytics-implementation.md`

---

---

## Phase 5: Trust & Customer-Facing Polish

**Priority:** MEDIUM (conversion & trust)  
**Goal:** Add trust-building features and marketing clarity  
**Duration:** 2-3 weeks  
**Risk Level:** LOW (marketing/messaging, no core changes)

### What to Build

- **Certification Badges**: clear "DMECH Certified" indicators
- **Guarantee Language**: warranty and guarantee clarity
- **Financing Transparency**: clear "how financing works" explanations
- **Process Messaging**: "here's what happens next" guides
- **Trust Signals**: verified history, inspection badges, support links

### Implementation Strategy

- Update marketing pages with trust elements
- Add guarantees/warranty info to vehicle detail page
- Create "financing explained" page
- Add order tracking transparency
- Link to support (WhatsApp integrated)

### Test Gate

- [ ] Trust elements match actual business process
- [ ] Messaging is honest and clear
- [ ] Conversion metrics improve
- [ ] Customer support load doesn't increase

### Artifacts

- Updated marketing pages
- Trust badge system
- `docs/trust-messaging-guide.md`

---

---

## Phase 6: Ongoing & Future Work

**Priority:** VARIES (continuous improvement)

### Includes

- AI-assisted customer service via WhatsApp
- Advanced inventory forecasting
- Predictive financing approvals
- Extended reporting and business intelligence
- Mobile app (if strategic)
- International expansion features

---

---

## Critical Success Factors

| Factor | How We Ensure It |
|--------|------------------|
| No app breakage | Phase gates, smoke tests, git tags |
| Clear priorities | This roadmap, ownership matrix |
| Team alignment | Weekly phase reviews, clear docs |
| Customer impact | Real testing, gradual rollouts, fallbacks |
| Data integrity | Business rule tests, audit logs |
| Performance | Load testing after major phases |
| Security | Regular review, no relaxed access control |

---

---

## Timeline Summary (REVISED)

**New Strategy:** Phase 1A+1B (Rules Foundation) → Phase 2 (WhatsApp) → Phase 1C-E (Wrap-up)

| Phase | Duration | Start | End | Notes |
|-------|----------|-------|-----|-------|
| Phase 0 | 1 week | Week 1 | Week 1 | ✅ COMPLETE |
| Phase 1A-1B | 2 weeks | Week 2 | Week 3 | Business Rules Foundation |
| Phase 2 | 4 weeks | Week 4 | Week 7 | WhatsApp-First (HIGH IMPACT) |
| Phase 1C-E | 3 weeks | Week 8 | Week 10 | Documentation & Testing |
| Phase 3 | 3 weeks | Week 11 | Week 13 | UX Clarity & Operations |
| Phase 4 | 3-4 weeks | Week 14 | Week 17 | Analytics & Dashboards |
| Phase 5 | 2-3 weeks | Week 18 | Week 20 | Trust & Polish |
| **Total** | **~20 weeks** | **Week 1** | **Week 20** | Prioritized for customer value |

---

---

## How to Track Progress

- [ ] Each phase has a git tag: `phase-X-complete`
- [ ] Each phase has documentation committed to `docs/`
- [ ] Phase gates are checked before moving forward
- [ ] Weekly status updates on the current phase
- [ ] Rollback plan is documented for each phase

---

---

## Questions to Ask Before Each Phase

1. Does the build pass?
2. Do all smoke tests pass?
3. Have all phase docs been reviewed?
4. Is the team aligned on the phase scope?
5. Are we staying within the phase boundaries?
6. Has the previous phase been tagged and backed up?

---

## ⚡ REVISED EXECUTION STRATEGY (APPROVED)

**Decision:** Execute Phase 1A+1B → Jump to Phase 2 (WhatsApp) → Complete Phase 1C-E

**See:** `docs/PHASE_EXECUTION_PLAN.md` for complete day-by-day breakdown

**Timeline:**
- **Weeks 2-3:** Phase 1A (product scope) + Phase 1B (centralize business rules)
- **Weeks 4-7:** Phase 2 (WhatsApp-first integration using centralized rules)
- **Weeks 8-10:** Phase 1C-E (comprehensive documentation and testing wrap-up)
- **Week 11+:** Phases 3, 4, 5 as planned

**Why This Order:**
1. Business rules MUST be centralized before WhatsApp code can use them (dependency)
2. Phase 2 creates immediate customer value (competitive advantage)
3. Documentation is better after full system is built (more complete and accurate)
4. Risk is lower: rules are thoroughly tested before WhatsApp relies on them
5. Team stays motivated with visible customer-facing progress

**Next Action:** Start Phase 1A today (2-3 days to complete)
**Phase 2 Kick-off:** Week 4 (immediately after Phase 1B complete)
