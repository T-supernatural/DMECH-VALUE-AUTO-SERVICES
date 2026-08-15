# Phase 0D: Smoke Test Checklist

**Date:** 2026-08-15  
**Status:** IN PROGRESS  
**Purpose:** Define critical flows to verify before each release/phase completion

---

## How to Use This Checklist

1. Start the dev server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Run through each section in order
4. Check off each item as you verify
5. Note any failures or unexpected behavior
6. DO NOT mark as complete until all items pass

**Time to run:** ~20 minutes (first time) / ~10 minutes (subsequent)

---

## Setup

**Before starting:**
- [ ] Dev server running (`npm run dev`)
- [ ] Browser console open (F12 → Console tab)
- [ ] No console errors visible
- [ ] Database is up (can access `/ops/dashboard` if logged in as staff)

---

## Section 1: Marketing Site (Public)

### 1.1 Home Page

- [ ] Homepage loads at `http://localhost:3000`
- [ ] Hero section displays with image
- [ ] "What We Do" capabilities are visible
- [ ] Dark mode toggle works
- [ ] No console errors

**Expected:** Page loads in <2 seconds, smooth hero animation

### 1.2 Navigation & Pages

- [ ] Navbar appears at top
- [ ] Links work: About, Service, Vehicles, Financing, Contact, FAQ
- [ ] Each page loads completely
- [ ] Mobile nav works (click hamburger on small screen)
- [ ] No 404 errors

**Expected:** All links navigate correctly

### 1.3 Ticker/Announcements

- [ ] Announcements ticker appears below navbar
- [ ] Text scrolls smoothly (not jerky)
- [ ] Messages are readable
- [ ] No console errors

**Expected:** Smooth marquee animation, no flicker

### 1.4 Vehicles Marketplace

- [ ] Navigate to `/vehicles`
- [ ] Vehicle list loads
- [ ] Vehicles display with images
- [ ] Filter options appear
- [ ] Sorting works (price, year, mileage)

**Expected:** List loads with 10+ vehicles, filtering works

### 1.5 Vehicle Compare Feature

- [ ] Click "Compare" on first vehicle → appears in floating bar
- [ ] Select second vehicle → modal auto-opens (or show "compare" button)
- [ ] Compare modal shows both vehicles side-by-side
- [ ] Comparison is accurate (same fields for both)
- [ ] Remove button removes from comparison
- [ ] Can select up to 3 vehicles

**Expected:** Compare UX is smooth, modal shows clear differences

### 1.6 Vehicle Detail

- [ ] Click on vehicle in list → detail page loads
- [ ] Shows full gallery
- [ ] Specifications display
- [ ] Pricing is visible
- [ ] "Add to Quote" or similar action works

**Expected:** Detail page loads in <2 seconds

### 1.7 Finance Calculator

- [ ] Navigate to `/financing`
- [ ] Calculator loads
- [ ] Enter price, down payment, tenor
- [ ] Calculation updates in real-time
- [ ] Results are correct (verify math manually)

**Expected:** Calculator is responsive, results update instantly

### 1.8 Forms & Lead Capture

- [ ] Contact form (`/contact`) loads
- [ ] Fill in name, email, message
- [ ] Submit form
- [ ] Success message appears
- [ ] No errors in console

**Expected:** Form submits without errors

---

## Section 2: Authentication

### 2.1 Login Page

- [ ] Navigate to `/login`
- [ ] Page loads
- [ ] Email and password fields appear
- [ ] "Forgot password" link is visible
- [ ] "Register" link works

**Expected:** Login form is complete and accessible

### 2.2 Registration Flow

- [ ] Click "Register" or go to `/register`
- [ ] Registration form loads
- [ ] All required fields are visible
- [ ] Can enter: name, email, phone, password
- [ ] Validation works (try invalid email)
- [ ] Submit button works

**Expected:** Form validates correctly

### 2.3 Auth Error Handling

- [ ] Try login with wrong email → error message
- [ ] Try login with wrong password → error message
- [ ] Try register with existing email → error message
- [ ] Error messages are clear

**Expected:** Errors are user-friendly, not technical

---

## Section 3: Ops/Admin Portal (Protected)

### 3.1 Access Control

- [ ] Try to access `/ops/dashboard` without login → redirects to `/login`
- [ ] Login with valid ops account
- [ ] After login, redirects to `/ops/dashboard`
- [ ] Sidebar appears with nav items
- [ ] Logout works

