# International Payment Support

## Overview

The giving system fully supports international donations from donors worldwide, including Asia, Africa, and South America. All donations are processed through Stripe, which accepts credit and debit cards from virtually any country.

## Supported Payment Methods

### Currently Enabled

- **Credit/Debit Cards** (Visa, Mastercard, Amex, Discover) - **Global Support**
- US Bank Account (ACH) - US only
- SEPA Debit - Eurozone only
- iDEAL - Netherlands only
- Bancontact - Belgium only

### Card Payment Coverage

Card payments (Visa/Mastercard) work from **195+ countries worldwide**, including all major countries in Asia, Africa, and South America.

## Supported Countries by Region

### Africa (18+ countries)

- Nigeria
- South Africa
- Kenya
- Ghana
- Egypt
- Morocco
- Algeria
- Ethiopia
- Tanzania
- Uganda
- Rwanda
- Botswana
- Namibia
- Mozambique
- Madagascar
- Angola
- Gabon
- Côte d'Ivoire

### Asia (25+ countries)

- China
- India
- Japan
- Singapore
- South Korea
- Thailand
- Philippines
- Vietnam
- Indonesia
- Malaysia
- Hong Kong
- Taiwan
- Israel
- UAE
- Saudi Arabia
- Qatar
- Kuwait
- Oman
- Jordan
- Pakistan
- Bangladesh
- Sri Lanka
- Cambodia
- Laos
- Mongolia

### South America (11+ countries)

- Brazil
- Argentina
- Chile
- Colombia
- Peru
- Mexico
- Uruguay
- Ecuador
- Bolivia
- Paraguay
- Venezuela

## How It Works

### For Donors

1. Donor visits the missionary's giving page
2. Selects donation amount (displayed in USD)
3. Enters their local credit/debit card information
4. Stripe processes the payment in USD
5. Donor's bank converts USD to their local currency
6. Donation appears in missionary's Stripe account

### Currency Conversion

- All donations are processed in **USD**
- International donors see pricing in USD
- Their bank handles currency conversion at checkout
- Small foreign transaction fees may apply (typically 1-3%)

### No Geographic Restrictions

The current configuration has **no country blocklists**, meaning Stripe will accept payments from any country where Visa/Mastercard are supported.

## Stripe Connect Cross-Border Payouts

Since each missionary connects their own Stripe account, Stripe supports cross-border payouts to connected accounts in 60+ countries.

### Payout Support by Region

**Africa:** Nigeria, South Africa, Kenya, Ghana, Egypt, Morocco, and 12+ more

**Asia:** India, Japan, Singapore, Hong Kong, Thailand, Philippines, Malaysia, Indonesia, and 17+ more

**South America:** Brazil, Chile, Colombia, Argentina, Peru, Uruguay, Ecuador, and 4+ more

## Current Configuration

### Stripe Settings

```typescript
// From: app/actions/stripe-donations.ts

payment_method_types: [
  'card',
  'us_bank_account',
  'sepa_debit',
  'ideal',
  'bancontact'
]

currency: 'usd'
mode: 'payment' // One-time or subscription
```

### Features Enabled

- ✅ International card payments
- ✅ Automatic currency conversion
- ✅ Stripe Connect for missionaries
- ✅ One-time and recurring donations
- ✅ Custom donation amounts
- ✅ Donor receipt emails
- ✅ Donor database tracking

## Recommendations for Enhanced International Support

### 1. Add Regional Payment Methods

To improve conversion rates in specific regions, consider adding:

**Asia:**
- Alipay (China)
- WeChat Pay (China)
- GrabPay (Southeast Asia)
- Paytm (India)
- LINE Pay (Japan, Thailand)

**Latin America:**
- MercadoPago (Brazil, Argentina, Mexico)
- OXXO (Mexico)
- Boleto (Brazil)

**Africa:**
- M-Pesa (Kenya, Tanzania)
- Airtel Money (Multiple countries)
- Mobile Money integrations

### 2. Multi-Currency Support

Enable donations in local currencies:
- EUR (Europe)
- GBP (UK)
- INR (India)
- BRL (Brazil)
- JPY (Japan)
- AUD (Australia)
- CAD (Canada)

