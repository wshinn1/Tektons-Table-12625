import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FundsReceivedPage() {
  const fundsData = [
    {
      date: "Nov 20, 2025",
      tenant: "John Doe Missions",
      amount: 5000.0,
      platformFee: 175.0,
      stripeFee: 145.0,
      netAmount: 4680.0,
      status: "Completed",
    },
    {
      date: "Nov 19, 2025",
      tenant: "Sarah's Mission Trip",
      amount: 2500.0,
      platformFee: 87.5,
      stripeFee: 72.5,
      netAmount: 2340.0,
      status: "Completed",
    },
    {
      date: "Nov 18, 2025",
      tenant: "Global Outreach Team",
      amount: 10000.0,
      platformFee: 350.0,
      stripeFee: 290.0,
      netAmount: 9360.0,
      status: "Completed",
    },
    {
      date: "Nov 17, 2025",
      tenant: "Youth Ministry Fund",
      amount: 1500.0,
      platformFee: 52.5,
      stripeFee: 43.5,
      netAmount: 1404.0,
      status: "Pending",
    },
  ]

  const totalFunds = fundsData.reduce((sum, item) => sum + item.amount, 0)
  const totalPlatformFees = fundsData.reduce((sum, item) => sum + item.platformFee, 0)
  const totalStripeFees = fundsData.reduce((sum, item) => sum + item.stripeFee, 0)
  const totalNet = fundsData.reduce((sum, item) => sum + item.netAmount, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funds Received</h1>
          <p className="text-gray-500 mt-1">Track all donation funds received through the platform</p>
        </div>
        <Button>Export Report</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Donations</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">${totalFunds.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Platform Fees (3.5%)</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">${totalPlatformFees.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Stripe Processing</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">${totalStripeFees.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Net to Missionaries</div>
          <div className="text-2xl font-bold text-green-600 mt-1">${totalNet.toLocaleString()}</div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donation Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform Fee
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stripe Fee
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fundsData.map((fund, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fund.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fund.tenant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${fund.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                    ${fund.platformFee.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                    ${fund.stripeFee.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-medium">
                    ${fund.netAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        fund.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {fund.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
