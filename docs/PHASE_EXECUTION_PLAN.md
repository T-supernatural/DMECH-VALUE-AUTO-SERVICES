# Revised Phase Execution Strategy: Balancing Phase 1 & 2

**Decision Made:** Execute Phase 1A+1B (Business Rules Foundation) → Jump to Phase 2 (WhatsApp-First) → Complete Phase 1C-E

**Rationale:** The WhatsApp integration depends on centralized business rules (Phase 1B). Once rules are centralized, Phase 2 can leverage them without reinventing. This maximizes customer value quickly while building on solid foundations.

---

## Timeline Overview

```
Phase 0: Week 1        ✅ COMPLETE
Phase 1A-1B: Week 2-3  ⏳ Business Rules Foundation
Phase 2: Week 4-7      ⏳ WhatsApp-First Customer Experience  
Phase 1C-E: Week 8-10  ⏳ Documentation & Testing Cleanup
Phase 3: Week 11+      ⏳ UX Clarity & Operations
```

**Total:** Still ~19 weeks, but reordered for maximum customer impact

---

## Immediate Next Steps (Starting Today)

### This Week: Phase 1A - Product Scope Tightening

**Time:** 2-3 days  
**Goal:** Document clear boundaries between marketing, sales, ops

**Tasks:**
1. ✅ Define responsibilities:
   - Marketing: discovery, trust, education (unchanged by WhatsApp)
   - Sales: lead management, vehicle purchase flow (affected by WhatsApp auth)
   - Ops: stock, finance, customs, workshop (affected by WhatsApp notifications)
   - Business Config: rules, defaults, approvals (must be centralized for WhatsApp)

2. ✅ Create ownership matrix

3. ✅ Document domain boundaries

**Deliverable:** `docs/PRODUCT_SCOPE.md` + `docs/OWNERSHIP_MATRIX.md`

### Week 2-3: Phase 1B - Centralize Business Rules

**Time:** 2 weeks  
**Goal:** Move all business logic to single, versioned, testable layer

**Why this MUST happen before Phase 2:**
- WhatsApp notification handlers will query: "Should this customer get financing approved?"
- Registration flow needs: "What's the minimum deposit for this vehicle?"
- Order flow needs: "What are the valid status transitions?"
- All these rules must exist in ONE place, not scattered across components

**Tasks:**
1. Create `src/lib/business-rules/` folder structure:
   ```
   src/lib/business-rules/
   ├── index.ts                 (exports all rules)
   ├── pricing.ts              (deposit %, reserve fund, margins)
   ├── financing.ts            (tenor options, interest, approval thresholds)
   ├── vehicle-lifecycle.ts    (status transitions, certification rules)
   ├── approvals.ts            (threshold logic, who can approve what)
   ├── invoice-payment.ts      (calculation, reconciliation)
   └── warranty.ts             (coverage, claim logic)
   ```

2. Move existing scattered logic into these modules

3. Write tests for each rule set

4. Document all rules in `docs/BUSINESS_RULES_REGISTRY.md`

**Example Rule Migration:**
```typescript
// BEFORE (scattered across components)
// In VehicleMarketplace.tsx:
const deposit = price * 0.15;

// In InvoiceForm.tsx:
const deposit = price * 0.15;

// In CalculatorComponent.tsx:
const deposit = price * 0.15;

// AFTER (centralized in Phase 1B)
// src/lib/business-rules/pricing.ts
export function calculateDepositPercentage(): number {
  return 0.15; // 15% default
}

export function calculateDeposit(price: number): number {
  return price * calculateDepositPercentage();
}

// Then EVERYWHERE imports from the same place:
import { calculateDeposit } from '@/lib/business-rules/pricing';
const deposit = calculateDeposit(price); // Always the same
```

**Deliverable:** 
- `src/lib/business-rules/` folder with all rules
- `docs/BUSINESS_RULES_REGISTRY.md`
- Test suite with >80% coverage of rules

