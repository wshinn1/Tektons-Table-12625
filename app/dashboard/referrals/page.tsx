import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Copy, Share2, Mail, Facebook, Twitter } from 'lucide-react'

const REFERRAL_TIERS = {
  welcome: { rate: 2.50, label: 'Welcome Discount', referrals: 0 },
  standard: { rate: 3.50, label: 'Standard Rate', referrals: 0 },
  bronze: { rate: 3.00, label: 'Bronze Advocate', referrals: 3 },
  silver: { rate: 2.75, label: 'Silver Advocate', referrals: 5 },
  gold: { rate: 2.50, label: 'Gold Advocate', referrals: 10 },
  platinum: { rate: 2.25, label: 'Platinum Advocate', referrals: 25 },
}

export default async function ReferralsPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get referral code
  const { data: referralCode } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('tenant_id', user.id)
    .single()

  // Get pricing info
  const { data: pricing } = await supabase
    .from('tenant_pricing')
    .select('*')
    .eq('tenant_id', user.id)
    .single()

  // Get referral history
  const { data: referrals } = await supabase
    .from('referrals')
    .select(`
      *,
      referee:referee_tenant_id(full_name, email)
    `)
    .eq('referrer_tenant_id', user.id)
    .order('created_at', { ascending: false })

  const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join?ref=${referralCode?.code}`

  // Calculate next tier
  let nextTier = null
  const currentCount = pricing?.referral_count || 0
  
  if (currentCount < 3) nextTier = { ...REFERRAL_TIERS.bronze, needed: 3 - currentCount }
  else if (currentCount < 5) nextTier = { ...REFERRAL_TIERS.silver, needed: 5 - currentCount }
  else if (currentCount < 10) nextTier = { ...REFERRAL_TIERS.gold, needed: 10 - currentCount }
  else if (currentCount < 25) nextTier = { ...REFERRAL_TIERS.platinum, needed: 25 - currentCount }

  const tierProgress = nextTier ? ((currentCount / nextTier.referrals) * 100) : 100

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-muted-foreground">
          Lower your platform fee by inviting fellow missionaries to Tektons Table
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Current Tier Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Current Tier</CardTitle>
            <CardDescription>Platform fee you pay on donations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Badge className="text-lg px-4 py-2">
                {REFERRAL_TIERS[pricing?.rate_tier || 'standard'].label}
              </Badge>
              <div className="text-right">
                <div className="text-3xl font-bold">{pricing?.current_rate_percentage}%</div>
                <div className="text-sm text-muted-foreground">Platform Fee</div>
              </div>
            </div>
            
            {pricing?.discounted_until && new Date(pricing.discounted_until) > new Date() && (
              <div className="text-sm text-muted-foreground mb-4">
                Welcome discount expires: {new Date(pricing.discounted_until).toLocaleDateString()}
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Completed Referrals</span>
                <span className="font-semibold">{currentCount}</span>
              </div>
              {nextTier && (
                <>
                  <Progress value={tierProgress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {nextTier.needed} more to unlock {nextTier.label} ({nextTier.rate}%)
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Referral Link Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link to invite missionaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <Button
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(referralLink)
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`mailto:?subject=Join me on Tektons Table&body=I've been using Tektons Table for missionary fundraising and thought you might be interested! ${referralLink}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank">
                    <Facebook className="h-4 w-4 mr-2" />
                    Share
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`https://twitter.com/intent/tweet?text=Join me on Tektons Table!&url=${encodeURIComponent(referralLink)}`} target="_blank">
                    <Twitter className="h-4 w-4 mr-2" />
                    Tweet
                  </a>
                </Button>
              </div>

              <div className="text-center text-sm">
                <strong>Referral Code:</strong> {referralCode?.code}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Comparison Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Referral Tiers</CardTitle>
          <CardDescription>Unlock lower rates by referring more missionaries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Tier</th>
                  <th className="text-left py-2">Referrals Needed</th>
                  <th className="text-left py-2">Platform Fee</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(REFERRAL_TIERS).map(([key, tier]) => (
                  key !== 'welcome' && (
                    <tr key={key} className="border-b">
                      <td className="py-3 font-medium">{tier.label}</td>
                      <td className="py-3">{tier.referrals === 0 ? 'Default' : tier.referrals}</td>
                      <td className="py-3 font-semibold">{tier.rate}%</td>
                      <td className="py-3">
                        {currentCount >= tier.referrals ? (
                          <Badge variant="default">Unlocked</Badge>
                        ) : (
                          <Badge variant="outline">Locked</Badge>
                        )}
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Missionaries who joined using your link</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals && referrals.length > 0 ? (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="font-medium">{referral.referee?.full_name || 'New User'}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={referral.status === 'completed' ? 'default' : 'outline'}>
                    {referral.status === 'completed' ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No referrals yet. Share your link to get started!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
