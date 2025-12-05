import { updateEmailPreferences } from '@/app/actions/email';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { email?: string; success?: string };
}) {
  const email = searchParams.email;

  const handleUnsubscribe = async () => {
    'use server';
    if (email) {
      await updateEmailPreferences(email, false);
      redirect(`/unsubscribe?success=true`);
    }
  };

  if (searchParams.success) {
    return (
      <div className="container max-w-2xl py-16">
        <Card>
          <CardHeader>
            <CardTitle>Unsubscribed Successfully</CardTitle>
            <CardDescription>You will no longer receive email notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You can resubscribe anytime from your supporter dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader>
          <CardTitle>Unsubscribe from Emails</CardTitle>
          <CardDescription>
            {email
              ? `Stop receiving email notifications at ${email}`
              : 'Invalid email address'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email ? (
            <form action={handleUnsubscribe}>
              <Button type="submit" variant="destructive" size="lg" className="w-full">
                Unsubscribe
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Please use the unsubscribe link from your email.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
