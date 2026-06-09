import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { fetchTransactions, type ApiTransaction } from '@/lib/fortuneApi'

export function TransactionHistoryPage() {
  const { accessToken } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [transactions, setTransactions] = useState<ApiTransaction[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchTransactions(accessToken, page, 10)
      .then((result) => {
        if (cancelled) return
        setTransactions(result.items)
        setLastPage(Math.max(result.lastPage || 1, 1))
      })
      .catch((err: Error) => {
        if (cancelled) return
        setTransactions([])
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, page])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (activeTab === 'all') return true
      return transaction.type.toLowerCase().includes(activeTab)
    })
  }, [activeTab, transactions])

  const typeBadge = (type: string) => {
    const normalized = type.toLowerCase()
    if (normalized.includes('deposit')) return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (normalized.includes('withdrawal')) return 'bg-red-500/10 text-red-400 border-red-500/20'
    if (normalized.includes('payout') || normalized.includes('winning')) return 'bg-primary/10 text-primary border-primary/20'
    return 'bg-muted text-muted-foreground border-border'
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">
            Wallet <span className="gold-text">Transactions</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track deposit funding, payouts, and ticket purchase audits</p>
        </div>
      </div>

      <div className="flex gap-0 border-b border-border/50 mb-8 overflow-x-auto scrollbar-hide">
        {[
          { id: 'all', label: 'All Transactions' },
          { id: 'deposit', label: 'Deposits' },
          { id: 'withdrawal', label: 'Withdrawals' },
          { id: 'purchase', label: 'Purchases' },
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

      <Card className="bg-fortune-card border border-border/60 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading transactions...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">{error}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No transactions found.</div>
          ) : (
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
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border/50 hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{transaction.id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${typeBadge(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{transaction.method}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{transaction.date}</td>
                      <td className={`px-6 py-4 text-right font-extrabold text-sm ${transaction.positive ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.positive ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
          Previous
        </Button>
        <div className="h-9 px-4 rounded-md border border-border bg-background flex items-center text-sm font-bold">
          {page} / {lastPage}
        </div>
        <Button variant="outline" size="sm" disabled={page >= lastPage || loading} onClick={() => setPage((current) => current + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
