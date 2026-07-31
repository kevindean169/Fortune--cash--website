import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu, X, Trophy, Ticket, Wallet, LayoutDashboard,
  ShieldCheck, Phone, ChevronDown, User, LogOut,
  FileText, ArrowLeft
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { formatUsd } from '@/lib/currency'

const mainNav = [
  { id: 'lotteries', label: 'Lotteries', icon: <Ticket className="size-4" /> },
  { id: 'results', label: 'Results', icon: <Trophy className="size-4" /> },
  { id: 'about', label: 'About', icon: <FileText className="size-4" /> },
  { id: 'contact', label: 'Support', icon: <Phone className="size-4" /> },
  { id: 'terms', label: 'Terms & Conditions', icon: <FileText className="size-4" /> },
]

export function Navigation() {
  const { user, walletBalance, logout } = useAuth()
  const navigateHook = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname.substring(1) || ''

  const handleNavigate = () => {
    setMobileOpen(false)
    setProfileOpen(false)
  }

  const handleLogout = () => {
    logout()
    handleNavigate()
    navigateHook('/')
  }

  const handleBackToLobby = () => {
    const baseUrl = (import.meta.env.VITE_API_URL || 'https://ja.fortunescash.com').replace(/\/$/, '')
    window.location.href = `${baseUrl}/api/back-to-lobby`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: Back Button & Logo */}
          <div className="flex items-center gap-1 sm:gap-3">
            {currentPath !== '' && (
              <Button
                variant="ghost"
                onClick={() => navigateHook(-1)}
                className="group flex items-center gap-1.5 px-2 md:px-3 -ml-2 sm:-ml-3 text-muted-foreground hover:text-primary hover:bg-white/5 transition-all"
                aria-label="Go back"
                title="Go back"
              >
                <ArrowLeft className="size-5 sm:size-6 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline font-bold text-sm tracking-wide">Back</span>
              </Button>
            )}

            {/* Logo */}
            <Link
              to="/"
              onClick={handleNavigate}
              className="flex items-center group"
            >
              <img src="/favicon.png" alt="Fortune Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(224,172,44,0.3)] group-hover:scale-105 transition-transform" style={{ mixBlendMode: 'screen' }} />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">

            {mainNav.map(item => (
              <Link
                key={item.id}
                to={`/${item.id}`}
                onClick={handleNavigate}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${currentPath === item.id
                  ? 'text-primary'
                  : 'text-foreground/90'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/wallet" onClick={handleNavigate}>
                  <div className="flex items-center gap-2 rounded-full border-2 bg-[#050505] p-1 pr-4 transition-all border-primary/70 hover:border-primary hover:shadow-[0_0_10px_rgba(224,172,44,0.15)]">
                    <div className="size-7 rounded-full border border-primary/50 bg-[#1a150c] flex items-center justify-center">
                      <Wallet className="size-4 text-primary" />
                    </div>
                    <span className="text-foreground font-bold tracking-wide text-sm">
                      {formatUsd(walletBalance)}
                    </span>
                  </div>
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative" onMouseLeave={() => setProfileOpen(false)}>
                  <button
                    onMouseEnter={() => setProfileOpen(true)}
                    className={`flex items-center gap-2.5 rounded-full py-1.5 px-3 transition-colors ${['profile', 'dashboard'].includes(currentPath)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-white/5 text-foreground/90 hover:text-primary'
                      }`}
                  >
                    <div className="size-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <User className="size-4 text-primary" />
                    </div>
                    <span className="text-sm font-bold tracking-wide">{user.username}</span>
                    <ChevronDown className={`size-3.5 opacity-70 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute top-full right-0 pt-2 z-50">
                      <div className="w-56 rounded-2xl border border-[#c5a059]/30 bg-[#0a0a0a] shadow-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
                        <div className="p-4 border-b border-[#c5a059]/20 bg-gradient-to-br from-[#1a150c] to-transparent">
                          <p className="text-sm font-extrabold text-white tracking-wide">{user.username}</p>
                          {user.email && <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>}
                        </div>
                        <div className="p-2 space-y-1">
                          <Link to="/dashboard" onClick={handleNavigate} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#c5a059]/10 hover:text-white ${currentPath === 'dashboard' ? 'bg-[#c5a059]/15 text-white' : 'text-muted-foreground'
                            }`}>
                            <LayoutDashboard className={`size-4 ${currentPath === 'dashboard' ? 'text-[#c5a059]' : ''}`} /> Dashboard
                          </Link>
                          <Link to="/profile" onClick={handleNavigate} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#c5a059]/10 hover:text-white ${currentPath === 'profile' ? 'bg-[#c5a059]/15 text-white' : 'text-muted-foreground'
                            }`}>
                            <User className={`size-4 ${currentPath === 'profile' ? 'text-[#c5a059]' : ''}`} /> Personal Details
                          </Link>
                        </div>
                        <div className="p-2 border-t border-[#c5a059]/20">
                          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                            <LogOut className="size-4" /> Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={handleNavigate}>
                  <Button variant="ghost" size="sm" className="text-foreground/90 font-semibold hover:text-primary hover:bg-transparent transition-colors">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={handleNavigate}>
                  <Button size="sm" className="gold-gradient text-fortune-navy font-bold hover:opacity-90 gold-glow">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLobby}
              className="border-2 border-primary bg-[#050505] text-primary hover:text-white hover:border-primary hover:shadow-[0_0_10px_rgba(224,172,44,0.15)] hover:bg-primary/10 font-bold transition-all text-xs px-3 h-8 rounded-lg"
            >
              Back to Lobby
            </Button>

            {user && (
              <Link to="/wallet" onClick={handleNavigate}>
                <div className="flex items-center gap-1.5 rounded-full border-2 bg-[#050505] p-0.5 pr-2.5 transition-all border-primary/70 hover:border-primary hover:shadow-[0_0_10px_rgba(224,172,44,0.15)] h-8">
                  <div className="size-6 rounded-full border border-primary/50 bg-[#1a150c] flex items-center justify-center">
                    <Wallet className="size-3 text-primary" />
                  </div>
                  <span className="text-foreground font-bold tracking-wide text-xs">
                    {formatUsd(walletBalance)}
                  </span>
                </div>
              </Link>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-fortune-card border-border p-0" showCloseButton={false}>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <img src="/favicon.png" alt="Fortune Logo" className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(224,172,44,0.3)]" style={{ mixBlendMode: 'screen' }} />
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                      <X className="size-4" />
                    </Button>
                  </div>

                  <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {[
                      { id: 'lotteries', label: 'Lotteries', icon: <Ticket className="size-4" /> },
                      { id: 'results', label: 'Results', icon: <Trophy className="size-4" /> },
                      { id: 'about', label: 'About', icon: <FileText className="size-4" /> },
                      ...(user ? [
                        { id: 'profile', label: 'My Profile', icon: <User className="size-4" /> },
                        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
                        { id: 'tickets', label: 'My Tickets', icon: <Ticket className="size-4" /> },
                        { id: 'wallet', label: 'Wallet', icon: <Wallet className="size-4" /> },
                        { id: 'transactions', label: 'Transactions', icon: <FileText className="size-4" /> },
                      ] : []),
                      { id: 'responsible-gaming', label: 'Responsible Gaming', icon: <ShieldCheck className="size-4" /> },
                      { id: 'contact', label: 'Support', icon: <Phone className="size-4" /> },
                      { id: 'terms', label: 'Terms & Conditions', icon: <FileText className="size-4" /> },
                    ].map(item => (
                      <Link
                        key={item.id}
                        to={`/${item.id}`}
                        onClick={handleNavigate}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${currentPath === item.id ? 'bg-accent text-primary' : 'hover:bg-accent text-foreground'
                          }`}
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}

                    <div className="pt-2 mt-2 border-t border-border/50">
                      {user ? (
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="size-4" /> Log Out
                        </button>
                      ) : (
                        <>
                          {[
                            { id: 'login', label: 'Log In', icon: <User className="size-4" /> },
                            { id: 'register', label: 'Sign Up', icon: <ShieldCheck className="size-4" /> },
                          ].map(item => (
                            <Link
                              key={item.id}
                              to={`/${item.id}`}
                              onClick={handleNavigate}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${currentPath === item.id ? 'bg-accent text-primary' : 'hover:bg-accent text-foreground'
                                }`}
                            >
                              {item.icon} {item.label}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  </nav>

                  <div className="p-4 border-t border-border space-y-2">
                    {user ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Wallet Balance</span>
                          <span className="font-bold text-primary">
                            {formatUsd(walletBalance)}
                          </span>
                        </div>
                        <Link to="/lotteries" onClick={handleNavigate} className="w-full">
                          <Button className="w-full gold-gradient text-fortune-navy font-bold">
                            Play Now
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Link to="/login" onClick={handleNavigate} className="w-full">
                        <Button className="w-full gold-gradient text-fortune-navy font-bold">
                          Login to Play
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
