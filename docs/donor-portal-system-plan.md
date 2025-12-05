# Donor Portal System Plan

## Overview
Create a complete donor account system where donors can create accounts, track their giving history, manage recurring payments, and receive year-to-date giving reports.

---

## Database Schema Changes

### New Tables

#### 1. `donor_accounts`
Stores donor user account information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique donor account ID |
| `email` | text (unique) | Donor email address |
| `full_name` | text | Donor full name |
| `password_hash` | text | Hashed password (or use Supabase Auth) |
| `created_at` | timestamp | Account creation date |
| `updated_at` | timestamp | Last update timestamp |

#### 2. `donor_donations`
Links donations to donor accounts for tracking and history.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique donation record ID |
| `donor_id` | uuid (FK) | Reference to donor_accounts |
| `tenant_id` | uuid (FK) | Reference to tenants |
| `stripe_payment_intent_id` | text | Stripe payment intent ID |
| `stripe_subscription_id` | text (nullable) | Stripe subscription ID for recurring |
| `amount_cents` | integer | Donation amount in cents |
| `tip_amount_cents` | integer | Platform tip in cents |
| `status` | text | Status: 'active', 'canceled', 'failed' |
| `frequency` | text | Frequency: 'once', 'monthly' |
| `is_anonymous` | boolean | Anonymous donation flag |
| `created_at` | timestamp | Donation date |
| `canceled_at` | timestamp (nullable) | Cancellation date if applicable |

#### 3. `donor_payment_methods`
Stores donor payment methods for future use.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique payment method ID |
| `donor_id` | uuid (FK) | Reference to donor_accounts |
| `stripe_payment_method_id` | text | Stripe payment method ID |
| `card_brand` | text | Card brand (Visa, Mastercard, etc.) |
| `card_last4` | text | Last 4 digits of card |
| `is_default` | boolean | Default payment method flag |
| `created_at` | timestamp | Payment method added date |

---

## Features to Build

### 1. Donor Registration/Login
**Routes:**
- `/giving/signup` - Create donor account during/after donation
- `/giving/login` - Login page for existing donors

**Functionality:**
- Email/password registration
- Integration with Supabase Auth
- Auto-create account during checkout flow
- Password reset functionality
- Email verification

### 2. Donor Dashboard (`/giving/my-giving`)
**Components:**
- YTD giving summary card with total amount
- List of all donations (one-time and recurring)
- Donation history grouped by tenant/missionary
- Download YTD giving statement button (PDF)
- Quick stats: Total given, Number of missionaries supported, Active subscriptions

**Layout:**
- Sidebar navigation with:
  - Overview
  - Donation History
  - Recurring Donations
  - Payment Methods
  - Account Settings

### 3. Manage Recurring Donations
**Features:**
- View all active subscriptions
- Edit donation amount (update Stripe subscription)
- Update payment method
- Cancel subscription with confirmation
- Pause/resume functionality (if Stripe supports)
- View next billing date and amount

**UI Components:**
- Subscription cards with missionary info
- Edit modal for changing amount
- Payment method selector
- Cancellation confirmation dialog

### 4. Account Management
**Pages:**
- Profile settings (name, email)
- Password change
- Payment methods management
- Email preferences (receipts, newsletters, YTD reports)
- Account deletion

### 5. Automated YTD Reports
**Features:**
- Cron job to send annual giving statements in January
- Manual "Download YTD Statement" button
- Email reports with PDF attachment
- Tax-deductible donation summary
- Breakdown by missionary/tenant

**Report Contents:**
- Donor information
- Total giving amount
- Donation breakdown by date
- Missionary/organization breakdown
- Tax ID information (if applicable)

---

## Implementation Phases

### Phase 1: Authentication & Database Setup
**Tasks:**
1. Create SQL migration scripts for new tables
2. Set up Supabase Auth for donor accounts
3. Add RLS (Row Level Security) policies for donor data
4. Create auth actions for signup/login/logout
5. Build authentication middleware for donor routes

**Estimated Time:** 1-2 days

### Phase 2: Donation Tracking Integration
**Tasks:**
1. Modify Stripe webhook handler to create donor_donations records
2. Link completed donations to donor accounts
3. Track subscription status changes (active, canceled, failed)
4. Update donation flow to prompt for account creation
5. Add donor ID to Stripe metadata

