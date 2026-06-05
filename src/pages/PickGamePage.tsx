import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { ArrowRight, Zap, RotateCcw, Clock, Trophy, Info, X, CheckCircle } from 'lucide-react'
import { GAMES } from '@/lib/fortune-data'
import type { PageId } from '@/lib/fortune-data'

interface PickGamePageProps {
  gameId: string
  navigate: (page: PageId) => void
}

const PLAY_TYPES: Record<string, { label: string; desc: string; prize: string; odds: string }[]> = {
  'pick-2': [
    { label: 'Straight', desc: 'Exact order match', prize: '$50', odds: '1 in 100' },
    { label: 'Box (2-Way)', desc: 'Any order match', prize: '$25', odds: '1 in 50' },
    { label: 'Straight/Box', desc: 'Both straight + box', prize: '$37.50', odds: '1 in 100' },
  ],
  'pick-3': [
    { label: 'Straight', desc: 'Exact order match', prize: '$500', odds: '1 in 1,000' },
    { label: 'Box 3-Way', desc: 'Any order (2 alike)', prize: '$160', odds: '1 in 333' },
    { label: 'Box 6-Way', desc: 'Any order (all diff)', prize: '$80', odds: '1 in 167' },
    { label: 'Combo', desc: 'All straight combos', prize: '$500', odds: '1 in 1,000' },
  ],
  'pick-4': [
    { label: 'Straight', desc: 'Exact order match', prize: '$5,000', odds: '1 in 10,000' },
    { label: 'Box 12-Way', desc: 'Any order (2 pairs)', prize: '$400', odds: '1 in 833' },
    { label: 'Box 24-Way', desc: 'Any order (all diff)', prize: '$200', odds: '1 in 417' },
    { label: '1-Off', desc: 'One digit off by 1', prize: '$2,500', odds: '1 in 5,000' },
    { label: 'Combo', desc: 'All straight combos', prize: '$5,000', odds: '1 in 10,000' },
  ],
}

