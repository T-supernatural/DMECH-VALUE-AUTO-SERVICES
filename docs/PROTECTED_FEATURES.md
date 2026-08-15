# Phase 0B: Protected Features ("Do Not Touch" Zone)

**Date:** 2026-08-15  
**Status:** IN PROGRESS  
**Purpose:** Define which features must remain stable during all future phases

---

## Core Principle

These features form the operational backbone of the system. Any changes to these areas must be:
- Extensively tested
- Approved by product/ops leadership
- Deployed with rollback plan
- Never changed as part of another phase's scope

---

## Protected Feature Zones

### 1. Authentication & Authorization (CRITICAL)

**Why:** Without this, the entire system fails.

**Protected:**
- Email/password authentication flow
- MFA (TOTP) enrollment and challenge
- Session handling (Supabase SSR)
- OAuth callback routing
- Password reset flow
- Middleware-level session checks

**Never Change Without:**
- Full security review
- MFA re-testing in all scenarios
- Session continuity verification
- Backup auth method

**Location:** 
- `src/middleware.ts`
- `src/app/auth/**`
- `src/lib/mfa.ts`
- `src/lib/supabase/server.ts`

---

### 2. Role-Based Access Control (CRITICAL)

**Why:** Controls who can do what. Loosening this is a security breach.

**Protected:**
- Staff role definitions (8 roles)
- Permission assignment by role
- Nav access by role
- API endpoint guards (`staffGuard`, `roleGuard`)
- RLS policy enforcement
- Permission inheritance

**Never Change Without:**
- Security audit
- Each role's access verified
- No unintended access granted
- Full audit log review

**Location:**
- `src/lib/staff-permissions.ts`
- `src/lib/guards.ts`
- `src/components/ops/Sidebar.tsx`
- All `api/admin/**` routes

---

### 3. Payment Processing (CRITICAL)

**Why:** Money. Errors here destroy trust and business.

**Protected:**
- Invoice creation and calculation logic
- Payment recording flow
- Balance updates
- Reconciliation logic
- PDF export for invoices
- Payment status transitions
- Receipt generation

**Never Change Without:**
- Finance review
- Reconciliation test
- End-to-end payment test
- No data loss verification

**Location:**
- `src/app/api/invoices/**`
- `src/app/api/payments/**`
- `src/app/api/receipts/**`
- `src/lib/invoice-line-items.ts`
- `src/components/ops/InvoicePDF.tsx`

---

### 4. Vehicle Lifecycle Management (HIGH)

**Why:** Core business logic. Broken vehicle status = broken operations.

**Protected:**
- Vehicle status transitions (Available → Reserved → Sold)
- Vehicle creation and photo upload
- Vehicle inspection and certification
- Trade-in valuation
- Consignment payout
- Vehicle history

**Never Change Without:**
- Ops review of status transitions
- Photo upload thoroughly tested
- History integrity verified
- All status changes logged

**Location:**
- `src/app/api/vehicles/**`
- `src/app/ops/vehicles/**`
- `src/lib/vehicles.ts`
- `src/components/ops/VehicleEditForm.tsx`

---

### 5. Approval Workflows (HIGH)

**Why:** Controls which staff can approve what. Broken = wrong people approving.

**Protected:**
- Customer approval logic
- Financing approval thresholds
- Staff approval assignment
- Approval status tracking
- Approval history

**Never Change Without:**
- Clear approval rules documented
- Each approval step tested
- Threshold logic verified
- Audit log checking

**Location:**
- `src/lib/approval.ts`
- `src/app/api/customers/[id]/approve/**`
- `src/components/ops/CustomerApprovalPanel.tsx`

---

### 6. Database & Migrations (HIGH)

**Why:** Data structure is everything. Broken migrations = data loss.

**Protected:**
- All existing migrations (001-024)
- Table schemas
- Relationships and constraints
- RLS policies
- Indexes

**Never Change Without:**
- Database backup
- Migration testing on copy
- Data integrity check
- Rollback plan

**Location:**
- `supabase/migrations/**`
- All migration files

---

### 7. Service-Role Usage (HIGH)

**Why:** Service role has god access. Misuse = huge security hole.

