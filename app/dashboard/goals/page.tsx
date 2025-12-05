import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export default async function GoalsPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!tenant) redirect('/onboarding')

  const { data: goals } = await supabase
    .from('funding_goals')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Funding Goals</h1>
          <p className="text-muted-foreground">Track your fundraising milestones</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/goals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Goal
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {goals && goals.length > 0 ? (
          goals.map((goal) => {
            const percentage = Math.min(
              Math.round((goal.current_amount / goal.target_amount) * 100),
              100
            )
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle>{goal.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>${(goal.current_amount / 100).toFixed(2)} raised</span>
                      <span>Goal: ${(goal.target_amount / 100).toFixed(2)}</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {percentage}% complete
                    </p>
                  </div>
                  
                  {goal.deadline && (
                    <p className="text-sm text-muted-foreground">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/goals/${goal.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No funding goals yet. Create one to track your progress!
              </p>
              <Button asChild>
                <Link href="/dashboard/goals/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create First Goal
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
