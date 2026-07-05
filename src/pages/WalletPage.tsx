import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Wallet, Plus, ArrowDownLeft, Trophy, Ticket, DollarSign
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { formatUsd } from '@/lib/currency'

const BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://node.rglabs.net:3603/api/v1'
const APP_KEY = import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e'

interface Transaction {
  id: string
  type: string
  amount: number
  balance_before: number
  balance_after: number
  status: string
  reference_type: string
  created_at: string
}

interface FinancialSummary {
  total_deposited: number
  total_withdrawn: number
  total_won: number
  current_balance: number
}

const TX_ICONS: Record<string, React.ReactNode> = {
  win: <Trophy className="size-4 text-emerald-400" />,
  deposit: <Plus className="size-4 text-sky-400" />,
  withdraw: <ArrowDownLeft className="size-4 text-amber-400" />,
  purchase: <Ticket className="size-4 text-muted-foreground" />,
}

export function WalletPage() {
  const { accessToken, walletBalance, fetchWallet } = useAuth()
  const [txFilter, setTxFilter] = useState('all')

  const [summary, setSummary] = useState<FinancialSummary>({
    total_deposited: 0,
    total_withdrawn: 0,
    total_won: 0,
    current_balance: 0,
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!accessToken) return
    loadWalletData()
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) return
    loadTransactions()
  }, [accessToken, txFilter])

  const loadWalletData = async () => {
    try {
      await fetchWallet()

      const summaryRes = await fetch(`${BASE_URL}/wallet/summary`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-App-Key': APP_KEY,
        },
      })
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        if (summaryData.success && summaryData.data) {
          setSummary(summaryData.data)
        }
      }
    } catch (err) {
      console.error('Error loading wallet data:', err)
    }
  }

  const loadTransactions = async () => {
    try {
      let url = `${BASE_URL}/wallet/transactions?page=1&limit=50`
      if (txFilter === 'deposit') url += '&type=deposit'
      if (txFilter === 'withdrawal' || txFilter === 'withdraw') url += '&type=withdraw'
      if (txFilter === 'prize' || txFilter === 'win') url += '&type=win'

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-App-Key': APP_KEY,
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setTransactions(data.data)
        }
      }
    } catch (err) {
      console.error('Error loading transactions:', err)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          <span className="gold-text">Wallet</span> &amp; Transactions
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage your funds securely</p>
      </div>

      <div className="space-y-5">
        {/* Balance Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-fortune-blue/20 to-fortune-card border-fortune-blue/30">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Wallet className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Available Balance</p>
                  <p className="text-3xl md:text-4.5xl font-black text-primary tracking-tight tabular-nums">
                    {formatUsd(walletBalance)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-muted/30 border border-border/40 rounded-2xl px-5 py-3.5 shrink-0 sm:min-w-[200px]">
                <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Plus className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1.5">Total Deposited</p>
                  <p className="text-lg font-black text-white tabular-nums">{formatUsd(summary.total_deposited)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="bg-fortune-card border-border">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="font-bold text-lg flex-shrink-0">Transaction History</h2>
              {/* Filter Tabs */}
              <div className="flex gap-1 bg-muted/30 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'all', label: 'all' },
                  { id: 'deposit', label: 'deposit' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setTxFilter(f.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize whitespace-nowrap flex-shrink-0 ${txFilter === f.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
              {transactions.map(tx => {
                const isPositive = tx.type === 'deposit' || tx.type === 'win' || tx.type === 'prize'
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0 gap-2">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className="size-8 md:size-9 rounded-full bg-muted/40 flex items-center justify-center flex-shrink-0">
                        {TX_ICONS[tx.type] || <Plus className="size-4 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium capitalize truncate">{tx.type} Request</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {new Date(tx.created_at).toLocaleDateString()} · {tx.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-foreground'}`}>
                        {isPositive ? '+' : '-'}{formatUsd(tx.amount)}
                      </p>
                      <Badge className={`text-xs border-0 mt-0.5 capitalize ${tx.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No transactions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
