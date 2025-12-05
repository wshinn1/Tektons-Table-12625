-- Update the international payments help article with proper spacing classes
UPDATE help_articles
SET content = jsonb_set(
  content,
  '{en}',
  to_jsonb('<div class="space-y-8">
<h2 class="text-2xl font-bold mt-8 mb-4">Global Donation Support</h2>
<p class="mb-6">Tektons Table fully supports international donations from donors worldwide, including Asia, Africa, and South America. All donations are processed through Stripe, which accepts credit and debit cards from virtually any country.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Supported Payment Methods</h2>

<h3 class="text-xl font-semibold mt-6 mb-3">Currently Enabled Payment Methods</h3>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Credit/Debit Cards</strong> (Visa, Mastercard, Amex, Discover) - <strong>Global Support from 195+ countries</strong></li>
<li><strong>US Bank Account (ACH)</strong> - United States only</li>
<li><strong>SEPA Debit</strong> - European Union countries only</li>
<li><strong>iDEAL</strong> - Netherlands only</li>
<li><strong>Bancontact</strong> - Belgium only</li>
</ul>

<p class="mb-6">Card payments work from <strong>195+ countries worldwide</strong>, including all major countries in Asia, Africa, and South America.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Supported Countries by Region</h2>

<h3 class="text-xl font-semibold mt-6 mb-3">Africa (18+ countries)</h3>
<p class="mb-6">Nigeria, South Africa, Kenya, Ghana, Egypt, Morocco, Algeria, Ethiopia, Tanzania, Uganda, Rwanda, Botswana, Namibia, Mozambique, Madagascar, Angola, Gabon, Côte d''Ivoire, and more.</p>

<h3 class="text-xl font-semibold mt-6 mb-3">Asia (25+ countries)</h3>
<p class="mb-6">China, India, Japan, Singapore, South Korea, Thailand, Philippines, Vietnam, Indonesia, Malaysia, Hong Kong, Taiwan, Israel, UAE, Saudi Arabia, Qatar, Kuwait, Oman, Jordan, Pakistan, Bangladesh, Sri Lanka, Cambodia, Laos, Mongolia, and more.</p>

<h3 class="text-xl font-semibold mt-6 mb-3">South America (11+ countries)</h3>
<p class="mb-6">Brazil, Argentina, Chile, Colombia, Peru, Mexico, Uruguay, Ecuador, Bolivia, Paraguay, Venezuela, and more.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">How International Donations Work</h2>

<h3 class="text-xl font-semibold mt-6 mb-3">For Donors</h3>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Donor visits your missionary giving page</li>
<li>Selects donation amount (displayed in USD)</li>
<li>Enters their local credit/debit card information</li>
<li>Stripe processes the payment in USD</li>
<li>Donor''s bank converts USD to their local currency</li>
<li>Donation appears in your Stripe account</li>
</ol>

<h3 class="text-xl font-semibold mt-6 mb-3">Currency Conversion</h3>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>All donations are processed in <strong>USD</strong></li>
<li>International donors see pricing in USD</li>
<li>Their bank handles currency conversion at checkout</li>
<li>Small foreign transaction fees may apply (typically 1-3% charged by the donor''s bank)</li>
</ul>

<h3 class="text-xl font-semibold mt-6 mb-3">No Geographic Restrictions</h3>
<p class="mb-6">The platform has <strong>no country blocklists</strong>, meaning Stripe will accept payments from any country where Visa/Mastercard are supported.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Stripe Connect Cross-Border Payouts</h2>
<p class="mb-4">Since each missionary connects their own Stripe account, Stripe supports cross-border payouts to connected accounts in 60+ countries.</p>

<h3 class="text-xl font-semibold mt-6 mb-3">Payout Support by Region</h3>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Africa:</strong> Nigeria, South Africa, Kenya, Ghana, Egypt, Morocco, and 12+ more</li>
<li><strong>Asia:</strong> India, Japan, Singapore, Hong Kong, Thailand, Philippines, Malaysia, Indonesia, and 17+ more</li>
<li><strong>South America:</strong> Brazil, Chile, Colombia, Argentina, Peru, Uruguay, Ecuador, and 4+ more</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Setting Up Your Stripe Account for International Payments</h2>

<h3 class="text-xl font-semibold mt-6 mb-3">Step 1: Connect Your Stripe Account</h3>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Go to your Admin Dashboard → <strong>Manage Giving</strong></li>
<li>Click <strong>Connect with Stripe</strong></li>
<li>Follow Stripe''s onboarding process</li>
<li>Provide required business/tax information for your country</li>
<li>Complete verification (may take 1-2 business days)</li>
</ol>

<h3 class="text-xl font-semibold mt-6 mb-3">Step 2: Enable Payment Methods</h3>
<p class="mb-4">By default, the following payment methods are automatically enabled:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>All major credit and debit cards (international)</li>
<li>US Bank Account transfers (ACH)</li>
<li>European SEPA transfers</li>
</ul>

<h3 class="text-xl font-semibold mt-6 mb-3">Step 3: Test Your Giving Page</h3>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Visit your public missionary site at <code>yourname.tektonstable.com</code></li>
<li>Click on <strong>Support</strong> or <strong>Give</strong></li>
<li>Test a small donation to verify everything works</li>
<li>Check your Stripe Dashboard to see the test payment</li>
</ol>

<h2 class="text-2xl font-bold mt-8 mb-4">Fees & Pricing</h2>

<h3 class="text-xl font-semibold mt-6 mb-3">Standard Stripe Fees</h3>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>US Cards:</strong> 2.9% + $0.30 per transaction</li>
<li><strong>International Cards:</strong> 3.9% + $0.30 per transaction</li>
<li><strong>Currency Conversion:</strong> 1% additional fee (if applicable)</li>
</ul>

<h3 class="text-xl font-semibold mt-6 mb-3">Nonprofit Discount</h3>
<p class="mb-4">If you represent a registered 501(c)(3) nonprofit organization, you may qualify for Stripe''s reduced processing rates:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>US Cards:</strong> 2.2% + $0.30</li>
<li><strong>International Cards:</strong> 3.2% + $0.30</li>
</ul>

<p class="mb-4">To apply for nonprofit pricing:</p>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Complete your Stripe account setup</li>
<li>Submit your IRS 501(c)(3) Determination Letter</li>
<li>Wait for Stripe approval (typically 2-5 business days)</li>
</ol>

<p class="mb-6"><a href="/stripe-nonprofit-calculator">Use our nonprofit fee calculator</a> to estimate your savings.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Accepting Donations in Multiple Currencies</h2>
<p class="mb-4">Currently, all donations are processed in <strong>USD</strong>. This provides several benefits:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Simplified accounting and reporting</li>
<li>Consistent pricing across all donors</li>
<li>Universal acceptance (USD is widely accepted globally)</li>
<li>Automatic currency conversion handled by donor''s bank</li>
</ul>

<p class="mb-6">If you need to accept donations in other currencies (EUR, GBP, INR, BRL, etc.), please contact support to discuss multi-currency setup options.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Compliance & Tax Considerations</h2>

<h3 class="text-xl font-semibold mt-6 mb-3">For Missionaries</h3>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Report all donations as income according to your local tax laws</li>
<li>Keep accurate records of all transactions</li>
<li>Understand currency conversion for accounting purposes</li>
<li>May need local tax ID or business registration depending on country</li>
</ul>

<h3 class="text-xl font-semibold mt-6 mb-3">For International Donors</h3>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Donations may not be tax-deductible in your country</li>
<li>Contact your local tax authority for guidance</li>
<li>Receipts are automatically emailed after each donation</li>
<li>Currency conversion is handled by your bank, not the platform</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Security & Fraud Protection</h2>
<p class="mb-4">All payments are processed securely through Stripe, which provides:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>PCI DSS Level 1 Compliance</strong> - Highest level of payment security</li>
<li><strong>3D Secure Authentication</strong> - Additional verification for high-risk regions</li>
<li><strong>Stripe Radar</strong> - Machine learning fraud detection</li>
<li><strong>SSL Encryption</strong> - All data is encrypted in transit</li>
<li><strong>No card data stored</strong> - Card information never touches our servers</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Common Questions</h2>

<h3 class="text-xl font-semibold mt-6 mb-3">Can donors use cards issued in their local country?</h3>
<p class="mb-6">Yes! Stripe accepts Visa, Mastercard, American Express, and Discover cards issued in 195+ countries worldwide.</p>

<h3 class="text-xl font-semibold mt-6 mb-3">Will donors see prices in their local currency?</h3>
<p class="mb-6">Donors will see prices in USD, but their bank will automatically convert to their local currency at checkout. Some banks show both amounts during the payment process.</p>

<h3 class="text-xl font-semibold mt-6 mb-3">What if a donation fails?</h3>
<p class="mb-4">Donation failures can happen for several reasons:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Insufficient funds</li>
<li>Card declined by bank</li>
<li>Incorrect card information</li>
<li>Bank requires additional authentication</li>
</ul>

<p class="mb-6">Donors will see a specific error message and can try again with a different payment method.</p>

<h3 class="text-xl font-semibold mt-6 mb-3">Can I receive payouts in my local currency?</h3>
<p class="mb-6">Yes! Stripe supports payouts in 135+ currencies. When setting up your Stripe account, you can specify your preferred payout currency and bank account.</p>

<h3 class="text-xl font-semibold mt-6 mb-3">How long do international payouts take?</h3>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>US Banks:</strong> 2 business days</li>
<li><strong>European Banks (SEPA):</strong> 2-3 business days</li>
<li><strong>Other International Banks:</strong> 3-7 business days</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Troubleshooting</h2>

<h3 class="text-xl font-semibold mt-6 mb-3">International donors cannot complete payment</h3>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Verify their card is enabled for international transactions</li>
<li>Ask them to contact their bank to authorize the payment</li>
<li>Check if 3D Secure authentication is required</li>
<li>Try a different card or payment method</li>
</ol>

<h3 class="text-xl font-semibold mt-6 mb-3">Payouts are not arriving in my bank account</h3>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Check your Stripe Dashboard for payout status</li>
<li>Verify your bank account information is correct</li>
<li>Check for any holds or verification requirements</li>
<li>Contact Stripe Support if delays exceed normal timeframes</li>
</ol>

<h3 class="text-xl font-semibold mt-6 mb-3">Need help with currency conversion accounting</h3>
<p class="mb-4">Stripe provides detailed transaction reports that include:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Original transaction amount (USD)</li>
<li>Fees deducted</li>
<li>Net payout amount</li>
<li>Payout currency and exchange rate</li>
<li>Date and time of transaction</li>
</ul>

<p class="mb-6">You can download these reports from your Stripe Dashboard under <strong>Reports</strong> → <strong>Balance</strong>.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Additional Resources</h2>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><a href="https://stripe.com/global" target="_blank" rel="noopener noreferrer">Stripe Global Coverage</a></li>
<li><a href="https://stripe.com/connect/country-availability" target="_blank" rel="noopener noreferrer">Stripe Connect Country Availability</a></li>
<li><a href="https://stripe.com/pricing#international-cards" target="_blank" rel="noopener noreferrer">International Card Pricing</a></li>
<li><a href="/stripe-nonprofit-calculator">Nonprofit Fee Calculator</a></li>
<li><a href="/help/article/stripe-nonprofit-discount">Applying for Stripe Nonprofit Discount</a></li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Need More Help?</h2>
<p class="mb-6">If you have specific questions about international payments or Stripe setup for your region, please <a href="/contact">contact our support team</a>. We''re here to help you successfully receive donations from supporters worldwide.</p>
</div>'::text)
)
WHERE slug = 'international-payments-stripe';
