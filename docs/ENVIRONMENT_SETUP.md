# Phase 0C: Environment Setup & Build Verification

**Date:** 2026-08-15  
**Status:** IN PROGRESS  
**Purpose:** Ensure reproducible development and build environments

---

## Local Development Setup

### Prerequisites

- **Node.js:** v18+ (check with `node --version`)
- **npm:** v8+ or **pnpm** v7+
- **Git:** Latest version
- **Database:** Supabase account with project created

### Step 1: Clone the Repository

```bash
git clone <repo-url>
cd DMECH-VALUE-AUTO-SERVICES
```

### Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

**Expected output:**
- No peer dependency warnings
- No major vulnerabilities (OK to have minor audit warnings)

### Step 3: Environment Configuration

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Next.js Public URL (local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration (from your Supabase project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: WhatsApp integration (Phase 2+)
# WHATSAPP_API_KEY=your-api-key
# WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

**Where to get these values:**
1. Log into your Supabase project
2. Go to **Project Settings** → **API**
3. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Verify the Build

```bash
npm run build
```

**Expected result:**
- Build succeeds with no TypeScript errors
- Output: `Successfully compiled ... routes`

**If build fails on Google Fonts:**

This is a known environmental issue. Try:

```bash
# Option 1: Offline build
NEXT_FONT_OFFLINE=1 npm run build

# Option 2: Build with network retry
npm run build -- --experimental-build-mode turbo
```

### Step 5: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 16.2.10
  - Local:        http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Test Core Flows (Manual)

- [ ] Marketing site loads (see hero, services, vehicles)
- [ ] Navigation works
- [ ] Login page accessible
- [ ] No console errors

---

## Environment Variables Explained

| Variable | Purpose | Required? | Example |
|----------|---------|-----------|---------|
| `NEXT_PUBLIC_APP_URL` | App's public URL | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | (long encoded string) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin key | Yes | (long encoded string) |
| `WHATSAPP_API_KEY` | WhatsApp Business API key | No | (set in Phase 2) |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business Phone ID | No | (set in Phase 2) |

**IMPORTANT:** 
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the client
- It is server-only and is used for sensitive operations
- Never commit this to git; use `.env.local` (which is .gitignored)

---

## Available NPM Scripts

| Script | Purpose | When to use |
|--------|---------|------------|
| `npm run dev` | Start dev server with hot reload | Local development |
| `npm run build` | Production build | Before deployment |
| `npm run start` | Run production build locally | Test production build locally |
| `npm run lint` | Run ESLint | Check code quality |
| `npm run test` | Run Vitest suite | Verify tests pass |

---

## Build Issues & Fixes

### Issue: Google Fonts timeout

**Symptom:**
```
Failed to fetch `Inter` from Google Fonts.
Turbopack build failed
```

**Cause:** Network connectivity to Google Fonts during build

**Fix:**
```bash
# Use offline font loading
NEXT_FONT_OFFLINE=1 npm run build

# Or specify the font URL explicitly in src/app/layout.tsx
```

### Issue: TypeScript errors after pulling

**Symptom:**
```
Type 'X' is not assignable to type 'Y'
```

**Fix:**
```bash
# Clear Next.js cache
rm -rf .next
# Rebuild
npm run build
```

### Issue: Module not found

**Symptom:**
```
Module not found: Can't resolve '@/lib/...'
```

**Fix:**
```bash
# Verify tsconfig.json paths
# Make sure the file exists
# Run npm install again
npm install
npm run build
```

### Issue: Supabase connection fails

**Symptom:**
```
Error: Unable to connect to Supabase
```

**Fix:**
1. Verify `.env.local` has correct Supabase URL and keys
2. Check Supabase project is running
3. Verify network connectivity
4. Check Supabase API permissions

---

## Staging & Production Setup

### Staging Environment

1. Create a new Supabase project for staging
2. Run all migrations against staging DB
3. Set environment variables in your hosting platform
4. Deploy code to staging domain
5. Run full smoke tests
6. Verify backups work

### Production Environment

1. Secure Supabase project (restrict access, enable backup)
2. Run all migrations
3. Set environment variables securely (use secrets management)
4. Deploy with monitoring
5. Enable error logging
6. Set up daily backups
7. Document rollback procedure

---

## Database Migrations

### How Migrations Work

1. Migrations in `supabase/migrations/` are SQL files
2. Supabase runs them in order by filename
3. Each migration is one atomic change
4. Never edit a migration after it's been deployed

### Running Migrations Locally

```bash
# Push migrations to your local Supabase
npx supabase db push

# Check migration status
npx supabase migration list
```

### Creating a New Migration

```bash
# Create a new migration file
npx supabase migration new <name>

# This creates: supabase/migrations/XXXXX_<name>.sql

# Edit the file with your SQL changes

# Push to database
npx supabase db push
```

### Important Migration Rules

✅ DO:
- Write idempotent migrations (can run multiple times safely)
- Add comments explaining complex changes
- Test migrations locally first
- Review with the team before deploying
- Keep migrations small and focused

❌ DON'T:
- Manually run SQL on production
- Edit migrations after deployment
- Delete migrations
- Run migrations without backup
- Change migrations based on test failure

---

## Testing Your Setup

### Quick Sanity Check

```bash
# This script verifies your setup is working

#!/bin/bash
echo "✓ Checking Node version..."
node --version

echo "✓ Checking npm version..."
npm --version

echo "✓ Checking for .env.local..."
[ -f .env.local ] && echo "  .env.local exists" || echo "  ❌ .env.local missing"

echo "✓ Running TypeScript check..."
npm run lint

echo "✓ Building..."
npm run build && echo "  Build OK" || echo "  ❌ Build failed"

echo "✓ Setup verification complete"
```

### Run Smoke Tests

See [SMOKE_TEST_CHECKLIST.md](./SMOKE_TEST_CHECKLIST.md)

---

## Troubleshooting Common Issues

| Problem | Solution |
|---------|----------|
| Port 3000 already in use | Use `npm run dev -- -p 3001` |
| `Cannot find module '@/...'` | Run `npm install` and `npm run build` |
| Supabase connection fails | Check `.env.local` values and Supabase project status |
| Build hangs | Clear cache: `rm -rf .next` then rebuild |
| TypeScript errors | Run `npm run lint -- --fix` to auto-fix |
| Tests fail | Check database is set up correctly |

---

## Phase 0C Exit Criteria

✅ All of the following must pass:

- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] Marketing site loads in browser
- [ ] Login page is accessible
- [ ] No TypeScript errors in critical paths
- [ ] Environment setup doc is complete and tested
- [ ] Team can follow setup doc and get working environment

---

## Next: Phase 0D (Baseline Test Harness)

Once environment is stable, we'll create the smoke test checklist and baseline tests.

