# Tekton's Table

A multi-tenant missionary and ministry fundraising platform built with modern web technologies. Tekton's Table enables missionaries, churches, and nonprofits to create their own branded fundraising sites with zero subscription fees.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/weshinn-6609s-projects/v0-tektons-tablev2main-7v)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/jZ71XOQXiqq)

## Overview

Tekton's Table is a comprehensive SaaS platform that provides:

- **Multi-tenant Architecture**: Each organization gets their own subdomain (e.g., `yourministry.tektonstable.com`)
- **Zero Subscription Fees**: Organizations only pay a small percentage on donations received
- **Full-Featured Admin Dashboard**: Manage donations, campaigns, blog posts, newsletters, and more
- **Donor Portal**: Supporters can manage their giving, view receipts, and track donations
- **Stripe Connect Integration**: Secure payment processing with direct payouts to organizations

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Component library built on Radix UI
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Backend & Database
- **Supabase** - PostgreSQL database with Row Level Security (RLS)
- **Supabase Auth** - Authentication and user management
- **Upstash Redis** - Caching and rate limiting
- **Vercel Blob** - File storage for media uploads

### Payments
- **Stripe Connect** - Payment processing with connected accounts
- **Stripe Checkout** - Secure donation flow
- **Recurring Donations** - Subscription management

### Email & Communications
- **Resend** - Transactional email delivery
- **Newsletter System** - Built-in email marketing with analytics
- **Puck Editor** - Visual email builder

### Content Management
- **TipTap** - Rich text editor for blog posts
- **Puck** - Visual page builder for custom pages
- **Media Library** - Image and file management with HEIC conversion

### Monitoring & Analytics
- **Sentry** - Error tracking and performance monitoring
- **Vercel Analytics** - Traffic and performance analytics
- **PostHog** - Product analytics and feature flags
- **Google Analytics** - Website analytics

## Project Structure

```
├── app/
│   ├── [tenant]/              # Tenant-specific routes (subdomains)
│   │   ├── admin/             # Tenant admin dashboard
│   │   │   ├── analytics/     # Donation analytics
│   │   │   ├── blog/          # Blog management
│   │   │   ├── campaigns/     # Campaign management
│   │   │   ├── giving/        # Giving settings & Stripe setup
│   │   │   ├── newsletter/    # Newsletter composer
│   │   │   ├── pages/         # Custom page builder
│   │   │   ├── settings/      # Site settings & SEO
│   │   │   └── supporters/    # Donor CRM
│   │   ├── auth/              # Tenant authentication
│   │   │   ├── login/         # Admin login
│   │   │   ├── donor-login/   # Donor login
│   │   │   └── forgot-password/
│   │   ├── blog/              # Public blog
│   │   ├── campaigns/         # Fundraising campaigns
│   │   ├── donor/             # Donor portal
│   │   │   ├── giving/        # Giving history
│   │   │   ├── receipt/       # Tax receipts
│   │   │   ├── recurring/     # Recurring donations
│   │   │   └── tax-summary/   # Annual tax summary
│   │   └── giving/            # Donation pages
│   ├── admin/                 # Platform super-admin dashboard
│   │   ├── tenants/           # Tenant management
│   │   ├── nonprofit-applications/
│   │   ├── financials/        # Platform revenue
│   │   ├── backups/           # System backups
│   │   └── help/              # Help article management
│   ├── api/                   # API routes
│   │   ├── stripe/            # Stripe webhooks
│   │   ├── cron/              # Scheduled jobs
│   │   └── admin/             # Admin APIs
│   └── actions/               # Server actions (100+ actions)
├── components/
│   ├── admin/                 # Admin dashboard components
│   ├── blog/                  # Blog components
│   ├── donor/                 # Donor portal components
│   ├── sections/              # Reusable page sections
│   ├── tenant/                # Tenant-specific components
│   ├── puck/                  # Puck editor components
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── supabase/              # Supabase client configuration
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   ├── admin.ts           # Admin client (service role)
│   │   └── middleware.ts      # Auth middleware
│   └── utils.ts               # Utility functions
└── scripts/                   # Database migrations
```

## Features

### For Organizations (Tenants)

#### Dashboard
- Real-time donation tracking and analytics
- Revenue charts and financial reports
- Supporter management with CRM features
- Contact submission management
- Campaign performance metrics

#### Campaigns
- Create unlimited fundraising campaigns
- Set goals and track progress with visual progress bars
- Share campaigns with custom URLs
- Campaign-specific donation pages
- Anonymous donation support
- Recent donations feed
- Top donors leaderboard

#### Blog & Content
- Rich text blog editor (TipTap) with media support
- Premium content gating for supporters
- SEO optimization tools
- Social sharing integration
- Reading progress indicator
- Comments and reactions (claps)
- Category and tag management

#### Newsletters
- Visual email builder (Puck)
- Subscriber group segmentation
- Open and click tracking
- Scheduled sending
- Email preferences management

#### Custom Pages
- Visual page builder (Puck)
- Custom navigation management
- SEO metadata control
- Multiple section types

#### Settings
- Branding customization (colors, logo, favicon)
- Stripe Connect onboarding
- Nonprofit verification (EIN, exemption letter)
- Giving page configuration
- Fee model selection
- Contact email recipients

### For Donors

