import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight, Trophy, Zap, Clock,
  ChevronRight, Star, TrendingUp, Play,
  Smartphone, Download, MessageCircle,
  User, Lock, EyeOff
} from 'lucide-react'
import { GAMES, RECENT_RESULTS, WINNERS } from '@/lib/fortune-data'
import type { PageId } from '@/lib/fortune-data'
import { useNavigate } from 'react-router-dom'

function JackpotCounter({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const duration = 1800
    const steps = 80
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, value)
      setDisplayed(Math.floor(current))
      if (current >= value) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="tabular-nums">
      ${displayed.toLocaleString()}
    </span>
  )
}

export function HomePage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden fortune-hero-bg">
        <div className="absolute inset-0 opacity-20">
          <img src="/lottery-hero.webp" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pt-16 lg:pb-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-none mb-4">
                  Your Next<br />
                  <span className="gold-text">Fortune</span><br />
                  Awaits
                </h1>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Play Cashpot, Money Time, and Pick 2. Draws happen daily. Winners happen constantly.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate('lotteries')}
                  className="gold-gradient text-fortune-navy font-bold text-base px-8 gold-glow hover:opacity-90"
                >
                  Play Now <ArrowRight className="size-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('results')}
                  className="border-border/60 hover:border-primary/50 hover:text-primary"
                >
                  View Results
                </Button>
              </div>
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { icon: <Zap className="size-4 text-primary" />, label: 'Instant Payouts' },
                  { icon: <Clock className="size-4 text-sky-400" />, label: 'Daily Draws' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    {b.icon} {b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Jackpot Display */}
            <div className="flex justify-center lg:justify-center">
              <div className="relative w-80">
                <div className="absolute inset-0 rounded-2xl gold-glow opacity-30" />
                <Card className="relative bg-fortune-card border-fortune-gold/20 rounded-2xl overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Tonight's Top Prize
                    </p>
                    <div className="text-6xl font-extrabold gold-text my-4">
                      <JackpotCounter value={85000} />
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">Cashpot · Next Draw Soon</p>
                    <Button
                      className="w-full gold-gradient text-fortune-navy font-bold"
                      onClick={() => navigate('cashpot')}
                    >
                      Play Cashpot <ChevronRight className="size-4" />
                    </Button>
                    <Separator className="my-4 opacity-30" />
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: 'Money Time', value: '$240,000' },
                        { label: 'Pick 2 Single', value: '$120,000' },
                        { label: 'Pick 2 Double', value: '$120,000' },
                      ].map((j, i) => (
                        <div key={i}>
                          <p className="text-sm font-bold text-primary">{j.value}</p>
                          <p className="text-xs text-muted-foreground">{j.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Strip */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Available Lotteries</h2>
              <p className="text-muted-foreground mt-1">Pick your game and play today</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('lotteries')} className="text-primary gap-1">
              All Games <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GAMES.map(game => {
              const getGameLogoSrc = (id: string) => {
                switch (id) {
                  case 'cashpot':
                    return '/cashpot_logo.png'
                  case 'money-time':
                    return '/moneytime_logo.png'
                  case 'pick-2-single':
                  case 'pick-2-double':
                    return '/pick2_logo.png'
                  default:
                    return null
                }
              }
              const logoSrc = getGameLogoSrc(game.id)
              return (
                <button
                  key={game.id}
                  onClick={() => navigate(game.id)}
                  className="group text-left"
                >
                  <Card className="bg-fortune-card border-border card-hover h-full">
                    <CardContent className="p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        {logoSrc ? (
                          <img src={logoSrc} alt={game.name} className="w-10 h-10 object-contain drop-shadow" />
                        ) : (
                          <span className="text-3xl">{game.icon}</span>
                        )}
                        <Badge className="bg-primary/15 text-primary border-primary/25 text-xs font-semibold">
                          {game.price}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{game.name}</h3>
                        <p className="text-sm text-muted-foreground">{game.tagline}</p>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-primary">{game.jackpot}</p>
                        <p className="text-xs text-muted-foreground">Top Prize</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{game.nextDraw}</span>
                      </div>
                      <div className="mt-auto pt-2 flex items-center gap-1 text-sm text-primary font-semibold group-hover:gap-2 transition-all">
                        Play Now <ArrowRight className="size-3.5" />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* How To Play */}
      <section className="py-16 bg-fortune-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">How to Play</h2>
            <p className="text-muted-foreground">Four simple steps to place your bet and start winning</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                icon: <Play className="size-6 text-primary" />,
                title: 'Choose Your Game',
                desc: 'Select from Jamaica Cashpot, Money Time, Pick 2 Single, or Pick 2 Double.',
              },
              {
                step: '02',
                icon: <Star className="size-6 text-primary" />,
                title: 'Pick Your Number',
                desc: 'Choose from 01–36 for Cashpot, or 00–99 for Pick 2. Add Mega & Monsta options.',
              },
              {
                step: '03',
                icon: <Zap className="size-6 text-primary" />,
                title: 'Set Your Bet Amount',
                desc: 'Bet from just $1.00. Use quick presets ($5, $10, $25) or enter a custom amount.',
              },
              {
                step: '04',
                icon: <Trophy className="size-6 text-primary" />,
                title: 'Watch the Results',
                desc: 'Draws happen daily. Check results instantly after the draw — winnings are credited automatically.',
              },
            ].map((step, i) => (
              <div key={i} className="relative text-center group cursor-default">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] w-[calc(100%-3rem)] h-px border-t border-dashed border-border/60 transition-colors duration-300 group-hover:border-primary/40" />
                )}
                <div className="relative inline-flex items-center justify-center size-16 rounded-2xl bg-fortune-card border border-border mb-4 transition-all duration-300 group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(224,172,44,0.2)]">
                  <div className="transition-transform duration-300 group-hover:rotate-6">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold text-muted-foreground bg-background rounded-full border border-border size-5 flex items-center justify-center transition-all duration-300 group-hover:border-primary/50 group-hover:text-primary">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 transition-colors duration-300 group-hover:text-primary">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-foreground/80">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Available Games list (compact) */}
          <div className="mt-16 bg-fortune-card border border-border rounded-2xl p-6 sm:p-8 relative overflow-hidden group/avail">
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <img src="/lottery-available-bg.jpg" alt="" className="w-full h-full object-cover object-center grayscale contrast-125 brightness-50 group-hover/avail:scale-105 transition-transform duration-700" />
            </div>
            <div className="absolute inset-0 bg-black/45 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">Available Lotteries</h2>

              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Cashpot', desc: 'Pick 01–36. Win up to 26× your bet. Add Mega & Monsta balls for bigger prizes.', path: 'cashpot' },
                  { name: 'Money Time', desc: 'Special Cashpot draws at fixed daily time slots. Same rules, extra chances.', path: 'money-time' },
                  { name: 'Pick 2 Single', desc: 'Select one two-digit number from 00–99. Simple, clean, great payout ratio.', path: 'pick-2-single' },
                  { name: 'Pick 2 Double', desc: 'Bet on two numbers. Win straight, box, or single-match combinations.', path: 'pick-2-double' },
                ].map((game) => (
                  <div
                    key={game.name}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                    onClick={() => navigate(game.path as PageId)}
                  >
                    <div className="size-10 rounded-xl bg-[#111111]/30 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={game.path === 'cashpot' ? '/cashpot_logo.png' : game.path === 'money-time' ? '/moneytime_logo.png' : '/pick2_logo.png'}
                        alt={game.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{game.name}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{game.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button onClick={() => navigate('lotteries')} className="gold-gradient text-fortune-navy font-bold text-sm px-8 gold-glow">
                  Start Playing Now <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Results */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Latest Results</h2>
              <p className="text-muted-foreground mt-1">Most recent winning numbers</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('results')} className="text-primary gap-1">
              All Results <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {RECENT_RESULTS.slice(0, 4).map((result, i) => (
              <Card key={i} className="bg-fortune-card border-border hover:border-border/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[100px]">
                        <p className="font-bold text-lg">{result.game}</p>
                        <p className="text-sm text-muted-foreground">{result.date}</p>
                      </div>
                      <div className="flex gap-2">
                        {result.numbers.map((n, ni) => (
                          <div key={ni} className="number-ball number-ball-result text-sm">
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-extrabold text-lg text-primary">{result.jackpot}</p>
                        <p className="text-sm text-muted-foreground">Top Prize</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-lg text-foreground">{result.winners}</p>
                        <p className="text-sm text-muted-foreground">Winners</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Winners */}
      <section className="py-16 bg-fortune-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Recent Winners</h2>
            <p className="text-muted-foreground">Real players. Real winnings. Real life-changing moments.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WINNERS.map((w, i) => (
              <Card key={i} className="bg-fortune-card border-border text-center">
                <CardContent className="p-5">
                  <div className="size-12 rounded-full border border-[#c5a059]/50 bg-[#1a150c] flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(197,160,89,0.15)]">
                    <span className="text-sm font-bold text-[#c5a059] tracking-wider">{w.initials}</span>
                  </div>
                  <p className="font-bold text-lg text-primary">{w.prize}</p>
                  <p className="text-sm font-semibold">{w.game}</p>
                  <p className="text-xs text-muted-foreground mt-1">{w.location} · {w.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Action Cards */}
      <section className="pt-16 pb-12 -mb-20 bg-background border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Mobile App Card */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 bg-fortune-card border border-border/60 rounded-3xl p-8 lg:px-12 lg:py-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10 lg:max-w-xl py-6">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                <Smartphone className="size-3 mr-1" /> Android Only
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Play Anywhere, Anytime</h2>
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                Download the official Fortune Lottery app. Experience the fastest way to play, get instant draw notifications, and manage your tickets securely on the go.
              </p>
              <a href="/fortune-app.apk" download>
                <Button className="gold-gradient text-fortune-navy font-bold px-8 h-12 gold-glow gap-2 text-md">
                  <Download className="size-4" /> Download APK Directly
                </Button>
              </a>
            </div>

            {/* Visual Phone Representation */}
            <div className="relative z-10 hidden md:flex items-center justify-center w-full max-w-sm [perspective:1000px] h-[480px]">
              {/* 3D Phone Container */}
              <div className="relative w-[280px] h-[580px] rounded-[3rem] p-[4px] bg-gradient-to-br from-[#4a4a4a] via-[#1a1a1a] to-[#0a0a0a] shadow-[25px_25px_50px_-12px_rgba(0,0,0,0.8),inset_1px_1px_2px_rgba(255,255,255,0.3),inset_-1px_-1px_2px_rgba(0,0,0,0.8)] [transform:scale(0.8)_rotateY(-15deg)_rotateX(5deg)] group-hover:[transform:scale(0.8)_rotateY(0deg)_rotateX(0deg)] transition-transform duration-700 ease-out origin-center">
                {/* Screen Bezel */}
                <div className="relative w-full h-full rounded-[2.8rem] bg-black border-[6px] border-black overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                  {/* Notch */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-2xl w-[40%] mx-auto z-50 flex items-center justify-center gap-2">
                    <div className="w-10 h-1.5 bg-[#1a1a1a] rounded-full" />
                    <div className="size-1.5 rounded-full bg-blue-900/50 shadow-[0_0_2px_rgba(0,0,255,0.5)]" />
                  </div>

                  {/* Screen Content (The Login Screen) */}
                  <div className="relative w-full h-full bg-[#050505] flex flex-col font-sans select-none">
                    {/* Top Header Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />

                    <div className="relative z-10 px-5 pt-20 pb-6 flex flex-col flex-1">
                      {/* Welcome Text */}
                      <h2 className="text-white text-[22px] font-bold leading-tight">Welcome Back,</h2>
                      <h2 className="text-primary text-[22px] font-bold leading-tight mb-4">High Roller!</h2>
                      <p className="text-gray-300 text-[11px] leading-relaxed max-w-[85%] mb-8">
                        Log in to continue your winning<br />journey with Money Time.
                      </p>

                      {/* Form */}
                      <div className="space-y-4 mb-3 mt-auto">
                        {/* Username Input */}
                        <div className="relative">
                          <label className="absolute -top-2 left-4 bg-[#050505] px-1 text-[9px] text-gray-500 font-medium tracking-wider uppercase">User Name</label>
                          <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-[#0a0a0a] p-3 text-sm">
                            <User className="size-4 text-primary" />
                            <span className="text-gray-600 text-[11px]">Enter Your User Name</span>
                          </div>
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                          <label className="absolute -top-2 left-4 bg-[#050505] px-1 text-[9px] text-gray-500 font-medium tracking-wider uppercase">Password</label>
                          <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-[#0a0a0a] p-3 text-sm">
                            <div className="flex items-center gap-3">
                              <Lock className="size-4 text-primary" />
                              <span className="text-gray-600 text-[11px]">Enter Your Password</span>
                            </div>
                            <EyeOff className="size-4 text-gray-600" />
                          </div>
                        </div>
                      </div>

                      <div className="text-right mb-6 mt-2">
                        <span className="text-[10px] text-gray-400 hover:text-white cursor-pointer transition-colors underline decoration-gray-600 underline-offset-2">Forgot Password</span>
                      </div>

                      {/* Login Button */}
                      <div className="rounded-xl border border-primary p-[1px] bg-gradient-to-b from-[#4caf50] to-[#2e7d32] shadow-[0_0_15px_rgba(76,175,80,0.15)] cursor-pointer hover:brightness-110 transition-all">
                        <div className="w-full h-[42px] flex items-center justify-center text-primary font-bold text-xs tracking-wider">
                          LOGIN
                        </div>
                      </div>

                      <div className="mt-8 text-center">
                        <p className="text-[10px] text-gray-500">
                          Don't have an account? <span className="text-primary font-bold cursor-pointer hover:brightness-125 transition-all">Register Now</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Community Card */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-fortune-card border border-border/60 rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
              <MessageCircle className="w-96 h-96 text-primary" />
            </div>
            <div className="relative z-10 flex-1">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10">
                <MessageCircle className="size-3 mr-1" /> Join Community
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Join Our WhatsApp Group</h2>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                Get instant draw results, early access to special promotions, and chat with other lucky winners in our exclusive official community.
              </p>
            </div>
            <div className="relative z-10 whitespace-nowrap mt-4 md:mt-0">
              <a href="https://chat.whatsapp.com/" target="_blank" rel="noreferrer">
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-fortune-navy font-bold px-8 h-12 gap-2 transition-all text-md shadow-[0_0_15px_rgba(197,160,89,0.1)]">
                  <MessageCircle className="size-5" /> Join Group Now
                </Button>
              </a>
            </div>
          </div>

          {/* CTA Card */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-black border border-border/60 rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <img src="/lottery-cta-bg.jpg" alt="" className="w-full h-full object-cover object-center grayscale contrast-125 brightness-50 group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none" />
            <div className="relative z-10 flex-1">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10">
                <TrendingUp className="size-3 mr-1" /> Start Winning
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Ready to Try Your <span className="gold-text">Luck?</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                Bets start from just $100. New player? Get 5 free Cashpot plays with your first deposit.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-6 md:mt-0">
              <Button
                size="lg"
                onClick={() => navigate('lotteries')}
                className="gold-gradient text-fortune-navy font-bold px-8 h-12 gold-glow"
              >
                Start Playing <ArrowRight className="size-4 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('tickets')}
                className="border-primary/40 text-primary hover:bg-primary/10 h-12"
              >
                View My Tickets
              </Button>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
