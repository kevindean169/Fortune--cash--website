import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight, Trophy, Zap, Clock,
  ChevronRight, Star, TrendingUp, Play,
  Download,
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.95 9.95 0 0 0 4.777 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.039-5.176-2.927-7.065A9.925 9.925 0 0 0 12.012 2zm5.72 13.916c-.246.696-1.233 1.295-1.702 1.347-.468.052-.942.247-2.986-.566-2.614-1.04-4.29-3.72-4.42-3.896-.13-.176-1.053-1.4-1.053-2.671 0-1.272.663-1.898.897-2.146.234-.248.51-.31.68-.31h.485c.15 0 .354-.057.552.427.2.492.68 1.66.74 1.78.06.121.1.261.02.421-.08.16-.18.35-.355.556-.175.207-.37.432-.527.58-.175.166-.358.347-.155.696.203.35.9 1.48 1.93 2.4 1.03.92 1.9 1.18 2.17.92.27-.26 1.8-1.04 1.8-1.04s.48-.24.42-.54z" />
    </svg>
  )
}

function formatToLocalTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate();
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${day} ${month} ${year} ${hours}:${minutes}${ampm}`;
  } catch (e) {
    return isoString;
  }
}

const getInitials = (name: any): string => {
  if (!name) return 'P.L.';
  const strName = String(name).trim();
  if (!strName || strName.toLowerCase() === 'player') return 'P.L.';
  const parts = strName.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase() + '.';
  }
  return parts.slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('.') + '.';
}

export function HomePage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)

  const [homeData, setHomeData] = useState<{
    latest_results: any[];
    recent_winners: any[];
    tonights_prizes: any[];
  } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const cached = sessionStorage.getItem('fortune_home_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setHomeData(parsed);
        setLoading(false);
      } catch (e) {
        // parse error, proceed to fetch
      }
    }

    fetch('/api/home')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch home data')
        }
        return res.json()
      })
      .then((data) => {
        if (data.status === 'success' && data.data) {
          console.log('API Home Response Data:', data.data);
          setHomeData(data.data);
          try {
            sessionStorage.setItem('fortune_home_data', JSON.stringify(data.data));
          } catch (e) {
            // cache save error
          }
        } else {
          throw new Error(data.message || 'Invalid structure')
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Home API error:', err)
        setLoading(false)
      })
  }, [])

  const parsePrizeNumber = (val: any, defaultVal: number): number => {
    if (val === null || val === undefined) return defaultVal
    const cleaned = String(val).replace(/[^0-9.]/g, '')
    const num = Number(cleaned)
    return isNaN(num) ? defaultVal : num
  }

  // Tonight's top prizes data with default fallbacks
  const getPrizeValue = (gameType: string, defaultVal: number) => {
    const p = homeData?.tonights_prizes?.find((x: any) => x.type === gameType || x.name === gameType)
    return p ? parsePrizeNumber(p.top_prize, defaultVal) : defaultVal
  }

  const cashpotPrizeObj = homeData?.tonights_prizes?.find((x: any) => x.type === 'Cashpot' || x.name === 'Cashpot')
  const cashpotPrize = cashpotPrizeObj ? parsePrizeNumber(cashpotPrizeObj.top_prize, 85000) : 85000

  // 2) here latest result but at the top prize give bet no and draw date time
  const cashpotBetNo = cashpotPrizeObj?.bet_no
  const cashpotDrawTime = cashpotPrizeObj?.draw_time_human
  
  const topPrizeSubtitle = (cashpotBetNo && cashpotDrawTime)
    ? `Cashpot · Bet No: ${cashpotBetNo} · ${cashpotDrawTime}`
    : `Cashpot · Next Draw Soon`

  // secondary tonight prizes
  const secondaryPrizes = [
    { label: 'Money Time', value: `$${getPrizeValue('Cashpot Money Time', 240000).toLocaleString()}` },
    { label: 'Pick 2 Single', value: `$${getPrizeValue('Pick 2 Single', 120000).toLocaleString()}` },
    { label: 'Pick 2 Double', value: `$${getPrizeValue('Pick 2 Double', 120000).toLocaleString()}` },
  ]

  // latest results with fallback to local mock data
  const latestResults = homeData?.latest_results?.length
    ? homeData.latest_results.map((r: any) => {
        const gameTypeNormalized = r.type === 'Cashpot' ? 'Cashpot' : r.type === 'Cashpot Money Time' ? 'Money Time' : r.type;
        return {
          game: r.name ? `${r.name} (${gameTypeNormalized})` : gameTypeNormalized,
          date: r.draw_time ? formatToLocalTime(r.draw_time) : r.draw_time_human,
          drawNo: r.draw_no || 0,
          numbers: r.winning_numbers || [],
          megaBall: r.megaball || null,
          monstaBall: r.monstaball || null,
          jackpot: r.jackpot || `$${Number(r.top_prize || 0).toLocaleString()}`,
          winners: r.winners_count || 0
        };
      })
    : RECENT_RESULTS.map((r, idx) => ({ ...r, drawNo: 3 - idx }));

  // recent winners with initials/fallback to local mock data
  const winnersList = homeData?.recent_winners?.length
    ? homeData.recent_winners.map((w: any) => {
        const gameTypeNormalized = w.lottery_type === 'Cashpot' ? 'Cashpot' : w.lottery_type === 'Cashpot Money Time' ? 'Money Time' : w.lottery_type;
        return {
          initials: getInitials(w.name || w.initials),
          prize: w.prize || `$${(w.win_amount || w.amount || 0).toLocaleString()}`,
          game: w.lottery_name ? `${w.lottery_name} (${gameTypeNormalized})` : gameTypeNormalized,
          location: w.location || 'Kingston',
          date: w.date,
          image: w.image,
          name: w.name || w.initials || 'Player'
        };
      })
    : WINNERS.map((w: any) => ({
        ...w,
        name: w.name || w.initials || 'Player'
      }));

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
                <p className="text-lg text-foreground/90 max-w-md leading-relaxed">
                  Play <span className="text-primary font-bold">Cashpot, Money Time, and Pick 2</span>. Draws happen daily. Winners happen constantly.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                <Button
                  size="lg"
                  onClick={() => navigate('lotteries')}
                  className="gold-gradient text-fortune-navy font-extrabold text-base px-8 shadow-[inset_0px_4px_10px_rgba(255,255,255,0.5),inset_0px_-6px_10px_rgba(0,0,0,0.4)] hover:brightness-110 hover:scale-[1.02] transition-all"
                >
                  Play Now <ArrowRight className="size-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('results')}
                  className="bg-transparent text-primary font-extrabold text-base px-8 border-[3px] border-primary hover:bg-primary/10 transition-all shadow-[0_0_15px_rgba(224,172,44,0.15)] hover:shadow-[0_0_25px_rgba(224,172,44,0.4)]"
                >
                  View Results
                </Button>
              </div>
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-5 pt-3">
                {[
                  { icon: <Zap className="size-5 text-primary" />, label: 'Instant Payouts' },
                  { icon: <Clock className="size-5 text-sky-400" />, label: 'Daily Draws' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground/90 font-semibold tracking-wide">
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
                    <div className="text-6xl font-extrabold gold-text my-4 min-h-[60px] flex items-center justify-center">
                      {loading ? (
                        <div className="h-14 w-44 bg-zinc-800/60 rounded animate-pulse" />
                      ) : (
                        <JackpotCounter value={cashpotPrize} />
                      )}
                    </div>
                    {loading ? (
                      <div className="h-4 w-36 bg-zinc-800/40 rounded animate-pulse mx-auto mb-6" />
                    ) : (
                      <p className="text-muted-foreground text-sm mb-6">{topPrizeSubtitle}</p>
                    )}
                    <Button
                      className="w-full gold-gradient text-fortune-navy font-bold"
                      onClick={() => navigate('cashpot')}
                    >
                      Play Cashpot <ChevronRight className="size-4" />
                    </Button>
                    <Separator className="my-4 opacity-30" />
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {secondaryPrizes.map((j, i) => (
                        <div key={i}>
                          {loading ? (
                            <div className="h-5 w-16 bg-zinc-800/40 rounded animate-pulse mx-auto mb-1" />
                          ) : (
                            <p className="text-sm font-bold text-primary">{j.value}</p>
                          )}
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
              All Lotteries <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GAMES.map(game => {
              const getGameLogoSrc = (id: string) => {
                switch (id) {
                  case 'cashpot':
                    return '/cashpot_logo.png?v=3'
                  case 'money-time':
                    return '/moneytime_logo.png?v=3'
                  case 'pick-2-single':
                  case 'pick-2-double':
                    return '/pick2_logo.png?v=3'
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
                  <Card className="bg-[#050505] border border-primary/20 hover:border-primary/60 transition-all h-full overflow-hidden group/card relative rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/0 to-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full relative z-10">
                      {logoSrc ? (
                        <div className="h-40 w-40 flex-shrink-0 mb-6 group-hover/card:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(224,172,44,0.25)]">
                          <img
                            src={logoSrc}
                            alt={game.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-6xl mb-6 group-hover/card:scale-105 transition-transform duration-500">{game.icon}</span>
                      )}

                      <h3 className="text-2xl font-extrabold text-primary mb-3 tracking-wide">{game.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{game.description}</p>
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
                    <div className="size-16 flex-shrink-0 drop-shadow-[0_0_12px_rgba(224,172,44,0.2)]">
                      <img
                        src={game.path === 'cashpot' ? '/cashpot_logo.png?v=3' : game.path === 'money-time' ? '/moneytime_logo.png?v=3' : '/pick2_logo.png?v=3'}
                        alt={game.name}
                        className="w-full h-full object-contain"
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
            {latestResults.slice(0, 4).map((result, i) => (
              <Card key={i} className="bg-fortune-card border-border hover:border-border/80 transition-colors">
                <CardContent className="p-6 md:px-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-6 text-center sm:text-left">
                    {/* Col 1: Game name + date */}
                    <div className="text-center sm:text-left">
                      <p className="font-bold text-base leading-tight">{result.game}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{result.date}</p>
                    </div>

                    {/* Col 2: Balls spread evenly */}
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      {/* Number balls */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex gap-2">
                          {result.numbers.map((n, ni) => (
                            <div key={ni} className="number-ball number-ball-result size-10 text-sm">
                              {n}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground tracking-wide uppercase">Number</span>
                      </div>

                      {/* Megaball — Cashpot only */}
                      {result.megaBall != null && result.megaBall !== '' && (
                        <div className="flex flex-col items-center gap-1">
                          <div className={`number-ball size-10 ${result.megaBall === 'white' ? 'number-ball-result' : 'number-ball-mega'}`} />
                          <span className="text-[10px] text-red-400 tracking-wide uppercase font-semibold">Mega</span>
                        </div>
                      )}

                      {/* Monstaball — Cashpot only */}
                      {result.monstaBall != null && result.monstaBall !== '' && (
                        <div className="flex flex-col items-center gap-1">
                          <div className={`number-ball size-10 ${result.monstaBall === 'white' ? 'number-ball-result' : 'number-ball-monsta'}`} />
                          <span className="text-[10px] text-amber-400 tracking-wide uppercase font-semibold">Monsta</span>
                        </div>
                      )}
                    </div>

                    {/* Col 3: Draw No */}
                    <div className="text-center sm:text-right min-w-[80px]">
                      <p className="text-xs text-muted-foreground mb-0.5">Draw No</p>
                      <p className="font-extrabold text-lg text-primary">{result.drawNo}</p>
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
            {winnersList.map((w, i) => (
              <Card key={i} className="bg-fortune-card border-border text-center">
                <CardContent className="p-5">
                  <div className="size-16 rounded-full border border-[#c5a059]/50 bg-[#1a150c] flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(197,160,89,0.15)] overflow-hidden relative">
                    {w.image ? (
                      <>
                        <img 
                          src={w.image} 
                          alt={w.initials} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                        <span className="fallback-initials hidden text-lg font-extrabold text-[#c5a059] tracking-wider">{w.initials}</span>
                      </>
                    ) : (
                      <span className="text-lg font-extrabold text-[#c5a059] tracking-wider">{w.initials}</span>
                    )}
                  </div>
                  <p className="font-bold text-base text-foreground mt-2 mb-1">{w.name}</p>
                  <p className="font-extrabold text-lg text-primary">{w.prize}</p>
                  <p className="text-sm font-semibold text-muted-foreground">{w.game}</p>
                  <p className="text-xs text-muted-foreground mt-1">{w.date}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1.1fr_0.9fr] items-center gap-8 lg:gap-12 bg-fortune-card border border-border/60 rounded-3xl p-8 lg:px-12 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />

            {/* Column 1: Info and Download */}
            <div className="relative z-10 py-4 flex flex-col justify-center h-full">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 w-fit px-3 py-1 flex items-center">
                <svg className="size-3.5 mr-1.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.523 15.3c-.551 0-.996-.445-.996-.996 0-.551.445-.996.996-.996.552 0 .997.445.997.996 0 .551-.445.996-.997.996m-11.046 0c-.551 0-.996-.445-.996-.996 0-.551.445-.996.996-.996.552 0 .997.445.997.996 0 .551-.445.996-.997.996m11.412-5.836l1.656-2.868a.498.498 0 00-.182-.68.498.498 0 00-.68.182l-1.68 2.91a10.978 10.978 0 00-6.003 0L7.3 5.1a.499.499 0 00-.862.378c0 .11.036.216.1.302l1.656 2.868A10.96 10.96 0 002 14.8h20a10.96 10.96 0 00-4.512-5.336" />
                </svg>
                Android
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Play Anywhere, Anytime</h2>
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                Get the official Fortune Lottery Android app. Experience live draw streams, instant ticket purchases, and a secure wallet for immediate payouts. Play on the go and never miss a draw!
              </p>
              <a href="/fortune-app.apk" download className="w-fit">
                <Button className="gold-gradient text-fortune-navy font-bold px-8 h-12 gold-glow gap-2 text-md">
                  <Download className="size-4" /> Download APK
                </Button>
              </a>
            </div>

            {/* Column 2: Steps */}
            <div className="relative z-10 w-full flex flex-col gap-3 py-4 border-t lg:border-t-0 lg:border-x border-border/40 lg:px-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-2 text-center lg:text-left">
                Easy Steps to Play
              </h3>
              {[
                { step: '1', title: 'Download APK', desc: 'Click the download button to get the official application installer package.' },
                { step: '2', title: 'Install App', desc: 'Allow installations from unknown sources in security settings and open the file.' },
                { step: '3', title: 'Login or Sign Up', desc: 'Create your secure account credentials or log into your current profile.' },
                { step: '4', title: 'Start Playing', desc: 'Fund your wallet balance securely, choose your lottery, and submit your tickets!' },
              ].map((s, idx) => (
                <div key={idx} className="flex items-start gap-4 bg-background/30 border border-border/40 hover:border-primary/20 rounded-2xl p-3.5 hover:bg-background/60 transition-all duration-300">
                  <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-black text-primary shrink-0 shadow-[0_0_10px_rgba(197,160,89,0.1)]">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-none mb-1.5">{s.title}</h4>
                    <p className="text-xs text-muted-foreground leading-normal">{s.desc}</p>
                  </div>
                </div>
              ))}
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

                    <div className="relative z-10 px-5 pt-16 pb-6 flex flex-col flex-1">
                      {/* Logo */}
                      <div className="text-center mb-4">
                        <img src="/favicon.png" alt="Fortune Logo" className="w-12 h-12 object-contain mx-auto rounded-xl shadow-[0_0_10px_rgba(224,172,44,0.2)]" />
                      </div>

                      {/* Welcome Text */}
                      <div className="text-center mb-6">
                        <h1 className="text-white text-lg font-extrabold mb-1">
                          Welcome <span className="gold-text"> Back</span>
                        </h1>
                        <p className="text-muted-foreground text-[10px]">
                          Log in to continue your winning journey with Fortune Lottery
                        </p>
                      </div>

                      {/* Form */}
                      <div className="space-y-3 mt-auto">
                        {/* Username Input */}
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                            Username
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-primary" />
                            <div className="w-full bg-background border border-primary/30 rounded-xl pl-9 pr-4 py-2 text-xs text-muted-foreground/50 select-none">
                              Enter Your Username
                            </div>
                          </div>
                        </div>

                        {/* Password Input */}
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-primary" />
                            <div className="w-full bg-background border border-primary/30 rounded-xl pl-9 pr-9 py-2 text-xs text-muted-foreground/50 select-none">
                              Enter Your Password
                            </div>
                            <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="space-y-2.5 mt-4 text-left">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            required
                            readOnly
                            checked={false}
                            id="mock-age"
                            className="mt-0.5 rounded border-primary/30 accent-primary text-primary bg-[#0a0a0a] size-3.5 cursor-pointer focus:ring-0 focus:outline-none"
                          />
                          <label htmlFor="mock-age" className="text-[10px] text-muted-foreground cursor-pointer select-none leading-tight">
                            I confirm that I am 18 years of age or older.
                          </label>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            required
                            readOnly
                            checked={false}
                            id="mock-terms"
                            className="mt-0.5 rounded border-primary/30 accent-primary text-primary bg-[#0a0a0a] size-3.5 cursor-pointer focus:ring-0 focus:outline-none"
                          />
                          <label htmlFor="mock-terms" className="text-[10px] text-muted-foreground cursor-pointer select-none leading-tight">
                            I have read and agree to the <span className="text-primary hover:underline">Terms & Conditions</span>.
                          </label>
                        </div>
                      </div>

                      {/* Login Button */}
                      <div className="w-full py-3 mt-4 text-xs font-bold uppercase tracking-widest gold-gradient text-fortune-navy gold-glow hover:opacity-90 rounded-xl flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(224,172,44,0.3)]">
                        Login
                      </div>

                      <div className="mt-6 text-center">
                        <p className="text-[10px] text-gray-500">
                          Don't have an account? <span className="text-primary font-bold cursor-pointer hover:brightness-125 transition-all">Create Account</span>
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
            <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
              <WhatsAppIcon className="w-96 h-96 text-green-500" />
            </div>
            <div className="relative z-10 flex-1">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10">
                <WhatsAppIcon className="size-3 mr-1 text-[#25D366]" /> Join Community
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Join Our WhatsApp Group</h2>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                Get instant draw results, early access to special promotions, and chat with other lucky winners in our exclusive official community.
              </p>
            </div>
            <div className="relative z-10 whitespace-nowrap mt-4 md:mt-0">
              <a href="https://chat.whatsapp.com/invite/YOUR_GROUP_INVITE_LINK" target="_blank" rel="noreferrer">
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-fortune-navy font-bold px-8 h-12 gap-2 transition-all text-md shadow-[0_0_15px_rgba(197,160,89,0.1)]">
                  <WhatsAppIcon className="size-5 text-[#25D366] group-hover:text-fortune-navy transition-colors" /> Join Group Now
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
