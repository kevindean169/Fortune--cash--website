import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight, Trophy, Zap, Shield, Clock,
  ChevronRight, Star, TrendingUp, Play,
} from 'lucide-react'
import { GAMES, RECENT_RESULTS, WINNERS } from '@/lib/fortune-data'
import type { PageId } from '@/lib/fortune-data'

interface HomePageProps {
  navigate: (page: PageId) => void
}

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

export function HomePage({ navigate }: HomePageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden fortune-hero-bg">
        <div className="absolute inset-0 opacity-20">
          <img src="/lottery-hero.webp" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8">
              <Badge className="bg-fortune-blue/20 text-primary border-primary/30 px-3 py-1">
                <Zap className="size-3 mr-1" /> Florida's #1 Online Lottery
              </Badge>
              <div>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-none mb-4">
                  Your Next<br />
                  <span className="gold-text">Fortune</span><br />
                  Awaits
                </h1>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Play Cash Pop, Pick 2, Pick 3, and Pick 4. Draws happen daily. Winners happen constantly.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate('games')}
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
                  { icon: <Shield className="size-4 text-emerald-400" />, label: 'Licensed & Regulated' },
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
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-80">
                <div className="absolute inset-0 rounded-2xl gold-glow opacity-30" />
                <Card className="relative bg-fortune-card border-fortune-gold/20 rounded-2xl overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Tonight's Top Prize
                    </p>
                    <div className="text-6xl font-extrabold gold-text my-4">
                      <JackpotCounter value={5000} />
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">Pick 4 · Draw at 7:29 PM</p>
                    <Button
                      className="w-full gold-gradient text-fortune-navy font-bold"
                      onClick={() => navigate('pick-4')}
                    >
                      Play Pick 4 <ChevronRight className="size-4" />
                    </Button>
                    <Separator className="my-4 opacity-30" />
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: 'Cash Pop', value: '$2,500' },
                        { label: 'Pick 3', value: '$500' },
                        { label: 'Pick 2', value: '$50' },
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
              <h2 className="text-3xl font-extrabold tracking-tight">Our Games</h2>
              <p className="text-muted-foreground mt-1">Pick your game and play today</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('games')} className="text-primary gap-1">
              All Games <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GAMES.map(game => (
              <button
                key={game.id}
                onClick={() => navigate(game.id)}
                className="group text-left"
              >
                <Card className="bg-fortune-card border-border card-hover h-full">
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{game.icon}</span>
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
            ))}
          </div>
        </div>
      </section>

      {/* How To Play */}
      <section className="py-16 bg-fortune-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to your fortune</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Play className="size-6 text-primary" />,
                title: 'Choose a Game',
                desc: 'Browse Cash Pop, Pick 2, Pick 3, or Pick 4. Each game has its own prizes and draw times.',
              },
              {
                step: '02',
                icon: <Star className="size-6 text-primary" />,
                title: 'Pick Your Numbers',
                desc: 'Select your lucky numbers or use Quick Pick for a random selection. Choose your play amount.',
              },
              {
                step: '03',
                icon: <Trophy className="size-6 text-primary" />,
                title: 'Collect Your Winnings',
                desc: 'Watch the live draw. Prizes are credited to your wallet instantly. Withdraw any time.',
              },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] w-[calc(100%-3rem)] h-px border-t border-dashed border-border/60" />
                )}
                <div className="relative inline-flex items-center justify-center size-16 rounded-2xl bg-fortune-card border border-border mb-4">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 text-xs font-bold text-muted-foreground bg-background rounded-full border border-border size-5 flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
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
                      <div className="text-center min-w-[80px]">
                        <p className="font-bold text-sm">{result.game}</p>
                        <p className="text-xs text-muted-foreground">{result.date}</p>
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
                        <p className="font-bold text-primary">{result.jackpot}</p>
                        <p className="text-xs text-muted-foreground">Top Prize</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{result.winners}</p>
                        <p className="text-xs text-muted-foreground">Winners</p>
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
                  <div className="size-12 rounded-full gold-gradient flex items-center justify-center mx-auto mb-3">
                    <span className="text-sm font-bold text-fortune-navy">{w.initials}</span>
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

      {/* CTA Banner */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-fortune-blue/20 via-fortune-card to-fortune-gold/10" />
            <div className="absolute inset-0 border border-fortune-gold/20 rounded-2xl" />
            <div className="relative p-10 text-center">
              <TrendingUp className="size-10 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-extrabold mb-3">
                Ready to Try Your <span className="gold-text">Luck?</span>
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Tickets start from just $0.50. New player? Get 10 free Cash Pop plays with your first $5 deposit.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('games')}
                  className="gold-gradient text-fortune-navy font-bold px-8 gold-glow"
                >
                  Start Playing <ArrowRight className="size-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('promotions')}
                  className="border-primary/40 text-primary hover:bg-primary/10"
                >
                  View Promotions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
