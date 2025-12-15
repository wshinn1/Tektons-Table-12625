# Custom Domain Setup for Tenants

This document outlines how to enable custom domains for tenant sites, allowing tenants to use their own domain (e.g., `wesshinn.org`) instead of the default subdomain (`wesshinn.tektonstable.com`).

---

## How It Works

Both URLs will work simultaneously:
- `wesshinn.tektonstable.com` → serves wesshinn's tenant site (default)
- `wesshinn.org` → also serves wesshinn's tenant site (custom domain)

From the visitor's perspective, the custom domain looks like an independent website with no iframe or tektonstable branding in the URL.

---

## Implementation Steps

### 1. Database Changes

Add a `custom_domain` column to the `tenants` table:

```sql
ALTER TABLE tenants ADD COLUMN custom_domain TEXT UNIQUE;

-- Example: Enable custom domain for a tenant
UPDATE tenants SET custom_domain = 'wesshinn.org' WHERE subdomain = 'wesshinn';
```

### 2. Middleware Changes

Update `middleware.ts` to check for custom domains:

```ts
// Current logic (simplified)
const subdomain = hostname.replace('.tektonstable.com', '')
const tenant = await getTenantBySubdomain(subdomain)

// With custom domains - check custom domain first
let tenant = await getTenantByCustomDomain(hostname)
if (!tenant) {
  const subdomain = hostname.replace('.tektonstable.com', '')
  tenant = await getTenantBySubdomain(subdomain)
}
```

### 3. Add Domain in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter the tenant's domain (e.g., `wesshinn.org`)
4. Vercel will display the required DNS records

### 4. Tenant Updates Their DNS

The tenant logs into their domain registrar and adds one of these records:

| Type | Name | Value |
|------|------|-------|
| CNAME | `@` or `www` | `cname.vercel-dns.com` |
| OR A | `@` | `76.76.21.21` |

**Note:** DNS propagation can take 5 minutes to 48 hours.

### 5. SSL Certificate

Vercel automatically provisions a free SSL certificate once DNS is verified. The custom domain will serve over HTTPS.

---

## Tenant Instructions (What to Tell Tenants)

### Step 1: Purchase a Domain
Buy a domain from any registrar:
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- Porkbun

### Step 2: Tell Us Your Domain
Contact support with your desired domain name. We'll add it to your account.

### Step 3: Update Your DNS Settings
Log into your domain registrar and add this DNS record:

**Option A - CNAME Record (Recommended)**
| Type | Name | Value |
|------|------|-------|
| CNAME | `@` | `cname.vercel-dns.com` |

**Option B - A Record**
| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |

### Step 4: Wait for Propagation
DNS changes can take up to 48 hours to propagate, though it's usually much faster (5-30 minutes).

### Step 5: Verify
Once propagation is complete, your custom domain will automatically work with HTTPS.

---

## Future Enhancements

1. **Self-Service UI** - Allow tenants to request/manage custom domains from their admin dashboard
2. **Vercel API Integration** - Automatically add domains via the Vercel Domains API instead of manually
3. **Domain Verification** - Show DNS status and troubleshooting in tenant admin
4. **Subdomain Support** - Allow tenants to use subdomains of their domain (e.g., `donate.wesshinn.org`)

---

## Troubleshooting

### Domain not working after 48 hours
- Verify DNS records are correct using [dnschecker.org](https://dnschecker.org)
- Check Vercel dashboard for any SSL certificate errors
- Ensure the domain was added to the correct Vercel project

### SSL Certificate not provisioning
- Vercel requires DNS to be properly configured before issuing SSL
- Check that no CAA records are blocking Let's Encrypt
- Try removing and re-adding the domain in Vercel

### Links going to wrong domain
- All internal links should be relative (`/blog`, `/about`) not absolute
- Check for any hardcoded URLs in the codebase
