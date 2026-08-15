# Phase 0A: Current Working Flows Documentation

**Date:** 2026-08-15  
**Status:** IN PROGRESS  
**Purpose:** Catalog all currently stable features and protect them from breakage

---

## Marketing Routes (Public)

| Route | Status | Purpose | Notes |
|-------|--------|---------|-------|
| `/` | ✅ STABLE | Home page with hero, features, testimonials | Identity hero, capability band |
| `/about` | ✅ STABLE | About DMECH brand and history | Public-facing trust page |
| `/service` | ✅ STABLE | Service offerings (diagnostic, EV, certification) | Multiple service pages |
| `/service/[slug]` | ✅ STABLE | Detailed service pages | Dynamically routed |
| `/vehicles` | ✅ STABLE | Vehicle marketplace browsing | Compare feature, filtering |
| `/vehicles/certified` | ✅ STABLE | Certified Nigerian-used vehicles | Specialized listing |
| `/vehicles/sourcing/[id]` | ✅ STABLE | Sourcing listing detail pages | With gallery |
| `/vehicles/request` | ✅ STABLE | Request vehicle form | Lead capture |
| `/sales` | ✅ STABLE | Sales funnel page | Gateway to marketplace |
| `/financing` | ✅ STABLE | Financing explanation and calculator | Key conversion page |
| `/contact` | ✅ STABLE | Contact form | Lead capture |
| `/faq` | ✅ STABLE | Frequently asked questions | Trust-building content |
| `/login` | ✅ STABLE | Customer/staff login | Email-based auth |
| `/register` | ✅ STABLE | Customer registration | Lead capture |
| `/auth/callback` | ✅ STABLE | OAuth callback handler | Supabase auth |

### Marketing Features

- Vehicle marketplace with filtering and compare
- Financing calculator
- Service booking integration
- Lead capture (vehicle requests, contact forms)
- Dark/light theme support
- Responsive mobile design
- Ticker/announcements bar

---

## Customer Portal Routes

| Route | Status | Purpose | Notes |
|-------|--------|---------|-------|
| `/portal/page.tsx` | ⚠️ PARTIAL | Customer dashboard redirect | Mostly landing |
| `(portal)/dashboard` | ⚠️ PARTIAL | Customer dashboard | Needs WhatsApp redesign |
| `(portal)/payments` | ⚠️ PARTIAL | Payment tracking | Under development |
| `(portal)/documents` | ⚠️ PARTIAL | Customer documents | Under development |

### Customer Features

- Customer authentication
- Order/vehicle tracking (partial)
- Document upload (partial)
- MFA enrollment

### Known Issues

- Dashboard is minimal
- No WhatsApp integration
- Heavy email verification (to be removed)
- Limited customer action

---

## Ops/Admin Routes (Protected)

### Main Sections

| Section | Routes | Status | Purpose |
|---------|--------|--------|---------|
| **Overview** | `/ops/dashboard` | ✅ STABLE | Main ops dashboard |
| **Customers** | `/ops/customers`, `/ops/customers/[id]` | ✅ STABLE | Customer list, detail, approval |
| **Vehicles** | `/ops/vehicles`, `/ops/vehicles/new`, `/ops/vehicles/[id]` | ✅ STABLE | Full vehicle lifecycle management |
| **Parts** | `/ops/parts`, `/ops/parts/[id]` | ✅ STABLE | Parts inventory |
| **Workshop** | `/ops/workshop`, `/ops/workshop/[id]` | ✅ STABLE | Job cards, scheduling |
| **Invoices** | `/ops/invoices`, `/ops/invoices/[id]` | ✅ STABLE | Invoice management, PDF export |
| **Receipts** | `/ops/receipts` | ✅ STABLE | Payment receipts |
| **Payments** | `/api/payments` | ✅ STABLE | Payment processing API |
| **Shipments** | `/ops/shipments`, `/ops/shipments/[id]` | ✅ STABLE | Logistics tracking |
| **Customs** | `/ops/customs`, `/ops/customs/[id]` | ✅ STABLE | Import/customs clearance |
| **Warranty Claims** | `/ops/warranty-claims`, `/ops/warranty-claims/[id]` | ✅ STABLE | Warranty processing |
| **Sourcing** | `/ops/sourcing`, `/ops/pre-orders` | ✅ STABLE | Sourcing catalog, pre-orders |
| **Reports** | `/ops/reports/*` | ✅ STABLE | Business reporting |
| **Settings** | `/ops/settings/*` | ✅ STABLE | Platform config, staff, audit |

### Ops Features

- Role-based access control (super_admin, managing_partner, ops_manager, etc.)
- Multi-factor authentication (TOTP)
- Audit logging
- Password management
- Document upload
- Photo management (HEIC support)
- PDF generation for invoices
- Real-time dashboard updates
- Stock photo galleries

