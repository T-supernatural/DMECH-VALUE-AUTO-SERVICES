# DMECH Product Modernization & Stabilization Roadmap

## Goal

Protect the current working app, improve the foundation in priority order, and roll out each upgrade in controlled phases without breaking the existing structure.

This document organizes the work into phases and sub-phases based on priority, necessity, and risk.

---

## Phase 0 — Stabilize and protect the current app

### Objective

Before changing business logic or user experience, preserve the current working system and identify what must not be touched.

### What to do

- Audit the current stable flows
- Mark existing working features as protected
- Define a no-go list for broad rewrites
- Identify areas that must be isolated before modification
- Confirm the current build state and baseline behavior
- Create a risk log for anything likely to break

### Key principle

Do not broaden scope. Do not rewrite working features. Add only what is required to stabilize and protect the current structure.

### Phase 0 exit criteria

- Current app build is known and stable
- Critical working flows are identified
- Protected areas are documented
- No change is made outside the current phase scope

---

## Phase 1 — Foundation: product rules and governance

### 1A. Tighten product scope

#### Objective

Define the real product boundaries and separate responsibilities clearly.

#### What to do

- Decide whether the project is primarily:
  - marketing + sales platform
  - internal operations system
  - full business-management platform
  - or a hybrid with clear boundaries
- Define clear ownership for each domain:
  - marketing
  - sales
  - operations
  - business configuration
  - customer flow
- Separate concerns so that one domain does not secretly own another

#### Why it matters

Without clear product boundaries, engineering is forced to guess where features belong, which causes messy logic and unpredictable changes.

#### Exit criteria

- Clear domain boundaries exist
- Each feature belongs to one primary owner/domain
- No ambiguity about whether a feature is public-facing or ops-facing

---

### 1B. Centralize business rules

#### Objective

Put all critical business rules in one source of truth.

#### What to do

- Define a single place for business rules and defaults
- Centralize:
  - deposit percentages
  - financing defaults
  - approval logic
  - vehicle lifecycle state transitions
  - invoice and payment logic
  - stock and status transitions
- Replace scattered or duplicate decision logic with shared rule definitions

#### Why it matters

Multiple screens using different logic is dangerous and makes the product unreliable.

#### Exit criteria

- Business rules are defined in one shared layer
- Core calculations match across app screens
- Status transitions are consistent and auditable
- No ad hoc logic is duplicated across components/routes

---

### 1C. Create documentation structure

#### Objective

Build a proper documentation system that is separated by concern.

#### What to do

Create a docs folder with separate files/folders such as:

- docs/
  - architecture/
  - business-rules/
  - auth-and-security/
  - deployment/
  - environment/
  - migrations/
  - testing/
  - user-flows/

Document:

- app architecture
- key route structure
- business domains
- auth model
- user roles and permissions
- DB overview
- environment setup
- deployment steps
- rollback plan
- migration process
- production troubleshooting notes

#### Why it matters

This reduces risk, speeds onboarding, and keeps the project maintainable as it grows.

#### Exit criteria

- A readable docs structure exists
- Setup and deployment are documented
- Business rules and architecture are documented
- New developers can understand the project without needing tribal knowledge

---

### 1D. Build a testing baseline for core business flows

#### Objective

Improve reliability before adding more product complexity.

#### What to do

Add tests around the most important workflows, such as:

- financing calculations
- vehicle intake and lifecycle
- approval logic
- invoice and payment flows
- order and customer flows
- vehicle photo and status updates

#### Why it matters

UI polish means nothing if the process logic is wrong. Real business failures come from bad workflow logic, not just bad styling.

#### Exit criteria

- Core workflows are under test
- High-risk business logic is protected
- Existing app remains functional while new tests are added

---

### 1E. Security review and validation

#### Objective

Validate the operational security foundation before code complexity increases.

#### What to do

Review and confirm:

- auth flow
- staff role boundaries
- RLS enforcement
- service-role usage
- storage policy protection
- audit trail for sensitive changes
- sensitive config update protection

#### Why it matters

This is a business-critical app that manages real customer and operational data.

#### Exit criteria

- No critical access-control gaps are found
- Sensitive workflows are protected and documented
- Security checks are recorded and reviewed

---

## Phase 2 — Customer experience overhaul and WhatsApp-first engagement

### 2A. Restructure customer auth and onboarding flow

#### Objective

Improve the weak customer dashboard and identity flow while keeping the existing structure stable.

#### What to do

- Rework customer onboarding around a simpler journey
- Make WhatsApp the primary communication and customer engagement channel
- Keep the app as the ordering and browsing layer
- Remove friction that slows down customer sign-up and activation

#### Why it matters

A customer should not have to fight a heavy formal process before buying or tracking something.

#### Exit criteria

- Onboarding is simpler and clearer
- Returning customer recognition is easier
- Customer flow is mobile-first and WhatsApp-friendly

---

### 2B. Remove or soften unnecessary formal verification friction

#### Objective

Reduce heavy verification steps that are not necessary for the business flow.

#### What to do

- Reduce unnecessary email-first friction
- Remove or soften rigid verification steps that are not aligned with the product use case
- Keep only essential purchase and service validation
- Prioritize WhatsApp-based communication and trust signals