**Estimated Time:** 2-3 days

### Phase 3: Donor Portal UI
**Tasks:**
1. Create donor dashboard layout with sidebar navigation
2. Build giving history page with filters and search
3. Add YTD summary card with statistics
4. Create donation detail modal/page
5. Implement responsive design for mobile donors

**Estimated Time:** 3-4 days

### Phase 4: Subscription Management
**Tasks:**
1. Build recurring donation management interface
2. Integrate Stripe Billing Portal API for payment updates
3. Add edit amount functionality (update subscription)
4. Implement cancel subscription with confirmation
5. Create subscription status change notifications

**Estimated Time:** 2-3 days

### Phase 5: Reports & Email Automation
**Tasks:**
1. Build PDF generation library for YTD statements
2. Create email templates for giving statements
3. Set up annual cron job for January tax reports
4. Add manual download feature to dashboard
5. Create receipt emails for individual donations

**Estimated Time:** 2-3 days

---

## Technical Considerations

### Security
- Implement proper RLS policies on donor tables
- Encrypt sensitive donor data
- Secure payment method storage (use Stripe tokens)
- Add CSRF protection to forms
- Rate limit authentication attempts

### Performance
- Index donor_donations by donor_id and tenant_id
- Cache YTD calculations for frequent access
- Paginate donation history for large donor accounts
- Optimize PDF generation for bulk reports

### Stripe Integration
- Use Stripe Customer Portal for payment method management
- Handle subscription lifecycle webhooks properly
- Store Stripe IDs for easy reconciliation
- Implement idempotency for webhook processing

### User Experience
- Progressive disclosure for complex forms
- Clear error messages and validation
- Email confirmations for important actions
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1)

---

## API Endpoints

### Authentication
- `POST /api/donor/signup` - Create donor account
- `POST /api/donor/login` - Login donor
- `POST /api/donor/logout` - Logout donor
- `POST /api/donor/reset-password` - Request password reset

### Donations
- `GET /api/donor/donations` - Fetch donation history
- `GET /api/donor/donations/ytd` - Get YTD summary
- `GET /api/donor/donations/:id` - Get donation details
- `POST /api/donor/donations/:id/receipt` - Email receipt

### Subscriptions
- `GET /api/donor/subscriptions` - Fetch active subscriptions
- `PUT /api/donor/subscriptions/:id` - Update subscription amount
- `DELETE /api/donor/subscriptions/:id` - Cancel subscription
- `POST /api/donor/subscriptions/:id/payment-method` - Update payment method

### Reports
- `GET /api/donor/reports/ytd` - Download YTD statement PDF
- `POST /api/donor/reports/email-ytd` - Email YTD statement

---

## Email Templates Needed

1. **Welcome Email** - Sent on account creation
2. **Donation Receipt** - Sent after each donation
3. **Subscription Confirmation** - Sent when recurring donation starts
4. **Subscription Updated** - Sent when amount or payment method changes
5. **Subscription Canceled** - Sent when subscription is canceled
6. **YTD Report** - Annual giving statement (January)
7. **Password Reset** - Password reset link
8. **Payment Failed** - Notification when recurring payment fails

---

## Success Metrics

- Donor account creation rate (% of donors who create accounts)
- Donor portal engagement (monthly active users)
- YTD report downloads
- Subscription management usage (edits, cancellations)
- Donor retention rate (repeat donations)
- Support ticket reduction for donation inquiries

---

## Future Enhancements

- Multi-missionary giving (support multiple missionaries from one account)
- Giving goals and milestones
- Social sharing of impact
- Mobile app for donors
- Text/SMS donation receipts
- Giving circles (group donations)
- Impact stories feed based on supported missionaries

---

## Questions to Answer Before Implementation

1. Should donors use Supabase Auth or separate authentication system?
2. What information should be required vs. optional during signup?
3. Should donors be able to give anonymously while having an account?
4. How should we handle disputes and refunds in the donor portal?
5. What tax documentation is required for giving statements?
6. Should there be a minimum/maximum donation amount?
7. How long should we retain donor data (GDPR compliance)?
8. Should donors receive instant receipts or batch emails?

---

## Total Estimated Timeline: 10-15 days

This plan provides a comprehensive roadmap for building a complete donor portal system that enhances donor engagement, simplifies recurring donation management, and provides transparency into giving history.
