import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Ticket, Wallet, Trophy, TrendingUp,
  ArrowRight, Play, Star, Gift, Clock, ChevronRight,
  User, Lock, Smartphone, HelpCircle, Award, Zap,
} from 'lucide-react'
import { MOCK_TICKETS, MOCK_TRANSACTIONS } from '@/lib/fortune-data'
import type { PageId } from '@/lib/fortune-data'

interface DashboardPageProps {
  navigate: (page: PageId) => void
}

const STATS = [
  { label: 'Wallet Balance', value: '$5,249.50', icon: <Wallet className="size-5" />, trend: '+$5,250', color: 'text-primary' },
  { label: 'Total Winnings', value: '$5,250.00', icon: <Trophy className="size-5" />, trend: 'All time', color: 'text-emerald-400' },
  { label: 'Active Tickets', value: '1', icon: <Ticket className="size-5" />, trend: 'Pending draw', color: 'text-sky-400' },
  { label: 'Games Played', value: '24', icon: <Play className="size-5" />, trend: 'This month', color: 'text-amber-400' },
]

export function DashboardPage({ navigate }: DashboardPageProps) {
  const wonTickets = MOCK_TICKETS.filter(t => t.status === 'won')
  const activeTickets = MOCK_TICKETS.filter(t => t.status === 'active' || t.status === 'pending')
  const recentTransactions = MOCK_TRANSACTIONS.slice(0, 4)

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Welcome back</p>
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="gold-text">Player</span> Dashboard
            </h1>
          </div>
          <Button
            className="gold-gradient text-fortune-navy font-bold gold-glow"
            onClick={() => navigate('games')}
          >
            Play Now <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat, i) => (
            <Card key={i} className="bg-fortune-card border-border card-hover">
              <CardContent className="p-5">
                <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
                <p className="text-2xl font-extrabold mb-0.5">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-primary mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Tickets */}
            <Card className="bg-fortune-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Active Tickets</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('my-lotteries')} className="text-primary gap-1 text-xs">
                    All Tickets <ChevronRight className="size-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ticket className="size-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No active tickets</p>
                    <Button size="sm" className="mt-3 gold-gradient text-fortune-navy font-semibold" onClick={() => navigate('games')}>
                      Buy Tickets
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeTickets.map(ticket => (
                      <div key={ticket.id} className="flex items-center justify-between rounded-xl bg-muted/20 border border-border/40 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            {ticket.numbers.map((n, i) => (
                              <div key={i} className="number-ball number-ball-idle text-xs" style={{ width: '1.75rem', height: '1.75rem' }}>
                                {n}
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{ticket.game}</p>
                            <p className="text-xs text-muted-foreground">{ticket.drawDate}</p>
                          </div>
                        </div>
                        <Badge className={`text-xs ${
                          ticket.status === 'active' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {ticket.status === 'active' ? 'Active' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Wins */}
            <Card className="bg-fortune-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Trophy className="size-5 text-emerald-400" /> Recent Wins
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('my-winnings')} className="text-primary gap-1 text-xs">
                    See All <ChevronRight className="size-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wonTickets.map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Trophy className="size-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{ticket.game}</p>
                          <div className="flex gap-1 mt-0.5">
                            {ticket.numbers.map((n, i) => (
                              <span key={i} className="text-xs text-muted-foreground font-mono">{n}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">{ticket.prize}</p>
                        <p className="text-xs text-muted-foreground">{ticket.drawDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-fortune-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Recent Transactions</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('wallet')} className="text-primary gap-1 text-xs">
                    Wallet <ChevronRight className="size-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`size-7 rounded-full flex items-center justify-center ${
                          tx.type === 'prize' ? 'bg-emerald-500/20' :
                          tx.type === 'deposit' ? 'bg-sky-500/20' :
                          tx.type === 'withdrawal' ? 'bg-amber-500/20' : 'bg-muted'
                        }`}>
                          {tx.type === 'prize' ? <Trophy className="size-3.5 text-emerald-400" /> :
                           tx.type === 'deposit' ? <TrendingUp className="size-3.5 text-sky-400" /> :
                           tx.type === 'withdrawal' ? <Wallet className="size-3.5 text-amber-400" /> :
                           <Ticket className="size-3.5 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-foreground'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Loyalty Level */}
            <Card className="bg-fortune-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-full gold-gradient flex items-center justify-center">
                    <Star className="size-5 text-fortune-navy" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loyalty Level</p>
                    <p className="font-bold">Gold Member</p>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress to Platinum</span>
                    <span>720 / 1,000 pts</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground">280 more points to reach Platinum status.</p>
              </CardContent>
            </Card>

            {/* User Account Management */}
            <Card className="bg-fortune-card border-border">
              <CardHeader className="pb-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <User className="size-4 text-primary" /> My Account
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('profile')}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <User className="size-4 text-primary" /> Profile
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => navigate('profile')}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="size-4 text-primary" /> Security
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-fortune-card border-border">
              <CardHeader className="pb-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Zap className="size-4 text-primary" /> Quick Links
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('my-lotteries')}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Ticket className="size-4 text-primary" /> My Lotteries
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => navigate('my-winnings')}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Award className="size-4 text-emerald-400" /> Winnings
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => navigate('mobile-app')}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Smartphone className="size-4 text-primary" /> Mobile App
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => navigate('support')}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="size-4 text-primary" /> Support
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Promo Banner */}
            <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-fortune-blue/20 to-fortune-card">
              <CardContent className="p-5">
                <Gift className="size-8 text-primary mb-3" />
                <h3 className="font-bold mb-1">Mega Monday</h3>
                <p className="text-sm text-muted-foreground mb-3">2× prizes on all Pick 3 & Pick 4 tickets every Monday!</p>
                <Button size="sm" className="gold-gradient text-fortune-navy font-semibold" onClick={() => navigate('promotions')}>
                  View All Promos
                </Button>
              </CardContent>
            </Card>

            {/* Next Draw Countdown */}
            <Card className="bg-fortune-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">Next Draw</p>
                </div>
                <p className="text-2xl font-extrabold text-primary tabular-nums">7:29 PM</p>
                <p className="text-xs text-muted-foreground mt-1">Pick 2, Pick 3 & Pick 4 daily draw</p>
                <Separator className="my-3 opacity-50" />
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Zap className="size-3" /> Cash Pop: Every 4 minutes
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-border/60 text-xs"
                  onClick={() => navigate('games')}
                >
                  Buy Tickets Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
