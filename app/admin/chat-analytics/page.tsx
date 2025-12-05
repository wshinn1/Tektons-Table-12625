import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatAnalyticsDashboard } from "@/components/admin/chat-analytics-dashboard"

export default async function ChatAnalyticsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Check if user is super admin
  const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

  if (!role || role.role !== "super_admin") {
    redirect("/dashboard")
  }

  // Fetch common questions
  const { data: commonQuestions } = await supabase.from("common_questions").select("*").limit(50)

  // Fetch recent chat logs
  const { data: recentChats } = await supabase
    .from("chat_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  // Fetch statistics
  const { count: totalChats } = await supabase.from("chat_logs").select("*", { count: "exact", head: true })

  const { count: chatsLast7Days } = await supabase
    .from("chat_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: avgSatisfaction } = await supabase
    .from("chat_logs")
    .select("helpful_rating")
    .not("helpful_rating", "is", null)

  const satisfactionRate =
    avgSatisfaction && avgSatisfaction.length > 0
      ? avgSatisfaction.filter((r) => r.helpful_rating === 1).length / avgSatisfaction.length
      : 0

  return (
    <ChatAnalyticsDashboard
      commonQuestions={commonQuestions || []}
      recentChats={recentChats || []}
      stats={{
        totalChats: totalChats || 0,
        chatsLast7Days: chatsLast7Days || 0,
        satisfactionRate: satisfactionRate * 100,
      }}
    />
  )
}
