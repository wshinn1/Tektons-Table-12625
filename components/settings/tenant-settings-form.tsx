'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { updateTenantSettings } from '@/app/actions/tenant-settings'
import { NonprofitModal } from './nonprofit-modal'

interface TenantSettingsFormProps {
  tenant: any
}

export function TenantSettingsForm({ tenant }: TenantSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: tenant.full_name || '',
    mission_organization: tenant.mission_organization || '',
    location: tenant.location || '',
    bio: tenant.bio || '',
    personal_reply_email: tenant.personal_reply_email || '',
    email_signature: tenant.email_signature || '',
    language_preference: tenant.language_preference || 'en',
    is_nonprofit: tenant.is_nonprofit || false,
  })
  const [showNonprofitModal, setShowNonprofitModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateTenantSettings(formData)
    
    if (result.success) {
      toast.success('Settings updated successfully')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to update settings')
    }
    
    setLoading(false)
  }

  const handleNonprofitChange = (checked: boolean) => {
    if (checked && !formData.is_nonprofit) {
      // Show modal before enabling
      setShowNonprofitModal(true)
    } else {
      // Allow unchecking without modal
      setFormData({ ...formData, is_nonprofit: checked })
    }
  }

  const handleNonprofitConfirm = () => {
    setFormData({ ...formData, is_nonprofit: true })
    setShowNonprofitModal(false)
  }

  return (
    <>
      <NonprofitModal
        open={showNonprofitModal}
        onOpenChange={setShowNonprofitModal}
        onConfirm={handleNonprofitConfirm}
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your public profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission_organization">Mission Organization</Label>
              <Input
                id="mission_organization"
                value={formData.mission_organization}
                onChange={(e) => setFormData({ ...formData, mission_organization: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Country, City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Mission Statement</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell supporters about your mission..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>
              Configure how emails are sent to your supporters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personal_reply_email">Reply-To Email</Label>
              <Input
                id="personal_reply_email"
                type="email"
                value={formData.personal_reply_email}
                onChange={(e) => setFormData({ ...formData, personal_reply_email: e.target.value })}
                placeholder="your.email@example.com"
              />
              <p className="text-sm text-muted-foreground">
                When supporters reply to newsletters, responses will go to this email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_signature">Email Signature</Label>
              <Textarea
                id="email_signature"
                value={formData.email_signature}
                onChange={(e) => setFormData({ ...formData, email_signature: e.target.value })}
                rows={3}
                placeholder="Thanks for your support!\nYour name"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nonprofit Status</CardTitle>
            <CardDescription>
              Get Stripe's reduced processing rates for registered nonprofits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                id="is_nonprofit"
                checked={formData.is_nonprofit}
                onChange={(e) => handleNonprofitChange(e.target.checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="is_nonprofit" className="font-semibold cursor-pointer">
                  This is a registered 501(c)(3) nonprofit organization
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Nonprofit organizations qualify for Stripe's reduced processing rates (2.2% vs 2.9%)
                </p>
                {tenant.nonprofit_verification_status && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Verification Status: </span>
                    <span className={`text-sm ${
                      tenant.nonprofit_verification_status === 'verified' ? 'text-green-600' :
                      tenant.nonprofit_verification_status === 'pending' ? 'text-yellow-600' :
                      tenant.nonprofit_verification_status === 'rejected' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {tenant.nonprofit_verification_status.charAt(0).toUpperCase() + tenant.nonprofit_verification_status.slice(1)}
                    </span>
                  </div>
                )}
                {formData.is_nonprofit && tenant.nonprofit_verification_status !== 'verified' && (
                  <p className="text-sm text-yellow-600 mt-2">
                    ⚠️ Verification required. Contact support@tektonstable.com with your 501(c)(3) documentation.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Preference</CardTitle>
            <CardDescription>
              Choose your preferred language for the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={formData.language_preference}
              onChange={(e) => setFormData({ ...formData, language_preference: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="fr">Français</option>
              <option value="ko">한국어</option>
              <option value="zh">中文</option>
            </select>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </>
  )
}