**Expected:** Auth flow protects admin pages

### 3.2 Dashboard

- [ ] Dashboard loads
- [ ] Shows key metrics (if any)
- [ ] No errors on console
- [ ] All sections are visible

**Expected:** Dashboard renders cleanly

### 3.3 Customers Section

- [ ] Navigate to `/ops/customers`
- [ ] Customer list loads
- [ ] Can see customer name, status, contact info
- [ ] Click on customer → detail page loads
- [ ] Customer details are complete and accurate

**Expected:** Customer list loads with 5+ customers (if database has data)

### 3.4 Vehicles Section

- [ ] Navigate to `/ops/vehicles`
- [ ] Vehicle list loads (admin view, different from public)
- [ ] Can see more fields than public (VIN, cost, status)
- [ ] Click "New Vehicle" → form appears
- [ ] Form has all required fields
- [ ] Can create or edit vehicle

**Expected:** Ops vehicle view is complete

### 3.5 Invoices Section

- [ ] Navigate to `/ops/invoices`
- [ ] Invoice list loads
- [ ] Can see invoice number, customer, amount, status
- [ ] Click on invoice → detail page loads
- [ ] Can export to PDF (click export button)
- [ ] PDF is valid and downloadable

**Expected:** Invoice management works end-to-end

### 3.6 Payments Section

- [ ] Navigate to `/ops/payments` or payments section
- [ ] Payment list loads
- [ ] Can see payment info (customer, amount, date, status)
- [ ] Click to view payment details
- [ ] Can record a new payment (if form available)

**Expected:** Payment tracking works

### 3.7 MFA Verification

- [ ] Logout from admin
- [ ] Login again with ops account
- [ ] If MFA is enabled, should prompt for TOTP code
- [ ] Can scan QR code with authenticator app
- [ ] After entering code, login completes
- [ ] MFA is now enrolled on account

**Expected:** MFA flow is smooth and secure

---

## Section 4: Database & Data Integrity

### 4.1 Vehicle Consistency

- [ ] Create a test vehicle in ops
- [ ] Verify it appears in public marketplace
- [ ] Change vehicle status to "Sold"
- [ ] Verify it disappears from public (or appears with "Sold" badge)

**Expected:** Data flows correctly between public and ops

### 4.2 Invoice-Payment Matching

- [ ] Create an invoice for a customer in ops
- [ ] Record a payment against that invoice
- [ ] Verify invoice status changes to "Partial" or "Paid"
- [ ] Verify payment is linked to correct invoice
- [ ] Try to pay an already-paid invoice → error or warning

**Expected:** Payment reconciliation works correctly

### 4.3 Audit Logging

- [ ] Perform a sensitive action (create invoice, approve customer)
- [ ] Log in as super_admin
- [ ] Go to Settings → Audit Log
- [ ] Verify the action is logged with timestamp, user, action type
- [ ] Cannot delete audit log entries

**Expected:** Audit trail is complete and immutable

---

## Section 5: Error Handling & Edge Cases

### 5.1 Missing Data

- [ ] Try to access non-existent customer: `/ops/customers/999999`
- [ ] Should see "Not Found" or "Customer not found" message
- [ ] Should NOT see a 500 error or blank page

**Expected:** Graceful error message

### 5.2 Validation Errors

- [ ] Try to create invoice with no customer selected
- [ ] Should show "Customer is required" message
- [ ] Form should not submit

**Expected:** Client-side validation prevents bad submissions

### 5.3 Permission Errors

- [ ] Login as ops_manager (not managing_partner)
- [ ] Try to access `/ops/settings` (admin-only)
- [ ] Should show "Access Denied" or redirect to dashboard
- [ ] Should NOT crash or show a 500 error

**Expected:** Permission checks work correctly

### 5.4 Network Errors

- [ ] Simulate slow network (open DevTools → Throttling)
- [ ] Load a page → should still work, just slower
- [ ] No timeout errors
- [ ] Loading indicators appear (if implemented)

**Expected:** App handles slow networks gracefully

---

## Section 6: Performance & UX

### 6.1 Page Load Times

- [ ] Open DevTools → Network tab
- [ ] Load each major page
- [ ] Total page load should be <3 seconds
- [ ] No missing resources (no red 404s in Network tab)

**Expected:** Fast load times

### 6.2 Responsive Design

- [ ] Resize browser to mobile width (375px)
- [ ] All pages should be readable
- [ ] No horizontal scrolling needed
- [ ] Touch targets (buttons) are >44px tall
- [ ] Navigation should stack vertically

