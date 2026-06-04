import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Ticket, Lightbulb, Zap, Gift, Clock, Trophy, Coins } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  
  const stats = [
    { label: 'Wallet Balance', value: '$9,898.98', color: 'text-foreground', icon: <CreditCard className="size-8 text-primary" /> },
    { label: "Today's Bet Volume", value: '$12.00', color: 'text-foreground', icon: <Ticket className="size-8 text-primary" /> },
    { label: "Today's Winning Slips", value: '3', color: 'text-primary', icon: <Lightbulb className="size-8 text-primary animate-pulse" /> },
    { label: "Today's Payout Wins", value: '$228.00', color: 'text-primary', icon: <Zap className="size-8 text-primary" /> },
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
            Welcome back, <span className="gold-text">Sachin!</span>
          </h2>
          <p className="text-muted-foreground text-xs mt-1">
            Account status: <span className="text-primary font-bold">Active Agent</span>&nbsp;•&nbsp;Timezone: America/Jamaica
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
                <span className="text-muted-foreground text-xs font-semibold leading-tight">{stat.label}</span>
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
