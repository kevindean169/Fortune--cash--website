import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu, X, Trophy, Ticket, Wallet, LayoutDashboard,
  Gift, ShieldCheck, Phone, ChevronDown, Sparkles,
} from 'lucide-react'
import type { PageId } from '@/lib/fortune-data'

interface NavProps {
  currentPage: PageId
  navigate: (page: PageId) => void
}

const gamesMenu: { id: PageId; label: string; icon: string }[] = [
  { id: 'cashpot', label: 'Jamaica Cashpot', icon: '💎' },
  { id: 'money-time', label: 'Money Time', icon: '🎯' },
  { id: 'pick-2-single', label: 'Pick 2 Single', icon: '✌️' },
  { id: 'pick-2-double', label: 'Pick 2 Double', icon: '🔥' },
]

const mainNav: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'results', label: 'Results', icon: <Trophy className="size-4" /> },
  { id: 'promotions', label: 'Promotions', icon: <Gift className="size-4" /> },
  { id: 'my-lotteries', label: 'My Lotteries', icon: <Ticket className="size-4" /> },
]

export function Navigation({ currentPage, navigate }: NavProps) {
  const [gamesOpen, setGamesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavigate = (page: PageId) => {
    navigate(page)
    setMobileOpen(false)
    setGamesOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="relative flex items-center justify-center size-8 rounded-full gold-gradient shadow-md">
              <Sparkles className="size-4 text-fortune-navy" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="gold-text">Fortune</span>
              <span className="text-foreground"> Lottery</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Games Dropdown */}
            <div className="relative" onMouseLeave={() => setGamesOpen(false)}>
              <button
                onMouseEnter={() => setGamesOpen(true)}
                onClick={() => handleNavigate('games')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  ['games','cashpot','money-time','pick-2-single','pick-2-double'].includes(currentPage)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                Games <ChevronDown className={`size-3.5 transition-transform ${gamesOpen ? 'rotate-180' : ''}`} />
              </button>
              {gamesOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 rounded-xl border border-border bg-popover p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95">
                  {gamesMenu.map(g => (
                    <button
                      key={g.id}
                      onClick={() => handleNavigate(g.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent ${
                        currentPage === g.id ? 'text-primary bg-accent/50' : 'text-foreground'
                      }`}
                    >
                      <span className="text-base">{g.icon}</span>
                      {g.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {mainNav.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  currentPage === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('dashboard')}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('wallet')}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Wallet className="size-4" />
              $5,249.50
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('login')}
              className="text-muted-foreground hover:text-foreground"
            >
              Log In
            </Button>
            <Button
              size="sm"
              onClick={() => handleNavigate('register')}
              className="gold-gradient text-fortune-navy font-bold hover:opacity-90 gold-glow"
            >
              Sign Up
            </Button>
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
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Games</p>
                  {gamesMenu.map(g => (
                    <button
                      key={g.id}
                      onClick={() => handleNavigate(g.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        currentPage === g.id ? 'bg-accent text-primary' : 'hover:bg-accent text-foreground'
                      }`}
                    >
                      <span className="text-lg">{g.icon}</span> {g.label}
                    </button>
                  ))}

                  <Separator className="my-3" />

                  {[
                    { id: 'results' as PageId, label: 'Results', icon: <Trophy className="size-4" /> },
                    { id: 'promotions' as PageId, label: 'Promotions', icon: <Gift className="size-4" /> },
                    { id: 'dashboard' as PageId, label: 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
                    { id: 'tickets' as PageId, label: 'My Tickets', icon: <Ticket className="size-4" /> },
                    { id: 'wallet' as PageId, label: 'Wallet', icon: <Wallet className="size-4" /> },
                    { id: 'responsible-gaming' as PageId, label: 'Responsible Gaming', icon: <ShieldCheck className="size-4" /> },
                    { id: 'contact' as PageId, label: 'Support', icon: <Phone className="size-4" /> },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        currentPage === item.id ? 'bg-accent text-primary' : 'hover:bg-accent text-foreground'
                      }`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </nav>

                <div className="p-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Wallet Balance</span>
                    <span className="font-bold text-primary">$5,249.50</span>
                  </div>
                  <Button className="w-full gold-gradient text-fortune-navy font-bold" onClick={() => handleNavigate('games')}>
                    Play Now
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