**Benefits:**
- Donors see familiar pricing
- Eliminates currency conversion confusion
- May reduce cart abandonment
- Better tax reporting for donors

### 3. Display Pricing in Multiple Currencies

Show approximate amounts in donor's local currency:
```
$50 USD ≈ ₹4,150 INR ≈ R$250 BRL ≈ ₦77,500 NGN
```

### 4. Fraud Prevention Enhancements

For international transactions, consider:
- Enable billing address collection
- Use Stripe Radar for fraud detection
- Require postal code verification
- Enable 3D Secure authentication for high-risk regions

### 5. Localization

Improve donor experience with:
- Multi-language support (Spanish, Portuguese, French, Chinese, etc.)
- Region-specific donation amounts
- Local payment method icons
- Culturally appropriate messaging

## Implementation Code

### Add Regional Payment Methods

```typescript
// In app/actions/stripe-donations.ts

payment_method_types: [
  'card',
  'us_bank_account',
  'sepa_debit',
  'ideal',
  'bancontact',
  // Add regional methods
  'alipay',
  'wechat_pay',
  'grabpay',
  'paytm',
  'oxxo',
  'boleto'
]
```

### Enable Multi-Currency

```typescript
// Detect donor location and offer local currency
const donorCountry = await detectCountry(request);
const currency = getCurrencyForCountry(donorCountry); // 'usd', 'eur', 'inr', etc.

await stripe.checkout.sessions.create({
  currency: currency,
  // ... rest of config
});
```

### Add Billing Address Collection

```typescript
await stripe.checkout.sessions.create({
  billing_address_collection: 'required',
  // Improves fraud prevention for international payments
});
```

## Testing International Payments

### Stripe Test Cards by Region

Stripe provides test cards for different countries:

```
US Card: 4242 4242 4242 4242
UK Card: 4000 0082 6000 0000
India Card: 4000 0035 6000 0008
Brazil Card: 4000 0007 6000 0002
```

### Testing Steps

1. Enable test mode in Stripe dashboard
2. Use test cards from target countries
3. Verify currency conversion displays correctly
4. Check receipt emails include correct currency
5. Confirm payouts work to connected accounts

## Monitoring & Analytics

### Track International Donations

```typescript
// Add country tracking to donations
await supabase
  .from('donations')
  .insert({
    amount,
    currency,
    donor_country: donorCountry,
    payment_method_type: paymentMethod
  });
```

### Key Metrics to Monitor

- Conversion rate by country
- Average donation by region
- Payment method preferences
- Failed payment reasons
- Currency conversion costs

## Support Resources

### For Missionaries

- [Stripe Connect Country Support](https://stripe.com/connect/country-availability)
- [Cross-Border Payout Guide](https://stripe.com/docs/connect/cross-border-payouts)
- [International Pricing](https://stripe.com/pricing#international-cards)

### For Donors

- Stripe accepts Visa, Mastercard, Amex from 195+ countries
- Currency conversion handled automatically
- Foreign transaction fees depend on donor's bank
- All donations are secure and PCI-compliant

## Compliance Considerations

### International Regulations

- **GDPR** (Europe): Data privacy compliance required
- **PSD2** (Europe): Strong customer authentication
- **PCI DSS**: Payment security standards (handled by Stripe)
- **Tax Regulations**: Varies by country for receipts

### Missionary Requirements

For missionaries receiving international donations:
- May need local tax ID or registration
- Report foreign income per local laws
- Understand currency conversion for accounting
- Provide tax receipts per donor's country requirements

## Current Status

✅ **Fully Functional** - Donors from Asia, Africa, and South America can donate today using credit/debit cards without any code changes needed.

🔄 **Optional Enhancements** - Regional payment methods and multi-currency support can improve conversion rates but are not required for basic functionality.

## Questions?

For technical questions about the implementation, check:
- `/app/actions/stripe-donations.ts` - Donation processing logic
- `/lib/stripe.ts` - Stripe configuration
- Stripe Dashboard - Payment analytics and settings