**Protected:**
- When service-role is used
- What it accesses
- How it's initialized
- No exposure to client

**Never Change Without:**
- Security review
- Service-role never in browser
- All uses documented
- Access audit

**Location:**
- `src/lib/supabase/server.ts`
- `src/lib/platform-config.ts`
- `src/lib/audit.ts`
- All `api/admin/**` routes

---

### 8. Audit Logging (HIGH)

**Why:** Without audit logs, we cannot trust the system.

**Protected:**
- What gets logged
- Audit table schema
- Audit access controls
- Log retention

**Never Change Without:**
- Audit function review
- Log completeness check
- No data deletion from audit

**Location:**
- `src/lib/audit.ts`
- `supabase/migrations/003_rls_policies.sql` (audit table)

---

### 9. Supabase Connection & Initialization (HIGH)

**Why:** Wrong connection = wrong data or no data.

**Protected:**
- Supabase client initialization
- Service-role client
- Session management
- Environment variable handling

**Never Change Without:**
- Connection test to all environments
- Auth flow re-verification
- Session persistence check

**Location:**
- `src/lib/supabase/**`
- `src/middleware.ts`

---

### 10. Order/Invoice/Payment Reconciliation (HIGH)

**Why:** Broken reconciliation = financial mess.

**Protected:**
- Invoice-payment matching
- Balance calculations
- Duplicate prevention
- Status sync

**Never Change Without:**
- Financial audit
- Sample reconciliation test
- No data loss

**Location:**
- `src/app/api/payments/**`
- `src/app/api/invoices/**`
- `src/lib/invoice-line-items.ts`

---

## What CAN Change Freely (Within Phases)

These are NOT protected. Improvements here are fine:

- UI/UX styling (CSS)
- Component rendering
- Form labels and messaging
- Icon choices
- Page layouts
- Button positioning
- Colors and themes
- Typography
- Animation timing
- Loading states
- Error messages (wording, not logic)
- Sorting/filtering options
- Dashboard layouts

---

## What MIGHT Change (But Carefully)

These need review but can evolve:

- Business rule values (thresholds, percentages)
- Role definitions (adding new roles is OK; changing existing is risky)
- API response formats (if backward-compatible)
- Form fields (if optional or migrated safely)
- Notification types
- Report layouts

---

## Protected Feature Audit Checklist

Before ANY phase change, verify:

- [ ] No changes to auth flow
- [ ] No changes to RLS policies
- [ ] No changes to role/permission logic
- [ ] No changes to payment calculations
- [ ] No changes to vehicle status transitions
- [ ] No changes to approval thresholds
- [ ] No database schema changes (unless migration)
- [ ] No service-role exposure
- [ ] Audit logging still working
- [ ] Supabase connection stable

---

## Breaking the Protected Zone

If you MUST change a protected feature:

1. **Document why** — Create an issue explaining the business reason
2. **Get approval** — CEO/ops lead agrees
3. **Plan thoroughly** — Detailed change plan with rollback
4. **Test exhaustively** — Manual + automated testing
5. **Communicate** — Tell the team what is changing
6. **Deploy carefully** — Use feature flags or dark launch
7. **Monitor** — Watch for issues immediately post-deploy
8. **Keep rollback ready** — Be able to revert in < 5 minutes

---

## How to Know What to Protect

Ask these questions:

1. **Would a bug here cost money?** → Protect it
2. **Would a bug here break auth?** → Protect it
3. **Would a bug here violate business rules?** → Protect it
4. **Would a bug here prevent orders?** → Protect it
5. **Would a bug here leak data?** → Protect it
6. **Would a bug here cause data loss?** → Protect it

---

## Review Schedule

- [ ] Weekly: Protected features still working
- [ ] Monthly: Audit log review
- [ ] After each phase: Full smoke test of protected zones
- [ ] Quarterly: Security review of RLS and service-role usage

---

## Questions for Phase 0 Exit

Before moving to Phase 1, confirm:

✅ Do we agree on what is protected?  
✅ Does the team understand why?  
✅ Can we test all protected zones?  
✅ Is rollback possible for each?  
✅ Are we documenting carefully?

