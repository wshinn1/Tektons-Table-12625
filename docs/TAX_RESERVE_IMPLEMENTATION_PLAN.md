# Tax Reserve Tracking Feature - Implementation Plan

## Overview
Implement a database-driven tax reserve tracking system that allows tenants to designate a percentage of donations to be categorized as "tax reserve". This is purely tracking/visualization - no actual fund separation occurs in Stripe.

## Feature Description
- Tenants can set a tax reserve percentage (0-100%, typically 0-15%)
- System calculates and displays how much should be set aside for taxes
- All money remains in tenant's Stripe account
- Provides visibility for tax planning without fund custody

---

## Database Schema Changes

### 1. Add Tax Settings to Tenants Table
\`\`\`sql
ALTER TABLE tenants 
ADD COLUMN tax_reserve_percentage DECIMAL(5,2) DEFAULT 0 CHECK (tax_reserve_percentage >= 0 AND tax_reserve_percentage <= 100);
\`\`\`

### 2. Add Tax Tracking to Donations Table
\`\`\`sql
ALTER TABLE donations 
ADD COLUMN tax_reserve_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN operating_amount DECIMAL(10,2);
\`\`\`

**Note:** Calculate these values when donations are created:
- `tax_reserve_amount = total_amount * (tax_reserve_percentage / 100)`
- `operating_amount = total_amount - tax_reserve_amount`

---

## Implementation Steps

### Phase 1: Backend Foundation (2-3 hours)

#### Step 1.1: Database Migration
- [ ] Create migration script to add columns to tenants and donations tables
- [ ] Run migration on development database
- [ ] Test migration rollback scenario

#### Step 1.2: Update Donation Creation Logic
**File:** `app/actions/donations.ts` (or wherever donation processing occurs)

\`\`\`typescript
// When creating a donation record
const tenant = await getTenantSettings(tenantId);
const taxReservePercentage = tenant.tax_reserve_percentage || 0;
const taxReserveAmount = (donationAmount * taxReservePercentage) / 100;
const operatingAmount = donationAmount - taxReserveAmount;

await supabase.from('donations').insert({
  // ... other fields
  amount: donationAmount,
  tax_reserve_amount: taxReserveAmount,
  operating_amount: operatingAmount,
});
\`\`\`

#### Step 1.3: Create Tax Summary Queries
**File:** `app/actions/financial-reports.ts`

\`\`\`typescript
export async function getTaxReserveSummary(tenantId: string) {
  const { data, error } = await supabase
    .from('donations')
    .select('tax_reserve_amount, operating_amount, amount, created_at')
    .eq('tenant_id', tenantId)
    .eq('status', 'succeeded');

  const summary = {
    totalDonations: data.reduce((sum, d) => sum + d.amount, 0),
    totalTaxReserve: data.reduce((sum, d) => sum + d.tax_reserve_amount, 0),
    totalOperating: data.reduce((sum, d) => sum + d.operating_amount, 0),
  };

  return summary;
}
\`\`\`

---

### Phase 2: Admin Settings UI (2 hours)

#### Step 2.1: Add Tax Settings to Giving Page
**File:** `app/[tenant]/admin/giving/page.tsx`

Add a new section:
\`\`\`tsx
<Card>
  <CardHeader>
    <CardTitle>Tax Reserve Settings</CardTitle>
    <CardDescription>
      Automatically categorize a percentage of donations as tax reserve for better financial planning.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <Label htmlFor="tax-percentage">Tax Reserve Percentage (%)</Label>
        <Input
          id="tax-percentage"
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={taxPercentage}
          onChange={(e) => setTaxPercentage(parseFloat(e.target.value))}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Set the percentage of each donation to categorize for tax reserves (0-100%)
        </p>
      </div>
      
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          This is for tracking only. All funds remain in your Stripe account. 
          You'll need to manually withdraw and set aside the tax reserve amount.
        </AlertDescription>
      </Alert>

      <Button onClick={saveTaxSettings}>Save Tax Settings</Button>
    </div>
  </CardContent>
</Card>
\`\`\`

#### Step 2.2: Create Server Action for Saving Settings
**File:** `app/actions/giving-settings.ts`

\`\`\`typescript
export async function updateTaxReservePercentage(
  tenantId: string,
  percentage: number
) {
  // Validate percentage
  if (percentage < 0 || percentage > 100) {
    return { success: false, error: 'Percentage must be between 0 and 100' };
  }

  const { error } = await supabase
    .from('tenants')
    .update({ tax_reserve_percentage: percentage })
    .eq('id', tenantId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[tenant]/admin/giving');
  return { success: true };
}
\`\`\`

---

### Phase 3: Financial Dashboard UI (3-4 hours)

#### Step 3.1: Create Tax Reserve Dashboard Card
**File:** `components/tenant/tax-reserve-card.tsx`

\`\`\`tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, PiggyBank, TrendingUp } from 'lucide-react'

interface TaxReserveSummary {
  totalDonations: number
  totalTaxReserve: number
  totalOperating: number
  taxPercentage: number
}

export function TaxReserveCard({ summary }: { summary: TaxReserveSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${summary.totalDonations.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All donations received
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tax Reserve ({summary.taxPercentage}%)</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            ${summary.totalTaxReserve.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Recommended to set aside
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Available for Ministry</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${summary.totalOperating.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            After tax reserve
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

#### Step 3.2: Add to Financial Reports Page
**File:** `app/[tenant]/admin/financial-reports/page.tsx`

\`\`\`tsx
import { getTaxReserveSummary } from '@/app/actions/financial-reports'
import { TaxReserveCard } from '@/components/tenant/tax-reserve-card'

export default async function FinancialReportsPage({ params }) {
  const tenant = await getTenantFromParams(params);
  const taxSummary = await getTaxReserveSummary(tenant.id);
  
  return (
    <div className="space-y-6">
      <h1>Financial Reports</h1>
      
      {/* Tax Reserve Overview */}
      <TaxReserveCard summary={taxSummary} />
      
      {/* ... existing financial reports ... */}
    </div>
  )
}
\`\`\`

#### Step 3.3: Add Tax Reserve Column to Donations Table
**File:** `app/[tenant]/admin/financial-reports/page.tsx`

Update the donations table to show tax breakdown:

\`\`\`tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Date</TableHead>
      <TableHead>Donor</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead>Tax Reserve</TableHead>
      <TableHead>Operating</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {donations.map((donation) => (
      <TableRow key={donation.id}>
        <TableCell>{formatDate(donation.created_at)}</TableCell>
        <TableCell>{donation.donor_name}</TableCell>
        <TableCell>${donation.amount.toFixed(2)}</TableCell>
        <TableCell className="text-amber-600">
          ${donation.tax_reserve_amount.toFixed(2)}
        </TableCell>
        <TableCell className="text-green-600">
          ${donation.operating_amount.toFixed(2)}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
\`\`\`

---

### Phase 4: Retroactive Calculation (1 hour)

For existing donations that don't have tax amounts calculated, create a migration script:

**File:** `scripts/backfill_tax_reserves.sql`

\`\`\`sql
-- Update existing donations to calculate tax reserve amounts
UPDATE donations d
SET 
  tax_reserve_amount = d.amount * (t.tax_reserve_percentage / 100),
  operating_amount = d.amount - (d.amount * (t.tax_reserve_percentage / 100))
FROM tenants t
WHERE d.tenant_id = t.id
  AND d.tax_reserve_amount IS NULL;
\`\`\`

---

## Testing Checklist

### Unit Tests
- [ ] Tax percentage validation (0-100 range)
- [ ] Tax amount calculation accuracy
- [ ] Operating amount calculation accuracy
- [ ] Edge cases: 0%, 100%, decimal percentages

### Integration Tests
- [ ] Donation creation with tax calculation
- [ ] Tax settings update flow
- [ ] Financial summary aggregation
- [ ] Retroactive calculation for existing donations

### Manual Testing
- [ ] Create tenant, set tax percentage to 10%
- [ ] Process test donation of $100
- [ ] Verify: Tax Reserve = $10, Operating = $90
- [ ] Update tax percentage to 15%
- [ ] Process another donation
- [ ] Verify dashboard shows correct totals
- [ ] Change tax percentage to 0%, verify donations have no reserve

---

## UI/UX Considerations

### Information Architecture
1. **Settings Location:** Add tax reserve settings to "Manage Giving" page
2. **Dashboard Location:** Show tax summary on Financial Reports page
3. **Transaction View:** Add tax breakdown column to donations table

### User Education
Include help text explaining:
- This is tracking only, not fund separation
- All money stays in their Stripe account
- They must manually set aside funds
- Changing percentage only affects new donations

### Visual Design
- Use amber/yellow colors for tax reserve amounts
- Use green colors for operating/available amounts
- Add info icons with tooltips explaining the feature
- Use cards to separate the three key metrics

---

## Future Enhancements (Not in MVP)

1. **Export for Tax Filing**
   - Generate CSV/PDF reports of tax reserves by year
   - Calculate total tax liability

2. **Historical Tracking**
   - Show tax reserve trend over time
   - Graph of operating vs tax reserve balance

3. **Withdrawal Tracking**
   - Let tenants mark when they've "withdrawn" tax reserves
   - Track "allocated" vs "actually set aside"

4. **Multi-Category Reserves**
   - Add other categories: "Emergency Fund", "Ministry Trip", etc.
   - Multiple percentage allocations

5. **Upgrade Path to Stripe Treasury**
   - If demand is high, implement actual fund separation
   - Migrate tracking data to real accounts

---

## Deployment Plan

### Development
1. Create feature branch: `feature/tax-reserve-tracking`
2. Implement database changes
3. Implement backend logic
4. Implement UI components
5. Write tests
6. Code review

### Staging
1. Run database migrations
2. Backfill existing donations
3. Test with sample tenant account
4. Verify calculations

### Production
1. Run migrations during low-traffic window
2. Monitor for errors
3. Send announcement to users explaining new feature

---

## Estimated Timeline
- **Phase 1 (Backend):** 2-3 hours
- **Phase 2 (Settings UI):** 2 hours
- **Phase 3 (Dashboard UI):** 3-4 hours
- **Phase 4 (Retroactive):** 1 hour
- **Testing:** 2 hours
- **Total:** 10-12 hours of development time

---

## Technical Debt & Considerations

### Performance
- Tax calculations happen at donation creation (no performance impact)
- Aggregation queries may need indexing for large datasets
- Consider caching summary calculations for high-volume tenants

### Data Integrity
- Ensure tax amounts are immutable after donation creation
- Handle edge cases: refunds, disputes, chargebacks
- What happens when percentage changes? (Only affects new donations)

### Compliance
- This is NOT tax advice or actual tax withholding
- Add disclaimers that tenants should consult tax professionals
- Document that platform is not holding funds

---

## Success Metrics
- % of tenants who enable tax reserve tracking
- Average tax reserve percentage set
- User feedback on feature usefulness
- Reduction in "How do I handle taxes?" support tickets

---

## Questions to Resolve Before Implementation
1. Should we allow tax percentage to change retroactively?
2. Do we need historical tracking of percentage changes?
3. Should there be a default percentage (e.g., 10%) or start at 0%?
4. Do we want to send notifications when tax reserve reaches a threshold?
5. Should this be opt-in or automatically available to all tenants?
