import { Outlet, NavLink } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { 
  User as UserIcon, Lock, Wallet, Trophy, Ticket, LogOut, 
  ChevronRight, LayoutDashboard, FileText
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function AccountLayout() {
  const { user, walletBalance, logout } = useAuth()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/profile', label: 'Personal Details', icon: UserIcon },
    { path: '/wallet', label: 'My Wallet', icon: Wallet },
    { path: '/transactions', label: 'My Transactions', icon: FileText },
    { path: '/tickets', label: 'My Tickets', icon: Ticket },
    { path: '/winnings', label: 'My Winnings', icon: Trophy },
    { path: '/security', label: 'Security', icon: Lock },
  ]

  return (
    <div className="min-h-screen py-4 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page Title — hidden on mobile */}
        <div className="hidden md:flex mb-6 md:mb-8 items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
              My <span className="gold-text">Account</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your dashboard, tickets, and wallet balance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          
          {/* Sidebar Navigation — hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            
            {/* User Summary Card */}
            <Card className="bg-fortune-card border border-border/60 text-center">
              <CardContent className="p-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                  <span className="text-3xl font-black text-primary">{(user?.username || 'U').charAt(0).toUpperCase()}</span>
                </div>
                <h2 className="font-bold text-lg text-foreground">
                  {user?.username || 'Player'}
                </h2>
                <div className="pt-4 mt-4 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Wallet Balance</p>
                  <p className="font-extrabold text-xl text-green-400">${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </CardContent>
            </Card>

            {/* Nav Menu */}
            <Card className="bg-fortune-card border border-border/60 overflow-hidden">
              <CardContent className="p-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all ${
                          isActive 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'text-muted-foreground hover:bg-background hover:text-foreground'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon className="size-4" />
                            {item.label}
                          </div>
                          <ChevronRight className={`size-4 transition-transform ${isActive ? 'translate-x-1' : ''}`} />
                        </>
                      )}
                    </NavLink>
                  )
                })}
                <div className="pt-2 mt-2 border-t border-border/50">
                  <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
