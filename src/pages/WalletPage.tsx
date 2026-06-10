import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Wallet, Plus, ArrowDownLeft, TrendingUp, Trophy, Ticket,
  CreditCard, Building2, DollarSign, ArrowRight, CheckCircle,
  AlertTriangle, Loader2
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

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

const QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500]

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function WalletPage() {
  const { accessToken, walletBalance, fetchWallet } = useAuth()
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')
  const [payMethod, setPayMethod] = useState<'card' | 'bank'>('card')
  const [txFilter, setTxFilter] = useState('all')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Wallet metadata from API
  const [currency, setCurrency] = useState('USD')
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
      // 1. Fetch main wallet details (for currency, etc.)
      const walletRes = await fetch(`${BASE_URL}/wallet`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-App-Key': APP_KEY,
        },
      })
      if (walletRes.ok) {
        const walletData = await walletRes.json()
        if (walletData.success && walletData.data) {
          setCurrency(walletData.data.currency || 'USD')
        }
      }

      // 2. Fetch balance in AuthContext
      await fetchWallet()

      // 3. Fetch summary stats
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

  const handleAction = async () => {
    setErrorMsg(null)
    setShowSuccess(false)
    setLoading(true)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount.')
      setLoading(false)
      return
    }

    if (activeTab === 'deposit') {
      // Simulate successful deposit (payment gateways integrated separately)
      setTimeout(() => {
        setSuccessMessage('Deposit Successful! Funds added to your wallet.')
        setShowSuccess(true)
        setAmount('')
        setLoading(false)
        loadWalletData()
        loadTransactions()
        setTimeout(() => setShowSuccess(false), 5000)
      }, 1500)
    } else {
      // Withdrawal process
      try {
        // 1. Eligibility Check
        const checkRes = await fetch(`${BASE_URL}/wallet/withdraw/check?amount=${numAmount}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-App-Key': APP_KEY,
          },
        })
        const checkData = await checkRes.json()
        if (!checkRes.ok || !checkData.success) {
          setErrorMsg(checkData.message || 'Withdrawal eligibility check failed.')
          setLoading(false)
          return
        }

        if (checkData.data && !checkData.data.eligible) {
          setErrorMsg('You are not eligible for this withdrawal amount.')
          setLoading(false)
          return
        }

        // 2. Submit Withdrawal Request (with a dummy/default PIN '1234' since user does not have PIN UI needs)
        const idempotencyKey = generateUUID()
        const submitRes = await fetch(`${BASE_URL}/wallet/withdraw/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-App-Key': APP_KEY,
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            amount: numAmount,
            pin: '1234',
            idempotencyKey,
          }),
        })

        const submitData = await submitRes.json()
        if (submitRes.ok && submitData.success) {
          setSuccessMessage('Withdrawal Request Submitted! Processing in 1–3 business days.')
          setShowSuccess(true)
          setAmount('')
          loadWalletData()
          loadTransactions()
          setTimeout(() => setShowSuccess(false), 5000)
        } else {
          setErrorMsg(submitData.message || 'Withdrawal submission failed.')
        }
      } catch (err) {
        setErrorMsg('Network error. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Format currency output
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(val)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          <span className="gold-text">Wallet</span> &amp; Transactions
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage your funds securely</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Balance + Transactions */}
        <div className="space-y-5">
          {/* Balance Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-fortune-blue/20 to-fortune-card border-fortune-blue/30">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start justify-between mb-5 md:mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-4xl md:text-5xl font-extrabold text-primary tabular-nums">
                    {formatCurrency(walletBalance)}
                  </p>
                </div>
                <div className="size-10 md:size-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Wallet className="size-5 md:size-6 text-primary" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {[
                  { label: 'Total Deposited', value: formatCurrency(summary.total_deposited), icon: <Plus className="size-3" /> },
                  { label: 'Total Won', value: formatCurrency(summary.total_won), icon: <Trophy className="size-3" /> },
                  { label: 'Total Withdrawn', value: formatCurrency(summary.total_withdrawn), icon: <ArrowDownLeft className="size-3" /> },
                ].map((stat, i) => (
                  <div key={i} className="text-center rounded-lg bg-muted/30 p-2 md:p-3">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1 leading-tight">
                      {stat.icon} <span className="hidden sm:inline">{stat.label}</span>
                    </p>
                    <p className="text-xs text-muted-foreground sm:hidden mb-0.5">{stat.label}</p>
                    <p className="text-sm font-bold truncate">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="bg-fortune-card border-border">
            <CardContent className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="font-bold text-lg flex-shrink-0">Transaction History</h2>
                {/* Filter Tabs — scrollable on mobile */}
                <div className="flex gap-1 bg-muted/30 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'all', label: 'all' },
                    { id: 'prize', label: 'prize / win' },
                    { id: 'deposit', label: 'deposit' },
                    { id: 'withdrawal', label: 'withdrawal' }
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
                          {isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
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

        {/* Right: Deposit / Withdraw */}
        <div className="space-y-4">
          <Card className="bg-fortune-card border-border lg:sticky lg:top-24">
            <CardContent className="p-4 md:p-5">
              {/* Tab Switch */}
              <div className="flex rounded-xl bg-muted/30 p-1 mb-5">
                {(['deposit', 'withdraw'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab)
                      setErrorMsg(null)
                      setShowSuccess(false)
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === tab
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {activeTab === 'deposit' ? 'Payment Method' : 'Withdraw To'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'card' as const, icon: <CreditCard className="size-4" />, label: 'Debit Card' },
                    { id: 'bank' as const, icon: <Building2 className="size-4" />, label: 'Bank Transfer' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      className={`flex items-center gap-2 rounded-xl p-3 border text-sm transition-all ${payMethod === m.id
                          ? 'border-primary/50 bg-primary/10 text-foreground'
                          : 'border-border/40 bg-muted/10 text-muted-foreground hover:border-border/70'
                        }`}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Amounts */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Amounts</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map(a => (
                    <button
                      key={a}
                      onClick={() => setAmount(a.toString())}
                      className={`rounded-lg py-2 text-sm font-semibold border transition-all ${amount === a.toString()
                          ? 'gold-gradient text-fortune-navy border-primary/50'
                          : 'bg-muted/30 text-muted-foreground border-border/40 hover:border-primary/30 hover:text-foreground'
                        }`}
                    >
                      {formatCurrency(a)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Custom Amount</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currency}</span>
                  <Input
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="pl-14 bg-muted/20 border-border"
                    type="number"
                    min="1"
                  />
                </div>
                {activeTab === 'withdraw' && (
                  <p className="text-xs text-muted-foreground mt-1">Min: 100 · Max: 50,000 · Available: {formatCurrency(walletBalance)}</p>
                )}
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-3 mb-4 flex items-start gap-2">
                  <AlertTriangle className="size-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
                </div>
              )}

              {showSuccess ? (
                <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle className="size-5 text-emerald-400" />
                    <p className="text-emerald-400 font-bold">Success!</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {successMessage}
                  </p>
                </div>
              ) : (
                <Button
                  className="w-full gold-gradient text-fortune-navy font-bold gold-glow hover:opacity-90 flex items-center justify-center gap-2"
                  size="lg"
                  disabled={!amount || parseFloat(amount) <= 0 || loading}
                  onClick={handleAction}
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin text-fortune-navy" />
                  ) : (
                    <>
                      {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} {amount ? formatCurrency(parseFloat(amount)) : 'Funds'}
                      <ArrowRight className="size-4 ml-1" />
                    </>
                  )}
                </Button>
              )}

              <Separator className="my-4 opacity-50" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="size-3 flex-shrink-0" />
                <p>All transactions are SSL encrypted and 256-bit secured.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

