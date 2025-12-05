import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const isAdmin = await isSuperAdmin(data.user.id)

  if (!isAdmin) {
    // Get tenant profile to redirect to their new admin dashboard
    const { data: tenant } = await supabase.from("tenants").select("subdomain").eq("id", data.user.id).single()

    if (!tenant) {
      redirect("/onboarding")
    }

    // Redirect to new tenant admin dashboard
    redirect(`/${tenant.subdomain}/admin`)
  }

  // But this should rarely happen as they should navigate to /admin directly
  redirect("/admin")

  // The rest of the code here is now redundant due to the redirect above.
  // If you need to keep it for some reason, please uncomment the following lines.

  // const { count: postsCount } = await supabase
  //   .from("posts")
  //   .select("*", { count: "exact", head: true })
  //   .eq("tenant_id", tenant.id)

  // const { count: supportersCount } = await supabase
  //   .from("supporters")
  //   .select("*", { count: "exact", head: true })
  //   .eq("tenant_id", tenant.id)

  // const { count: goalsCount } = await supabase
  //   .from("funding_goals")
  //   .select("*", { count: "exact", head: true })
  //   .eq("tenant_id", tenant.id)
  //   .eq("is_active", true)

  // const { data: donations } = await supabase
  //   .from("donations")
  //   .select("amount")
  //   .eq("tenant_id", tenant.id)
  //   .eq("status", "succeeded")

  // const totalRaised = donations?.reduce((sum, d) => sum + d.amount, 0) || 0

  // const { data: pricing } = await supabase.from("tenant_pricing").select("*").eq("tenant_id", tenant.id).single()

  // const { data: platformFeeConfig } = await supabase
  //   .from("platform_settings")
  //   .select("setting_value")
  //   .eq("setting_key", "base_platform_fee_percentage")
  //   .single()

  // const basePlatformFee = platformFeeConfig?.setting_value
  //   ? Number.parseFloat(platformFeeConfig.setting_value as string)
  //   : 3.5

  // const { data: referralCode } = await supabase
  //   .from("referral_codes")
  //   .select("code, times_used")
  //   .eq("tenant_id", tenant.id)
  //   .single()

  // const { count: messagesCount } = await supabase
  //   .from("contact_messages")
  //   .select("*", { count: "exact", head: true })
  //   .eq("tenant_id", tenant.id)
  //   .eq("status", "unread")

  // return (
  //   <div className="container mx-auto p-6 max-w-7xl">
  //     <div className="mb-8">
  //       <h1 className="text-3xl font-bold">Welcome back, {tenant.full_name}!</h1>
  //       <p className="text-muted-foreground mt-1">Manage your missionary fundraising from one place</p>
  //     </div>

  //     {/* Quick Stats */}
  //     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
  //       <Card>
  //         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //           <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
  //           <DollarSign className="h-4 w-4 text-muted-foreground" />
  //         </CardHeader>
  //         <CardContent>
  //           <div className="text-2xl font-bold">${(totalRaised / 100).toLocaleString()}</div>
  //           <p className="text-xs text-muted-foreground">
  //             Platform fee: {pricing?.current_rate_percentage || basePlatformFee}%
  //           </p>
  //         </CardContent>
  //       </Card>

  //       <Card>
  //         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //           <CardTitle className="text-sm font-medium">Supporters</CardTitle>
  //           <Users className="h-4 w-4 text-muted-foreground" />
  //         </CardHeader>
  //         <CardContent>
  //           <div className="text-2xl font-bold">{supportersCount || 0}</div>
  //           <p className="text-xs text-muted-foreground">Your prayer partners</p>
  //         </CardContent>
  //       </Card>

  //       <Card>
  //         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //           <CardTitle className="text-sm font-medium">Posts</CardTitle>
  //           <FileText className="h-4 w-4 text-muted-foreground" />
  //         </CardHeader>
  //         <CardContent>
  //           <div className="text-2xl font-bold">{postsCount || 0}</div>
  //           <p className="text-xs text-muted-foreground">Ministry updates</p>
  //         </CardContent>
  //       </Card>

  //       <Card>
  //         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //           <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
  //           <Target className="h-4 w-4 text-muted-foreground" />
  //         </CardHeader>
  //         <CardContent>
  //           <div className="text-2xl font-bold">{goalsCount || 0}</div>
  //           <p className="text-xs text-muted-foreground">Fundraising targets</p>
  //         </CardContent>
  //       </Card>
  //     </div>

  //     {pricing && (
  //       <Card className="mb-8 border-primary">
  //         <CardHeader>
  //           <CardTitle className="flex items-center justify-between">
  //             <span className="flex items-center">
  //               <Gift className="mr-2 h-5 w-5" />
  //               Referral Program
  //             </span>
  //             <Badge variant="default">{pricing.current_rate_percentage}% Fee</Badge>
  //           </CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <div className="grid gap-4 md:grid-cols-3">
  //             <div>
  //               <p className="text-sm font-medium mb-1">Your Referral Code</p>
  //               <p className="text-lg font-mono">{referralCode?.code}</p>
  //               <p className="text-xs text-muted-foreground mt-1">{referralCode?.times_used || 0} signups</p>
  //             </div>
  //             <div>
  //               <p className="text-sm font-medium mb-1">Current Tier</p>
  //               <p className="text-lg capitalize">{pricing.rate_tier}</p>
  //               <p className="text-xs text-muted-foreground mt-1">{pricing.referral_count} completed referrals</p>
  //             </div>
  //             <div className="flex items-center">
  //               <Button asChild className="w-full">
  //                 <Link href="/dashboard/referrals">View Referral Dashboard</Link>
  //               </Button>
  //             </div>
  //           </div>
  //           {pricing.discounted_until && new Date(pricing.discounted_until) > new Date() && (
  //             <div className="mt-4 p-3 bg-primary/10 rounded-md">
  //               <p className="text-sm">
  //                 🎉 Your {pricing.current_rate_percentage}% discount expires on{" "}
  //                 {new Date(pricing.discounted_until).toLocaleDateString()}
  //               </p>
  //             </div>
  //           )}
  //         </CardContent>
  //       </Card>
  //     )}

  //     {/* Quick Actions */}
  //     <div>
  //       <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
  //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  //         <Card className="hover:bg-accent/50 transition-colors">
  //           <CardHeader>
  //             <CardTitle className="flex items-center text-base">
  //               <FileText className="mr-2 h-5 w-5" />
  //               Create Post
  //             </CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <p className="text-sm text-muted-foreground mb-4">Share a ministry update with your supporters</p>
  //             <Button asChild className="w-full">
  //               <Link href="/dashboard/posts/new">New Post</Link>
  //             </Button>
  //           </CardContent>
  //         </Card>

  //         <Card className="hover:bg-accent/50 transition-colors">
  //           <CardHeader>
  //             <CardTitle className="flex items-center text-base">
  //               <Target className="mr-2 h-5 w-5" />
  //               Set Goal
  //             </CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <p className="text-sm text-muted-foreground mb-4">Create a fundraising goal for a specific need</p>
  //             <Button asChild className="w-full bg-transparent" variant="outline">
  //               <Link href="/dashboard/goals">Manage Goals</Link>
  //             </Button>
  //           </CardContent>
  //         </Card>

  //         <Card className="hover:bg-accent/50 transition-colors">
  //           <CardHeader>
  //             <CardTitle className="flex items-center text-base">
  //               <Mail className="mr-2 h-5 w-5" />
  //               Send Newsletter
  //             </CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <p className="text-sm text-muted-foreground mb-4">Email updates to all your supporters</p>
  //             <Button asChild className="w-full bg-transparent" variant="outline">
  //               <Link href="/dashboard/newsletters">Newsletters</Link>
  //             </Button>
  //           </CardContent>
  //         </Card>

  //         <Card className="hover:bg-accent/50 transition-colors">
  //           <CardHeader>
  //             <CardTitle className="flex items-center text-base">
  //               <MessageSquare className="mr-2 h-5 w-5" />
  //               Messages
  //               {messagesCount > 0 && (
  //                 <Badge className="ml-2" variant="default">
  //                   {messagesCount}
  //                 </Badge>
  //               )}
  //             </CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <p className="text-sm text-muted-foreground mb-4">View contact form submissions</p>
  //             <Button asChild className="w-full bg-transparent" variant="outline">
  //               <Link href="/dashboard/messages">View Messages</Link>
  //             </Button>
  //           </CardContent>
  //         </Card>

  //         <Card className="hover:bg-accent/50 transition-colors">
  //           <CardHeader>
  //             <CardTitle className="flex items-center text-base">
  //               <Code className="mr-2 h-5 w-5" />
  //               WordPress Embed
  //             </CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <p className="text-sm text-muted-foreground mb-4">Get embed code for your WordPress site</p>
  //             <Button asChild className="w-full bg-transparent" variant="outline">
  //               <Link href="/dashboard/embed">Get Embed Code</Link>
  //             </Button>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>

  //     {/* Account Info */}
  //     <div className="mt-8">
  //       <Card>
  //         <CardHeader>
  //           <CardTitle className="flex items-center">
  //             <Settings className="mr-2 h-5 w-5" />
  //             Your Account
  //           </CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <div className="grid gap-4 md:grid-cols-2">
  //             <div>
  //               <p className="text-sm font-medium">Public Site</p>
  //               <p className="text-sm text-muted-foreground">
  //                 <a
  //                   href={`https://${tenant.subdomain}.tektonstable.com`}
  //                   target="_blank"
  //                   rel="noopener noreferrer"
  //                   className="text-primary hover:underline"
  //                 >
  //                   {tenant.subdomain}.tektonstable.com
  //                 </a>
  //               </p>
  //             </div>
  //             <div>
  //               <p className="text-sm font-medium">Referral Code</p>
  //               <p className="text-sm text-muted-foreground font-mono">{referralCode?.code}</p>
  //             </div>
  //             <div>
  //               <p className="text-sm font-medium">Platform Fee</p>
  //               <p className="text-sm text-muted-foreground">
  //                 {pricing?.current_rate_percentage || basePlatformFee}% + Stripe fees
  //               </p>
  //             </div>
  //             <div>
  //               <p className="text-sm font-medium">Account Status</p>
  //               <p className="text-sm text-muted-foreground">
  //                 {tenant.stripe_account_id ? "✅ Active" : "⚠️ Setup Required"}
  //               </p>
  //             </div>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   </div>
  // )
}