### Known Issues

- Some settings are admin-only, not role-flexible
- Photo upload can be slow
- Limited dashboard customization

---

## API Routes (Backend)

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/api/auth/*` | POST | ✅ STABLE | Authentication endpoints |
| `/api/customers/[id]/*` | GET/POST/PATCH | ✅ STABLE | Customer operations |
| `/api/vehicles/[id]/*` | GET/POST/PATCH | ✅ STABLE | Vehicle operations |
| `/api/invoices/[id]/*` | GET/POST/PATCH | ✅ STABLE | Invoice operations |
| `/api/payments/[id]/*` | GET/POST/PATCH | ✅ STABLE | Payment operations |
| `/api/shipments/*` | GET/POST/PATCH | ✅ STABLE | Shipment operations |
| `/api/customs/*` | GET/POST/PATCH | ✅ STABLE | Customs operations |
| `/api/workshop/*` | GET/POST/PATCH | ✅ STABLE | Workshop operations |
| `/api/parts/*` | GET/POST/PATCH | ✅ STABLE | Parts operations |
| `/api/calculator` | POST | ✅ STABLE | Finance calculation |
| `/api/service/booking` | POST | ✅ STABLE | Service booking |

---

## Database Schema (Stable Tables)

| Table | Status | Purpose | Records |
|-------|--------|---------|---------|
| `auth.users` | ✅ STABLE | Supabase auth | Staff + customer accounts |
| `public.users` | ✅ STABLE | App user profiles | Full user data |
| `public.vehicles` | ✅ STABLE | Vehicle inventory | All vehicles |
| `public.customers` | ✅ STABLE | Customer records | All customers |
| `public.invoices` | ✅ STABLE | Invoices | Financial records |
| `public.payments` | ✅ STABLE | Payments | Payment records |
| `public.parts` | ✅ STABLE | Parts inventory | Spare parts |
| `public.workshop_jobs` | ✅ STABLE | Workshop cards | Service records |
| `public.shipments` | ✅ STABLE | Logistics | Shipment tracking |
| `public.customs` | ✅ STABLE | Import clearance | Customs records |
| `public.platform_config` | ✅ STABLE | Business settings | Operating rules |
| `public.audit_log` | ✅ STABLE | Audit trail | Sensitive actions |

---

## Authentication & Access Control

| Feature | Status | Details |
|---------|--------|---------|
| Email/password auth | ✅ STABLE | Supabase-based |
| MFA (TOTP) | ✅ STABLE | Google Authenticator compatible |
| OAuth callback | ✅ STABLE | Supabase integration |
| Session management | ✅ STABLE | Server + browser |
| RLS (Row-Level Security) | ✅ STABLE | Enforced on sensitive tables |
| Staff roles | ✅ STABLE | 8 role types with different access |
| Permission gating | ✅ STABLE | API and page-level checks |

---

## Key Libraries & Dependencies

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Next.js | 16.2.10 | Framework | ✅ Current |
| React | 19.2.4 | UI library | ✅ Current |
| TypeScript | ^5 | Type safety | ✅ Current |
| Supabase | ^2.110.2 | Backend/DB | ✅ Current |
| Lucide React | ^1.24.0 | Icons | ✅ Current |
| React PDF | ^4.5.1 | PDF generation | ✅ Current |
| HEIC to Any | ^0.0.4 | Image conversion | ✅ Current |

---

## Known Stability Issues

| Issue | Severity | Impact | Status |
|-------|----------|--------|--------|
| Build dependency on Google Fonts network | MEDIUM | Build can fail without internet | ⚠️ NEEDS FIX |
| Photo uploads slow on large files | MEDIUM | UX delay | ⚠️ KNOWN |
| Dashboard middleware deprecation warning | LOW | Non-critical, just warning | ⚠️ KNOWN |
| Some customer flows incomplete | MEDIUM | Portal needs work | ⚠️ IN PROGRESS |

---

## Smoke Test Verification (Manual)

- [ ] Marketing site loads and renders all pages
- [ ] Customer can login via email/password
- [ ] Staff can login and access dashboard
- [ ] MFA flow works (TOTP)
- [ ] Vehicle can be created and displayed
- [ ] Customer can browse vehicles
- [ ] Compare feature works (select 2+ and compare)
- [ ] Invoice can be created and exported to PDF
- [ ] Payment can be recorded
- [ ] No console errors on key pages
- [ ] Responsive design works on mobile

---

## Next Steps (Phase 0B)

This document will be updated as Phase 0 progresses:
1. Identify protected zones (routes that must not break)
2. Set up test environment properly
3. Create baseline test suite
4. Tag stable state in git