---

## Phase 2: WhatsApp-First Customer Experience (Week 4-7)

Once Phase 1A+1B are complete, immediately start Phase 2 using:

```typescript
// WhatsApp registration uses centralized pricing rules
import { calculateDeposit } from '@/lib/business-rules/pricing';

export async function handleRegistrationMessage(message) {
  // Customer asks about vehicle pricing
  // Rule lookup (centralized):
  const deposit = calculateDeposit(vehiclePrice);
  
  // Send WhatsApp reply
  await sendTemplateMessage(phone, 'pricing_info', { deposit });
}
```

**Why this order works:**
- Pricing rules are centralized (Phase 1B)
- WhatsApp handlers can query rules directly
- No business logic is duplicated in WhatsApp code
- Future changes to rules automatically flow through WhatsApp

**Full Phase 2 Deliverables:**
- WhatsApp registration flow (< 90 seconds)
- WhatsApp login with OTP
- Order status notifications via WhatsApp
- Support inbox in ops dashboard
- Message templates registered with Meta
- Database schema for messages and sessions
- End-to-end testing

See: `docs/WHATSAPP_INTEGRATION_STRATEGY.md` for complete details

---

## Phase 1C-E: Wrap Up & Testing (Week 8-10)

After Phase 2 completes, return to Phase 1 to finish:

**Phase 1C:** Create comprehensive documentation
- `ARCHITECTURE.md`
- `AUTH_AND_SECURITY.md`
- `DATABASE_SCHEMA.md`
- `DEPLOYMENT.md`

**Phase 1D:** Build testing baseline
- Business rule tests (expanded from Phase 1B)
- Workflow tests (including WhatsApp workflows)
- Smoke test checklist (updated for WhatsApp)

**Phase 1E:** Security review & validation

**Deliverable:** Complete Phase 1 documentation and test suite

---

## The Real Implementation Plan (DETAILED)

### ⏰ PHASE 1A: Product Scope (Days 1-3)

**Before starting Phase 1B, answer these questions:**

1. Marketing domain:
   - What content lives here? (Hero, testimonials, vehicle gallery, financing calculator)
   - What data flows in? (Vehicle catalog, contact leads)
   - What triggers? (User clicks "View Vehicle", "Calculate Financing", "Contact Us")

2. Sales domain:
   - What is the sales process? (Browse → Select → Add to Quote → Checkout → Payment)
   - What business rules apply? (Deposit calculation, financing approval, inventory checks)
   - What systems must integrate? (Payment, Financing, Inventory)

3. Ops domain:
   - What is the operations workflow? (Receive order → Inspect vehicle → Clear customs → Deliver)
   - What business rules? (Status transitions, approval thresholds, audit requirements)
   - What can staff do? (Approve customer, create invoice, record payment, generate reports)

4. Business Config domain:
   - What rules must be centralized? (Pricing, financing terms, approval thresholds)
   - Who can change them? (Super admin only)
   - What impact do changes have? (Marketing calculator, sales flows, reporting)

**Deliverable:** Create these documents:

```markdown
# docs/PRODUCT_SCOPE.md
## Marketing Domain
- **Purpose:** Customer discovery and education
- **Boundaries:** Public-facing only, no customer data collection except leads
- **Business Rules:** None (showcasing, not enforcing)
- **Data Flow:** Read-only access to vehicle catalog, financing templates

## Sales Domain
- **Purpose:** Convert interest into orders
- **Boundaries:** Customer-facing, order creation
- **Business Rules:** Deposit calculation, financing approval, inventory reservation
- **Data Flow:** Read vehicle data, create orders, call financing API

## Ops Domain
- **Purpose:** Fulfill orders and manage operations
- **Boundaries:** Staff-only, operational decisions
- **Business Rules:** Status transitions, approval workflows, audit logging
- **Data Flow:** Full CRUD on orders, staff actions logged

## Business Config Domain
- **Purpose:** Central source of truth for all rules
- **Boundaries:** Super admin only
- **Business Rules:** All pricing, financing, approval, lifecycle rules
- **Data Flow:** Read by all, write by super admin only
```

