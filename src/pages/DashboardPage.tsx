import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Trophy, ArrowDownLeft, Zap, Gift, Clock, Coins } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchCustomerDashboard } from '@/lib/fortuneApi'

const BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://node.rglabs.net:3603/api/v1'
const APP_KEY = import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e'

export function DashboardPage() {
  const navigate = useNavigate()
  const { accessToken, walletBalance, user } = useAuth()

  const [currency, setCurrency] = useState('USD')
  const [totalWon, setTotalWon] = useState(0)
  const [totalUnpayout, setTotalUnpayout] = useState(0)
  const [totalPayout, setTotalPayout] = useState(0)

  useEffect(() => {
    if (!accessToken) return

    // Fetch currency from wallet details
    fetch(`${BASE_URL}/wallet`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-App-Key': APP_KEY,
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCurrency(data.data.currency || 'USD')
        }
      })
      .catch(err => console.error('Error fetching wallet:', err))

    fetchCustomerDashboard(accessToken)
      .then((data) => {
        setTotalWon(data.total_winnings)
        setTotalPayout(data.total_payout)
        setTotalUnpayout(data.total_unpayout)
      })
      .catch((err: Error) => console.error('Error fetching customer dashboard:', err))
  }, [accessToken])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(val)
  }

  const stats = [
    { label: 'Wallet Balance', value: formatCurrency(walletBalance), color: 'text-foreground', icon: <CreditCard className="size-8 text-primary" /> },
    { label: 'Total Won', value: formatCurrency(totalWon), color: 'text-foreground', icon: <Trophy className="size-8 text-primary" /> },
    { label: 'Total Payout', value: formatCurrency(totalPayout), color: 'text-primary', icon: <Zap className="size-8 text-primary animate-pulse" /> },
    { label: 'Total Unpayout', value: formatCurrency(totalUnpayout), color: 'text-primary', icon: <ArrowDownLeft className="size-8 text-primary" /> },
  ]

  const quickLinks = [
    { label: 'Play CASHPOT', page: '/cashpot', desc: 'Pick numbers 01-36 and bet', icon: <Gift className="size-10 text-primary flex-shrink-0" /> },
    { label: 'Play Money Time', page: '/money-time', desc: 'Fast hourly draws daily', icon: <Clock className="size-10 text-primary flex-shrink-0" /> },
    { label: 'Draw Results', page: '/results', desc: 'Check latest winning numbers', icon: <Trophy className="size-10 text-primary flex-shrink-0" /> },
    { label: 'Transaction Audit', page: '/transactions', desc: 'View deposits and payouts', icon: <Coins className="size-10 text-primary flex-shrink-0" /> },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      {/* Welcome Banner */}
      <div className="bg-fortune-card border border-l-4 border-l-primary border-border/60 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Welcome back, <span className="gold-text">{user?.username || 'Sachin'}!</span>
          </h2>
          <p className="text-muted-foreground text-xs mt-1">
            Account status: <span className="text-primary font-bold">Active Customer</span>&nbsp;•&nbsp;Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>
        <Button
          onClick={() => navigate('/lotteries')}
          className="gold-gradient text-fortune-navy font-bold hover:opacity-90 gold-glow"
        >
          Create New Bet Slip →
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-fortune-card border border-border/60 hover:-translate-y-1 transition-all">
            <CardContent className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-muted-foreground text-xs font-semibold leading-tight flex items-center gap-1">
                  {stat.label}
                </span>
                {stat.icon}
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold mt-2 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-fortune-card border border-border/60">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg text-foreground border-b border-border pb-3 mb-6">
            Quick Action Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.page)}
                className="p-4 border border-border bg-white/[0.02] hover:bg-primary/5 hover:border-primary/30 rounded-xl flex gap-4 transition-all hover:-translate-y-1 text-left items-center"
              >
                {link.icon}
                <div>
                  <h4 className="font-bold text-foreground text-sm">{link.label}</h4>
                  <p className="text-muted-foreground text-xs mt-1 leading-snug">{link.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
