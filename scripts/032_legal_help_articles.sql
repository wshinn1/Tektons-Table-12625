-- Add Terms and Conditions and Privacy Policy to help articles for chatbot reference
-- This allows the AI chatbot to answer questions about legal terms, fees, and policies

INSERT INTO help_articles (
  slug,
  title,
  content,
  category,
  subcategory,
  is_published,
  order_index
) VALUES 
(
  'terms-and-conditions',
  jsonb_build_object('en', 'Terms and Conditions'),
  jsonb_build_object('en', $$COMPLETE TERMS OF SERVICE

ACCEPTANCE OF TERMS
By creating an account on Tektons Table, you agree to these Terms and Conditions. If you do not agree, please do not use our platform.

PLATFORM FEE STRUCTURE
- Platform Fee: 3.5% per transaction
- This fee covers platform maintenance, security, hosting, and continuous improvements
- The 3.5% fee is clearly disclosed during signup and applies to all donations
- Stripe processing fees apply separately (2.9% + $0.30 standard, or 2.2% + $0.30 nonprofit rate)
- Total fees: 6.4% + $0.30 (standard) or 5.7% + $0.30 (nonprofit)

HOW PAYMENTS WORK
- All donations are processed through Stripe, a PCI DSS Level 1 certified payment processor
- Money flows DIRECTLY from donors to your connected bank account
- Tektons Table NEVER holds, stores, or touches your funds
- Payouts typically arrive in 2-7 business days (Stripe standard)
- You maintain full control of your Stripe account

USER RESPONSIBILITIES
As a Tektons Table user, you agree to:
- Provide accurate information about your mission or nonprofit
- Keep your content appropriate and mission-focused
- Comply with all applicable laws and regulations
- Not use the platform for fraudulent purposes
- Maintain the security of your account credentials
- Respond to donor inquiries in a timely manner

STRIPE INTEGRATION
- You must create and maintain a Stripe account to receive donations
- You are responsible for complying with Stripe's Terms of Service
- Stripe may require additional verification documents
- Nonprofit organizations can apply for discounted Stripe rates (2.2% vs 2.9%)
- Tektons Table is not responsible for Stripe account issues or holds

CONTENT OWNERSHIP
- You retain ownership of all content you create (blog posts, updates, photos)
- You grant Tektons Table permission to display your content on the platform
- You are responsible for ensuring you have rights to all content you upload
- Tektons Table may remove content that violates our policies

ACCOUNT TERMINATION
- You may close your account at any time
- We may suspend or terminate accounts that violate these terms
- Upon termination, your public content may remain visible for 30 days
- You can request complete data deletion

LIABILITY AND DISCLAIMERS
- Platform provided "as is" without warranties
- We are not responsible for donation disputes between you and donors
- Maximum liability limited to platform fees paid in last 12 months
- Not responsible for Stripe processing issues or delays

CHANGES TO TERMS
- We may update these terms with 30 days notice
- Continued use after changes constitutes acceptance
- Material changes will be emailed to all users$$),
  'legal',
  'terms-of-service',
  true,
  1
),
(
  'privacy-policy',
  jsonb_build_object('en', 'Privacy Policy and Data Protection'),
  jsonb_build_object('en', $$PRIVACY POLICY

INFORMATION WE COLLECT
Personal Information:
- Name and email address (for account creation)
- Mission organization name and description
- Profile photos and content you upload
- Bank account information (stored securely by Stripe, not by us)

Donor Information:
- Donor names and email addresses
- Donation amounts and dates
- Payment information (processed and stored by Stripe only)
- Mailing addresses (if provided for receipts)

Usage Information:
- Pages visited and features used
- Device and browser information
- IP addresses and location data (general)

HOW WE USE YOUR DATA
- To provide and improve the fundraising platform
- To process donations through Stripe
- To send transactional emails (donation receipts, updates)
- To provide customer support
- To prevent fraud and ensure security
- To comply with legal obligations

We DO NOT:
- Sell your data to third parties
- Share donor lists with other organizations
- Use your data for advertising purposes
- Send unsolicited marketing emails

DATA SECURITY
- All data encrypted in transit (SSL/TLS)
- Database encryption at rest
- Stripe PCI DSS Level 1 compliance for payment data
- Regular security audits and updates
- Row-level security ensures you only see your data
- Two-factor authentication available

THIRD-PARTY SERVICES
We use trusted third-party services:
- Stripe: Payment processing (their privacy policy applies)
- Supabase: Database hosting (enterprise security)
- Vercel: Platform hosting (SOC 2 compliant)
- Resend: Email delivery

YOUR RIGHTS (GDPR/CCPA)
You have the right to:
- Access all your personal data
- Export your data at any time
- Correct inaccurate information
- Delete your account and data
- Opt out of marketing communications
- Request data portability

DATA RETENTION
- Active accounts: Data retained as long as account is active
- Closed accounts: Data deleted within 30 days (except legal requirements)
- Financial records: Retained for 7 years (tax/legal compliance)
- Anonymized analytics: May be retained indefinitely

COOKIES AND TRACKING
- Essential cookies for authentication and security
- Analytics cookies to improve platform (can opt out)
- No third-party advertising cookies
- Session data stored securely

INTERNATIONAL TRANSFERS
- Data hosted in secure US data centers
- Adequate protection measures for international users
- Compliant with EU-US Data Privacy Framework

CONTACT FOR PRIVACY CONCERNS
Email privacy questions to support@tektonstable.com
Response within 48 hours for privacy requests$$),
  'legal',
  'privacy-data',
  true,
  2
),
(
  'acceptable-use-policy',
  jsonb_build_object('en', 'Acceptable Use and Content Guidelines'),
  jsonb_build_object('en', $$ACCEPTABLE USE POLICY

PERMITTED USES
Tektons Table is designed for:
- Legitimate missionary fundraising
- Nonprofit organization support
- Faith-based mission work
- Charitable causes and humanitarian aid
- Ministry support and church planting

PROHIBITED CONTENT
You may NOT use Tektons Table for:
- Fraudulent or misleading fundraising
- Political campaigns or lobbying
- Hate speech or discriminatory content
- Illegal activities or services
- Adult content or gambling
- Multi-level marketing schemes
- Personal loans or business ventures
- Anything violating US law or regulations

CONTENT STANDARDS
All blog posts, updates, and pages must:
- Be truthful and accurate
- Respect intellectual property rights
- Be appropriate for general audiences
- Not contain spam or excessive promotional content
- Not violate privacy of others

FUNDRAISING TRANSPARENCY
You must:
- Accurately describe how donations will be used
- Provide regular updates to supporters
- Use donations for stated purposes
- Disclose if you are a registered nonprofit
- Be honest about your identity and mission

CONSEQUENCES OF VIOLATIONS
- First violation: Warning and content removal
- Repeated violations: Account suspension
- Serious violations: Immediate termination and legal action
- Fraudulent activity: Reported to authorities

We reserve the right to review accounts and remove content that violates these policies.$$),
  'legal',
  'acceptable-use',
  true,
  3
);