```markdown
# docs/OWNERSHIP_MATRIX.md
| Feature | Owner | Contributors | Status |
|---------|-------|--------------|--------|
| Vehicle Marketplace | Marketing | Sales | Stable |
| Financing Calculator | Sales | Business Config | Stable |
| Customer Registration | Sales | Ops | Needs WhatsApp |
| Invoice Management | Ops | Business Config | Stable |
| Approval Workflows | Ops | Business Config | Stable |
| Business Rules | Business Config | All | To be centralized |
```

**Time:** 2-3 days  
**Start:** Immediately after Phase 0  
**Success Criteria:** All domains clearly defined, no overlapping responsibilities

---

### ⏰ PHASE 1B: Centralize Business Rules (Days 4-18)

**Step 1: Inventory existing rules (Days 4-5)**

Run this grep search across the codebase:
```
pricing | deposit | financing | approval | threshold | status | transition | reserve | margin | tenure | interest
```

Document every place a business rule is mentioned. Example output:
```
File: src/lib/money.ts (line 12)
- Rule: deposit = price * 0.15
- Current use: VehicleMarketplace, CalculatorComponent, InvoiceForm
- Centralize as: calculateDeposit(price)

File: src/app/api/invoices/route.ts (line 45)
- Rule: approval needed if > ₦10M
- Current use: Manual check in API handler
- Centralize as: requiresApproval(invoiceAmount)
```

**Step 2: Create business-rules folder (Days 5-7)**

```typescript
// src/lib/business-rules/index.ts
export * from './pricing';
export * from './financing';
export * from './vehicle-lifecycle';
export * from './approvals';
export * from './invoice-payment';
export * from './warranty';

// src/lib/business-rules/pricing.ts
/**
 * Pricing rules for DMECH vehicles
 * All pricing logic must go through these functions
 */

export function getDefaultDepositPercentage(): number {
  // Get from database or config, not hardcoded
  return 0.15; // 15%
}

export function calculateDeposit(vehiclePrice: number, vehicleType?: string): number {
  const percentage = getDefaultDepositPercentage();
  return vehiclePrice * percentage;
}

export function calculateReserveFund(invoiceTotal: number): number {
  // Reserve fund is 5% of invoice total
  return invoiceTotal * 0.05;
}

export function calculateMargin(costPrice: number, salePrice: number): {
  percentage: number;
  amount: number;
} {
  const amount = salePrice - costPrice;
  const percentage = (amount / salePrice) * 100;
  return { percentage, amount };
}

// src/lib/business-rules/financing.ts
export interface FinancingOption {
  tenor_months: number;
  interest_rate: number;
  max_price: number;
  min_deposit_percentage: number;
}

export function getAvailableFinancingOptions(): FinancingOption[] {
  return [
    { tenor_months: 12, interest_rate: 0.08, max_price: 5_000_000, min_deposit_percentage: 0.15 },
    { tenor_months: 24, interest_rate: 0.10, max_price: 10_000_000, min_deposit_percentage: 0.20 },
    { tenor_months: 36, interest_rate: 0.12, max_price: 15_000_000, min_deposit_percentage: 0.25 },
  ];
}

export function calculateMonthlyPayment(
  principal: number,
  interestRate: number,
  tenor_months: number
): number {
  // Standard amortization formula
  const monthlyRate = interestRate / 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenor_months)) /
    (Math.pow(1 + monthlyRate, tenor_months) - 1)
  );
}

export function canApproveFinancing(
  customerProfile: { approved_limit: number },
  requestAmount: number,
  vehiclePrice: number
): boolean {
  // Business rule: customer can finance up to their approved limit
  return requestAmount <= customerProfile.approved_limit;
}

// src/lib/business-rules/vehicle-lifecycle.ts
export type VehicleStatus = 
  | 'available'
  | 'reserved'
  | 'sold'
  | 'in_transit'
  | 'in_customs'
  | 'delivered';

export const VALID_STATUS_TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
  'available': ['reserved', 'sold'],
  'reserved': ['available', 'sold', 'in_transit'],
  'in_transit': ['in_customs', 'delivered'],
  'in_customs': ['delivered'],
  'sold': [], // Terminal state
  'delivered': [], // Terminal state
};

export function canTransition(from: VehicleStatus, to: VehicleStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getStatusLabel(status: VehicleStatus): string {
  const labels: Record<VehicleStatus, string> = {
    'available': '✅ Available',
    'reserved': '🔒 Reserved',
    'sold': '✅ Sold',
    'in_transit': '🚚 In Transit',
    'in_customs': '🛂 Customs Clearance',
    'delivered': '🎉 Delivered',
  };
  return labels[status];
}

// src/lib/business-rules/approvals.ts
export interface ApprovalThreshold {
  role: string;
  max_amount: number;
  can_approve_customer: boolean;
  can_approve_financing: boolean;
}

export const APPROVAL_THRESHOLDS: ApprovalThreshold[] = [
  {
    role: 'it_manager',
    max_amount: 1_000_000, // ₦1M
    can_approve_customer: false,
    can_approve_financing: false,
  },
  {
    role: 'ops_manager',
    max_amount: 5_000_000, // ₦5M
    can_approve_customer: true,
    can_approve_financing: true,
  },
  {
    role: 'managing_partner',
    max_amount: Infinity,
    can_approve_customer: true,
    can_approve_financing: true,
  },
];

export function canApprove(
  userRole: string,
  amount: number,
  type: 'customer' | 'financing'
): boolean {
  const threshold = APPROVAL_THRESHOLDS.find(t => t.role === userRole);
  if (!threshold) return false;
  
  if (amount > threshold.max_amount) return false;
  
  if (type === 'customer') return threshold.can_approve_customer;
  if (type === 'financing') return threshold.can_approve_financing;
  
  return false;
}
```

