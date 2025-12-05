import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { TransactionTable } from "@/components/admin/financials/transaction-table"

export default async function TransactionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  // Get all transactions
  const { data: donations } = await supabase
    .from("donations")
    .select(`
      *,
      tenants (full_name, subdomain),
      supporters (full_name, email)
    `)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
        <p className="text-gray-500 mt-1">Complete transaction history</p>
      </div>

      <TransactionTable donations={donations || []} />
    </div>
  )
}
