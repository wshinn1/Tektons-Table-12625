'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateEmailPreferences } from '@/app/actions/email';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface EmailPreferencesProps {
  email: string;
  currentPreference: boolean;
}

export function EmailPreferences({ email, currentPreference }: EmailPreferencesProps) {
  const [enabled, setEnabled] = useState(currentPreference);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    setEnabled(checked);

    const result = await updateEmailPreferences(email, checked);

    if (result.error) {
      toast.error('Failed to update preferences');
      setEnabled(!checked);
    } else {
      toast.success(checked ? 'Email notifications enabled' : 'Email notifications disabled');
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="space-y-0.5">
        <Label htmlFor="email-notifications" className="text-base">
          Email Notifications
        </Label>
        <p className="text-sm text-muted-foreground">
          Receive updates when new posts are published
        </p>
      </div>
      <Switch
        id="email-notifications"
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  );
}