**Step 3: Refactor components to use rules (Days 8-14)**

Replace all hardcoded values:
```typescript
// BEFORE
const deposit = price * 0.15;

// AFTER
import { calculateDeposit } from '@/lib/business-rules/pricing';
const deposit = calculateDeposit(price);
```

Update forms to use rule definitions:
```typescript
// BEFORE
const options = [
  { tenor: 12, rate: 0.08 },
  { tenor: 24, rate: 0.10 },
];

// AFTER
import { getAvailableFinancingOptions } from '@/lib/business-rules/financing';
const options = getAvailableFinancingOptions();
```

**Step 4: Write rule tests (Days 15-18)**

```typescript
// tests/business-rules/pricing.test.ts
import { calculateDeposit, calculateMargin } from '@/lib/business-rules/pricing';

describe('Pricing Rules', () => {
  test('calculateDeposit returns 15% of price', () => {
    expect(calculateDeposit(1_000_000)).toBe(150_000);
  });

  test('calculateMargin calculates correctly', () => {
    const { percentage, amount } = calculateMargin(8_000_000, 10_000_000);
    expect(amount).toBe(2_000_000);
    expect(percentage).toBeCloseTo(20);
  });
});

// tests/business-rules/vehicle-lifecycle.test.ts
import { canTransition, VALID_STATUS_TRANSITIONS } from '@/lib/business-rules/vehicle-lifecycle';

describe('Vehicle Lifecycle Rules', () => {
  test('Available vehicle can be reserved', () => {
    expect(canTransition('available', 'reserved')).toBe(true);
  });

  test('Sold vehicle cannot transition anywhere', () => {
    Object.values(VALID_STATUS_TRANSITIONS['sold']).forEach(status => {
      expect(canTransition('sold', status)).toBe(false);
    });
  });

  test('Cannot jump directly from in_transit to delivered without customs', () => {
    // Customs clearance is required
    expect(canTransition('in_transit', 'delivered')).toBe(false);
    expect(canTransition('in_customs', 'delivered')).toBe(true);
  });
});
```

