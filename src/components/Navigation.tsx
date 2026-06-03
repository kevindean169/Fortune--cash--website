import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu, X, Trophy, Ticket, Wallet, LayoutDashboard,
  ShieldCheck, Phone, ChevronDown, Sparkles, User, LogOut
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const mainNav = [
  { id: 'games', label: 'Lotteries', icon: <Ticket className="size-4" /> },
  { id: 'results', label: 'Results', icon: <Trophy className="size-4" /> },
]

export function Navigation() {
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname.substring(1) || ''

  const handleNavigate = () => {
    setMobileOpen(false)
    setProfileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleNavigate}
            className="flex items-center gap-2 group"
          >
            <div className="relative flex items-center justify-center size-8 rounded-full gold-gradient shadow-md">
              <Sparkles className="size-4 text-fortune-navy" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="gold-text">Fortune</span>
              <span className="text-foreground"> Lottery</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">

            {mainNav.map(item => (
              <Link
                key={item.id}
                to={`/${item.id}`}
                onClick={handleNavigate}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  currentPath === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* User Profile Dropdown */}
            <div className="relative" onMouseLeave={() => setProfileOpen(false)}>
              <button
                onMouseEnter={() => setProfileOpen(true)}
                className={`flex items-center gap-2 rounded-full border bg-[#050505] p-1 pr-3 transition-colors ${
                  ['profile', 'dashboard'].includes(currentPath) 
                    ? 'border-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.2)]' 
                    : 'border-[#c5a059]/30 hover:border-[#c5a059]/60'
                }`}
              >
                <div className={`size-7 rounded-full border bg-[#1a150c] flex items-center justify-center ${['profile', 'dashboard'].includes(currentPath) ? 'border-[#c5a059]' : 'border-[#c5a059]/50'}`}>
                  <User className="size-4 text-[#c5a059]" />
                </div>
                <span className={`text-sm font-bold ${['profile', 'dashboard'].includes(currentPath) ? 'text-[#c5a059]' : 'text-white'}`}>Profile</span>
                <ChevronDown className={`size-3.5 text-[#c5a059] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {profileOpen && (
                <div className="absolute top-full right-0 pt-2 z-50">
                  <div className="w-56 rounded-2xl border border-[#c5a059]/30 bg-[#0a0a0a] shadow-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
                    <div className="p-4 border-b border-[#c5a059]/20 bg-gradient-to-br from-[#1a150c] to-transparent">
                      <p className="text-sm font-extrabold text-white tracking-wide">Sachin Kumar</p>
                      <p className="text-xs text-muted-foreground mt-0.5">sachin@example.com</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link to="/dashboard" onClick={handleNavigate} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#c5a059]/10 hover:text-white ${
                        currentPath === 'dashboard' ? 'bg-[#c5a059]/15 text-white' : 'text-muted-foreground'
                      }`}>
                        <LayoutDashboard className={`size-4 ${currentPath === 'dashboard' ? 'text-[#c5a059]' : ''}`} /> Dashboard
                      </Link>
                      <Link to="/profile" onClick={handleNavigate} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#c5a059]/10 hover:text-white ${
                        currentPath === 'profile' ? 'bg-[#c5a059]/15 text-white' : 'text-muted-foreground'
                      }`}>
                        <User className={`size-4 ${currentPath === 'profile' ? 'text-[#c5a059]' : ''}`} /> Personal Details
                      </Link>
                    </div>
                    <div className="p-2 border-t border-[#c5a059]/20">
                      <button onClick={handleNavigate} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="size-4" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/wallet" onClick={handleNavigate}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <Wallet className="size-4" />
                $5,249.50
              </Button>
            </Link>
            <Link to="/login" onClick={handleNavigate}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Log In
              </Button>
            </Link>
            <Link to="/register" onClick={handleNavigate}>
              <Button size="sm" className="gold-gradient text-fortune-navy font-bold hover:opacity-90 gold-glow">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-fortune-card border-border p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="text-lg font-extrabold">
                    <span className="gold-text">Fortune</span> Lottery
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                    <X className="size-4" />
                  </Button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {[
                    { id: 'games', label: 'Lotteries', icon: <Ticket className="size-4" /> },
                    { id: 'results', label: 'Results', icon: <Trophy className="size-4" /> },
                    { id: 'profile', label: 'My Profile', icon: <User className="size-4" /> },
                    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
                    { id: 'tickets', label: 'My Tickets', icon: <Ticket className="size-4" /> },
                    { id: 'wallet', label: 'Wallet', icon: <Wallet className="size-4" /> },
                    { id: 'responsible-gaming', label: 'Responsible Gaming', icon: <ShieldCheck className="size-4" /> },
                    { id: 'contact', label: 'Support', icon: <Phone className="size-4" /> },
                  ].map(item => (
                    <Link
                      key={item.id}
                      to={`/${item.id}`}
                      onClick={handleNavigate}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        currentPath === item.id ? 'bg-accent text-primary' : 'hover:bg-accent text-foreground'
                      }`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="p-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Wallet Balance</span>
                    <span className="font-bold text-primary">$5,249.50</span>
                  </div>
                  <Link to="/games" onClick={handleNavigate} className="w-full">
                    <Button className="w-full gold-gradient text-fortune-navy font-bold">
                      Play Now
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