export function PickGamePage({ gameId, navigate }: PickGamePageProps) {
  const game = GAMES.find(g => g.id === gameId)!
  const playTypes = PLAY_TYPES[gameId] ?? []

  const [selections, setSelections] = useState<(number | null)[]>(Array(game.maxPick).fill(null))
  const [playType, setPlayType] = useState(playTypes[0]?.label ?? 'Straight')
  const [betAmount, setBetAmount] = useState(0.5)
  const [quantity, setQuantity] = useState(1)
  const [purchased, setPurchased] = useState(false)
  const [activePosition, setActivePosition] = useState(0)

  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const betOptions = [0.50, 1.00, 2.00, 5.00]

  const quickPick = () => {
    setSelections(Array(game.maxPick).fill(null).map(() => Math.floor(Math.random() * 10)))
    setActivePosition(game.maxPick - 1)
  }

  const clearAll = () => {
    setSelections(Array(game.maxPick).fill(null))
    setActivePosition(0)
  }

  const pickDigit = (digit: number) => {
    const next = [...selections]
    next[activePosition] = digit
    setSelections(next)
    if (activePosition < game.maxPick - 1) setActivePosition(activePosition + 1)
  }

  const clearPosition = (pos: number) => {
    const next = [...selections]
    next[pos] = null
    setSelections(next)
    setActivePosition(pos)
  }

  const isComplete = selections.every(s => s !== null)
  const totalCost = betAmount * quantity
  const currentPlayType = playTypes.find(p => p.label === playType)

  const handlePurchase = () => {
    if (!isComplete) return
    setPurchased(true)
    setTimeout(() => setPurchased(false), 3000)
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('lotteries')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 flex items-center gap-1"
          >
            ← All Games
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {game.id === 'pick-2-single' || game.id === 'pick-2-double' ? (
                <img src="/pick2_logo.png?v=3" alt={game.name} className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-4xl">{game.icon}</span>
              )}
              <div>
                <h1 className="text-4xl font-extrabold">{game.name}</h1>
                <p className="text-muted-foreground">{game.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="border-border/60 text-muted-foreground">
                <Clock className="size-3 mr-1" /> {game.nextDraw}
              </Badge>
              <Badge className="bg-primary/15 text-primary border-primary/25">
                <Trophy className="size-3 mr-1" /> Top Prize: {game.jackpot}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Left Panel */}
          <div className="space-y-5">
            {/* Number Selection */}
            <Card className="bg-fortune-card border-border">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step 1</p>
                    <h2 className="text-lg font-bold">Pick {game.maxPick} Numbers</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={quickPick} className="gap-1.5 border-border/60">
                      <Zap className="size-3.5" /> Quick Pick
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5">
                      <RotateCcw className="size-3.5" /> Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Position Slots */}
                <div className="flex gap-3 mb-6">
                  {selections.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePosition(i)}
                      className={`relative flex items-center justify-center rounded-xl border-2 transition-all
                        ${activePosition === i
                          ? 'border-primary bg-primary/10'
                          : s !== null
                            ? 'border-border/60 bg-muted/30'
                            : 'border-border/40 bg-muted/10'
                        }
                      `}
                      style={{ width: '3.5rem', height: '3.5rem' }}
                    >
                      {s !== null ? (
                        <>
                          <span className="text-2xl font-extrabold text-primary">{s}</span>
                          <button
                            onClick={e => { e.stopPropagation(); clearPosition(i) }}
                            className="absolute -top-1.5 -right-1.5 size-4 bg-muted rounded-full flex items-center justify-center hover:bg-destructive transition-colors"
                          >
                            <X className="size-2.5 text-muted-foreground hover:text-white" />
                          </button>
                        </>
                      ) : (
                        <span className="text-muted-foreground/40 text-2xl font-bold">
                          {activePosition === i ? '_' : '?'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Selecting position {activePosition + 1} of {game.maxPick}
                </p>

                {/* Digit Grid */}
                <div className="grid grid-cols-5 gap-3">
                  {digits.map(d => (
                    <button
                      key={d}
                      onClick={() => pickDigit(d)}
                      className={`number-ball mx-auto text-base ${
                        selections[activePosition] === d ? 'number-ball-selected' : 'number-ball-idle'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Play Type */}
            <Card className="bg-fortune-card border-border">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Step 2</p>
                <h2 className="text-lg font-bold mb-4">Play Type</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {playTypes.map(pt => (
                    <button
                      key={pt.label}
                      onClick={() => setPlayType(pt.label)}
                      className={`flex flex-col gap-1 rounded-xl p-3 border text-left transition-all ${
                        playType === pt.label
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-border/40 bg-muted/10 hover:border-border/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{pt.label}</span>
                        <span className="text-sm font-bold text-primary">{pt.prize}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{pt.desc}</span>
                      <span className="text-xs text-muted-foreground/70">Odds: {pt.odds}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bet Amount */}
            <Card className="bg-fortune-card border-border">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Step 3</p>
                <h2 className="text-lg font-bold mb-4">Bet Amount</h2>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {betOptions.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      className={`rounded-lg py-2.5 text-sm font-bold border transition-all ${
                        betAmount === amt
                          ? 'gold-gradient text-fortune-navy border-primary/50'
                          : 'bg-muted/50 text-muted-foreground border-border/60 hover:border-primary/30'
                      }`}
                    >
                      ${amt.toFixed(2)}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Quantity</p>
                    <span className="text-sm font-bold text-primary">{quantity} ticket{quantity > 1 ? 's' : ''}</span>
                  </div>
                  <Slider
                    value={[quantity]}
                    onValueChange={([v]) => setQuantity(v)}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1</span><span>10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prize Info */}
            {currentPlayType && (
              <Card className="bg-fortune-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="size-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Selected: {playType} Play</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{currentPlayType.desc}</span>
                    <div className="text-right">
                      <span className="font-bold text-primary">{currentPlayType.prize}</span>
                      <p className="text-xs text-muted-foreground">{currentPlayType.odds}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel: Ticket Summary */}
          <div>
            <Card className="bg-fortune-card border-border sticky top-24">
              <CardContent className="p-5">
                <h2 className="text-lg font-bold mb-4">Your Ticket</h2>

                {/* Ticket Preview */}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {game.id === 'pick-2-single' || game.id === 'pick-2-double' ? (
                        <img src="/pick2_logo.png?v=3" alt={game.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-xl">{game.icon}</span>
                      )}
                      <span className="font-bold">{game.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-border/60 text-muted-foreground">
                      {playType}
                    </Badge>
                  </div>

                  <div className="flex gap-2 mb-3">
                    {selections.map((s, i) =>
                      s !== null ? (
                        <div key={i} className="number-ball number-ball-selected">{s}</div>
                      ) : (
                        <div key={i} className="number-ball number-ball-idle opacity-30">?</div>
                      )
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {isComplete
                      ? `Draw at ${game.drawTime} · ${game.nextDraw}`
                      : `Select ${selections.filter(s => s === null).length} more number(s)`
                    }
                  </p>
                </div>

                <Separator className="mb-4" />

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Play type</span>
                    <span>{playType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bet amount</span>
                    <span>${betAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tickets</span>
                    <span>{quantity}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Possible prize</span>
                    <span className="text-primary font-medium">{currentPlayType?.prize ?? '—'}</span>
                  </div>
                  <Separator className="opacity-50" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                {purchased ? (
                  <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle className="size-5 text-emerald-400" />
                      <p className="text-emerald-400 font-bold">Tickets Purchased!</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Draw at {game.drawTime}. Good luck!</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-border/60"
                      onClick={() => navigate('tickets')}
                    >
                      View My Tickets
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full gold-gradient text-fortune-navy font-bold gold-glow"
                    disabled={!isComplete}
                    onClick={handlePurchase}
                  >
                    {isComplete
                      ? `Buy ${quantity > 1 ? `${quantity} Tickets` : 'Ticket'} · $${totalCost.toFixed(2)}`
                      : `Pick ${selections.filter(s => s === null).length} More Number(s)`
                    }
                    {isComplete && <ArrowRight className="size-4 ml-1" />}
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Funds deducted from wallet · Must be 18+
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
