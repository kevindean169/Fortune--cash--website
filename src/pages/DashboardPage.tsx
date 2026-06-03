import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { PageId } from '@/lib/fortune-data'

interface DashboardPageProps {
  navigate: (page: PageId) => void
}

const stats = [
  { label: 'Wallet Balance', value: '$9,898.98', color: 'text-foreground', icon: '💳' },
  { label: "Today's Bet Volume", value: '$12.00', color: 'text-foreground', icon: '🎟️' },
  { label: "Today's Winning Slips", value: '3', color: 'text-primary', icon: '💡' },
  { label: "Today's Payout Wins", value: '$228.00', color: 'text-primary', icon: '⚡' },
]

const quickLinks: { label: string; page: PageId; desc: string; icon: string }[] = [
  { label: 'Play CASHPOT', page: 'cashpot', desc: 'Pick numbers 01-36 and bet', icon: '🎁' },
  { label: 'Play Money Time', page: 'money-time', desc: 'Fast hourly draws daily', icon: '⏱️' },
  { label: 'My Bet Slips', page: 'tickets', desc: 'Audit won/lost ticket history', icon: '🎟️' },
  { label: 'Transactions History', page: 'transactions', desc: 'Audit deposits and payouts', icon: '💰' },
]

export function DashboardPage({ navigate }: DashboardPageProps) {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Welcome Banner */}
        <div className="bg-fortune-card border border-l-4 border-l-primary border-border/60 rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Welcome back, <span className="gold-text">Sachin!</span>
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              Account status: <span className="text-primary font-bold">Active Agent</span>&nbsp;•&nbsp;Timezone: America/Jamaica
            </p>
          </div>
          <Button
            onClick={() => navigate('games')}
            className="gold-gradient text-fortune-navy font-bold hover:opacity-90 gold-glow"
          >
            Create New Bet Slip →
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-fortune-card border border-border/60 hover:-translate-y-1 transition-all">
              <CardContent className="p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-muted-foreground text-xs font-semibold leading-tight">{stat.label}</span>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <p className={`text-2xl sm:text-3xl font-extrabold mt-2 ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Quick Actions */}
          <div className="lg:col-span-2">
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
                      className="p-4 border border-border bg-white/[0.02] hover:bg-primary/5 hover:border-primary/30 rounded-xl flex gap-4 transition-all hover:-translate-y-1 text-left"
                    >
                      <span className="text-3xl flex-shrink-0 my-auto">{link.icon}</span>
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

          {/* Wallet Summary */}
          <div>
            <Card className="bg-fortune-card border border-border/60">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-foreground border-b border-border pb-3 mb-4">
                  Wallet Details
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="text-green-400 font-bold">$9,898.98</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Today's Commission:</span>
                    <span className="text-foreground font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Registered Phone:</span>
                    <span className="text-foreground font-medium">+1 (876) 555-0199</span>
                  </div>
                </div>
                <div className="pt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border hover:border-primary/40"
                    onClick={() => navigate('transactions')}
                  >
                    Deposit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border hover:border-primary/40"
                    onClick={() => navigate('transactions')}
                  >
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