#### Why it matters

High-friction identity checks reduce conversion and create unnecessary customer drop-off.

#### Exit criteria

- Customers can get started faster
- The order journey is less bureaucratic
- The process still protects legitimate sales and service work

---

### 2C. Build WhatsApp-integrated customer layer

#### Objective

Use WhatsApp as the main customer communication and service layer, without disrupting the app.

#### What to do

- Integrate customer communication via WhatsApp for order updates, support, and follow-up
- Allow customer service to happen through WhatsApp instead of forcing email-heavy flows
- Support order tracking and returning customer recognition
- Keep the app as the operational interface, and WhatsApp as the engagement layer

#### Why it matters

This is more natural for the target customer base and improves customer trust and speed.

#### Exit criteria

- WhatsApp is clearly part of the customer journey
- Customers can track or follow up without friction
- Order communication is easier and more responsive

---

### 2D. Refine the customer dashboard structure

#### Objective

Build a practical customer dashboard instead of a crowded or incomplete one.

#### What to do

- Focus on the real needs of customers:
  - my orders
  - my vehicles
  - service updates
  - financing status
  - delivery/tracking info
  - WhatsApp access
- Remove unnecessary formal administrative sections until the user flow is proven

#### Why it matters

A dashboard should help the customer do things, not overwhelm them.

#### Exit criteria

- Customer dashboard is useful and clear
- Main actions are visible and easy to reach
- Customers can understand their status without confusion

---

## Phase 3 — UX clarity and operational consistency

### 3A. Fix the compare feature UX

#### Objective

Make vehicle comparison obvious, understandable, and useful.

#### What to do

- Show clearly when a vehicle is selected
- Guide the user to select more than one item before comparing
- Make the comparison action obvious and contextual
- Reduce ambiguity in the compare interaction

#### Why it matters

Users should never wonder what they are comparing or why the feature is there.

#### Exit criteria

- The selection state is obvious
- The compare flow is intuitive
- Users can understand the next step without explanation

---

### 3B. Simplify actions and reduce hidden logic

#### Objective

Make user interactions clearer and more direct.

#### What to do

- Improve button labels and action wording
- Show what is selected and what the user should do next
- Reduce unexpected behavior behind buttons
- Simplify forms and action sequences

#### Why it matters

Users should not have to guess what a button does.

#### Exit criteria

- Control labels are explicit
- User flows are easier to follow
- Fewer hidden interactions remain

---

### 3C. Improve operations consistency

#### Objective

Standardize statuses, transitions, validation, and language across the ops system.

#### What to do

- Standardize status names and status transitions
- Review required field rules
- Align validation behavior across forms
- Make internal language consistent and predictable

#### Why it matters

Operational confusion leads to bad decisions and poor data quality.

#### Exit criteria

- Same status names are used consistently
- Internal flows behave predictably
- Form rules are coherent across modules

---

## Phase 4 — Measurement and management dashboards

### Objective

Improve business decision-making after the foundational system is stable.

### What to do

- Add sales conversion tracking
- Add financing conversion metrics
- Add order and customer flow measurement
- Add service booking tracking
- Add ops productivity metrics
- Track stock movement and aging

### Why it matters

Without metrics, it is difficult to improve the business intelligently.

### Exit criteria

- Teams can see meaningful metrics
- Dashboards reflect real business performance
- Decision-making improves based on data

---

## Phase 5 — Trust and customer-facing confidence features

### Objective

Strengthen trust with customers after the operating foundation is stable.

### What to do

- Add certification trust elements
- Clarify financing and guarantee explanations
- Improve transparency around process and status
- Add customer-facing reassurance content that matches the real business workflow

### Why it matters

Customers buy with confidence, not just with interest.

### Exit criteria

- The front-end communicates trust clearly
- Marketing and sales messages match actual operational reality

---

## Phase 6 — Product polish and maturity improvements

### Objective

Prepare the product for long-term scaling and repeated use after the core platform is stable.

### What to do

- Refine workflows based on production usage
- Improve clarity and trust across public and internal surfaces
- Tune performance and UX based on actual feedback
- Continue strengthening quality and consistency

### Why it matters

After the foundation is stable, the project can become a mature system instead of a growing collection of disconnected improvements.

### Exit criteria

- Product is consistent, understandable, and business-ready
- Fewer operational problems remain
- The project becomes easier to scale and maintain

---

## Implementation strategy

### Rule 1: Do not skip phases
Each phase must be validated before moving to the next one.

### Rule 2: Do not rewrite working parts
Existing features remain protected unless they are directly part of the current phase.

### Rule 3: Test before moving on
Every phase must pass:

- build check
- targeted tests
- smoke test of key flows
- regression review of unchanged workflows

### Rule 4: Keep existing structure intact
Changes should be additive or isolated, not destructive.

---

## Recommended order of execution

1. Phase 0
2. Phase 1A
3. Phase 1B
4. Phase 1C
5. Phase 1D
6. Phase 1E
7. Phase 2A
8. Phase 2B
9. Phase 2C
10. Phase 2D
11. Phase 3A
12. Phase 3B
13. Phase 3C
14. Phase 4
15. Phase 5
16. Phase 6

This sequence keeps the project stable while prioritizing the most important technical and operational risks first.
