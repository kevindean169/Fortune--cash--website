import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User, Lock, Wallet, Trophy, Ticket, LogOut, 
  ChevronRight, ShieldCheck, LayoutDashboard
} from 'lucide-react'
import type { PageId } from '@/lib/fortune-data'

interface DashboardPageProps {
  navigate: (page: PageId) => void
  initialTab?: string
}

export function DashboardPage({ navigate, initialTab = 'overview' }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  
  // Static mock data
  const profile = {
    firstName: 'Sachin',
    lastName: 'Kumar',
    email: 'sachin@example.com',
    mobile: '+1 (876) 555-0199',
    address: '10 Main Street',
    city: 'Kingston',
    country: 'Jamaica',
    balance: 9898.98
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
    { label: 'Draw Results', page: 'results', desc: 'Check latest winning numbers', icon: '🏆' },
    { label: 'Transaction Audit', page: 'transactions', desc: 'View deposits and payouts', icon: '💰' },
  ]

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Personal Details', icon: User },
    { id: 'wallet', label: 'My Wallet', icon: Wallet },
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'winnings', label: 'My Winnings', icon: Trophy },
    { id: 'security', label: 'Security', icon: Lock },
  ]

  const goldBtn = {
    background: 'linear-gradient(to bottom, #5c9e42, #36791d)',
    color: 'white',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 15px rgba(92,158,66,0.3)',
  }

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">
            My <span className="gold-text">Account</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your dashboard, tickets, and wallet balance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Summary Card */}
            <Card className="bg-fortune-card border border-border/60 text-center">
              <CardContent className="p-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                  <span className="text-3xl font-black text-primary">{profile.firstName.charAt(0)}</span>
                </div>
                <h2 className="font-bold text-lg text-foreground">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-xs text-muted-foreground mb-4">{profile.email}</p>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Wallet Balance</p>
                  <p className="font-extrabold text-xl text-green-400">${profile.balance.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Nav Menu */}
            <Card className="bg-fortune-card border border-border/60 overflow-hidden">
              <CardContent className="p-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all ${
                        isActive 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'text-muted-foreground hover:bg-background hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-4" />
                        {item.label}
                      </div>
                      <ChevronRight className={`size-4 transition-transform ${isActive ? 'translate-x-1' : ''}`} />
                    </button>
                  )
                })}
                <div className="pt-2 mt-2 border-t border-border/50">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                {/* Welcome Banner */}
                <div className="bg-fortune-card border border-l-4 border-l-primary border-border/60 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      Welcome back, <span className="gold-text">{profile.firstName}!</span>
                    </h2>
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <Card className="bg-fortune-card border border-border/60 animate-in fade-in slide-in-from-bottom-2">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-xl text-foreground border-b border-border pb-4 mb-6 flex items-center gap-2">
                    <User className="size-5 text-primary" />
                    Personal & Address Details
                  </h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">First Name</label>
                        <input type="text" defaultValue={profile.firstName} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Last Name</label>
                        <input type="text" defaultValue={profile.lastName} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Email Address</label>
                        <input type="email" defaultValue={profile.email} disabled className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed opacity-50" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Phone Number</label>
                        <input type="text" defaultValue={profile.mobile} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Street Address</label>
                        <input type="text" defaultValue={profile.address} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">City</label>
                        <input type="text" defaultValue={profile.city} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary" />
                      </div>
                    </div>

                    <div className="pt-6 text-right">
                      <Button style={goldBtn} className="font-bold px-8 py-6 rounded-xl text-sm hover:opacity-90 transition-opacity">
                        Save Profile Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* WALLET TAB */}
            {activeTab === 'wallet' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <Card className="bg-fortune-card border border-border/60">
                  <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h3 className="font-bold text-xl text-foreground mb-1">Available Balance</h3>
                      <p className="text-muted-foreground text-sm">Manage your funds to buy tickets seamlessly.</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-4xl text-green-400">${profile.balance.toLocaleString()}</p>
                      <div className="flex gap-2 mt-4 justify-end">
                        <Button variant="outline" size="sm" onClick={() => navigate('transactions')} className="border-border hover:border-primary/40">Deposit</Button>
                        <Button variant="outline" size="sm" onClick={() => navigate('transactions')} className="border-border hover:border-primary/40">Withdraw</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 className="font-bold text-lg text-foreground mt-8 mb-4">Recent Transactions</h3>
                <Card className="bg-fortune-card border border-border/60">
                  <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-border bg-white/[0.02]">
                          <th className="px-6 py-4 text-muted-foreground text-xs uppercase">Type</th>
                          <th className="px-6 py-4 text-muted-foreground text-xs uppercase">Date</th>
                          <th className="px-6 py-4 text-muted-foreground text-xs uppercase text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { type: 'Deposit', date: 'May 30, 2026', amount: 1000, pos: true },
                          { type: 'Purchase', date: 'May 30, 2026', amount: -25, pos: false },
                          { type: 'Payout', date: 'May 28, 2026', amount: 260, pos: true },
                        ].map((t, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-white/[0.02]">
                            <td className="px-6 py-4 font-bold text-foreground">{t.type}</td>
                            <td className="px-6 py-4 text-muted-foreground">{t.date}</td>
                            <td className={`px-6 py-4 text-right font-bold ${t.pos ? 'text-green-400' : 'text-foreground'}`}>
                              {t.pos ? '+' : ''}${Math.abs(t.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TICKETS TAB */}
            {activeTab === 'tickets' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xl text-foreground">Active & Past Tickets</h3>
                  <Button variant="outline" size="sm" onClick={() => navigate('tickets')} className="border-border text-xs">
                    View Full History →
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { game: 'CASHPOT', no: '14', status: 'Won', payout: 72 },
                    { game: 'Money Time', no: '28', status: 'Pending', payout: 0 },
                    { game: 'Pick 2 Single', no: '07', status: 'Lost', payout: 0 },
                    { game: 'P2 Double Digit', no: '44', status: 'Pending', payout: 0 },
                  ].map((t, i) => (
                    <Card key={i} className={`bg-fortune-card border border-border/60 border-t-4 ${
                      t.status === 'Won' ? 'border-t-green-500' : t.status === 'Lost' ? 'border-t-red-500' : 'border-t-primary'
                    }`}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <p className="font-bold text-foreground">{t.game}</p>
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                            t.status === 'Won' ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                            t.status === 'Lost' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                            'text-primary border-primary/30 bg-primary/10'
                          }`}>{t.status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Number</p>
                            <p className="font-extrabold text-2xl text-primary">#{t.no}</p>
                          </div>
                          {t.status === 'Won' && (
                            <div className="text-right">
                              <p className="text-[10px] text-green-400 uppercase">Payout</p>
                              <p className="font-bold text-lg text-green-400">+${t.payout}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* WINNINGS TAB */}
            {activeTab === 'winnings' && (
              <Card className="bg-fortune-card border border-border/60 animate-in fade-in slide-in-from-bottom-2">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="size-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Trophy className="size-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-foreground">Total Lifetime Winnings</h3>
                      <p className="text-muted-foreground text-sm">A summary of all payouts credited to your account.</p>
                    </div>
                  </div>
                  <div className="text-center py-8 bg-background border border-border rounded-xl">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Value</p>
                    <p className="font-black text-5xl gold-text">$1,260.00</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <Card className="bg-fortune-card border border-border/60 animate-in fade-in slide-in-from-bottom-2">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-xl text-foreground border-b border-border pb-4 mb-6 flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />
                    Change Password
                  </h3>
                  <div className="space-y-5 max-w-md">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Confirm Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button style={goldBtn} className="font-bold w-full py-6 rounded-xl text-sm hover:opacity-90 transition-opacity">
                        Update Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