#### Donor Portal
- View complete giving history
- Download individual tax receipts
- Annual tax summary reports
- Manage recurring donations
- Update payment methods
- Email notification preferences

#### Giving Experience
- One-time and recurring donations
- Campaign-specific giving
- Optional tip to platform
- Fee coverage option
- Multiple suggested amounts
- Custom amount support

### Platform Administration

#### Super Admin Dashboard
- Tenant management and overview
- Nonprofit application review workflow
- Platform-wide analytics
- Revenue tracking and fee management
- System settings configuration
- Automated backup management
- Help article CMS
- Contact/CRM management
- Newsletter system for platform communications
- Email workflow automation

## Database Schema

The platform uses 100+ database tables with Row Level Security (RLS). Key tables include:

### Core Tables
- **tenants** - Organization profiles, settings, Stripe connection
- **supporters** - Donor information per tenant
- **donations** / **tenant_donations** - Transaction records
- **campaigns** / **tenant_campaigns** - Fundraising campaigns
- **campaign_donations** - Campaign-specific donations

### Content Tables
- **blog_posts** - Blog content with TipTap JSON
- **blog_categories** / **blog_tags** - Content organization
- **tenant_pages** - Custom pages with Puck JSON
- **tenant_menu_items** - Navigation configuration

### Communication Tables
- **newsletters** / **tenant_newsletters** - Email campaigns
- **newsletter_recipients** - Delivery tracking
- **tenant_email_subscribers** - Subscriber management
- **subscriber_groups** - Segmentation

### Platform Tables
- **super_admins** - Platform administrators
- **platform_settings** - Global configuration
- **platform_fee_config** - Fee management
- **help_articles** / **help_categories** - Support content
- **backups** - System backup records

All tables use Supabase Row Level Security (RLS) for data isolation between tenants.

## Authentication

The platform supports multiple authentication flows:

1. **Platform Super Admins** - Full platform management access
2. **Tenant Admins** - Organization owners managing their site at `subdomain.tektonstable.com/auth/login`
3. **Donors** - Financial supporters accessing the donor portal at `subdomain.tektonstable.com/auth/donor-login`

Authentication is handled via Supabase Auth with custom middleware for:
- Subdomain detection and routing
- Cookie management across subdomains
- Session refresh and persistence

## Multi-Tenancy Architecture

### Subdomain Routing
- Main site: `tektonstable.com`
- Tenant sites: `{subdomain}.tektonstable.com`
- Middleware handles URL rewriting and tenant detection

### Data Isolation
- All tenant data is isolated via `tenant_id` foreign keys
- Row Level Security (RLS) policies enforce data access
- Cookies are scoped to `.tektonstable.com` domain

### Tenant Customization
- Custom branding (logo, favicon, colors)
- Custom domain support (planned)
- Configurable navigation
- Custom pages via page builder

## Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
POSTGRES_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_CLIENT_ID=
STRIPE_PREMIUM_PRICE_ID=

# Upstash Redis
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
REDIS_URL=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# Email
RESEND_API_KEY=

# Monitoring
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# AI Features
OPENAI_API_KEY=

# Cron Jobs
CRON_SECRET=

# Page Builder
PUCK_API_KEY=
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm, pnpm, or yarn
- Supabase account
- Stripe account with Connect enabled
- Vercel account (recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tektonstable.git
cd tektonstable
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Run database migrations:
```bash
# Migrations are in /scripts folder
# Execute via Supabase dashboard or CLI
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Deployment

The platform is designed for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up wildcard domain for subdomains (`*.tektonstable.com`)
4. Configure Stripe webhooks to point to your deployment
5. Deploy

### Stripe Webhook Endpoints
- `/api/stripe/webhook` - Main platform webhooks
- `/api/stripe/connect-webhook` - Connect account webhooks

## Key Integrations

### Stripe Connect
Organizations connect their Stripe accounts to receive direct payouts:
- Connected account onboarding via OAuth
- Payment intent creation with application fees
- Webhook processing for payment events
- Subscription management for recurring donations
- Payout tracking

### Supabase
- PostgreSQL database with 100+ tables
- Row Level Security for multi-tenancy
- Real-time subscriptions (planned)
- Auth with custom JWT claims
- Edge Functions (planned)

### Vercel
- Edge middleware for subdomain routing
- Blob storage for media uploads
- Analytics and Web Vitals
- Serverless functions
- Cron jobs for scheduled tasks

### Resend
- Transactional emails (receipts, notifications)
- Newsletter delivery
- Email tracking (opens, clicks)
- Webhook processing

## Build Information

This project was built using:
- **v0.app** - AI-powered development platform by Vercel
- **Cursor** - AI-powered code editor
- **GitHub Copilot** - AI pair programming

The development approach combined AI assistance with manual refinement to create a production-ready platform.

## Contributing

This is a proprietary project. For feature requests or bug reports, please contact the development team.

## License

Proprietary - All rights reserved

## Support

For support:
- Visit the help center at [tektonstable.com/help](https://tektonstable.com/help)
- Use the in-app chat support
- Email support@tektonstable.com

---

**Live Site**: [https://tektonstable.com](https://tektonstable.com)

**Build with v0**: [https://v0.app/chat/jZ71XOQXiqq](https://v0.app/chat/jZ71XOQXiqq)
