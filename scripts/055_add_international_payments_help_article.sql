-- Add comprehensive International Payments & Stripe help article
-- This article will appear at /help/article/international-payments-stripe

-- Using jsonb_build_object() to properly escape all special characters in HTML content
INSERT INTO help_articles (
  slug,
  title,
  content,
  category,
  subcategory,
  is_published,
  order_index,
  view_count,
  helpful_count,
  not_helpful_count,
  related_articles,
  video_url,
  created_at,
  updated_at
) VALUES (
  'international-payments-stripe',
  jsonb_build_object('en', 'International Payments & Stripe Setup'),
  -- Reformatted HTML with proper spacing and structure for better readability
  jsonb_build_object('en', '
<h2>Global Donation Support</h2>

<p>Tektons Table fully supports international donations from donors worldwide, including Asia, Africa, and South America. All donations are processed through Stripe, which accepts credit and debit cards from virtually any country.</p>

<h2>Supported Payment Methods</h2>

<h3>Currently Enabled Payment Methods</h3>

<ul>
<li><strong>Credit/Debit Cards</strong> (Visa, Mastercard, Amex, Discover) - <strong>Global Support from 195+ countries</strong></li>
<li><strong>US Bank Account (ACH)</strong> - United States only</li>
<li><strong>SEPA Debit</strong> - European Union countries only</li>
<li><strong>iDEAL</strong> - Netherlands only</li>
<li><strong>Bancontact</strong> - Belgium only</li>
</ul>

<p>Card payments work from <strong>195+ countries worldwide</strong>, including all major countries in Asia, Africa, and South America.</p>

<h2>Supported Countries by Region</h2>

<h3>Africa (18+ countries)</h3>

<p>Nigeria, South Africa, Kenya, Ghana, Egypt, Morocco, Algeria, Ethiopia, Tanzania, Uganda, Rwanda, Botswana, Namibia, Mozambique, Madagascar, Angola, Gabon, Côte d''Ivoire, and more.</p>

<h3>Asia (25+ countries)</h3>

<p>China, India, Japan, Singapore, South Korea, Thailand, Philippines, Vietnam, Indonesia, Malaysia, Hong Kong, Taiwan, Israel, UAE, Saudi Arabia, Qatar, Kuwait, Oman, Jordan, Pakistan, Bangladesh, Sri Lanka, Cambodia, Laos, Mongolia, and more.</p>

<h3>South America (11+ countries)</h3>

<p>Brazil, Argentina, Chile, Colombia, Peru, Mexico, Uruguay, Ecuador, Bolivia, Paraguay, Venezuela, and more.</p>

<h2>How International Donations Work</h2>

<h3>For Donors</h3>

<ol>
<li>Donor visits your missionary giving page</li>
<li>Selects donation amount (displayed in USD)</li>
<li>Enters their local credit/debit card information</li>
<li>Stripe processes the payment in USD</li>
<li>Donor''s bank converts USD to their local currency</li>
<li>Donation appears in your Stripe account</li>
</ol>

<h3>Currency Conversion</h3>

<ul>
<li>All donations are processed in <strong>USD</strong></li>
<li>International donors see pricing in USD</li>
<li>Their bank handles currency conversion at checkout</li>
<li>Small foreign transaction fees may apply (typically 1-3% charged by the donor''s bank)</li>
</ul>

<h2>No Geographic Restrictions</h2>

<p>The platform has <strong>no country blocklists</strong>, meaning Stripe will accept payments from any country where Visa/Mastercard are supported.</p>

<h2>Stripe Connect Cross-Border Payouts</h2>

<p>Since each missionary connects their own Stripe account, Stripe supports cross-border payouts to connected accounts in 60+ countries.</p>

<h3>Payout Support by Region</h3>

<ul>
<li><strong>Africa:</strong> Nigeria, South Africa, Kenya, Ghana, Egypt, Morocco, and 12+ more</li>
<li><strong>Asia:</strong> India, Japan, Singapore, Hong Kong, Thailand, Philippines, Malaysia, Indonesia, and 17+ more</li>
<li><strong>South America:</strong> Brazil, Chile, Colombia, Argentina, Peru, Uruguay, Ecuador, and 4+ more</li>
</ul>

<h2>Setting Up Your Stripe Account for International Payments</h2>

<h3>Step 1: Connect Your Stripe Account</h3>

<p>Go to your Admin Dashboard → <strong>Manage Giving</strong></p>

<p>Click <strong>Connect with Stripe</strong></p>

<p>Follow Stripe''s onboarding process</p>

<ul>
<li>Provide required business/tax information for your country</li>
<li>Complete verification (may take 1-2 business days)</li>
</ul>

<h3>Step 2: Enable Payment Methods</h3>

<p>By default, the following payment methods are automatically enabled:</p>

<ul>
<li>All major credit and debit cards (international)</li>
<li>US Bank Account transfers (ACH)</li>
<li>European SEPA transfers</li>
</ul>

<h3>Step 3: Test Your Giving Page</h3>

<p>Visit your public missionary site at <code>yourname.tektonstable.com</code></p>

<p>Click on <strong>Support</strong> or <strong>Give</strong></p>

<p>Test a small donation to verify everything works</p>

<p>Check your Stripe Dashboard to see the test payment</p>

<h2>Fees & Pricing</h2>

<h3>Standard Stripe Fees</h3>

<ul>
<li><strong>US Cards:</strong> 2.9% + $0.30 per transaction</li>
<li><strong>International Cards:</strong> 3.9% + $0.30 per transaction</li>
<li><strong>Currency Conversion:</strong> 1% additional fee (if applicable)</li>
</ul>

<h3>Nonprofit Discount</h3>

<p>If you represent a registered 501(c)(3) nonprofit organization, you may qualify for Stripe''s reduced processing rates:</p>

<ul>
<li><strong>US Cards:</strong> 2.2% + $0.30</li>
<li><strong>International Cards:</strong> 3.2% + $0.30</li>
</ul>

<p>Apply for the discount at <a href="https://stripe.com/nonprofits" target="_blank">stripe.com/nonprofits</a></p>
'),
  'financial-management',
  'payments',
  true,
  10,
  0,
  0,
  0,
  ARRAY[]::uuid[],
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (slug) 
DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  updated_at = NOW();
