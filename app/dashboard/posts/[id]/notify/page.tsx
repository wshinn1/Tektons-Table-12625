import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { sendPostNotification } from '@/app/actions/email';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NotifyPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get post details
  const { data: post } = await supabase
    .from('posts')
    .select('title, status')
    .eq('id', params.id)
    .eq('tenant_id', user.id)
    .single();

  if (!post) {
    redirect('/dashboard/posts');
  }

  // Get supporter count
  const { count } = await supabase
    .from('supporter_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('email_notifications', true)
    .is('unsubscribed_at', null);

  const handleSendNotifications = async () => {
    'use server';
    await sendPostNotification(params.id);
    redirect('/dashboard/posts?notified=true');
  };

  return (
    <div className="container max-w-2xl py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/dashboard/posts">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Send Post Notification</CardTitle>
          <CardDescription>
            Notify your supporters about this new post
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-sm text-muted-foreground">Status: {post.status}</p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              This will send an email notification to <strong>{count || 0} subscribers</strong> who
              have email notifications enabled.
            </p>
          </div>

          {count && count > 0 ? (
            <form action={handleSendNotifications}>
              <Button type="submit" size="lg" className="w-full">
                Send Notifications to {count} Subscribers
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any subscribers with email notifications enabled yet.
              </p>
              <Button variant="outline" asChild>
                <Link href="/dashboard/supporters">View Supporters</Link>
              </Button>
            </div>
          )}

          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/posts">Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
