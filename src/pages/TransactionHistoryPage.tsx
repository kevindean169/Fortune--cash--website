import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { PageId } from '@/lib/fortune-data'

interface TransactionHistoryPageProps {
  navigate: (page: PageId) => void
}

const mockTransactions = [
  { id: 'TRX-99812', type: 'Payout', amount: 26.00, method: 'Wallet Balance', date: 'May 30, 2026 06:15 PM', status: 'Completed', positive: true },
  { id: 'TRX-99811', type: 'Purchase', amount: -2.00, method: 'Wallet Balance', date: 'May 30, 2026 05:45 PM', status: 'Completed', positive: false },
  { id: 'TRX-99810', type: 'Purchase', amount: -5.00, method: 'Wallet Balance', date: 'May 30, 2026 03:30 PM', status: 'Completed', positive: false },
  { id: 'TRX-99809', type: 'Deposit', amount: 1000.00, method: 'Bank Transfer', date: 'May 28, 2026 11:20 AM', status: 'Completed', positive: true },
  { id: 'TRX-99808', type: 'Withdrawal', amount: -250.00, method: 'Bank Account', date: 'May 27, 2026 09:00 AM', status: 'Completed', positive: false },
  { id: 'TRX-99807', type: 'Deposit', amount: 50.00, method: 'Credit Card', date: 'May 25, 2026 02:15 PM', status: 'Completed', positive: true },
  { id: 'TRX-99806', type: 'Purchase', amount: -1.00, method: 'Wallet Balance', date: 'May 24, 2026 01:10 PM', status: 'Completed', positive: false },
]

export function TransactionHistoryPage({ navigate }: TransactionHistoryPageProps) {
  const [activeTab, setActiveTab] = useState('all')

  const filteredTransactions = mockTransactions.filter((trx) => {
    if (activeTab === 'all') return true
    return trx.type.toLowerCase() === activeTab
  })

  const typeBadge = (type: string) => {
    if (type === 'Deposit') return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (type === 'Withdrawal') return 'bg-red-500/10 text-red-400 border-red-500/20'
    if (type === 'Payout') return 'bg-primary/10 text-primary border-primary/20'
    return 'bg-muted text-muted-foreground border-border'
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Wallet <span className="gold-text">Transactions</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Track deposit funding, payouts, and ticket purchase audits</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border/50 mb-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdrawal', label: 'Withdrawals' },
            { id: 'purchase', label: 'Purchases' },
            { id: 'payout', label: 'Payouts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction Table */}
        <Card className="bg-fortune-card border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-white/[0.01]">
                    <th className="text-left text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Transaction ID</th>
                    <th className="text-left text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Type</th>
                    <th className="text-left text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Payment Method</th>
                    <th className="text-left text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Timestamp</th>
                    <th className="text-right text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-right text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="border-b border-border/50 hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{trx.id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${typeBadge(trx.type)}`}>
                          {trx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{trx.method}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{trx.date}</td>
                      <td className={`px-6 py-4 text-right font-extrabold text-sm ${trx.positive ? 'text-green-400' : 'text-foreground'}`}>
                        {trx.positive ? '+' : ''}${Math.abs(trx.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                          {trx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
