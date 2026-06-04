import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Wallet, Plus, ArrowDownLeft, TrendingUp, Trophy, Ticket,
  CreditCard, Building2, DollarSign, ArrowRight, CheckCircle,
} from 'lucide-react'
import { MOCK_TRANSACTIONS } from '@/lib/fortune-data'



const TX_ICONS = {
  prize: <Trophy className="size-4 text-emerald-400" />,
  deposit: <Plus className="size-4 text-sky-400" />,
  withdrawal: <ArrowDownLeft className="size-4 text-amber-400" />,
  purchase: <Ticket className="size-4 text-muted-foreground" />,
}

const QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500]

export function WalletPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')
  const [payMethod, setPayMethod] = useState<'card' | 'bank'>('card')
  const [txFilter, setTxFilter] = useState('all')
  const [showSuccess, setShowSuccess] = useState(false)

  const filteredTx = MOCK_TRANSACTIONS.filter(
    tx => txFilter === 'all' || tx.type === txFilter
  )

  const handleSubmit = () => {
    setShowSuccess(true)
    setAmount('')
    setTimeout(() => setShowSuccess(false), 3000)
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
                    $5,249.50
                  </p>
                </div>
                <div className="size-10 md:size-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Wallet className="size-5 md:size-6 text-primary" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {[
                  { label: 'Total Deposited', value: '$50.00', icon: <Plus className="size-3" /> },
                  { label: 'Total Won', value: '$5,250.00', icon: <Trophy className="size-3" /> },
                  { label: 'Total Spent', value: '$2.00', icon: <Ticket className="size-3" /> },
                ].map((stat, i) => (
                  <div key={i} className="text-center rounded-lg bg-muted/30 p-2 md:p-3">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1 leading-tight">
                      {stat.icon} <span className="hidden sm:inline">{stat.label}</span>
                    </p>
                    <p className="text-xs text-muted-foreground sm:hidden mb-0.5">{stat.label}</p>
                    <p className="text-sm font-bold">{stat.value}</p>
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
                  {['all', 'prize', 'deposit', 'purchase', 'withdrawal'].map(f => (
                    <button
                      key={f}
                      onClick={() => setTxFilter(f)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize whitespace-nowrap flex-shrink-0 ${txFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                {filteredTx.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0 gap-2">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className="size-8 md:size-9 rounded-full bg-muted/40 flex items-center justify-center flex-shrink-0">
                        {TX_ICONS[tx.type]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground truncate">{tx.date} · {tx.id}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-foreground'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-$' : '$'}{Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <Badge className="text-xs bg-emerald-500/15 text-emerald-400 border-0 mt-0.5">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTx.length === 0 && (
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
                    onClick={() => setActiveTab(tab)}
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
                      ${a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Custom Amount</p>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="pl-9 bg-muted/20 border-border"
                    type="number"
                    min="1"
                  />
                </div>
                {activeTab === 'withdraw' && (
                  <p className="text-xs text-muted-foreground mt-1">Min: $10 · Max: $5,000 · Available: $5,249.50</p>
                )}
              </div>

              {showSuccess ? (
                <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle className="size-5 text-emerald-400" />
                    <p className="text-emerald-400 font-bold">
                      {activeTab === 'deposit' ? 'Deposit Successful!' : 'Withdrawal Initiated!'}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === 'deposit' ? 'Funds added to your wallet.' : 'Processing in 1–3 business days.'}
                  </p>
                </div>
              ) : (
                <Button
                  className="w-full gold-gradient text-fortune-navy font-bold gold-glow hover:opacity-90"
                  size="lg"
                  disabled={!amount || parseFloat(amount) <= 0}
                  onClick={handleSubmit}
                >
                  {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} {amount ? `$${parseFloat(amount).toFixed(2)}` : 'Funds'}
                  <ArrowRight className="size-4 ml-1" />
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