**Deliverable:** 
- `src/lib/business-rules/` with 6+ modules
- All existing business logic moved to rules
- `docs/BUSINESS_RULES_REGISTRY.md` documenting all rules
- Test suite with >80% coverage

**Success Criteria:**
- No hardcoded business values in components
- Same rule tested and produces same result everywhere
- Rules are versioned and can be updated from admin panel

---

### ⏰ PHASE 2: WhatsApp-First Integration (Weeks 4-7)

**With Phase 1B complete, implement Phase 2:**

**Week 4: Setup & Webhooks**
- Set up Meta Cloud API account
- Create webhook infrastructure
- Deploy webhook to production
- Test webhook verification with Meta

**Week 5: Auth Flow**
- Implement WhatsApp OTP system
- Build WhatsApp login page
- Test registration and authentication

**Week 6: Notifications**
- Register message templates with Meta
- Hook up order notifications using centralized rules
- Build notification queue processor
- Test end-to-end order flow

**Week 7: Support & Polish**
- Build ops WhatsApp inbox
- Implement two-way messaging
- Testing and optimization

**See:** `docs/WHATSAPP_INTEGRATION_STRATEGY.md` for complete implementation details

---

### ⏰ PHASE 1C-E: Complete Phase 1 (Weeks 8-10)

After Phase 2, finish Phase 1:

**Phase 1C: Comprehensive Documentation**
- Architecture guide (including WhatsApp)
- Auth & security documentation
- Database schema with WhatsApp tables
- Deployment procedures
- Operations runbook

**Phase 1D: Testing**
- Complete test suite (including WhatsApp workflows)
- Smoke test checklist (updated)
- Performance benchmarks

**Phase 1E: Security Review**
- Review all centralized business rules for security
- Validate WhatsApp webhook security
- RLS policy audit

---

## Why This Order?

### Advantages of Phase 1A+1B → Phase 2 → Phase 1C-E

1. **Foundation First:** Business rules must be centralized before WhatsApp uses them
2. **High Impact:** Phase 2 creates customer value immediately
3. **Better Code:** WhatsApp integration is cleaner when using centralized rules
4. **Documentation Last:** Document the system once it's fully built (Phase 1C-E)
5. **Risk Mitigated:** Rules are tested before WhatsApp relies on them

### What Gets Done When

```
Week 1:  Phase 0 ✅ Complete
Week 2-3: Phase 1A+1B (Rules Foundation) ⏳
Week 4-7: Phase 2 (WhatsApp Integration) ⏳
Week 8-10: Phase 1C-E (Documentation Wrap-up) ⏳
Week 11+: Phase 3 (UX Clarity) ⏳
```

---

## Next Action: Start Phase 1A

**Do this now:**

1. Create `docs/PRODUCT_SCOPE.md` (reference the template above)
2. Create `docs/OWNERSHIP_MATRIX.md` (reference the template above)
3. Have team review and agree on domain boundaries
4. Once approved → Start Phase 1B (business rules)

**Time to start Phase 1A:** 2-3 hours today  
**Expected completion:** End of this week  
**Estimated Phase 1B completion:** Week 3  
**Phase 2 kickoff:** Week 4

---

## Exit Criteria Before Phase 2

✅ Phase 1A: Product scope defined and agreed  
✅ Phase 1B: All business rules centralized  
✅ Phase 1B: Business rules tested (>80% coverage)  
✅ Phase 1B: No hardcoded business values in components  
✅ Team trained on how to use centralized rules  

Then: **Full speed into Phase 2 WhatsApp integration!**