**Expected:** Mobile-friendly layout

### 6.3 Form Usability

- [ ] Fill out a form with keyboard only (no mouse)
- [ ] Tab through fields in logical order
- [ ] Tab highlights visible elements
- [ ] Enter submits form

**Expected:** Keyboard navigation works

---

## Section 7: Reporting & Special Features

### 7.1 PDF Export

- [ ] Create/view an invoice in ops
- [ ] Click "Export to PDF" or "Print"
- [ ] PDF downloads or opens
- [ ] PDF is readable and has all info (no missing data)
- [ ] Images/logos appear in PDF

**Expected:** PDF generation works correctly

### 7.2 Dark/Light Mode

- [ ] Toggle theme switcher (usually in navbar or footer)
- [ ] All pages should change to dark theme
- [ ] Text remains readable in both modes
- [ ] Images don't disappear
- [ ] Theme persists on page reload (if saved locally)

**Expected:** Theme toggle works smoothly

### 7.3 Mobile Photos

- [ ] In ops, try to upload vehicle photo
- [ ] Should accept JPG, PNG, HEIC
- [ ] Large files should compress or warn
- [ ] Photo should appear in preview after upload

**Expected:** Photo upload works across formats

---

## Section 8: Console & Developer Tools

### 8.1 Browser Console

- [ ] Open DevTools → Console tab
- [ ] Perform all actions above
- [ ] No RED errors in console
- [ ] Yellow warnings are acceptable (if not related to app logic)
- [ ] No exceptions thrown

**Expected:** No critical JavaScript errors

### 8.2 Network Tab

- [ ] Open DevTools → Network tab
- [ ] Perform actions
- [ ] No failed requests (red status codes)
- [ ] All API responses are 200-299 (success) or expected error codes
- [ ] No requests hang indefinitely

**Expected:** Clean network activity

### 8.3 Performance Tab

- [ ] Open DevTools → Performance tab
- [ ] Record page load
- [ ] Load time should be <3 seconds
- [ ] No long tasks blocking UI
- [ ] Smooth animations (no frame drops)

**Expected:** Good performance metrics

---

## Section 9: Security Checks

### 9.1 Auth Token Security

- [ ] Open DevTools → Application tab
- [ ] Check Local Storage and Cookies
- [ ] Should NOT see sensitive data in plain text
- [ ] Auth tokens should be in httpOnly cookies (not readable by JS)

**Expected:** Tokens are secure

### 9.2 API Security

- [ ] Open DevTools → Network tab
- [ ] Make an API call (e.g., get customer list)
- [ ] Response should be valid JSON
- [ ] Should NOT expose sensitive fields (like passwords)
- [ ] Try to edit API request → server should reject with permission error

**Expected:** API respects permissions

### 9.3 RLS Policy Check

- [ ] Login as ops_manager
- [ ] Try to access another user's data via DevTools console
- [ ] Should return "permission denied" or empty result
- [ ] Should NOT show data from other roles

**Expected:** Row-level security is enforced

---

## Failure Recovery

If any check FAILS:

1. **Note the failure clearly:**
   - Which section and item
   - What was expected vs. what happened
   - Error message (if any)

2. **Reproduce the failure:**
   - Try again to confirm it's consistent
   - Check if it affects other areas

3. **Log the issue:**
   - Create an issue in your issue tracker
   - Include steps to reproduce
   - Note severity (critical/high/medium/low)

4. **Decide if it blocks Phase 0:**
   - Critical failures → Fix before Phase 0 exit
   - High failures → Fix before Phase 1
   - Medium/low → Can defer to Phase 1 or 3

---

## Phase 0D Exit Criteria

✅ All of the following must pass:

- [ ] All Section 1-3 checks pass (public site, auth, ops access)
- [ ] All Section 4 checks pass (data integrity)
- [ ] No critical Section 5+ failures (edge cases, security)
- [ ] Console has no RED errors
- [ ] Network tab shows no failed requests
- [ ] Can complete all major workflows without confusion

---

## Sign-Off

**Checked by:** _________________  
**Date:** _________________  
**Status:** ⬜ Not Started | 🔄 In Progress | ✅ All Pass | ❌ Failures

**Notes:**
```
[Document any issues, observations, or follow-up items]
```

---

## Next: Phase 0E (Git Baseline Commit)

Once all smoke tests pass, we'll create a clean commit and tag: `phase-0-stable`

