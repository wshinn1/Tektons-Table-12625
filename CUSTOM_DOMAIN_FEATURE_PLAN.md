# Custom Domain Feature Plan

## Overview

Allow tenants to connect their own domain to their tenant site through a self-service flow with provider-specific DNS instructions.

---

## Phase 1: Database Schema
**Status:** Not Started

**Tasks:**
- [ ] Create `domain_requests` table with fields:
  - `id` (UUID, primary key)
  - `tenant_id` (UUID, foreign key to tenants)
  - `domain` (text, e.g., "wesshinn.org")
  - `dns_provider` (text, e.g., "siteground", "godaddy")
  - `status` (enum: pending, verifying, active, failed)
  - `vercel_domain_id` (text, nullable - from Vercel API)
  - `verification_record` (text, nullable - TXT record for verification)
  - `created_at`, `updated_at` timestamps
- [ ] Add `custom_domain` column to `tenants` table (if not exists)
- [ ] Create RLS policies for domain_requests

**SQL Script:** `scripts/089_custom_domain_requests.sql`

---

## Phase 2: Vercel Domains API Integration
**Status:** Not Started

**Tasks:**
- [ ] Create server actions in `app/actions/custom-domain.ts`:
  - `submitDomainRequest(domain, dnsProvider)` - Creates request and adds domain to Vercel
  - `checkDomainVerification(requestId)` - Checks if DNS is properly configured
  - `removeDomain(requestId)` - Removes domain from Vercel and deletes request
  - `getDomainStatus(requestId)` - Gets current verification status
- [ ] Integrate with Vercel Domains API:
  - `POST /v10/projects/{projectId}/domains` - Add domain
  - `GET /v10/projects/{projectId}/domains/{domain}` - Check status
  - `DELETE /v10/projects/{projectId}/domains/{domain}` - Remove domain
- [ ] Environment variable needed: `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`

**API Reference:** https://vercel.com/docs/rest-api/endpoints#domains

---

## Phase 3: Provider-Specific Email Instructions
**Status:** Not Started

**Tasks:**
- [ ] Create email template with provider-specific DNS instructions
- [ ] Supported providers with step-by-step guides:
  - Siteground (Site Tools → Domain → DNS Zone Editor)
  - Squarespace (Settings → Domains → DNS Settings)
  - GoDaddy (My Products → DNS → Add Record)
  - Cloudflare (DNS → Records → Add Record)
  - Namecheap (Domain List → Manage → Advanced DNS)
  - Google Domains (DNS → Custom Records)
  - Bluehost (Domains → Zone Editor)
  - HostGator (Domains → Manage)
  - Other (generic instructions)
- [ ] Include in email:
  - CNAME record: `@ → cname.vercel-dns.com`
  - A record alternative: `@ → 76.76.21.21`
  - Verification TXT record (if required by Vercel)
  - Link to check verification status
  - Support contact info

**Email Template:** `lib/email-templates/domain-instructions.tsx`

---

## Phase 4: Tenant Domain Settings Page
**Status:** Not Started

**Tasks:**
- [ ] Create `/admin/settings/domain` page
- [ ] UI Components:
  - Current domain status card (if exists)
  - Domain input field with validation
  - DNS provider dropdown selector
  - Submit button
  - Verification status indicator (pending → verifying → active)
  - "Check DNS" button to manually trigger verification
  - "Remove Domain" button with confirmation
- [ ] Show clear instructions after submission
- [ ] Real-time status updates

**File:** `app/[tenant]/admin/settings/domain/page.tsx`

---

## Phase 5: Middleware Update for Custom Domains
**Status:** Not Started

**Tasks:**
- [ ] Update `middleware.ts` to check custom domains:
  - If hostname matches a tenant's `custom_domain`, rewrite to tenant route
  - Cache domain lookups for performance (use KV or in-memory)
- [ ] Handle both subdomain and custom domain access simultaneously
- [ ] SSL is automatic via Vercel

**Logic:**
```
1. Check if hostname is a tenant subdomain (*.tektonstable.com)
2. If not, check if hostname matches any tenant's custom_domain
3. If match found, rewrite to /${tenant.subdomain}/*
4. If no match, serve main site
```

---

## Phase 6: Admin Dashboard (Platform Admin)
**Status:** Not Started

**Tasks:**
- [ ] Create platform admin view at `/admin/domain-requests`
- [ ] List all domain requests with status
- [ ] Ability to manually verify/approve domains
- [ ] Ability to troubleshoot failed verifications
- [ ] Send reminder emails for pending verifications

**File:** `app/admin/domain-requests/page.tsx`

---

## DNS Provider Instructions Reference

### Siteground
1. Log in to Site Tools
2. Go to Domain → DNS Zone Editor
3. Select your domain
4. Add new record:
   - Type: CNAME
   - Name: @ (or www)
   - Points to: cname.vercel-dns.com

### Squarespace
1. Go to Settings → Domains
2. Click on your domain → DNS Settings
3. Add Custom Record:
   - Type: CNAME
   - Host: @
   - Data: cname.vercel-dns.com

### GoDaddy
1. Go to My Products → Domains
2. Click DNS next to your domain
3. Add Record:
   - Type: CNAME
   - Name: @
   - Value: cname.vercel-dns.com

### Cloudflare
1. Go to your domain's DNS settings
2. Add Record:
   - Type: CNAME
   - Name: @
   - Target: cname.vercel-dns.com
   - Proxy status: DNS only (gray cloud)

### Namecheap
1. Go to Domain List → Manage
2. Click Advanced DNS
3. Add New Record:
   - Type: CNAME
   - Host: @
   - Value: cname.vercel-dns.com

### Google Domains
1. Go to DNS → Custom Records
2. Add Record:
   - Type: CNAME
   - Host: @
   - Data: cname.vercel-dns.com

### Bluehost
1. Go to Domains → Zone Editor
2. Select domain → Add Record:
   - Type: CNAME
   - Name: @
   - Points to: cname.vercel-dns.com

### HostGator
1. Go to Domains → Manage
2. Click DNS Zone Editor
3. Add CNAME Record:
   - Name: @
   - CNAME: cname.vercel-dns.com

---

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| `VERCEL_API_TOKEN` | Vercel API token with domain management permissions |
| `VERCEL_PROJECT_ID` | The Vercel project ID for tektonstable |
| `VERCEL_TEAM_ID` | (Optional) Team ID if using Vercel Teams |

---

## Testing Checklist

- [ ] Submit domain request with various providers
- [ ] Verify email is sent with correct provider instructions
- [ ] Check Vercel API adds domain correctly
- [ ] Test DNS verification polling
- [ ] Verify custom domain routing works in middleware
- [ ] Test domain removal flow
- [ ] Test error handling for invalid domains
- [ ] Test duplicate domain prevention

---

## Notes

- Vercel automatically provisions SSL certificates for custom domains
- DNS propagation can take 5 minutes to 48 hours
- Tenants can use both subdomain and custom domain simultaneously
- Consider adding a verification cron job to periodically check pending domains
