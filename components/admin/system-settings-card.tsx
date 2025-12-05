'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface SystemSetting {
  id: string
  setting_key: string
  setting_value: any
  description: string
}

interface Props {
  settings: SystemSetting[]
}

export function SystemSettingsCard({ settings }: Props) {
  const [localSettings, setLocalSettings] = useState(settings)

  const getSettingValue = (key: string): boolean => {
    const setting = localSettings.find(s => s.setting_key === key)
    return setting?.setting_value?.enabled || false
  }

  const handleToggle = async (key: string, value: boolean) => {
    // Update local state
    setLocalSettings(prev => prev.map(s => 
      s.setting_key === key 
        ? { ...s, setting_value: { enabled: value } }
        : s
    ))

    // TODO: Call server action to update setting
    // await updateSystemSetting(key, value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System-Wide Settings</CardTitle>
        <CardDescription>
          Control platform-wide features and access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Maintenance Mode</Label>
            <p className="text-sm text-muted-foreground">
              Display maintenance message to all users
            </p>
          </div>
          <Switch 
            checked={getSettingValue('maintenance_mode')}
            onCheckedChange={(val) => handleToggle('maintenance_mode', val)}
          />
        </div>

        {getSettingValue('maintenance_mode') && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Platform is in maintenance mode. Only super admins can access.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <Label>New Signups</Label>
            <p className="text-sm text-muted-foreground">
              Allow new missionary registrations
            </p>
          </div>
          <Switch 
            checked={getSettingValue('new_signups_enabled')}
            onCheckedChange={(val) => handleToggle('new_signups_enabled', val)}
          />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Platform-wide email notifications
            </p>
          </div>
          <Switch 
            checked={getSettingValue('email_notifications_enabled')}
            onCheckedChange={(val) => handleToggle('email_notifications_enabled', val)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
