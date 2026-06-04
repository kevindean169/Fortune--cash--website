import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, RefreshCw, ShieldCheck, Wallet } from 'lucide-react'
import type { PageId } from '@/lib/fortune-data'

interface TransactionsPageProps {
  navigate: (page: PageId) => void
}

const QUICK_AMOUNTS = [500, 1000, 5000, 10000]

export function TransactionsPage({ navigate }: TransactionsPageProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('withdraw')
  const [amount, setAmount] = useState(0)

  const totalBalance = 9898.98
  const winningAmount = 0

  const handleAddAmount = (val: number) => {
    setAmount((prev) => prev + val)
  }

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-md px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span className="font-bold text-lg text-foreground">
              {activeTab === 'withdraw' ? 'Withdraw' : 'Deposit'}
            </span>
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className="size-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl border border-border p-1 mb-6 bg-fortune-card">
          {(['deposit', 'withdraw'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg capitalize transition-all ${activeTab === tab
                ? 'gold-gradient text-fortune-navy shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Balance Card */}
        <Card className="bg-fortune-card border border-primary/20 mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-32 flex items-center justify-center opacity-20 pointer-events-none">
            <Wallet className="size-20 text-primary" />
          </div>
          <CardContent className="p-5 relative">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Balance</p>
                <p className="text-xl font-extrabold text-primary">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <Separator className="opacity-30" />
              <div>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  Winning Amount
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-muted-foreground text-[10px]">?</span>
                </p>
                <p className="text-xl font-extrabold">${winningAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <div className="mb-6">
          <h2 className="font-bold text-base mb-1">
            Enter {activeTab === 'withdraw' ? 'Withdraw' : 'Deposit'} Amount
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Enter the amount you want to {activeTab}
          </p>
          <Card className="bg-fortune-card border border-primary/20">
            <CardContent className="p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-widest font-bold block mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-transparent text-2xl font-bold text-foreground focus:outline-none border-none"
                min={0}
              />
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground mt-2">
            Minimum {activeTab === 'withdraw' ? 'Withdraw' : 'Deposit'} amount is $160
          </p>
        </div>

        {/* Quick Amounts */}
        <div className="flex flex-wrap gap-2 mb-8">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => handleAddAmount(amt)}
              className="px-4 py-2 rounded-lg border border-primary/40 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              +${amt.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Proceed Button */}
        <Button
          className="w-full py-7 font-bold uppercase tracking-widest text-base gold-gradient text-fortune-navy gold-glow hover:opacity-90"
          disabled={amount === 0}
        >
          PROCEED
        </Button>

        {/* Security Notice */}
        <div className="flex items-start gap-3 mt-6 p-4 rounded-xl bg-fortune-card border border-border/50">
          <ShieldCheck className="size-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your withdrawals are safe and secure, we do not share your information.
          </p>
        </div>
      </div>
    </div>
  )
}
